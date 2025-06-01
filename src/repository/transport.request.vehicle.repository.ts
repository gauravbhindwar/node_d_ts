import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import { transportStatus } from "@/interfaces/model/transport.request.interface";
import {
  ITransportRequestVehicleCreate,
  TransportRequestVehicleAttributes,
} from "@/interfaces/model/transport.request.vehicle.interface";
import TransportDriver from "@/models/transport.driver.model";
import TransportRequest from "@/models/transport.request.model";
import TransportRequestVehicle from "@/models/transport.request.vehicle.model";
import TransportVehicle from "@/models/transport.vehicle.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { checkDate } from "@/utils/transport/transport";
import _ from "lodash";
import BaseRepository from "./base.repository";

export default class TransportRequestVehicleRepo extends BaseRepository<
  TransportRequestVehicle
> {
  constructor() {
    super(TransportRequestVehicle.name);
  }

  private msg = new MessageFormation("TransportRequestVehicle").message;

  async getAllTransportRequestVehicle(query: IQueryParameters) {
    const { page, limit, clientId, requestId, sort, sortBy } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        requestId: requestId,
        ...(clientId && { clientId: clientId }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      include: [
        { model: TransportVehicle, paranoid: false, attributes: ["vehicleNo"] },
        { model: TransportDriver, paranoid: false, attributes: ["driverNo"] },
      ],
      order: [[sortedColumn ?? "requestId", sort ?? "asc"]],
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

  async getTransportRequestVehicleById(id: number) {
    let data = await TransportRequestVehicle.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: TransportVehicle,
          attributes: ["vehicleNo"],
          where: { deletedAt: null },
        },
        {
          model: TransportDriver,
          attributes: ["driverNo"],
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

  async addTransportRequestVehicle({
    body,
    user,
    startDate,
    endDate,
  }: {
    body: ITransportRequestVehicleCreate;
    user: User;
    startDate: string;
    endDate: string;
  }) {
    const unavailableDates = startDate + "-" + endDate;

    let data = await TransportRequestVehicle.create({
      ...body,
      createdBy: user.id,
    });
    if (data) {
      await TransportRequest.update(
        { status: transportStatus.STARTED },
        { where: { id: data.requestId, deletedAt: null } }
      );
      updateOldData(data, unavailableDates);
    }
    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_REQUEST_VEHICLE,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>added</b> Transport Request Vehicle to client id ${data.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateTransportRequestVehicle({
    body,
    user,
    id,
    startDate,
    endDate,
  }: {
    body: TransportRequestVehicleAttributes;
    user: User;
    id: number;
    startDate: string;
    endDate: string;
  }) {
    const unavailableDates = startDate + "-" + endDate;
    let vehicleData,
      driverData,
      table = "";
    const isExistTransportRequest = await TransportRequestVehicle.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportRequest) {
      throw new HttpException(404, this.msg.notFound);
    }

    if (isExistTransportRequest) {
      driverData = await TransportDriver.findOne({
        where: { id: isExistTransportRequest.driverId },
        attributes: ["id", "unavailableDates"],
      });
      vehicleData = await TransportVehicle.findOne({
        where: { id: isExistTransportRequest.vehicleId },
        attributes: ["id", "unavailableDates"],
      });

      if (driverData) {
        table = "driverData";
        checkDate(driverData, table, unavailableDates);
      }
      if (vehicleData) {
        table = "vehicleData";
        checkDate(vehicleData, table, unavailableDates);
      }
    }

    await TransportRequestVehicle.update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getTransportRequestVehicleById(id);
    if (updatedData) {
      updateOldData(updatedData, unavailableDates);
    }

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_REQUEST_VEHICLE,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Request Vehicle to client id ${updatedData.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteTransportRequestVehicle(id: number, query: IQueryParameters, user?: User) {
    const unavailableDates =
      query.transportStartDate + "-" + query.transportEndDate;

    let vehicleData,
      driverData,
      table = "";
    const isExistTransportRequest = await TransportRequestVehicle.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportRequest) {
      throw new HttpException(404, this.msg.notFound);
    }

    if (isExistTransportRequest) {
      driverData = await TransportDriver.findOne({
        where: { id: isExistTransportRequest.driverId },
        attributes: ["id", "unavailableDates"],
      });

      vehicleData = await TransportVehicle.findOne({
        where: { id: isExistTransportRequest.vehicleId },
        attributes: ["id", "unavailableDates"],
      });

      if (driverData) {
        table = "driverData";
        checkDate(driverData, table, unavailableDates);
      }

      if (vehicleData) {
        table = "vehicleData";
        checkDate(vehicleData, table, unavailableDates);
      }
    }

    let data = await TransportRequestVehicle.destroy({
      where: {
        id: id,
      },
    });
    if (data) {
      const getData = await TransportRequestVehicle.findOne({
        where: {
          requestId: isExistTransportRequest.requestId,
        },
      });
      if (!getData) {
        await TransportRequest.update(
          { status: transportStatus.DRAFT },
          { where: { id: isExistTransportRequest.requestId, deletedAt: null } }
        );
      }
    }
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_REQUEST_VEHICLE,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Request Vehicle to client id ${isExistTransportRequest.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
    data = parse(data);
    return data;
  }
}

const updateOldData = async (data, unavailableDates) => {
  let oldDriverData = await TransportDriver.findOne({
    where: {
      deletedAt: null,
      id: data.driverId,
    },
    attributes: ["id", "unavailableDates"],
  });
  let oldVehicleData = await TransportVehicle.findOne({
    where: {
      deletedAt: null,
      id: data.vehicleId,
    },
    attributes: ["id", "unavailableDates"],
  });
  oldDriverData = parse(oldDriverData);
  oldVehicleData = parse(oldVehicleData);

  let finalDriverUnavailableDate, finalVehicleUnavailableDate;
  if (
    oldVehicleData.unavailableDates === null ||
    oldVehicleData.unavailableDates === "" ||
    oldVehicleData.unavailableDates === undefined
  ) {
    finalVehicleUnavailableDate = unavailableDates;
  }
  if (
    oldDriverData.unavailableDates === null ||
    oldDriverData.unavailableDates === "" ||
    oldDriverData.unavailableDates === undefined
  ) {
    finalDriverUnavailableDate = unavailableDates;
  }
  if (!_.isEmpty(oldVehicleData.unavailableDates)) {
    finalVehicleUnavailableDate = oldVehicleData.unavailableDates.concat(
      ",",
      unavailableDates
    );
  }
  if (!_.isEmpty(oldDriverData.unavailableDates)) {
    finalDriverUnavailableDate = oldDriverData.unavailableDates.concat(
      ",",
      unavailableDates
    );
  }

  await TransportVehicle.update(
    { unavailableDates: finalVehicleUnavailableDate },
    { where: { id: data.vehicleId } }
  );
  await TransportDriver.update(
    { unavailableDates: finalDriverUnavailableDate },
    { where: { id: data.driverId } }
  );
};
