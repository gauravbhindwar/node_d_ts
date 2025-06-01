import { MessageFormation } from "@/constants/messages.constants";
import { messageStatus } from "@/interfaces/model/message.interface";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import LoginUser from "@/models/loginUser.model";
import Role from "@/models/role.model";
import ErrorLogsRepo from "@/repository/errorLog.repository";
import GlobalSettingsRepo from "@/repository/globalSettings.repository";
import LoginUserRepo from "@/repository/loginUser.repository";
import { parse } from "@/utils/common.util";
import * as bcrypt from "bcrypt";
import { HttpException } from "exceptions/HttpException";
import { Request, Response } from "express";
import { status } from "interfaces/model/user.interface";
import User from "models/user.model";
import AuthRepo from "repository/auth.repository";
import UserRepo from "repository/user.repository";
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync";
import generalResponse from "../utils/generalResponse";

class AuthController {
  private authRepository = new AuthRepo();
  private userRepository = new UserRepo();
  private loginUserRepository = new LoginUserRepo();
  private errorRepository = new ErrorLogsRepo();
  private globalsettingrepo = new GlobalSettingsRepo();

  private msg = new MessageFormation("User").message;

  /**
   * user login Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public login = catchAsync(async (req: Request, res: Response) => {
    try {
      console.log("Login request received", req.body);
  
      const { email, password } = req.body;
  
      // Fetch user with required relations
      let user = await this.userRepository.get({
        where: { status: status.ACTIVE },
        include: [
          {
            model: LoginUser,
            required: true,
            where: { email: { [Op.iLike]: email } },
            attributes: ["id", "email", "name", "password", "randomPassword", "profileImage"],
            include: [
              {
                model: Employee,
                where: { terminationDate: { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } } },
                required: false,
                attributes: ["id", "clientId", "slug"],
              },
              { model: Client, required: false, attributes: ["id"] },
            ],
          },
          { model: Role, attributes: ["name", "isViewAll"] },
          // { model: UserClient, required: false, attributes: ["clientId"] },
          // { model: UserSegment, required: false, attributes: ["id", "segmentId", "subSegmentId"] },
        ],
        attributes: ["id", "loginUserId", "roleId", "status"],
        rejectOnEmpty: false,
      });
  
      console.log("User fetched:", user ? "Found" : "Not Found");
  
      // Helper function for logging errors
      const logError = async (errorMessage: string) => {
        console.error("Login error:", errorMessage);
  
        await this.errorRepository.addErrorLogs({
          body: {
            type: "auth",
            status: messageStatus.ERROR,
            isActive: status.ACTIVE,
            email,
            full_error: JSON.stringify(errorMessage),
            error_message: errorMessage,
          },
          user,
        });
        throw new HttpException(400, errorMessage);
      };
  
      // If user not found
      if (!user) return logError(this.msg.invalidCredentials);
  
      // Validate password existence
      if (!user?.loginUserData?.password && !user?.loginUserData?.randomPassword) {
        return logError(this.msg.passwordSetError);
      }
  
      // Compare password
      const storedPassword = user?.loginUserData?.password || user?.loginUserData?.randomPassword;
      const isMatch = await bcrypt.compare(password, storedPassword);
  
      console.log("Password match:", isMatch ? "Success" : "Failed");
  
      if (!isMatch) return logError(this.msg.correctPasswordError);
  
      // Successful login
      user = parse(user);
      await LoginUser.update(
        { logintimeutc: new Date().toISOString(), logouttimeutc: null },
        { where: { id: user?.loginUserId }, individualHooks: true }
      );
  
      console.log("User login time updated");
  
      return generalResponse(req, res, {
        user: { ...user, client: null },
        access_token: this.authRepository.createToken(user),
        refresh_token: this.authRepository.refreshToken(user),
      }, this.msg.loggInSuccess);
  
    } catch (error) {
      console.error("Unexpected login error:", error);
      throw new HttpException(500, "Internal Server Error");
    }
  });
  

  /**
   * get Logged in Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public getLoggedIn = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    return generalResponse(
      req,
      res,
      user,
      this.msg.getLoggInSuccess,
      "success",
      false,
      200
    );
  });

  /**
   * User Validate Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public userValidate = catchAsync(async (req: Request, res: Response) => {
    const data = await this.authRepository.userValidate(req.query);
    return generalResponse(req, res, data, this.msg.fetch, "success", false);
  });

  /**
   * Reset Password Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public resetPassword = catchAsync(async (req: Request, res: Response) => {
    const data = await this.authRepository.resetPassword(req.body);
    return generalResponse(
      req,
      res,
      data,
      this.msg.passwordSet,
      "success",
      true
    );
  });

  /**
   * OTP Verification Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public otpVerification = catchAsync(async (req: Request, res: Response) => {
    const data = await this.authRepository.otpVerification(req.body);
    return generalResponse(
      req,
      res,
      data,
      this.msg.otpVerificationSuccess,
      "success",
      true
    );
  });

  /**
   * Resent Otp Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public resendOTP = catchAsync(async (req: Request, res: Response) => {
    const a = await this.authRepository.resendOTP(req.body);
    return generalResponse(
      req,
      res,
      a,
      this.msg.otpSentSuccess,
      "success",
      true
    );
  });

  /**
   * Change Password Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public changePassword = catchAsync(async (req: Request, res: Response) => {
    const data = await this.authRepository.changePassword(
      req.body,
      (req.user as User).id
    );
    return generalResponse(
      req,
      res,
      data,
      this.msg.passwordChangeSuccess,
      "success",
      true
    );
  });

  /**
   * Update Profile Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public updateProfile = catchAsync(async (req: Request, res: Response) => {
    const data = await this.authRepository.updateProfile(
      req.body,
      (req.user as User).id
    );
    return generalResponse(req, res, data, this.msg.update, "success", true);
  });

  /**
   * Generate Access Token Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public genereateAccessToken = catchAsync(
    async (req: Request, res: Response) => {
      const data = await this.authRepository.genereateAccessToken(req.body);
      return generalResponse(
        req,
        res,
        data,
        this.msg.tokengenerate,
        "success",
        true
      );
    }
  );

  public logout = catchAsync(async (req: Request, res: Response) => {
    const data = await this.authRepository.logout(req.user as User);
    return generalResponse(req, res, data, this.msg.update, "success", false);
  });
}

export default AuthController;
