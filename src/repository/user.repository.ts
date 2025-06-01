import { FRONTEND_URL } from "@/config";
// import { status } from '@/interfaces/model/user.interface';
import Feature from "@/models/feature.model";
import LoginUser from "@/models/loginUser.model";
import Permission from "@/models/permission.model";
import Role from "@/models/role.model";
import UserClient from "@/models/userClient.model";
import UserPermission from "@/models/userPermission.model";
import UserSegment from "@/models/userSegment.model";
import { createRandomHash, parse } from "@/utils/common.util";
import { HttpException } from "exceptions/HttpException";
// import { Op } from 'sequelize';
import {
  createHistoryRecord,
  customHistoryUpdateMesage,
} from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { ModelCtor } from "sequelize-typescript";
import {
  BuildUserArgs,
  BuildUserUpdateArgs,
} from "../interfaces/functional/user.interface";
import db from "../models";
import User from "../models/user.model";
import BaseRepository from "./base.repository";

export default class UserRepo extends BaseRepository<User> {
  constructor() {
    super(User.name);
  }

  readonly createUser = async (userCreateArgs: BuildUserArgs) => {
    const { data } = userCreateArgs;
    return db.transaction(async (transaction) => {
      const isExistUser: User & { isExistUser?: boolean } = await this.get({
        where: { deletedAt: null },
        include: [
          { model: LoginUser, required: true, where: { email: data.email } },
        ],
        attributes: ["id"],
        transaction,
      });
      if (!isExistUser) {
        const userData = await this.create(data, { transaction });
        return userData;
      } else {
        throw new HttpException(400, "Email Address Already Registered.", true);
      }
    });
  };

  readonly updateUser = async (userCreateArgs: BuildUserUpdateArgs) => {
    const { data, id, authUser } = userCreateArgs;
    return db.transaction(async (transaction) => {
      const isExistUser: User & { isExistUser?: boolean } = await this.get({
        where: { id: id, deletedAt: null },
        transaction,
      });
      if (isExistUser) {
        const user = await isExistUser.update({ ...data });
        await createHistoryRecord({
          tableName: tableEnum.USER,
          moduleName: moduleName.ADMIN,
          userId: authUser?.id,
          custom_message: await customHistoryUpdateMesage(
            data,
            isExistUser,
            authUser,
            user,
            tableEnum.USER,
            `Update User Status`
          ),
          lastlogintime: authUser?.loginUserData?.logintimeutc,
          jsonData: parse(user),
          activity: statusEnum.UPDATE,
        });
        return user;
      } else {
        throw new HttpException(
          400,
          "Email Address Not Registered.",
          null,
          true
        );
      }
    });
  };

  readonly deleteUser = async (userCreateArgs: BuildUserUpdateArgs) => {
    const { id } = userCreateArgs;
    return db.transaction(async (transaction) => {
      const isExistUser: User & { isExistUser?: boolean } = await this.get({
        where: { id, deletedAt: null },
        attributes: ["id"],
        transaction,
      });
      if (isExistUser) {
        const user = await this.update(
          { deletedAt: new Date() },
          { where: { id: +isExistUser.id }, transaction }
        );
        // await createHistoryRecord({
        //   tableName: tableEnum.USER,
        //   moduleName: moduleName.ADMIN,
        //   userId: authUser?.id,
        //   lastlogintime: authUser?.loginUserData?.logintimeutc,
        //   custom_message: await customHistoryDeleteMessage(user, tableEnum.MESSAGE, isExistUser),
        //   jsonData: parse(user),
        //   activity: statusEnum.VIEW,
        // });
        return user;
      }
    });
  };

  readonly getUserRoleData = async (userId: number) => {
    const isExistUser: User = await this.get({
      where: { id: userId, status: "ACTIVE" },
      attributes: ["name", "role", "id"],
    });
    return isExistUser.toJSON();
  };

  readonly getUserRolePermissionData = async (
    loginUserId: number,
    roleId: number,
    clientId?: number
  ) => {
    let feature = await Feature.findAll({
      include: [
        {
          model: Permission,
          required: true,
          attributes: ["id", "permissionName"],
          include: [
            {
              model: UserPermission,
              required: false,
              where: {
                loginUserId: loginUserId,
                roleId: roleId,
                clientId: Number(clientId) ? clientId : null,
              },
              attributes: ["id", "roleId"],
            },
          ],
        },
      ],
      attributes: ["id", "name"],
    });
    feature = parse(feature);
    let result = {};
    feature?.map((value) => {
      result = {
        ...result,
        [value.name]: value?.permissions?.map((val) => {
          return val.permissionName;
        }),
      };
    });
    return { ...result };
  };

  static readonly getLoginUserData = async (email: string) => {
    // let isEmployee = false;
    // const ismultipleUser = await User.findAll({
    // 	where: { status: status.ACTIVE },
    // 	include: [
    // 		{
    // 			model: LoginUser,
    // 			attributes: ['id'],
    // 			where: { email },
    // 		},
    // 		{ model: Role, attributes: ['id', 'name'] },
    // 	],
    // });
    // const employeeRole = await Role.findOne({
    // 	where: {
    // 		name: 'Employee',
    // 	},
    // 	attributes: ['id', 'name'],
    // });
    // if (ismultipleUser?.length > 0 && ismultipleUser?.findIndex((e) => e?.roleData?.name === employeeRole?.name) >= 0) {
    // 	isEmployee = true;
    // }

    return (<ModelCtor<User>>db.models.User)
      .findOne({
        where: { deletedAt: null },
        include: [
          {
            model: Role,
            attributes: ["name", "isViewAll"],
            // where: {
            // 	...(isEmployee && {
            // 		id: {
            // 			[Op.ne]: employeeRole?.id,
            // 		},
            // 	}),
            // },
          },
          { model: LoginUser, required: true, where: { email: email } },
          {
            model: UserClient,
            attributes: ["clientId"],
          },
          {
            model: UserSegment,
            attributes: ["id", "segmentId", "subSegmentId"],
          },
        ],
        // order: [['id', 'desc']],
        rejectOnEmpty: false,
      })
      .then((data) => parse(data));
  };

  //============== Send Password Update Link SERVICE ================
  async sendLink(data) {
    try {
      const { email } = data;

      const user = await User.findOne({
        include: [
          {
            model: LoginUser,
            required: true,
            where: { email, deletedAt: null },
          },
        ],
        rejectOnEmpty: false,
      });
      if (!user) throw new HttpException(400, "User not found");

      if (user) {
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
        await createHistoryRecord({
          tableName: tableEnum.USER,
          moduleName: moduleName.ADMIN,
          userId: user?.id,
          custom_message: `<b>${user?.loginUserData?.name}<b/> has send mail for Reset Password`,
          lastlogintime: user?.loginUserData?.logintimeutc,
          jsonData: parse(user),
          activity: statusEnum.EXPORT,
        });
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
