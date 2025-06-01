import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { secureFileToken } from "@/helpers/secureFolder.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import {
  ITransportVehicleDocumentCreate,
  TransportVehicleDocumentAttributes,
} from "@/interfaces/model/transport.vehicle.document.interface";
import Folder from "@/models/folder.model";
import TransportVehicleDocument from "@/models/transport.vehicle.document.model";
import TransportVehicle from "@/models/transport.vehicle.model";
import User from "@/models/user.model";
import { fileDelete, folderExistCheck, parse } from "@/utils/common.util";
import path from "path";
import BaseRepository from "./base.repository";

export default class TransportVehicleDocumentRepo extends BaseRepository<
  TransportVehicleDocument
> {
  constructor() {
    super(TransportVehicleDocument.name);
  }

  private msg = new MessageFormation("TransportVehicleDocument").message;

  async getAllTransportVehicleDocument(query: IQueryParameters) {
    const { page, limit, clientId, vehicleId, sort, sortBy } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        vehicleId: vehicleId,
        ...(clientId && { clientId: clientId }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      include: [
        {
          model: TransportVehicle,
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

  async getTransportVehicleDocumentById(id: number) {
    let data = await TransportVehicleDocument.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: TransportVehicle,
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

  async addTransportVehicleDocument({
    body,
    user,
  }: {
    body: ITransportVehicleDocumentCreate;
    user: User;
  }) {
    let data = await TransportVehicleDocument.create({
      ...body,
      createdBy: user.id,
    });
    data = parse(data);
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_VEHICLE_DOCUMENTS,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>added</b> Transport Vehicle Document for client id ${data.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });
    return data;
  }

  async updateTransportVehicleDocument({
    body,
    user,
    id,
  }: {
    body: TransportVehicleDocumentAttributes;
    user: User;
    id: number;
  }) {
    const isExistDocument = await TransportVehicleDocument.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistDocument) {
      throw new HttpException(404, this.msg.notFound);
    }

    await TransportVehicleDocument.update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null } }
    );
    const updatedData = await this.getTransportVehicleDocumentById(id);
    const publicFolder = path.join(__dirname, "../../secure-file");
    folderExistCheck(publicFolder);
    const pdfPath = path.join(publicFolder, `${isExistDocument.documentPath}`);
    fileDelete(pdfPath);
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_VEHICLE_DOCUMENTS,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Transport Vehicle Document for client id ${updatedData.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });
    return updatedData;
  }

  async deleteTransportVehicleDocument(id: number, user?: User) {
    const isExistDocument = await TransportVehicleDocument.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [{ model: Folder, attributes: ["id", "typeId"] }],
    });

    if (!isExistDocument) {
      throw new HttpException(404, this.msg.notFound);
    }

    let data = await TransportVehicleDocument.destroy({
      where: {
        id: id,
      },
    });
    if (isExistDocument.documentPath) {
      const publicFolder = path.join(__dirname, "../../secure-file");
      folderExistCheck(publicFolder);
      const pdfPath = path.join(
        publicFolder,
        `${isExistDocument.documentPath}`
      );
      isExistDocument?.folder?.typeId != 2 && fileDelete(pdfPath);
    }
    await createHistoryRecord({
      tableName: tableEnum.TRANSPORT_VEHICLE_DOCUMENTS,
      moduleName: moduleName.TRANSPORT,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Transport Vehicle Document for client id ${isExistDocument.clientId}`,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
    data = parse(data);
    return data;
  }
}
