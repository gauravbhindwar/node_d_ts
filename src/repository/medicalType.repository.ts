import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryDeleteMessage,
  customHistoryUpdateMesage,
} from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import {
  IMedicalTypeCreate,
  MedicalTypeAttributes,
} from "@/interfaces/model/medicalType.interface";
import MedicalType from "@/models/medicalType.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import BaseRepository from "./base.repository";

export default class MedicalTypeRepo extends BaseRepository<MedicalType> {
  constructor() {
    super(MedicalType.name);
  }

  private msg = new MessageFormation("MedicalType").message;

  async getAllMedicalTypes(query: IQueryParameters) {
    const { page, limit, sortBy, sort } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
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
    };
    return responseObj;
  }

  async getMedicalTypesData() {
    let data = await this.getAllData({
      where: {
        deletedAt: null,
      },
      attributes: ["id", "name", "format"],
      order: [["name", "asc"]],
    });

    // await createHistoryRecord({
    //   tableName: tableEnum.MEDICAL_TYPE,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MEDICAL_TYPE, `Medical Types Data!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });

    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    return responseObj;
  }

  async getMedicalTypeById(id: number) {
    let data = await MedicalType.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }

    // await createHistoryRecord({
    //   tableName: tableEnum.MEDICAL_TYPE,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MEDICAL_TYPE, `Specific Medical Types!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });

    data = parse(data);
    return data;
  }

  async addMedicalType({
    body,
    user,
  }: {
    body: IMedicalTypeCreate;
    user: User;
  }) {
    const isExistMedicalType = await MedicalType.findOne({
      where: {
        name: body.name,
        deletedAt: null,
      },
    });
    if (isExistMedicalType) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    const medicalTypeIndex = await MedicalType.findOne({
      order: [["index", "desc"]],
    });

    const index = medicalTypeIndex ? medicalTypeIndex.index + 1 : 1;
    let data = await MedicalType.create({
      ...body,
      index: index,
      createdBy: user.id,
    });
    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.MEDICAL_TYPE,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryCreateMessage(
        user,
        tableEnum.MEDICAL_TYPE,
        data
      ),
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateMedicalType({
    body,
    user,
    id,
  }: {
    body: MedicalTypeAttributes;
    user: User;
    id: number;
  }) {
    const isExistMedicalType = await MedicalType.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistMedicalType) {
      throw new HttpException(404, this.msg.notFound);
    }

    await MedicalType.update(
      { ...body, updatedBy: user.id },
      { where: { id: id }, individualHooks: true }
    );
    const updatedData = await this.getMedicalTypeById(id);

    await createHistoryRecord({
      tableName: tableEnum.MEDICAL_TYPE,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryUpdateMesage(
        body,
        isExistMedicalType,
        user,
        updatedData,
        tableEnum.MEDICAL_TYPE
      ),
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });

    return updatedData;
  }

  async deleteMedicalType(id: number, user: User) {
    const isExistMedicalType = await MedicalType.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistMedicalType) {
      throw new HttpException(404, this.msg.notFound);
    }

    await isExistMedicalType.destroy();
    await createHistoryRecord({
      tableName: tableEnum.MEDICAL_TYPE,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryDeleteMessage(
        user,
        tableEnum.MEDICAL_TYPE,
        isExistMedicalType
      ),
      jsonData: parse(isExistMedicalType),
      activity: statusEnum.DELETE,
    });
    return {};
  }
}
