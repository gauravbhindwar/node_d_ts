import { FRONTEND_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";
import { DefaultRoles } from "@/interfaces/functional/feature.interface";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { moduleName, statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import { requestStatus } from "@/interfaces/model/request.document.interface";
import { IRequestCreate, status } from "@/interfaces/model/request.interface";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import EmployeeContract from "@/models/employeeContract.model";
import LoginUser from "@/models/loginUser.model";
import RequestDocument from "@/models/request.document.model";
import Request from "@/models/request.model";
import RequestType from "@/models/requestType.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import User from "@/models/user.model";
import {
  getSegmentAccessForUser,
  getSubSegmentAccessForUser,
  parse,
} from "@/utils/common.util";
import moment from "moment";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";

export default class RequestRepo extends BaseRepository<Request> {
  constructor() {
    super(Request.name);
  }

  private msg = new MessageFormation("Request").message;

    async addRequest({ body, user }: { body: IRequestCreate; user: User }) {
    console.log("🚀 addRequest initiated");
      
    try {
      const contractNumber = String(body.contractNumber);
  
      // 🔍 Step 1: Verify Contract
      console.log("🔍 Verifying contract...");
      const contractQuery: any = {
        where: { newContractNumber: contractNumber },
      };
  
      if (user?.roleData.name === DefaultRoles.Employee && user.roleData.isViewAll) {
        contractQuery.include = [{ model: Employee, where: { loginUserId: user.loginUserId } }];
      }
  
      const existingContract = await EmployeeContract.findOne(contractQuery);
      if (!existingContract) {
        console.warn("❌ Invalid contract number.");
        throw new HttpException(200, "Please enter valid contract number", {}, true);
      }
  
      // 👤 Step 2: Fetch Enriched Employee Data
      console.log("📡 Fetching contract and employee details...");
      const contractDetails = await EmployeeContract.findOne({
        where: { newContractNumber: contractNumber },
        include: [
          {
            model: Employee,
            attributes: ["clientId", "employeeNumber"],
            include: [
              {
                model: Client,
                attributes: ["id"],
                include: [{ model: LoginUser, attributes: ["name"] }],
              },
              { model: LoginUser, attributes: ["firstName", "lastName"] },
            ],
          },
        ],
        attributes: ["employeeId", "id"],
      });
  
      if (!contractDetails?.employeeDetail) {
        throw new HttpException(404, "Employee or client details not found", {}, true);
      }
  
      // 🧠 Step 3: Enrich Body with IDs
      const enrichedBody = {
        ...body,
        clientId: contractDetails.employeeDetail.clientId,
        employeeId: contractDetails.employeeId,
        contractId: contractDetails.id,
        documentTotal: body.requestDocument?.length || 0,
      };
  
      // 📄 Step 4: Validate Request Types and Collect Emails
      console.log("📄 Validating document types and preparing notification emails...");
      const documentList = body.requestDocument || [];
      const requestTypeIds = documentList.map((doc) => doc.documentType);
  
      const requestTypes = await RequestType.findAll({
        where: { id: { [Op.in]: requestTypeIds } },
      });
  
      const { emails, documentNames } = requestTypes.reduce(
        (acc, type) => {
          if (type.notificationEmails) {
            acc.emails.push(...type.notificationEmails.split(",").map((e) => e.trim()));
          }
          if (type.name) {
            acc.documentNames.push(type.name);
          }
          return acc;
        },
        { emails: [], documentNames: [] } as { emails: string[]; documentNames: string[] }
      );
  
      // ✍️ Step 5: Create Request
      console.log("✍️ Creating request...");
      delete enrichedBody.requestDocument;
  
      const requestData = await Request.create({
        ...enrichedBody,
        contractNumber,
        mobileNumber: enrichedBody.mobileNumber?.toString(),
        createdBy: user?.id ?? null,
      });
  
      // 📥 Step 6: Create Request Documents
      console.log("📥 Attaching request documents...");
      if (!requestData?.id) {
        console.error("❌ Request creation failed. No ID returned.");
        throw new HttpException(500, "Request creation failed", {}, true);
      }
      console.log("📥 Attaching request documents...");
      for (const doc of documentList) {
        await RequestDocument.create({
          requestId: requestData.id,
          documentType: doc.documentType,
          otherInfo: doc.otherInfo,
        });
      }
  
      // 📧 Step 7: Email Notification
      if (enrichedBody.email) {
        console.log("📧 Sending email...");
        const replacement = {
          client: contractDetails.employeeDetail.client?.loginUserData?.name,
          firstName: contractDetails.employeeDetail.loginUserData?.firstName,
          lastName: contractDetails.employeeDetail.loginUserData?.lastName,
          employeeNumber: contractDetails.employeeDetail.employeeNumber,
          email: enrichedBody.email,
          logourl: `${FRONTEND_URL}/assets/images/lred-main-logo.png`,
          mailHeader: "Requested Documents Details",
          checkReliquatUrl: "",
          message: `The request has been successfully placed for the Employee, <br><br>
            Contract Number: ${contractNumber} <br>
            For the Type of ${documentNames.join(", ")} <br>
            The date of request was: ${moment(requestData?.createdAt).format("DD MMMM YYYY")} <br>
            The Document is requested for: ${requestData?.collectionDelivery}`,
        };
      
        try {
          await sendMail(
            [enrichedBody.email, "admin@lred.com"],
            "Request Documents",
            "generalMailTemplate",
            replacement,
            null,
            emails
          );
        } catch (mailErr) {
          console.error("📧 Email sending failed:", mailErr);
        }
      }
  
      // 📚 Step 8: Create History
      console.log("📚 Logging request history...");
      await createHistoryRecord({
        tableName: tableEnum.REQUESTS,
        moduleName: moduleName.REQUESTS,
        custom_message: `${user?.loginUserData?.name} has created a request for document, client is ${enrichedBody.clientId}`,
        userId: user?.id,
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(requestData),
        activity: statusEnum.CREATE,
      });
  
      console.log("✅ Request created successfully.");
      console.log("✔️ Request created with ID:", requestData?.id);
      console.log("📨 Email target:", enrichedBody?.email);
      console.log("📨 Notification list:", emails);
      return requestData;
    } catch (error) {
      console.error("❌ addRequest failed:", error);
      throw new HttpException(
        500,
        "Something went wrong while processing the request.",
        error,
        true
      );
    }
  }

   async findOne(query: any) {
    return Request.findOne(query);
  }
  async updateRequestStatus({
    body,
    user,
    id,
  }: {
    body: {
      status: status;
      requestDocumentId?: number[];
      documentStatus?: string;
    };
    user: User;
    id: number;
  }) {
    const isExistMedicalRequest = await Request.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistMedicalRequest) {
      throw new HttpException(404, this.msg.notFound);
    }
    const isExistContractData = await EmployeeContract.findOne({
      where: { newContractNumber: isExistMedicalRequest.contractNumber },
    });
    let updateDate = {};
    switch (body.status) {
      case "STARTED":
        if (isExistContractData) {
          updateDate = {
            status: body.status,
            reviewedBy: user.id,
            reviewedDate: new Date(),
          };
        }
        break;
      case "DECLINED":
        updateDate = {
          status: body.status,
          reviewedBy: user.id,
          reviewedDate: new Date(),
        };
        break;
      case "COMPLETED":
        await Promise.all(
          body.requestDocumentId?.map(async (docId: number) => {
            await RequestDocument.update(
              {
                status: body.documentStatus as requestStatus,
                completedBy: user.id,
                completedDate: new Date(),
                updatedAt: new Date(),
              },
              { where: { id: docId }, individualHooks: true }
            );
          })
        );

        const checkVarifyRemainingDocument = await RequestDocument.findOne({
          where: { requestId: id, completedDate: null },
        });
        if (!checkVarifyRemainingDocument) {
          updateDate = {
            status: "COMPLETED",
            reviewedBy: user.id,
            reviewedDate: new Date(),
          };
        }
        break;
      default:
        break;
    }

    await Request.update(
      { ...updateDate, updatedBy: user.id },
      { where: { id: id }, individualHooks: true }
    );
    const data = await this.getRequestById(id);

    await createHistoryRecord({
      tableName: tableEnum.REQUESTS,
      userId: user?.id,
      moduleName: moduleName.REQUESTS,
      custom_message: `${user?.loginUserData?.name} has updated a request for document, requestDocumentId: ${body.requestDocumentId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
     jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });

    return data;
  }
  async getAllRequest(query: IQueryParameters, user: User) {
    const {
      page,
      limit,
      startDate,
      clientId,
      endDate,
      sort,
      sortBy,
      search,
    } = query;
    const sortedColumn = sortBy || null;
    const segmentIds = getSegmentAccessForUser(user);
    const subSegmentIds = getSubSegmentAccessForUser(user);
    // End Date Convert with timestamp with timezone    
  
    let datefilter: any = {}
    if(startDate && endDate){
      const dateWithTimezone = new Date(
        new Date(endDate).getTime() -
          new Date(endDate).getTimezoneOffset() * 60000
      );
      dateWithTimezone.setHours(23, 59, 59, 999); // Add Remaining minites until the end of the day
     
      datefilter.createdAt = {
        [Op.between]: [
          moment(startDate).toDate(),
          new Date(dateWithTimezone).toISOString(),
        ],
      };
    }
    let data = await this.getAllData({
      where: {
        ...(search && {
          [Op.or]: {
            name: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
            email: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
          },
        }),
        ...(Number(clientId) ? { clientId: clientId } : { clientId: null }),
        deletedAt: null,
        ...datefilter
      },
      include: [
        {
          model: Client,
          attributes: ["id", "loginUserId"],
          include: [
            {
              model: LoginUser,
              attributes: ["name"],
              where: {
                ...(user.roleData.name === DefaultRoles.Client &&
                user.roleData.isViewAll
                  ? { id: user.loginUserId }
                  : {}),
              },
            },
          ],
        },
        {
          model: Employee,
          required: true,
          attributes: ["segmentId", "subSegmentId", "contractEndDate"],
          include: [{ model: Segment }, { model: SubSegment, required: false }],
          where: {
            [Op.and]: [
              {
                ...(segmentIds?.length > 0 && {
                  segmentId: { [Op.in]: segmentIds },
                }),
              },
              {
                ...(subSegmentIds?.length > 0 && {
                  [Op.or]: [
                    { subSegmentId: { [Op.in]: subSegmentIds } },
                    { subSegmentId: null },
                  ],
                }),
              },
            ],
          },
        },
        ...(user.roleData.isViewAll &&
        user.roleData.name === DefaultRoles.Employee
          ? [
              {
                model: Employee,
                required: true,
                include: [
                  {
                    model: Segment,
                    attributes: ["name", "id"],
                  },
                  {
                    model: SubSegment,
                    required: false,
                    attributes: ["name", "id"],
                  },
                ],
                attributes: ["employeeNumber", "contractEndDate"],
                where: {
                  loginUserId: user.loginUserId,
                  [Op.and]: [
                    {
                      ...(segmentIds?.length > 0 && {
                        segmentId: { [Op.in]: segmentIds },
                      }),
                    },
                    {
                      ...(subSegmentIds?.length > 0 && {
                        [Op.or]: [
                          { subSegmentId: { [Op.in]: subSegmentIds } },
                          { subSegmentId: null },
                        ],
                      }),
                    },
                  ],
                },
              },
            ]
          : []),
      ],
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

  async getRequestById(id: number) {
    let data = await Request.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: RequestDocument,
          include: [
            { model: RequestType, attributes: ["name"] },
            {
              model: User,
              attributes: ["id", "loginUserId"],
              include: [{ model: LoginUser, attributes: ["name", "email"] }],
            },
          ],
        },
        {
          model: Client,
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
        {
          model: Employee,
          attributes: ["employeeNumber", "contractEndDate"],
          include: [
            { model: LoginUser, attributes: ["firstName", "lastName"] },
            { model: Segment, attributes: ["name"] },
          ],
        },
        {
          model: User,
          as: "reviewedByUser",
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
      ],
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async deleteRequest(id: number, user: User) {
    const isExistRequest = await this.get({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!isExistRequest) {
      throw new HttpException(404, this.msg.notFound);
    }

    // const data = await this.deleteData({ where: { id: id } });
    await createHistoryRecord({
      tableName: tableEnum.REQUESTS,
      userId: user?.id,
      moduleName: moduleName.REQUESTS,
      custom_message: `${user?.loginUserData?.name} has deleted a request for document, contractId: ${isExistRequest.contractId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
     jsonData: parse(isExistRequest),
      activity: statusEnum.DELETE,
    });
    await isExistRequest.destroy();

    return {};
  }
}
