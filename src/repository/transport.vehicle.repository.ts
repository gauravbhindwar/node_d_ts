import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import {
  ITransportVehicleCreate,
  TransportVehicleAttributes,
} from "@/interfaces/model/transport.vehicle.interface";
import TransportModels from "@/models/transport.models.model";
import TransportType from "@/models/transport.type.model";
import TransportVehicle from "@/models/transport.vehicle.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import _ from "lodash";
import moment from "moment";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class TransportVehicleRepo extends BaseRepository<
  TransportVehicle
> {
  constructor() {
    super(TransportVehicle.name);
  }

  private msg = new MessageFormation("TransportVehicle").message;

  async getAllTransportVehicle(query: IQueryParameters) {
    const { page, limit, clientId, sort, sortBy, search } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        ...(clientId && { clientId: clientId }),
        ...(search && {
          vehicleNo: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
        }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      include: [
        { model: TransportType, attributes: ["name"] },
        { model: TransportModels, attributes: ["name"] },
      ],
      order: [[sortedColumn ?? "year", sort ?? "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data.rows,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    return responseObj;
  }

  async getAvailableTransportVehicles(query: IQueryParameters) {
    const { clientId, transportStartDate, transportEndDate } = query;
    const transportStartDates = moment(transportStartDate, "DD/MM/YYYY");
    const transportEndDates = moment(transportEndDate, "DD/MM/YYYY");

    const transportDifferenceDates = [];
    let vehicleBookedDatesDifference = [];
    let startDate, endDate;
    const vehicleDropdownData = [];

    let data = await TransportVehicle.findAll({
      where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
      attributes: ["id", "unavailableDates", "vehicleNo"],
    });

    data = parse(data);

    for (
      let m = moment(transportStartDates);
      m.isSameOrBefore(transportEndDates);
      m.add(1, "days")
    ) {
      transportDifferenceDates.push(m.format("DD/MM/YYYY"));
    }

    data.forEach((item) => {
      if (!_.isEmpty(item.unavailableDates)) {
        vehicleBookedDatesDifference = [];
        item?.unavailableDates?.split(",").forEach((element) => {
          const splitted = element?.split("-");

          startDate = moment(splitted[0], "DD/MM/YYYY");
          endDate = moment(splitted[1], "DD/MM/YYYY");

          for (
            let m = moment(startDate);
            m.isSameOrBefore(endDate);
            m.add(1, "days")
          ) {
            vehicleBookedDatesDifference.push(m.format("DD/MM/YYYY"));
          }
        });
        const result = vehicleBookedDatesDifference.some((element) => {
          return transportDifferenceDates.includes(element);
        });
        if (!result) {
          vehicleDropdownData.push(item);
        }
      } else if (_.isEmpty(item.unavailableDates)) {
        vehicleDropdownData.push(item);
      }
    });

    return vehicleDropdownData;
  }

  async getTransportVehicleById(id: number) {
    let data = await TransportVehicle.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        { model: TransportType, attributes: ["name"] },
        { model: TransportModels, attributes: ["name"] },
      ],
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async addTransportVehicle({
    body,
    user,
  }: {
    body: ITransportVehicleCreate;
    user: User;
  }) {
    const isExistTransportVehicle = await TransportVehicle.findOne({
      where: {
        vehicleNo: body.vehicleNo,
        clientId: body.clientId,
      },
    });

    if (isExistTransportVehicle) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    const filterData = _.omit(body, "capacity");
    const capacity = body.capacity.toString();

    let data = await TransportVehicle.create({
      ...filterData,
      capacity,
      createdBy: user.id,
    });
    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_VEHICLE,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>added</b> Transport Vehicle for client id ${data.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateTransportVehicle({
    body,
    user,
    id,
  }: {
    body: TransportVehicleAttributes;
    user: User;
    id: number;
  }) {
    const isExistTransportVehicle = await TransportVehicle.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportVehicle) {
      throw new HttpException(404, this.msg.notFound, {}, true);
    }

    const isAlreadyExistTransportVehicle = await TransportVehicle.findOne({
      where: {
        id: {
          [Op.ne]: id,
        },
        vehicleNo: body.vehicleNo,
        clientId: body.clientId,
      },
    });

    if (isAlreadyExistTransportVehicle) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    const filterData = _.omit(body, "capacity");

    const capacity = body.capacity.toString();

    await TransportVehicle.update(
      { ...filterData, capacity, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getTransportVehicleById(id);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_VEHICLE,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Vehicle for client id ${updatedData.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteTransportVehicle(id: number, user: User) {
    const isExistTransportCapacity = await TransportVehicle.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistTransportCapacity) {
      throw new HttpException(404, this.msg.notFound);
    }
    let data = await TransportVehicle.destroy({
      where: {
        id: id,
      },
    });
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_VEHICLE,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Transport Vehicle for client id ${isExistTransportCapacity.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isExistTransportCapacity),
      activity: statusEnum.DELETE,
    });

    data = parse(data);
    return data;
  }
}
