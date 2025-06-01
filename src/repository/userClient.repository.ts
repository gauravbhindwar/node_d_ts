import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, customHistoryUpdateMesage } from "@/helpers/history.helper";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import { status } from "@/interfaces/model/user.interface";
import RolePermission from "@/models/rolePermission.model";
import Segment from "@/models/segment.model";
import User from "@/models/user.model";
import UserClient from "@/models/userClient.model";
import UserPermission from "@/models/userPermission.model";
import UserSegment from "@/models/userSegment.model";
import UserSegmentApproval from "@/models/userSegmentApproval.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class UserClientRepo extends BaseRepository<UserClient> {
  constructor() {
    super(UserClient.name);
  }

  private msg = new MessageFormation("User Client").message;

  async updateUserClientData({
    body,
    user,
    id,
    clientId,
  }: {
    body: { client: number[] };
    user: User;
    id: number;
    clientId?: number;
  }) {
    const isExistUser = await User.findOne({ where: { id: id } });
    for (const element of body.client) {
      const isExist = await UserClient.findOne({
        where: { clientId: element, userId: id, deletedAt: null },
      });
      if (!isExist) {
        await UserClient.create({
          clientId: element,
          roleId: isExistUser?.roleId,
          userId: id,
          status: status.ACTIVE,
          createdBy: user.id,
        });
        UserPermission.destroy({
          where: {
            loginUserId: isExistUser?.loginUserId,
            clientId: Number(element),
          },
          force: true,
        });
        const rolePermissions = await RolePermission.findAll({
          where: { roleId: isExistUser?.roleId },
        });
        rolePermissions?.map(async (value) => {
          await UserPermission.create({
            permissionId: value?.permissionId,
            loginUserId: isExistUser?.loginUserId,
            roleId: isExistUser?.roleId,
            clientId: Number(element),
            createdBy: user.id,
          });
        });
      }
    }
    const userClientList = await UserClient.findAll({
      where: { userId: id, clientId: { [Op.notIn]: body.client } },
    });
    userClientList?.map(async (userClient) => {
      const segmentData = await Segment.findAll({
        where: { clientId: userClient.clientId },
      });
      const segmentIds = segmentData?.map((segment) => segment.id);
      if (segmentIds.length) {
        await UserSegment.destroy({
          where: {
            userId: userClient.userId,
            segmentId: {
              [Op.in]: segmentIds,
              ...(clientId ? { clientId: clientId } : {}),
            },
          },
        });
        await UserSegmentApproval.destroy({
          where: {
            userId: userClient.userId,
            segmentId: {
              [Op.in]: segmentIds,
              ...(clientId ? { clientId: clientId } : {}),
            },
          },
        });
      }
    });

    await UserClient.destroy({
      where: { userId: id, clientId: { [Op.notIn]: body.client } },
    });
    const responseData = parse(isExistUser);
    await createHistoryRecord({
      tableName: tableEnum.USER_CLIENT,
      moduleName: moduleName.ADMIN,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryUpdateMesage(body, isExistUser, user,  responseData, tableEnum.ROLE, `update user`),
      jsonData: parse(responseData),
      activity: statusEnum.UPDATE,
    });
    return responseData;
  }

  readonly deleteUserClient = async (id: number, clientId?: number, user?: User) => {
    const isExistUserClient = await this.get({
      where: { id, deletedAt: null },
    });
    if (isExistUserClient) {
      await this.deleteData({ where: { id: id } });
      const segmentData = await Segment.findAll({
        where: { clientId: isExistUserClient.clientId },
      });
      const segmentIds = segmentData?.map((segment) => segment.id);
      if (segmentIds.length) {
        await UserSegment.destroy({
          where: {
            userId: isExistUserClient.userId,
            segmentId: {
              [Op.in]: segmentIds,
              ...(clientId ? { clientId: clientId } : {}),
            },
          },
        });
        await UserSegmentApproval.destroy({
          where: {
            userId: isExistUserClient.userId,
            segmentId: {
              [Op.in]: segmentIds,
              ...(clientId ? { clientId: clientId } : {}),
            },
          },
        });
        await createHistoryRecord({
          tableName: tableEnum.USER_CLIENT,
          moduleName: moduleName.ADMIN,
          userId: user?.id,
          custom_message: `<b>${user?.loginUserData?.name}<b/> has <b>deleted</b> the ${tableEnum.USER_CLIENT} user id <b>${isExistUserClient.userId}</b>`,
          lastlogintime: user?.loginUserData?.logintimeutc,
         jsonData: parse(isExistUserClient),
          activity: statusEnum.DELETE,
        });
      }
      return true;
    } else throw new HttpException(404, this.msg.notFound);
  };
}
