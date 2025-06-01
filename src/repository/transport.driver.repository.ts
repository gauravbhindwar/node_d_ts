import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import {
  ITransportDriverCreate,
  TransportDriverAttributes,
} from "@/interfaces/model/transport.driver.interface";
import TransportDriver from "@/models/transport.driver.model";
import TransportPositions from "@/models/transport.positions.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import _ from "lodash";
import moment from "moment";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class TransportDriverRepo extends BaseRepository<
  TransportDriver
> {
  constructor() {
    super(TransportDriver.name);
  }

  private msg = new MessageFormation("TransportDriver").message;

  async getAllTransportDriver(query: IQueryParameters) {
    const { page, limit, clientId, sort, sortBy, search } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        ...(clientId && { clientId: clientId }),
        ...(search && {
          driverNo: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
        }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      include: [{ model: TransportPositions, attributes: ["name"] }],
      order: [[sortedColumn ?? "driverNo", sort ?? "asc"]],
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

  async getAvailableTransportDriver(query: IQueryParameters) {
    const { clientId, transportStartDate, transportEndDate } = query;
    const transportStartDates = moment(transportStartDate, "DD/MM/YYYY");
    const transportEndDates = moment(transportEndDate, "DD/MM/YYYY");

    const transportDifferenceDates = [];
    let driverBookedDatesDifference = [];
    let startDate, endDate;
    const driverDropdownData = [];

    let data = await TransportDriver.findAll({
      where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
      attributes: ["id", "unavailableDates", "driverNo"],
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
        driverBookedDatesDifference = [];
        item?.unavailableDates?.split(",").forEach((element) => {
          const splitted = element?.split("-");

          startDate = moment(splitted[0], "DD/MM/YYYY");
          endDate = moment(splitted[1], "DD/MM/YYYY");

          for (
            let m = moment(startDate);
            m.isSameOrBefore(endDate);
            m.add(1, "days")
          ) {
            driverBookedDatesDifference.push(m.format("DD/MM/YYYY"));
          }
        });
        const result = driverBookedDatesDifference.some((element) => {
          return transportDifferenceDates.includes(element);
        });
        if (!result) {
          driverDropdownData.push(item);
        }
      } else if (_.isEmpty(item.unavailableDates)) {
        driverDropdownData.push(item);
      }
    });

    return driverDropdownData;
  }

  async getTransportDriverById(id: number) {
    let data = await TransportDriver.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [{ model: TransportPositions, attributes: ["name"] }],
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async addTransportDriver({
    body,
    user,
  }: {
    body: ITransportDriverCreate;
    user: User;
  }) {
    const isExistDriver = await TransportDriver.findOne({
      where: {
        driverNo: body.driverNo,
        clientId: body.clientId,
      },
    });

    if (isExistDriver) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    let data = await TransportDriver.create({ ...body, createdBy: user.id });
    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_DRIVER,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>added</b> Transport Driver to client id ${data.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateTransportDriver({
    body,
    user,
    id,
  }: {
    body: TransportDriverAttributes;
    user: User;
    id: number;
  }) {
    const isExistDriver = await TransportDriver.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistDriver) {
      throw new HttpException(404, this.msg.notFound, {}, true);
    }

    const isAlreadyExistDriver = await TransportDriver.findOne({
      where: {
        id: {
          [Op.ne]: id,
        },
        driverNo: body.driverNo,
        clientId: body.clientId,
      },
    });

    if (isAlreadyExistDriver) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    await TransportDriver.update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null }, individualHooks: true }
    );
    const updatedData = await this.getTransportDriverById(id);

    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_DRIVER,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Driver to client id ${updatedData.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteTransportDriver(id: number, user:User) {
    const isExistDriver = await TransportDriver.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistDriver) {
      throw new HttpException(404, this.msg.notFound);
    }

    let data = await TransportDriver.destroy({
      where: {
        id: id,
      },
    });
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_DRIVER,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Transport Driver to client id ${isExistDriver.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isExistDriver),
      activity: statusEnum.DELETE,
    });
    data = parse(data);
    return data;
  }
}
