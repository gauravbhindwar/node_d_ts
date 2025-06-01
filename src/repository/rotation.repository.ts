import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryDeleteMessage,
  customHistoryUpdateMesage
} from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import {
  IRotationCreate,
  RotationAttributes,
} from "@/interfaces/model/rotation.interface";
import Rotation from "@/models/rotation.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class RotationRepo extends BaseRepository<Rotation> {
  constructor() {
    super(Rotation.name);
  }

  private msg = new MessageFormation("Data").message;

async getAllRotation(query: IQueryParameters) {
  const { page = 1, limit = 10, sortBy, sort = "asc", isResident } = query;
  const offset = (page - 1) * limit;

  // Validate sortBy
  const allowedSortColumns = ["name", "createdAt", "updatedAt"]; // add your allowed columns here
  const sortColumn = (typeof sortBy === "string" && sortBy.trim().length > 0 && allowedSortColumns.includes(sortBy))
    ? sortBy
    : "name";

  const sortDirection = sort.toUpperCase() === "DESC" ? "DESC" : "ASC";

  // Use parameterized query for isResident for safety
  const [results] = await Rotation.sequelize!.query(`
    SELECT DISTINCT ON (name) *
    FROM "rotation"
    WHERE "deletedAt" IS NULL
      AND "isResident" = $1
    ORDER BY name, "${sortColumn}" ${sortDirection}
    LIMIT $2
    OFFSET $3;
  `, {
    bind: [isResident, limit, offset]
  });

  const [countResult] = await Rotation.sequelize!.query(`
    SELECT COUNT(DISTINCT name) AS count
    FROM "rotation"
    WHERE "deletedAt" IS NULL
      AND "isResident" = $1;
  `, {
    bind: [isResident]
  });

  const count = parseInt((countResult[0] as { count: string }).count, 10);

  return {
    data: results,
    count,
    currentPage: page,
    limit,
    lastPage: Math.ceil(count / limit),
  };
}

  // async getAllRotation(query: IQueryParameters) {
  //   const { page, limit, sortBy, sort, isResident } = query;
  //   const sortedColumn = sortBy || null;

  // let data = await this.getAllData({
  //   where: { deletedAt: null, isResident: isResident },
  //   offset: page && limit ? (page - 1) * limit : undefined,
  //   limit: limit ?? undefined,
  //   order: [[sortedColumn ?? "name", sort ?? "asc"]],
  //   distinct: true,
  // });
  //   // await createHistoryRecord({
  //   //   tableName: isResident? tableEnum.RESIDENT: tableEnum.ROTATION,
  //   //   moduleName: moduleName.SETUP,
  //   //   userId: user?.id,
  //   //   lastlogintime: user?.loginUserData?.logintimeutc,
  //   //   custom_message: await customHistoryViewMessage(user, isResident? tableEnum.RESIDENT: tableEnum.ROTATION, `${limit} All ${isResident? 'Resident': 'Rotations'}!`),
  //   //   jsonData: parse(data),
  //   //   activity: statusEnum.VIEW,
  //   // });
  //   data = parse(data);
  //   const responseObj = {
  //     data: data?.rows,
  //     count: data?.count,
  //     currentPage: page ?? undefined,
  //     limit: limit ?? undefined,
  //     lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
  //   };
  //   return responseObj;
  // }

  async getRotationData() {
    let data = await this.getAllData({
      where: { deletedAt: null },
      attributes: ["name", "id"],
      order: [["name", "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    // await createHistoryRecord({
    //   tableName: tableEnum.ROTATION,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.ROTATION, `All Rotations!`),
    //   jsonData: parse(responseObj),
    //   activity: statusEnum.VIEW,
    // });
    return responseObj;
  }

  async getRotationById(id: number) {
    let data = await Rotation.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.ROTATION,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.ROTATION, `All Rotations!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    data = parse(data);
    return data;
  }

  async addRotation({ body, user }: { body: IRotationCreate; user: User }) {
    const isExistRotation = await Rotation.findOne({
      where: {
        name: {
          [Op.iLike]: body.name,
        },
        isResident: body.isResident ? true : false,
      },
    });

    if (isExistRotation) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    const weekOn = body.weekOn;
    const weekOff = body.weekOff;
    if (body?.annualHolidays) {
      body.weekOn = 365;
      body.weekOff = body.annualHolidays;
    }
    const annualHolidays = body.annualHolidays;
    let description = "";
    const daysWorked = body.daysWorked ? body.daysWorked.split(",") : [];
    let isAllDays = false;

    if (daysWorked.length == 7) {
      isAllDays = true;
    }

    const dayWork = body.daysWorked ? body.daysWorked : "";
    if (body.isResident) {
      if (annualHolidays != undefined) {
        description = `Resident ${annualHolidays} days off, working ${
          isAllDays ? "all days" : dayWork
        }`;
      }
    } else {
      if (weekOn != undefined && weekOff != undefined) {
        description = `Rotation ${weekOn} weeks on and ${weekOff} weeks off`;
      }
    }

    let data = await Rotation.create({
      ...body,
      description,
      isAllDays,
      createdBy: user.id,
    });
    data = parse(data);
    const table = data.isResident ? tableEnum.RESIDENT : tableEnum.ROTATION;
    await createHistoryRecord({
      tableName: table,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      moduleName: moduleName.SETUP,
      custom_message: await customHistoryCreateMessage(user, table, body),
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateRotation({
    body,
    user,
    id,
  }: {
    body: RotationAttributes;
    user: User;
    id: number;
  }) {
    const isExistRotation = await Rotation.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistRotation) {
      throw new HttpException(404, this.msg.notFound);
    }
    const weekOn = body.weekOn;
    const weekOff = body.weekOff;
    if (body?.annualHolidays) {
      body.weekOn = 365;
      body.weekOff = body.annualHolidays;
    }
    let description = "";
    const daysWorked = body.daysWorked ? body.daysWorked.split(",") : [];
    let isAllDays = false;
    if (daysWorked.length == 7) {
      isAllDays = true;
    }
    const dayWork = body.daysWorked ? body.daysWorked : "";
    if (body.isResident) {
      if (weekOff != undefined && weekOff != null) {
        description = `Resident ${weekOff} days off, working ${
          isAllDays ? "all days" : dayWork
        }`;
      }
    } else {
      if (
        weekOn != undefined &&
        weekOn != null &&
        weekOff != undefined &&
        weekOff != null
      ) {
        description = `Rotation ${weekOn} weeks on and ${weekOff} weeks off`;
      }
    }
    await Rotation.update(
      { ...body, description, isAllDays, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getRotationById(id);
    const table = isExistRotation.isResident
      ? tableEnum.RESIDENT
      : tableEnum.ROTATION;

    await createHistoryRecord({
      tableName: table,
      userId: user?.id,
      moduleName: moduleName.SETUP,
      custom_message: await customHistoryUpdateMesage(
        body,
        isExistRotation,
        user,
        parse(updatedData),
        table
      ),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteRotation(id: number, user: User) {
    const isExistRotation = await Rotation.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistRotation) {
      throw new HttpException(404, this.msg.notFound);
    }
    await isExistRotation.destroy();
    const table = isExistRotation.isResident
      ? tableEnum.RESIDENT
      : tableEnum.ROTATION;
    await createHistoryRecord({
      tableName: table,
      userId: user?.id,
      moduleName: moduleName.SETUP,
      custom_message : await customHistoryDeleteMessage(user, table, isExistRotation),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isExistRotation),
      activity: statusEnum.DELETE,
    });
    return {};
  }
}
