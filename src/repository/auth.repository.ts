import { createHistoryRecord } from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import History from "@/models/history.model";
import LoginUser from "@/models/loginUser.model";
import { parse } from "@/utils/common.util";
import axios from "axios";
import * as bcrypt from "bcrypt";
import {
  FRONTEND_URL,
  GOOGLE_RECAPTCH_SECRET_KEY,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "config";
import { AUTH_MESSAGES } from "constants/auth.messages";
import { MessageFormation } from "constants/messages.constants";
import { HttpException } from "exceptions/HttpException";
import { type } from "interfaces/model/otp.model.interface";
import { status } from "interfaces/model/user.interface";
import jwt from "jsonwebtoken";
import _ from "lodash";
import OTP from "models/otp.model";
import moment from "moment";
import { Op } from "sequelize";
import { createRandomHash, generateFourDigitNumber } from "utils/common.util";
import User from "../models/user.model";
import BaseRepository from "./base.repository";
import LoginUserRepo from "./loginUser.repository";
import UserRepo from "./user.repository";

export default class AuthRepo extends BaseRepository<User> {
  private messages = new MessageFormation("User").message;

  private readonly userRepository = new UserRepo();
  private readonly loginUserRepository = new LoginUserRepo();

  constructor() {
    super(User.name);
  }

  readonly createToken = (user: any) => {
    return jwt.sign(
      { email: user?.loginUserData?.email, userId: user.id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
  };

  readonly refreshToken = (user: User) => {
    return jwt.sign(
      { email: user?.loginUserData?.email, userId: user.id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
  };

  readonly verifyRefreshToken = (RefreshToken: string) => {
    return new Promise((resolve, reject) => {
      jwt.verify(RefreshToken, REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
          // console.log("JWT error", err);
          reject(err);
        }
        resolve(payload);
      });
    });
  };

  //============== OTP Verification SERVICE ================
  async otpVerification(data) {
    try {
      const { email, otp, type: typeData } = data;

      const userData = await User.findAll({
        include: [
          {
            model: LoginUser,
            required: true,
            where: { email: { [Op.iLike]: email } },
          },
        ],
      });

      if (!userData) throw new HttpException(409, "User not found");

      const otpData = await OTP.findOne({
        where: {
          deletedAt: null,
          type: typeData,
          email: { [Op.iLike]: email },
        },
        order: [["updatedAt", "DESC"]],
      });

      if (!otpData)
        throw new Error(
          `OTP has been not sended ${email ? "this email " + email : ""}`
        );

      const expiredTime = moment(otpData?.expired).utc().format();
      const currentTime = moment().utc().format();

      if (!moment(currentTime).isSameOrBefore(expiredTime))
        throw new Error("OTP expired");

      if (otpData && otpData?.otp !== parseInt(otp))
        throw new Error("otp is not match");

      const user = await User.findOne({
        include: [
          {
            model: LoginUser,
            required: true,
            where: { email: { [Op.iLike]: email }, deletedAt: null },
          },
        ],
        rejectOnEmpty: false,
      });

      if (user) {
        const updateUser = { verified: true, status: status.ACTIVE };
        await user.update(updateUser);

        if (typeData === type.FORGOT) {
          const hashValue = createRandomHash(20);
          const hashExpired = new Date(new Date().getTime() + 15 * 60000); // 15 minute expiry

          await User.update(
            {
              hashToken: hashValue,
              hashTokenExpiry: hashExpired,
            },
            { where: { id: user.id } }
          );

          const context = {
            name: user.loginUserData.name,
            email: user.loginUserData.email,
            id: user.loginUserData.id,
            link:
              FRONTEND_URL +
              "/reset-password?id=" +
              user.id +
              "&email=" +
              user.loginUserData.email +
              "&token=" +
              hashValue,
            logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          };

          if (user.loginUserData.email) {
            await sendMail(
              [user.loginUserData.email, "admin@lred.com"],
              "Reset Password",
              "resetPassword",
              context
            );
          }
          await OTP.update(
            { deletedAt: new Date() },
            { where: { id: otpData.id } }
          );
        }

        const accessToken = {
          verified: true,
          access_token: this.createToken(user),
          refresh_token: this.refreshToken(user),
        };
        return accessToken;
      }

      return { verified: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  //============== Reset Password SERVICE ================
  async resetPassword(data: {
    email: string;
    hashToken: string;
    newPassword: string;
  }) {
    const { email, hashToken, newPassword } = data;
    const updatedatutc = new Date();
    const userData = await User.findOne({
      where: { deletedAt: null },
      attributes: ["id", "hashToken", "hashTokenExpiry"],
      include: [
        {
          model: LoginUser,
          required: true,
          where: { email: { [Op.iLike]: email } },
        },
      ],
    });

    if (!userData) {
      throw new HttpException(400, "User not found");
    }
    if (
      userData &&
      userData.hashToken === hashToken &&
      userData.hashTokenExpiry < new Date()
    ) {
      await User.update(
        { hashToken: null, hashTokenExpiry: null },
        { where: { id: userData.id } }
      );
      throw new HttpException(400, AUTH_MESSAGES.TOKEN_EXPIRED, null, true);
    } else {
      const changedPassword = await bcrypt.hash(newPassword, 10);
      await LoginUser.update(
        { password: changedPassword, updatedatutc: updatedatutc.toISOString() },
        { where: { id: userData?.loginUserData?.id } }
      );
      await User.update(
        { hashToken: null, hashTokenExpiry: null },
        { where: { id: userData.id } }
      );

      await createHistoryRecord({
        tableName: tableEnum.USER,
        userId: userData?.id,
        moduleName: moduleName.ADMIN,
        custom_message: `${userData?.loginUserData?.name} had chenged their password`,
        lastlogintime: userData?.loginUserData?.logintimeutc,
        jsonData: parse(userData),
        activity: statusEnum.UPDATE,
      });
      return true;
    }
  }

  //============== User Validate SERVICE ================
  async userValidate(query: IQueryParameters) {
    const { email } = query;

    const userData = await User.findOne({
      where: { deletedAt: null },
      attributes: ["id", "hashToken", "hashTokenExpiry"],
      include: [
        {
          model: LoginUser,
          required: true,
          where: { email: { [Op.iLike]: email } },
        },
      ],
    });

    if (!userData) {
      throw new HttpException(400, "User not found");
    }
    if (
      userData &&
      userData.hashToken === null &&
      userData.hashTokenExpiry === null
    ) {
      throw new HttpException(
        400,
        "You have already changed your password! Please try again.",
        null,
        true
      );
    }
    return true;
  }

  //============== Resend OTP SERVICE ================
  async resendOTP(data: { email: string; type: type }) {
    const { email, type: otpType } = data;
    const otp = generateFourDigitNumber();
    const userData = await this.userRepository.get({
      where: { deletedAt: null },
      include: [
        {
          model: LoginUser,
          required: true,
          where: { email: { [Op.iLike]: email } },
        },
      ],
      rejectOnEmpty: false,
    });
    if (_.isEmpty(userData))
      throw new HttpException(
        400,
        "This User is not registered with this platform.",
        null,
        true
      );

    if (otpType === type.REGISTER) {
      if (!userData)
        throw new HttpException(
          400,
          "User already exist so cannot otp send to register"
        );
    }
    const context = {
      username: userData?.loginUserData?.name,
      useremail: userData?.loginUserData?.email,
      otp: otp,
      logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
      text: this.messages.resentOtp + otp,
    };

    if (userData?.loginUserData?.email) {
      await sendMail(
        [userData?.loginUserData?.email, "admin@lred.com"],
        "Otp",
        type && otpType === type.FORGOT ? "forgotPassword" : "register",
        context
      );
    }

    await OTP.update(
      {
        type: otpType,
        deletedAt: new Date(),
      },
      { where: { email: { [Op.iLike]: data.email } } }
    );

    await OTP.create({
      email: data.email,
      otp: Number(otp),
      expired: moment.utc().add(900, "second").format(),
      ...(data.type ? { type: data.type } : {}),
    });
  }

  //============== Change Password SERVICE ================
  async changePassword(
    data: { oldPassword: string; newPassword: string },
    userId: number
  ) {
    const { oldPassword, newPassword } = data;
    const updatedatutc = new Date();
    const getUser = await this.userRepository.get({
      where: { id: userId },
      include: [{ model: LoginUser, required: true }],
      rejectOnEmpty: false,
    });
    if (
      getUser &&
      (getUser?.loginUserData?.password ||
        getUser?.loginUserData?.randomPassword)
    ) {
      const isMatch = await bcrypt.compare(
        oldPassword,
        getUser?.loginUserData?.password
          ? getUser?.loginUserData?.password
          : getUser?.loginUserData?.randomPassword
      );
      if (isMatch) {
        const changedPassword = await bcrypt.hash(newPassword, 10);
        await LoginUser.update(
          {
            password: changedPassword,
            updatedatutc: updatedatutc.toISOString(),
          },
          { where: { id: getUser?.loginUserData?.id } }
        );
        return true;
      }
      throw new HttpException(400, AUTH_MESSAGES.OLD_PASSWORD);
    } else throw new HttpException(400, AUTH_MESSAGES.USER_NOT_FOUND);
  }

  //============== Update Profile SERVICE ================
  async updateProfile(data: any, userId: number) {
    const updatedatutc = new Date();
    const getUser = await this.userRepository.get({
      where: { id: userId },
      include: [{ model: LoginUser, required: true }],
      rejectOnEmpty: false,
    });

    if (getUser?.loginUserData) {
      data["updatedatutc"] = updatedatutc.toISOString();

      for (const key in data) {
        // Check if the property is a direct property of the object
        if (data.hasOwnProperty(key)) {
          // If the property is a string, trim it
          if (typeof data[key] === "string") {
            data[key] = data[key].trim();
          }
        }
      }
      data["name"] = `${data.firstName} ${data.lastName}`;
      data.email = data.email.toLowerCase();

      await LoginUser.update(data, {
        where: { id: getUser?.loginUserData?.id },
      });

      return true;
    }
    throw new HttpException(400, AUTH_MESSAGES.USER_NOT_FOUND);
  }

  //============== Generate TOKEN SERVICE ================
  async genereateAccessToken(data) {
    const { refresh_token } = data;

    if (refresh_token) {
      const authUser = await this.verifyRefreshToken(refresh_token);
      const { email }: IQueryParameters = authUser;

      const userData = await User.findAll({
        include: [
          {
            model: LoginUser,
            required: true,
            where: { email: { [Op.iLike]: email } },
          },
        ],
      });

      const accessToken = {
        verified: true,
        access_token: this.createToken(userData),
      };
      return accessToken;
    }
    throw new HttpException(400, AUTH_MESSAGES.TOKEN_NOTFOUND);
  }

  async logout(user: User) {
    try {
      const currenctDate = new Date().toISOString();

      // Two UTC date-time strings
      const startTime = moment.utc(user?.loginUserData?.logintimeutc);
      const endTime = moment.utc(currenctDate);
      const totalMinutes = endTime.diff(startTime, "minutes");

      // Calculate hours and remaining minutes
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const Difference = `${hours} Hr ${minutes} Min`;

      await LoginUser.update(
        { logouttimeutc: currenctDate },
        { where: { id: user?.loginUserId }, individualHooks: true }
      );
      await History.update(
        {
          lastlogouttime: currenctDate,
          systemUtilisationTime: Difference,
        },
        {
          where: { userId: user?.id, lastlogouttime: { [Op.eq]: null } },
          individualHooks: true,
        }
      );
      return;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("error", error);
    }
  }

  async varifyGoogleRecaptcha(data: string) {
    let _res_data;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCH_SECRET_KEY}&response=${data}`;
    const res = await axios.post(url);
    if (
      res.data &&
      ((_res_data = res.data) === null || _res_data === void 0
        ? void 0
        : _res_data.success)
    ) {
      return true;
    } else return false;
  }
}
