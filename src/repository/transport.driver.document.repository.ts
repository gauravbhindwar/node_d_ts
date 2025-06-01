import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { secureFileToken } from "@/helpers/secureFolder.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import {
  ITransportDriverDocumentCreate,
  TransportDriverDocumentAttributes,
} from "@/interfaces/model/transport.driver.document.interface";
import Folder from "@/models/folder.model";
import TransportDriverDocument from "@/models/transport.driver.document.model";
import TransportDriver from "@/models/transport.driver.model";
import User from "@/models/user.model";
import { fileDelete, folderExistCheck, parse } from "@/utils/common.util";
import path from "path";
import BaseRepository from "./base.repository";

export default class TransportDriverDocumentRepo extends BaseRepository<
  TransportDriverDocument
> {
  constructor() {
    super(TransportDriverDocument.name);
  }

  private msg = new MessageFormation("TransportDriverDocument").message;

  async getAllTransportDriverDocument(query: IQueryParameters) {
    const { page, limit, clientId, driverId, sort, sortBy } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        driverId: driverId,
        ...(clientId && { clientId: clientId }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      include: [
        {
          model: TransportDriver,
          attributes: ["deletedAt"],
          where: { deletedAt: null },
        },
      ],
      order: [[sortedColumn ?? "documentName", sort ?? "asc"]],
    });

    data = parse(data);
    const dataFile = await Promise.all(
      data?.rows.map(async (row) => {
        const temp = { ...row };
        temp.documentPath = await secureFileToken(row.documentPath);
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
    return responseObj;
  }

  async getTransportDriverDocumentById(id: number) {
    let data = await TransportDriverDocument.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: TransportDriver,
          attributes: ["deletedAt"],
          where: { deletedAt: null },
        },
      ],
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    data.documentPath = await secureFileToken(data.documentPath);
    return data;
  }

  async addTransportDriverDocument({
    body,
    user,
  }: {
    body: ITransportDriverDocumentCreate;
    user: User;
  }) {
    let data = await TransportDriverDocument.create({
      ...body,
      createdBy: user.id,
    });
    data = parse(data);
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_DRIVER_DOCUMENTS,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>added</b> Transport Driver Document of Driver id ${data.driverId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
       jsonData: parse(data),
      activity: statusEnum.CREATE,
    });
    return data;
  }

  async updateTransportDriverDocument({
    body,
    user,
    id,
  }: {
    body: TransportDriverDocumentAttributes;
    user: User;
    id: number;
  }) {
    const isExistDocument = await TransportDriverDocument.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistDocument) {
      throw new HttpException(404, this.msg.notFound);
    }

    await TransportDriverDocument.update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getTransportDriverDocumentById(id);
    const publicFolder = path.join(__dirname, "../../secure-file");
    folderExistCheck(publicFolder);
    const pdfPath = path.join(publicFolder, `${isExistDocument.documentPath}`);
    fileDelete(pdfPath);
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_DRIVER_DOCUMENTS,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Driver Document of Driver id ${updatedData.driverId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });
    return updatedData;
  }

  async deleteTransportDriverDocument(id: number, user?: User) {
    const isExistDocument = await TransportDriverDocument.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [{ model: Folder, attributes: ["id", "typeId"] }],
    });

    if (!isExistDocument) {
      throw new HttpException(404, this.msg.notFound);
    }

    let data = await TransportDriverDocument.destroy({
      where: {
        id: id,
      },
    });
    if (isExistDocument?.folder?.typeId != 2) {
      const publicFolder = path.join(__dirname, "../../secure-file");
      folderExistCheck(publicFolder);
      const pdfPath = path.join(
        publicFolder,
        `${isExistDocument.documentPath}`
      );
      fileDelete(pdfPath);
    }
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_DRIVER_DOCUMENTS,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Driver Document of Driver id ${isExistDocument.driverId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.DELETE,
    });
    data = parse(data);
    return data;
  }
}
