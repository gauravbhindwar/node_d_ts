import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryDeleteMessage,
  customHistoryUpdateMesage
} from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { IBonusTypeCreate } from "@/interfaces/model/bonusType.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import LoginUser from "@/models/loginUser.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import { default as BonusType } from "../models/bonusType.model";
import BaseRepository from "./base.repository";

export default class BonusTypeRepo extends BaseRepository<BonusType> {
  constructor() {
    super(BonusType.name);
  }

  private msg = new MessageFormation("BonusType").message;

  async getAllBonusTypeService(query: IQueryParameters) {
    const { page, limit, isActive, sort, sortBy } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        ...(isActive != undefined && { isActive: isActive }),
      },
      include: [
        {
          model: User,
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "name", sort ?? "asc"]],
    });
    // await createHistoryRecord({
    //   tableName: tableEnum.BONUS_TYPE,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.BONUS_TYPE, `Bonus Type Services!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
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

  async getBonusDropdownDataService() {
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        isActive: true,
      },
      include: [
        {
          model: User,
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      attributes: ["id", "code", "name", "timesheetName", "basePrice"],
      order: [["name", "asc"]],
    });
    data = parse(data);

    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    return responseObj;
  }

  async getBonusTypeByIdService(id: number, user?: User) {
    const isFound = await BonusType.findOne({
      where: { id: id, deletedAt: null },
      include: [
        {
          model: User,
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    if(user){
      // await createHistoryRecord({
      //   tableName: tableEnum.BONUS_TYPE,
      //   moduleName: moduleName.SETUP,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(user, tableEnum.BONUS_TYPE, `Specific Bonus Type Services!`),
      //   jsonData: parse(isFound),
      //   activity: statusEnum.VIEW,
      // });
    }
    const data = parse(isFound);
    return data;
  }

  async addBonusTypeService({
    body,
    user,
  }: {
    body: IBonusTypeCreate;
    user: User;
  }) {
    const isExist = await BonusType.findOne({
      where: { code: body.code, createdBy: user.id },
    });
    if (isExist) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    let data = await BonusType.create({ ...body, createdBy: user.id });
    data = parse(data);
    data = await this.getBonusTypeByIdService(data.id, user);

    await createHistoryRecord({
      tableName: tableEnum.BONUS_TYPE,
      userId: user?.id,
      moduleName: moduleName.SETUP,
      custom_message: await customHistoryCreateMessage(
        user,
        tableEnum.BONUS_TYPE,
        data
      ),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateBonusTypeStatus({
    body,
    id,
    user,
  }: {
    body: IBonusTypeCreate;
    id: number;
    user: User;
  }) {
    const isExist = await BonusType.findOne({ where: { id: id } });
    if (!isExist) {
      throw new HttpException(404, this.msg.notFound);
    }

    await BonusType.update({ isActive: body.isActive }, { where: { id: id } });
    const data = await this.getBonusTypeByIdService(id, user);
    await createHistoryRecord({
      tableName: tableEnum.BONUS_TYPE,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      moduleName: moduleName.SETUP,
      custom_message: await customHistoryUpdateMesage(
        body,
        isExist,
        user,
        data,
        tableEnum.BONUS_TYPE
      ),
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
    return data;
  }

  async updateBonusTypeService({
    body,
    user,
    id,
  }: {
    body: IBonusTypeCreate;
    user: User;
    id: number;
  }) {
    const isExist = await BonusType.findOne({
      where: { code: body.code, id: { [Op.ne]: id } },
    });
    if (isExist) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    await BonusType.update(
      { ...body, updatedBy: user.id },
      { where: { id: id } }
    );
    const data = await this.getBonusTypeByIdService(id);

    await createHistoryRecord({
      tableName: tableEnum.BONUS_TYPE,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      moduleName: moduleName.SETUP,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${tableEnum.BONUS_TYPE}`,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });

    return data;
  }

  async deleteBonusTypeService({ id, user }: { id: number; user: User }) {
    const isFound = await BonusType.findOne({ where: { id: id } });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    // const data = await BonusType.destroy({ where: { id: id } });
    await isFound.destroy();
    await createHistoryRecord({
      tableName: tableEnum.BONUS_TYPE,
      userId: user?.id,
      moduleName: moduleName.SETUP,
      custom_message: await customHistoryDeleteMessage(
        user,
        tableEnum.BONUS_TYPE,
        isFound
      ),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isFound),
      activity: statusEnum.DELETE,
    });
    return {};
  }

  async getAllBonusTypeServiceCode(user?: User) {
    let data = await this.getAllData({
      attributes: ["code"],
      where: {
        deletedAt: null,
      },
    });
    if(user){
      // await createHistoryRecord({
      //   tableName: tableEnum.BONUS_TYPE,
      //   moduleName: moduleName.SETUP,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(user, tableEnum.BONUS_TYPE, `All Bonus Type Servive Code!`),
      //   jsonData: parse(data),
      //   activity: statusEnum.VIEW,
      // });
    }
    data = parse(data);
    const responseData = data?.rows?.map((object) => object.code);
    return responseData;
  }
}
