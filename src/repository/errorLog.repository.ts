import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, customHistoryCreateMessage } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { IErrorLogsCreate } from "@/interfaces/model/errorLogs.interface";
import { statusEnum, tableEnum, moduleName } from "@/interfaces/model/history.interface";
import Client from "@/models/client.model";
import ErrorLogs from "@/models/errorLogs.model";
import LoginUser from "@/models/loginUser.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class ErrorLogsRepo extends BaseRepository<ErrorLogs> {
  constructor() {
    super(ErrorLogs.name);
  }

  private msg = new MessageFormation("Error Logs").message;

  async getAllErrorLogsService(query: IQueryParameters) {
    const {
      page,
      limit,
      clientId,
      sortBy,
      sort,
      startDate,
      endDate,
      type,
    } = query;
    const sortedColumn = sortBy || null;
    const dateWithTimezone = new Date(
      new Date(endDate).getTime() -
        new Date(endDate).getTimezoneOffset() * 60000
    );
    dateWithTimezone.setHours(23, 59, 59, 999);
    let data = await this.getAllData({
      where: {
        isActive: "ACTIVE",
        ...(clientId ? { clientId: clientId } : {}),
        ...(startDate && endDate && dateWithTimezone
          ? {
              createdAt: {
                [Op.between]: [
                  startDate,
                  new Date(dateWithTimezone).toISOString(),
                ],
              },
            }
          : {}),
        ...(type !== undefined && { type: type }),
      },
      include: [
        {
          model: Client,
          attributes: ["loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
        {
          model: User,
          attributes: ["loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "createdAt", sort ?? "asc"]],
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

  async findAllErrorLogsCategories(id: number) {
    let data = await this.getAll({
      where: {
        clientId: id,
        isActive: "ACTIVE",
      },
      attributes: ["id", "type"],
    });
    data = parse(data);
    data = data.filter(
      (elem, index, self) =>
        self.findIndex((t) => {
          return t.type === elem.type;
        }) === index
    );
    return data;
  }

  async getErrorLogsById(id: number) {
    const isFound = await ErrorLogs.findOne({
      where: { id: id, isActive: "ACTIVE" },
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    return data;
  }

  async addErrorLogs({ body, user }: { body: IErrorLogsCreate, user: User }) {
    let data = await ErrorLogs.create({
      ...body,
    });
    data = parse(data);
    data = await this.getErrorLogsById(data.id);
    return data;
  }
}
