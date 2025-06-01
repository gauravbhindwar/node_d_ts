import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import {
  ITransportRequestCreate,
  TransportRequestAttributes,
} from "@/interfaces/model/transport.request.interface";
import LoginUser from "@/models/loginUser.model";
import TransportDriver from "@/models/transport.driver.model";
import TransportRequest from "@/models/transport.request.model";
import TransportRequestVehicle from "@/models/transport.request.vehicle.model";
import TransportVehicle from "@/models/transport.vehicle.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { checkDate } from "@/utils/transport/transport";
import moment from "moment";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class TransportRequestRepo extends BaseRepository<
  TransportRequest
> {
  constructor() {
    super(TransportRequest.name);
  }

  private msg = new MessageFormation("TransportRequest").message;

  async getAllTransportRequest(query: IQueryParameters) {
    const { page, limit, clientId, sort, sortBy, search } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        ...(clientId && { clientId: clientId }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      include: [
        {
          model: User,
          attributes: ["loginUserId"],
          include: [
            {
              model: LoginUser,
              attributes: ["email"],
              where: {
                ...(search && {
                  email: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
                }),
              },
            },
          ],
          where: { deletedAt: null },
        },
      ],
      order: [[sortedColumn ?? "source", sort ?? "asc"]],
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

  async getTransportRequestById(id: number) {
    let data = await TransportRequest.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: User,
          attributes: ["loginUserId"],
          include: [{ model: LoginUser, attributes: ["email"] }],
          where: { deletedAt: null },
        },
      ],
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async addTransportRequest({
    body,
    user,
  }: {
    body: ITransportRequestCreate;
    user: User;
  }) {
    let data = await TransportRequest.create({ ...body, createdBy: user.id });
    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_REQUEST,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>added</b> Transport Request to client id ${data.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateTransportRequest({
    body,
    user,
    id,
  }: {
    body: TransportRequestAttributes;
    user: User;
    id: number;
  }) {
    const isExistTransportRequest = await TransportRequest.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportRequest) {
      throw new HttpException(404, this.msg.notFound);
    }

    await TransportRequest.update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null }, individualHooks: true }
    );
    const updatedData = await this.getTransportRequestById(id);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_REQUEST,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Request to client id ${updatedData.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteTransportRequest(id: number, user: User) {
    let isExistTransportRequest = await TransportRequestVehicle.findAll({
      where: {
        requestId: id,
        deletedAt: null,
      },
      include: [
        {
          model: TransportRequest,
          attributes: ["id", "startDate", "destinationDate"],
        },
        { model: TransportDriver, attributes: ["id", "unavailableDates"] },
        { model: TransportVehicle, attributes: ["id", "unavailableDates"] },
      ],
    });

    let driverData,
      vehicleData,
      startingDate,
      endingDate,
      unavailableDates,
      table = "";

    isExistTransportRequest = parse(isExistTransportRequest);

    if (!isExistTransportRequest) {
      throw new HttpException(404, this.msg.notFound);
    }

    if (isExistTransportRequest) {
      for (const element of isExistTransportRequest) {
        startingDate = moment(element.request.startDate).format("DD/MM/YYYY");
        endingDate = moment(element.request.destinationDate).format(
          "DD/MM/YYYY"
        );
        unavailableDates = startingDate + "-" + endingDate;

        driverData = await TransportDriver.findOne({
          where: { id: element.driverId },
          attributes: ["id", "unavailableDates"],
        });
        driverData = parse(driverData);

        vehicleData = await TransportVehicle.findOne({
          where: { id: element.vehicleId },
          attributes: ["id", "unavailableDates"],
        });

        vehicleData = parse(vehicleData);

        if (driverData) {
          table = "driverData";
          checkDate(driverData, table, unavailableDates);
        }

        if (vehicleData) {
          table = "vehicleData";
          checkDate(vehicleData, table, unavailableDates);
        }
      }
      await TransportRequestVehicle.destroy({
        where: {
          requestId: id,
          deletedAt: null,
        },
      });
    }

    let data = await TransportRequest.destroy({
      where: {
        id: id,
      },
    });

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_REQUEST,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Transport Request.`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isExistTransportRequest),
      activity: statusEnum.DELETE,
    });

    data = parse(data);
    return data;
  }
}
