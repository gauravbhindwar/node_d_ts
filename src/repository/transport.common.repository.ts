import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum } from "@/interfaces/model/history.interface";
import {
  ITransportCommonCreate,
  TransportCommonAttributes,
} from "@/interfaces/model/transport.common.interface";
import TransportModels from "@/models/transport.models.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import Models from "../models";
import BaseRepository from "./base.repository";

export default class TransportCommonRepo extends BaseRepository<
  TransportModels
> {
  constructor() {
    super(TransportModels.name);
  }

  private msg = new MessageFormation("TransportModel").message;
  private customMsg = new MessageFormation("TransportModel");

  async getAllCommonTransport(query: IQueryParameters) {
    const { page, limit, clientId, type, sort, sortBy, search } = query;
    const sortedColumn = sortBy || null;
    let data = await Models.models[type].findAndCountAll({
      where: {
        deletedAt: null,
        ...(clientId && { clientId: clientId }),
        ...(search && {
          name: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
        }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "name", sort ?? "asc"]],
    });

    data = parse(data);

    const responseObj = {
      data: data?.rows,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
      type: type,
    };
    return responseObj;
  }

  async getTransportData(query: IQueryParameters) {
    const { clientId, type } = query;

    let data = await Models.models[type].findAndCountAll({
      where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
      attributes: ["id", "name"],
      order: [["name", "asc"]],
    });

    data = parse(data);

    const responseObj = {
      data: data?.rows,
      count: data?.count,
      type: type,
    };
    return responseObj;
  }

  async getCommonTransportById(id: number, type: string) {
    let data = await Models.models[type].findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async addCommonTransport({
    body,
    user,
  }: {
    body: ITransportCommonCreate;
    user: User;
  }) {
    const isExistTransportModels = await Models.models[body.type].findOne({
      where: {
        name: body.name,
        clientId: body.clientId,
      },
    });

    if (isExistTransportModels) {
      throw new HttpException(
        200,
        this.customMsg.custom(`${body.type} already exist`),
        {},
        true
      );
    }
    let data = await Models.models[body.type].create({
      ...body,
      createdBy: user.id,
    });
    data = parse(data);

    await createHistoryRecord({
      tableName: body.type,
      moduleName: moduleName.TRANSPORT,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created</b> Common Transport in ${body.type}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateCommonTransport({
    body,
    user,
    id,
  }: {
    body: TransportCommonAttributes;
    user: User;
    id: number;
  }) {
    const isExistTransportModels = await Models.models[body.type].findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportModels) {
      throw new HttpException(404, `${body.type} Not Found`, {}, true);
    }

    const isAlreadyExistTransportModels = await Models.models[
      body.type
    ].findOne({
      where: {
        name: body.name,
        clientId: body.clientId,
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (isAlreadyExistTransportModels) {
      throw new HttpException(200, `${body.type} already exist`, {}, true);
    }

    await Models.models[body.type].update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getCommonTransportById(id, body.type);

    await createHistoryRecord({
      tableName: body.type,
      moduleName: moduleName.TRANSPORT,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Common Transport in ${body.type}`,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteCommonTransport(id: number, type: string, user: User) {
    const isExistTransportModels = await Models.models[type].findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportModels) {
      throw new HttpException(404, `${type} Not Found`);
    }
    let data = await Models.models[type].destroy({
      where: {
        id: id,
      },
    });
    await createHistoryRecord({
      tableName: type,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Common Transport in ${type}`,
      jsonData: parse(isExistTransportModels),
      activity: statusEnum.DELETE,
    });
    data = parse(data);
    return data;
  }
}
