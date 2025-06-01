import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, customHistoryCreateMessage, customHistoryDeleteMessage, customHistoryUpdateMesage } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { IContractTemplateCreate } from "@/interfaces/model/contractTemplete.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import Client from "@/models/client.model";
import ContractTemplate from "@/models/contractTemplete.model";
import LoginUser from "@/models/loginUser.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { default as Segment } from "../models/segment.model";
import BaseRepository from "./base.repository";

export default class ContractTemplateRepo extends BaseRepository<Segment> {
  constructor() {
    super(ContractTemplate.name);
  }

  private msg = new MessageFormation("Contract Template").message;

  async getAllContractTemplateService(query: IQueryParameters) {
    const { page, limit, clientId, isActive, sortBy, sort } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        // [Op.and]: [{ clientId: clientId }, { clientId: null }],
        ...(isActive != undefined && { isActive: isActive }),
      },
      include: [
        {
          model: Client,
          attributes: ["loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "contractName", sort ?? "asc"]],
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

  async getContractTemplateDataService() {
    // const { clientId } = query;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        // [Op.or]: [{ clientId: clientId }, { clientId: null }],
      },
      include: [
        {
          model: Client,
          attributes: ["loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      attributes: ["id", "contractName"],
      order: [["contractName", "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    return responseObj;
  }

  async findContractTemplate(criteria: any) {
    let contractTemplate = await ContractTemplate.findOne({
      where: { contractName: criteria?.contractName, deletedAt: null },
    });
    contractTemplate = parse(contractTemplate);

    return contractTemplate;
  }

  async getContractTemplateServiceByRotationDataService() {
    // const { employeeId, clientId } = query;
    let contarctData = await ContractTemplate.findAll({
      where: {
        deletedAt: null,
      },
    });
    contarctData = parse(contarctData);

    // let data = await Employee.findOne({
    // 	where: {
    // 		id: Number(employeeId),
    // 		deletedAt: null,
    // 	},
    // 	include: [
    // 		{
    // 			model: Rotation,
    // 		},
    // 	],
    // });
    // data = parse(data);

    // let contractTemplate;
    // let dataItem;
    // const contractTemplateValue = [];
    // if (data?.rotation !== null) {
    // 	dataItem = await this.findContractTemplate({
    // 		contractName: ContractTemplateName.LRED_AVENANT,
    // 	});
    //
    // contractTemplateValue.push(dataItem);
    // if (data?.rotation?.weekOn !== null && data?.rotation?.weekOff !== null && data?.rotation?.isResident !== true) {
    // 	// Rotation..
    // 	contractTemplate = await this.findContractTemplate({
    // 		contractName: ContractTemplateName.LRED_CONTRACT_DE_TRAVAIL_ROTATION,
    // 	});
    // 	contractTemplate = parse(contractTemplate);
    // 	contractTemplateValue.push(...contarctData, contractTemplate);
    // } else if (
    // 	(data?.rotation?.weekOn === null || data?.rotation?.weekOn !== null) &&
    // 	(data?.rotation?.weekOff === null || data?.rotation?.weekOff !== null) &&
    // 	data?.rotation?.isResident === true
    // ) {
    // 	// Resident Rotation..
    // 	contractTemplate = await this.findContractTemplate({
    // 		contractName: ContractTemplateName.LRED_CONTRACT_DE_TRAVAIL_RESIDENT,
    // 	});
    // 	contractTemplate = parse(contractTemplate);
    // 	contractTemplateValue.push(...contarctData, contractTemplate);
    // } else if (
    // 	data?.rotation?.weekOn === null &&
    // 	data?.rotation?.description === null &&
    // 	data?.rotation?.weekOff === null &&
    // 	data?.rotation?.isResident === false &&
    // 	data?.rotation?.daysWorked === null &&
    // 	data?.rotation?.isAllDays === false &&
    // 	data?.rotation?.isWeekendBonus === false &&
    // 	data?.rotation?.isOvertimeBonus === false
    // ) {
    // 	// CallOut Rotation..
    // 	contractTemplate = await this.findContractTemplate({
    // 		contractName: ContractTemplateName.LRED_CONTRACT_DE_TRAVAIL_CALL_OUT,
    // 	});
    // 	contractTemplate = parse(contractTemplate);
    // 	contractTemplateValue.push(...contarctData, contractTemplate);
    // }
    // } else {
    // Exception Rotation..
    // 	contractTemplate = await this.findContractTemplate({
    // 		contractName: ContractTemplateName.EXPAT_CONTRACT,
    // 	});
    // 	contractTemplate = parse(contractTemplate);
    // 	contractTemplateValue.push(...contarctData, contractTemplate);
    // }

    return contarctData;
  }

  async getContractTemplateByIdService(id: number) {
    const isFound = await ContractTemplate.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    return data;
  }

  async addContractTemplate({
    body,
    user,
  }: {
    body: IContractTemplateCreate;
    user: User;
  }) {
    const isExist = await ContractTemplate.findOne({
      where: { contractName: body.contractName, clientId: body.clientId },
    });
    if (isExist) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    let data = await ContractTemplate.create({ ...body, createdBy: user.id });
    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.CONTRACT_TEMPLATE,
      moduleName: moduleName.CONTRACTS,
      userId: user?.id,
      custom_message: await customHistoryCreateMessage(user, tableEnum.CONTRACT_TEMPLATE, data),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateContractTemplateStatus({
    body,
    id,
  }: {
    body: IContractTemplateCreate;
    id: number;
  }) {
    const isExistClient = await ContractTemplate.findOne({ where: { id: id } });
    if (!isExistClient) {
      throw new HttpException(404, this.msg.notFound);
    }

    await ContractTemplate.update(
      { isActive: body.isActive },
      { where: { id: id } }
    );
    const data = await this.getContractTemplateByIdService(id);
    return data;
  }

  async updateContractTemplate({
    body,
    user,
    id,
  }: {
    body: IContractTemplateCreate;
    user: User;
    id: number;
  }) {
    const isExist = await ContractTemplate.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isExist) {
      throw new HttpException(200, this.msg.notFound, {}, true);
    }
    await ContractTemplate.update(
      { ...body, updatedBy: user.id },
      { where: { id: id } }
    );
    const data = await this.getContractTemplateByIdService(id);

    await createHistoryRecord({
      tableName: tableEnum.CONTRACT_TEMPLATE,
      moduleName: moduleName.CONTRACTS,
      userId: user?.id,
      custom_message: await customHistoryUpdateMesage(
        body,
        isExist,
        user,
        data,
        tableEnum.CONTRACT_TEMPLATE
      ),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });

    return data;
  }

  async deleteContractTemplateService({ id, user }: { id: number, user: User }) {
    const isExistUser = await this.get({
      where: { id, deletedAt: null },
      attributes: ["id"],
    });
    if (isExistUser) {
      const UpdatedUser = await this.update(
        { deletedAt: new Date() },
        { where: { id: +isExistUser.id } }
      );
      await createHistoryRecord({
        tableName: tableEnum.CONTRACT_TEMPLATE,
        moduleName: moduleName.CONTRACTS,
        userId: user?.id,
        custom_message: await customHistoryDeleteMessage(user, tableEnum.CONTRACT_TEMPLATE, UpdatedUser),
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(UpdatedUser),
        activity: statusEnum.DELETE,
      });
      return UpdatedUser;
    }
  }
}
