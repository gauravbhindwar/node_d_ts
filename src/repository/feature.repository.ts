import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {createHistoryRecord, customHistoryCreateMessage, customHistoryUpdateMesage } from "@/helpers/history.helper";
import { ICreateUpdateFeature } from "@/interfaces/model/feature.interface";
import { moduleName,  statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import Permission from "@/models/permission.model";
import { parse } from "@/utils/common.util";
import User from "models/user.model";
import { Op } from "sequelize";
import { default as Feature } from "../models/feature.model";
import BaseRepository from "./base.repository";

export default class FeatureRepo extends BaseRepository<Feature> {
  constructor() {
    super(Feature.name);
  }

  private msg = new MessageFormation("Feature").message;

  async getAllFeatureService() {
    let data = await Feature.findAll({
      where: { deletedAt: null },
      include: [{ model: Permission, attributes: ["id", "permissionName"] }],
    });
    data = parse(data);
    return data;
  }

  async getFeatureByIdService(id: number) {
    const isFound = await Feature.findOne({
      where: { id: id, deletedAt: null },
      include: [{ model: Permission, attributes: ["id", "permissionName"] }],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    return data;
  }

  async addFeatureService({
    body,
    user,
  }: {
    body: ICreateUpdateFeature;
    user: User;
  }) {
    const isExist = await Feature.findOne({ where: { name: body.name } });
    if (isExist) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    let data = await Feature.create({ name: body.name, createdBy: user.id });
    data = parse(data);
    for (const element of body.permission) {
      const isPermissionExist = await this.checkAvailablePermission(
        element,
        data.id
      );

      if (!isPermissionExist) {
        await Permission.create({
          permissionName: element,
          featureId: data.id,
        });
      }
    }
    data = await this.getFeatureByIdService(data.id);
    await createHistoryRecord({
      tableName: tableEnum.FEATURES,
      userId: user?.id,
      moduleName: moduleName.ADMIN,
      custom_message: await customHistoryCreateMessage(user, tableEnum.FEATURES, {name: "Add Employee Features!"}),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });
    return data;
  }

  async checkAvailablePermission(permission: string, id: number) {
    return await Permission.findOne({
      where: { permissionName: permission, featureId: id },
    });
  }

  async updateFeatureService({
    body,
    user,
    id,
  }: {
    body: ICreateUpdateFeature;
    user: User;
    id: number;
  }) {
    const isExist = await Feature.findOne({
      where: { name: body.name, id: { [Op.ne]: id } },
    });
    if (isExist) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    let data = await Feature.update(
      { name: body.name, updatedBy: user.id },
      { where: { id: id } }
    );
    for (const element of body.permission) {
      const isPermissionExist = await this.checkAvailablePermission(
        element,
        id
      );

      if (!isPermissionExist) {
        await Permission.create({
          permissionName: element,
          featureId: id,
        });
      }
    }
    await Permission.destroy({
      where: { featureId: id, permissionName: { [Op.notIn]: body.permission } },
    });
    data = await this.getFeatureByIdService(id);
    await createHistoryRecord({
      tableName: tableEnum.FEATURES,
      userId: user?.id,
      moduleName: moduleName.ADMIN,
      custom_message: await customHistoryUpdateMesage(body, isExist, user,  data, tableEnum.FEATURES, `Feature Update!`),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
    return data;
  }

  async deleteFeatureService({ id }: { id: number }) {
    const isFound = await Feature.findOne({ where: { id: id } });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = await Feature.destroy({ where: { id: id } });
    return data;
  }
}
