import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, customHistoryCreateMessage, customHistoryUpdateMesage } from "@/helpers/history.helper";
import { secureFileToken } from "@/helpers/secureFolder.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  IEmployeeFileCreate,
  IEmployeeFileUpdate,
} from "@/interfaces/model/employeeFile.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import EmployeeFile from "@/models/employeeFile.model";
import Folder from "@/models/folder.model";
import User from "@/models/user.model";
import { fileDelete, folderExistCheck, parse } from "@/utils/common.util";
import path from "path";
import BaseRepository from "./base.repository";
import EmployeeRepo from "./employee.repository";

export default class EmployeeFileRepo extends BaseRepository<EmployeeFile> {
  private EmployeeService = new EmployeeRepo();
  constructor() {
    super(EmployeeFile.name);
  }

  private msg = new MessageFormation("EmployeeFile").message;

  async getAllEmployeeFileService(query: IQueryParameters) {
    const { page, limit, employeeId, sortBy, sort } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      include: [
        {
          model: Folder,
          attributes: ["name", "id"],
        },
      ],
      where: { status: 0, deletedAt: null, employeeId: employeeId },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "name", sort ?? "asc"]],
    });
    data = parse(data);
    const dataFile = await Promise.all(
      data?.rows.map(async (row) => {
        const temp = { ...row };
        temp.fileName = await secureFileToken(row.fileName);

        return temp;
      })
    );
    const responseObj = {
      data: dataFile,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    // await createHistoryRecord({
    //   tableName: tableEnum.EMPLOYEE_FILE,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.EMPLOYEE_FILE, `All Employees Files Detaile!`),
    //   jsonData: parse(responseObj),
    //   activity: statusEnum.VIEW,
    // });
    return responseObj;
  }

  async getEmployeeFileByIdService(id: number) {
    const isFound = await EmployeeFile.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    data.fileName = await secureFileToken(data.fileName);
    // await createHistoryRecord({
    //   tableName: tableEnum.EMPLOYEE_FILE,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.EMPLOYEE_FILE, `Specific Employees Files Detaile of ${isFound.fileName}!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    return data;
  }

  async addEmployeeFileService({
    body,
    user,
  }: {
    body: IEmployeeFileCreate;
    user: User;
  }) {
    try {
      const employeeData = await this.EmployeeService.getEmployeeByIdService(
        body?.employeeId
      );
  
      let data = await EmployeeFile.create({
        ...body,
        clientId: employeeData?.clientId,
        fileLink: body.fileLink === true ? true : false,
        createdBy: user.id,
      });
      data = parse(data);
  
      await createHistoryRecord({
        tableName: tableEnum.EMPLOYEE_FILE,
        moduleName: moduleName.SETUP,
        userId: user?.id,
        lastlogintime: user?.loginUserData?.logintimeutc,
        custom_message: await customHistoryCreateMessage(user, tableEnum.EMPLOYEE_FILE, data),
        jsonData: parse(data),
        activity: statusEnum.CREATE,
      });
  
      return data;
    } catch (error) {
      console.error('Error in addEmployeeFileService:', error);
      throw new Error('Failed to add employee file. ' + (error as Error).message);
    }
  }
  

  async updateEmployeeFileService({
    body,
    user,
    id,
  }: {
    body: IEmployeeFileUpdate;
    user: User;
    id: number;
  }) {
    const isExist = await EmployeeFile.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isExist) {
      throw new HttpException(403, this.msg.notFound);
    }
    const updatedData = await EmployeeFile.update(
      { ...body, name: body.newFileName, updatedBy: user.id },
      { where: { id: id } }
    );
    if (updatedData) {
      const data = await this.getEmployeeFileByIdService(id);

      await createHistoryRecord({
        tableName: tableEnum.EMPLOYEE_FILE,
        moduleName: moduleName.SETUP,
        userId: user?.id,
        custom_message: await customHistoryUpdateMesage(
          body,
          isExist,
          user,
          updatedData,
          tableEnum.EMPLOYEE_FILE
        ),
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(data),
        activity: statusEnum.UPDATE,
      });

      return data;
    }
  }

  async deleteEmployeeFileService({ id, user }: { id: number, user: User }) {
    const isFound = await EmployeeFile.findOne({
      where: { id: id },
      include: [{ model: Folder, attributes: ["id", "typeId"] }],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = await EmployeeFile.update(
      { deletedAt: new Date(), status: 1 },
      { where: { id: id } }
    );
    if (isFound?.folder?.typeId != 2) {
      const publicFolder = path.join(__dirname, "../../secure-file");
      folderExistCheck(publicFolder);
      const filePath = path.join(publicFolder, `${isFound.fileName}`);
      fileDelete(filePath);
    }
    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE_FILE,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}<b/> has deleted the ${tableEnum.EMPLOYEE_FILE} <b>${isFound?.name}</b>`,
      jsonData: parse(data),
      activity: statusEnum.DELETE,
    });
    return data;
  }

  async findFilesByFolderId(id: number, query: any) {
    const { limit, page, employeeId, clientId } = query;
    let filterQuery = {};
    let folder = await Folder.findOne({ where: { id: id, deletedAt: null } });
    if (!folder) {
      throw new HttpException(404, this.msg.notFound);
    }
    folder = parse(folder);

    filterQuery = {
      ...(clientId && { clientId }),
      ...(employeeId && { employeeId }),
    };

    let data = await this.getAllData({
      where: {
        status: 0,
        deletedAt: null,
        folderId: folder?.id,
        ...filterQuery,
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [["createdAt", "DESC"]],
    });
    data = parse(data);
    const dataFile = await Promise.all(
      data?.rows.map(async (row) => {
        const temp = { ...row };
        temp.fileName = await secureFileToken(row.fileName);
        return temp;
      })
    );
    const responseObj = {
      data: dataFile,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    // await createHistoryRecord({
    //   tableName: tableEnum.FOLDER,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.FOLDER, `Specific Folder File Detaile!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    return responseObj;
  }
}
