import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import {
  ITransportCapacityCreate,
  TransportCapacityAttributes,
} from "@/interfaces/model/transport.capacity.interface";
import TransportCapacity from "@/models/transport.capacity.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class TransportCapacityRepo extends BaseRepository<
  TransportCapacity
> {
  constructor() {
    super(TransportCapacity.name);
  }

  private msg = new MessageFormation("TransportCapacity").message;

  async getAllTransportCapacity(query: IQueryParameters) {
    const { page, limit, clientId, sort, sortBy } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "value", sort ?? "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    return responseObj;
  }

  async getTransportCapacityData(query: IQueryParameters) {
    const { clientId } = query;
    let data = await this.getAllData({
      where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
      attributes: ["id", "value"],
      order: [["value", "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    return responseObj;
  }

  async getTransportCapacityById(id: number) {
    let data = await TransportCapacity.findOne({
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

  async addTransportCapacity({
    body,
    user,
  }: {
    body: ITransportCapacityCreate;
    user: User;
  }) {
    const isExistTransportCapacity = await TransportCapacity.findOne({
      where: {
        value: body.value,
        clientId: body.clientId,
      },
    });

    if (isExistTransportCapacity) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    let data = await TransportCapacity.create({ ...body, createdBy: user.id });
    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_CAPACITY,
      moduleName: moduleName.TRANSPORT,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created</b> Transport Capacity for client id ${data.clientId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateTransportCapacity({
    body,
    user,
    id,
  }: {
    body: TransportCapacityAttributes;
    user: User;
    id: number;
  }) {
    const isExistTransportCapacity = await TransportCapacity.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportCapacity) {
      throw new HttpException(404, this.msg.notFound, {}, true);
    }

    const isAlreadyExistTransportCapacity = await TransportCapacity.findOne({
      where: {
        value: body.value,
        clientId: body.clientId,
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (isAlreadyExistTransportCapacity) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    await TransportCapacity.update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getTransportCapacityById(id);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_CAPACITY,
      moduleName: moduleName.TRANSPORT,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Capacity for client id ${updatedData.clientId}`,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteTransportCapacity(id: number, user: User) {
    const isExistTransportCapacity = await TransportCapacity.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportCapacity) {
      throw new HttpException(404, this.msg.notFound);
    }
    let data = await TransportCapacity.destroy({
      where: {
        id: id,
      },
    });
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_CAPACITY,
      moduleName: moduleName.TRANSPORT,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Transport Capacity for client id ${isExistTransportCapacity.clientId}`,
      jsonData: parse(isExistTransportCapacity),
      activity: statusEnum.DELETE,
    });
    data = parse(data);
    return data;
  }
}
