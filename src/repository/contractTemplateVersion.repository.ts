import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, customHistoryCreateMessage, customHistoryDeleteMessage, customHistoryUpdateMesage } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { IContractTemplateVersionCreate, PreviewContractTemplate } from "@/interfaces/model/contractTempleteVersion.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import ContractTemplate from "@/models/contractTemplete.model";
import ContractTemplateVersion from "@/models/contractTempleteVersion.model";
import LoginUser from "@/models/loginUser.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class ContractTemplateVersionRepo extends BaseRepository<
  ContractTemplateVersion
> {
  constructor() {
    super(ContractTemplateVersion.name);
  }

  private msg = new MessageFormation("Contract Template Version").message;

  async getAllContractTemplateVersionService(query: IQueryParameters) {
    const { page, limit, contractTemplateId, clientId, sortBy, sort } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        [Op.or]: [{ clientId: clientId }, { clientId: null }],
        ...(contractTemplateId
          ? { contractTemplateId: contractTemplateId }
          : {}),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      include: [
        {
          model: User,
          attributes: ["loginUserId"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
        {
          model: ContractTemplate,
          attributes: ["contractName", "clientId"],
          where: {
            deletedAt: null,
          },
        },
      ],

      limit: limit ?? undefined,
      order: [[sortedColumn ?? "versionNo", sort ?? "asc"]],
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

  async getContractTemplateVersionDataService(query: IQueryParameters) {
    const { contractTemplateId, clientId } = query;
    let data = await this.getAllData({
      where: {
        [Op.or]: [{ clientId: clientId }, { clientId: null }],
        contractTemplateId: contractTemplateId,
        deletedAt: null,
      },
      attributes: ["id", "versionName"],
      order: [["versionNo", "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    return responseObj;
  }

  async findAllContractTemplateVersionLastInsertedData(
    query: IQueryParameters
  ) {
    const { contractTemplateId, clientId } = query;
    const isFoundData = await ContractTemplateVersion.findAll({
      where: {
        [Op.or]: [{ clientId: clientId }, { clientId: null }],
        deletedAt: null,
        contractTemplateId: contractTemplateId,
      },
      limit: 1,
      attributes: ["id", "description"],
      order: [["createdAt", "DESC"]],
    });
    if (!isFoundData) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFoundData);
    return data;
  }

  async getContractTemplateVersionByIdService(id: number) {
    const isFound = await ContractTemplateVersion.findOne({
      where: { id: id, deletedAt: null },
      logging: console.log
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    console.log("data-----*************************", id, isFound)
    const data = parse(isFound);
    return data;
  }

  async addContractTemplateVersion({
    body,
    user,
  }: {
    body: IContractTemplateVersionCreate;
    user: User;
  }) {
    const isExist = await ContractTemplateVersion.findOne({
      where: {
        description: body.description,
        contractTemplateId: body.contractTemplateId,
        ...(body.clientId != undefined && { clientId: body.clientId }),
      },
    });
    if (isExist) throw new HttpException(200, this.msg.exist, {}, true);

    let data = await ContractTemplateVersion.create({
      ...body,
      createdBy: user.id,
    });

    data = parse(data);

    await createHistoryRecord({
      tableName: tableEnum.CONTRACT_TEMPLATE_VERSION,
      moduleName: moduleName.CONTRACTS,
      userId: user?.id,
      custom_message: await customHistoryCreateMessage(user, tableEnum.CONTRACT_TEMPLATE_VERSION, data),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateContractTemplateVersion({
    body,
    user,
    id,
  }: {
    body: IContractTemplateVersionCreate;
    user: User;
    id: number;
  }) {
    const isExist = await ContractTemplateVersion.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isExist) {
      throw new HttpException(200, this.msg.notFound, {}, true);
    }
    await ContractTemplateVersion.update(
      { ...body, updatedBy: user.id },
      { where: { id: id } }
    );
    const data = await this.getContractTemplateVersionByIdService(id);

    await createHistoryRecord({
      tableName: tableEnum.CONTRACT_TEMPLATE_VERSION,
      moduleName: moduleName.CONTRACTS,
      userId: user?.id,
      custom_message: await customHistoryUpdateMesage(
        body,
        isExist,
        user,
        data,
        tableEnum.EMPLOYEE_FILE
      ),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });

    return data;
  }

  async deleteContractTemplateVersionService({ id, user }: { id: number, user: User }) {
    const isExistUser = await this.get({
      where: { id, deletedAt: null },
      attributes: ["id"],
    });
    if (isExistUser) {
      await this.update(
        { deletedAt: new Date() },
        { where: { id: +isExistUser.id } }
      );
      let data = await this.getAllData({
        where: {
          id: {
            [Op.gt]: isExistUser.id,
          },
          deletedAt: null,
        },
        attributes: [
          "id",
          "versionNo",
          "contractTemplateId",
          "description",
          "isActive",
        ],
        order: [["id", "ASC"]],
      });
      data = parse(data);

      const dataValue = [];
      data.rows.forEach((e: { id: number; versionNo: number }, index) => {
        const item = data.rows[index].versionNo - 1;
        dataValue.push({
          versionNo: item,
          id: e.id,
        });
      });

      let updateData;
      for (const iterator of dataValue) {
        updateData = await ContractTemplateVersion.update(
          { versionNo: iterator.versionNo },
          { where: { id: iterator.id } }
        );
      }

      await createHistoryRecord({
        tableName: tableEnum.CONTRACT_TEMPLATE_VERSION,
        moduleName: moduleName.CONTRACTS,
        userId: user?.id,
        custom_message: await customHistoryDeleteMessage(user, tableEnum.CONTRACT_TEMPLATE_VERSION, data),
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(data),
        activity: statusEnum.DELETE,
      });

      return updateData;
    }
  }

  // async previewContractTemplate({
  //   body,
  //   user,
  //   id,
  // }: {
  //   body: PreviewContractTemplate;
  //   user: User;
  //   id: number;
  // }) {
  //   const isExist = await ContractTemplateVersion.findOne({
  //     where: { id: id, deletedAt: null },
  //   });
  //   if (!isExist) {
  //     throw new HttpException(200, this.msg.notFound, {}, true);
  //   }
  //   const description = isExist.description;
  //   // {
  //   //   CONTRACT_NUMBER,
  //   //   FIRST_NAME,
  //   //   LAST_NAME,
  //   //   DOB,
  //   //   PLACE_OF_BIRTH,
  //   //   ADDRESS,
  //   //   JOB_TITLE,
  //   //   MONTHLY_SALARY,
  //   //   HAS_BONUS,
  //   //   BONUS_NAME,
  //   //   BONUS_VALUE,
  //   //   DURATION,
  //   //   START_DATE,
  //   //   END_DATE,
  //   //   WEEK_ON,
  //   //   WEEK_OFF
  //   // } = body;
  //   const previewDescription = {
  //     //
  //   }
  //   return previewDescription;
  //   // await ContractTemplateVersion.update(
  //   //   { ...body, updatedBy: user.id },
  //   //   { where: { id: id } }
  //   // );
  //   // const data = await this.getContractTemplateVersionByIdService(id);

  //   // await createHistoryRecord({
  //   //   tableName: tableEnum.CONTRACT_TEMPLATE_VERSION,
  //   //   moduleName: moduleName.CONTRACTS,
  //   //   userId: user?.id,
  //   //   custom_message: await customHistoryUpdateMesage(
  //   //     body,
  //   //     isExist,
  //   //     user,
  //   //     data,
  //   //     tableEnum.EMPLOYEE_FILE
  //   //   ),
  //   //   lastlogintime: user?.loginUserData?.logintimeutc,
  //   //   jsonData: parse(data),
  //   //   activity: statusEnum.UPDATE,
  //   // });

  //   // return data;
  // }  

  async previewContractTemplate({
    body,
    user,
    id,
  }: {
    body: PreviewContractTemplate | any;
    user: User;
    id: number;
  }) {
    // Check if the contract template version exists
    const isExist = await ContractTemplateVersion.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isExist) {
      throw new HttpException(200, "Contract template not found", {}, true);
    }
  
    const description = isExist.description; // HTML template as string

    // Dynamically replace placeholders with body data
    let previewDescription = "";

    if(id == 10) {
      const {
        CLIENT_CONTRACT_NUMBER,
        CONTRACT_NUMBER,
        LAST_NAME,
        FIRST_NAME,
        DOB,
        PLACE_OF_BIRTH,
        ADDRESS,
        JOB_TITLE,
        MONTHLY_SALARY,
        BONUS_NAME,
        BONUS_VALUE,
        HAS_BONUS,
        DURATION,
        START_DATE,
        END_DATE,
        WEEK_ON,
        WEEK_OFF,
        //  TRIAL_PERIOD,
        ["TRIAL-PERIOD"]: TRIAL_PERIOD,

      } = body?.data 
      console.log("body", body?.data)
      previewDescription = description
        .replace(/\[CLIENT-CONTRACT-NUMBER\]/g, CLIENT_CONTRACT_NUMBER || "N/A")
        .replace(/\[CONTRACT-NUMBER\]/g, CONTRACT_NUMBER || "N/A")
        .replace(/\[LAST-NAME\]/g, LAST_NAME || "N/A")
        .replace(/\[FIRST-NAME\]/g, FIRST_NAME || "N/A")
        .replace(/\[DOB\]/g,DOB || "N/A")
        .replace(/\[DURATION\]/g, DURATION || "N/A")
        .replace(/\[PLACE-OF-BIRTH\]/g, PLACE_OF_BIRTH || "N/A")
        .replace(/\[ADDRESS\]/g, ADDRESS || "N/A")
        .replace(/\[JOB-TITLE\]/g, JOB_TITLE || "N/A")
        .replace(/\[PAGE-BREAK\]/g, "") // Handle special placeholders like page breaks if needed
        .replace(/\[MONTHLY-SALARY\]/g, MONTHLY_SALARY || "N/A")
        .replace(/\[BONUS-NAME\]/g, BONUS_NAME || "N/A")
        .replace(/\[BONUS-VALUE\]/g, BONUS_VALUE || "N/A")
        .replace(/\[HAS-BONUS\]/g, HAS_BONUS ? "Yes" : "No")
        .replace(/\[DURATION\]/g, DURATION || "N/A")        
        .replace(/\[START-DATE\]/g, START_DATE ? new Date(body.START_DATE).toLocaleDateString() : "N/A")
        .replace(/\[END-DATE\]/g, END_DATE ? new Date(body.END_DATE).toLocaleDateString() : "N/A")
        .replace(/\[WEEK-ON\]/g, WEEK_ON || "N/A")
        .replace(/\[WEEK-OFF\]/g, WEEK_OFF || "N/A")
        .replace(/\[CLIENT-CONTRACT-NUMBER\]/g, CLIENT_CONTRACT_NUMBER || "N/A")
        .replace(/\[TRIAL-PERIOD\]/g, TRIAL_PERIOD);
        // replace [TRIAL-PERIOD] with body?."TRIAL-PERIOD"

    } 
    // else if(id == 5) {

    //   const replacementData = {
    //     "LRED-XXX": "LRED-KJL78",
    //     "notre client XXX": "notre client KUT876",
    //     "société de XXX": "société de GF34",
    //     "contrat N°. XXX": "contrat N°. NH786",
    //     "de rotation à XXX": "de rotation à FR67",
    //     "FAMILY_NAME": "Sharma family",
    //     "First_name": "Rahul",
    //     "ADDRESS": "34-T, Torkey",
    //     "Services Pétroliers Schlumberger et Compagnie d’Operations Pétrolières Schlumberger": "Test Tagline",
    //     "HR & Payroll Specialist": "Test Abc",
    //     "70 000.00DZD": "1500 USD",
    //     "19er Janvier 2023": "13-10-2024",
    //     "de travail N° CW2972991": "de travail N° KHT567",
    //     "2021-LRED 019E": "2021-LRED HG45",
    //   };
  
      // previewDescription = description;
  
      // Replace placeholders in the description
      // for (const [placeholder, value] of Object.entries(replacementData)) {
      //   const regex = new RegExp(placeholder, "g");
      //   previewDescription = previewDescription.replace(regex, value);
      // }
  
    // }
  
    // Return the preview description
    return {
      previewDescription: previewDescription,
    };
  }

}
