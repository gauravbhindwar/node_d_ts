import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createExcelFile, generateFileName } from "@/helpers/common.helper";
import {
  createHistoryRecord,
  customHistoryExportMessage,
  customHistoryUpdateMesage,
} from "@/helpers/history.helper";
// import { checkS3FileExists } from "@/helpers/s3.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { medicalRequestStatus } from "@/interfaces/model/medicalRequest.interface";
import AccountPO from "@/models/accountPO.model";
import BonusType from "@/models/bonusType.model";
import Client from "@/models/client.model";
import Contact from "@/models/contact.model";
import Employee from "@/models/employee.model";
import EmployeeBonus from "@/models/employeeBonus.model";
import EmployeeCatalogueNumber from "@/models/employeeCatalogueNumber.model";
import LoginUser from "@/models/loginUser.model";
import MedicalRequest from "@/models/medicalRequest.model";
import MedicalType from "@/models/medicalType.model";
// import PoSummaryExcelUrl from "@/models/poSummaryExcelUrl.model";
import Segment from "@/models/segment.model";
import SegmentManager from "@/models/segmentManagers.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import User from "@/models/user.model";
import {
  getSegmentAccessForUser,
  getSubSegmentAccessForUser,
  parse,
} from "@/utils/common.util";
import axios from "axios";
import { isNull } from "lodash";
import moment from "moment";
import { Op, Transaction } from "sequelize";
export default class AccountPORepo {
  private msg = new MessageFormation("AccountPO").message;

  // async getAllSegmentsData(query: IQueryParameters, user: User) {
  //   try {
  //     const { clientId, startDate, endDate } = query;
  //     const { segment, subSegment } = query;
  //     //   const filterStartDate = moment(startDate, "DD-MM-YYYY").toISOString();
  //     //   const filterEndDate = moment(endDate, "DD-MM-YYYY").toISOString();

  //     const subSegmentIds = getSubSegmentAccessForUser(user);
  //     const segmentIds = getSegmentAccessForUser(user);

  //     const sendData = {
  //       segment: segment,
  //       subSegment: subSegment,
  //       clientId: +clientId,
  //       // startDate: filterStartDate,
  //       // endDate: filterEndDate,
  //       startDate: startDate,
  //       endDate: endDate,
  //       timesheetAttribute: ["id", "startDate", "endDate"],
  //       employeeAttribute: ["id"],
  //       segmentAttribute: ["id", "name", "code"],
  //     };
  //     const getTypeOfInclude = await this.fetchTypeOfInclude(sendData);

  //     let segmentsData = await AccountPO.findAll({
  //       where: {
  //         ...getTypeOfInclude?.where,
  //         ...(segmentIds.length && { segmentId: { [Op.in]: segmentIds } }),
  //         ...(subSegmentIds.length && {
  //           subSegmentId: {
  //             [Op.or]: { [Op.eq]: null, [Op.in]: subSegmentIds },
  //           },
  //         }),
  //       },
  //       attributes: ["segmentId", "subSegmentId", "id"],
  //       include: [...getTypeOfInclude?.include],
  //       order: [["segmentData", "name", "asc"]],
  //     });
  //     segmentsData = parse(segmentsData);
  //     const segmentSet = new Set();
  //     segmentsData = segmentsData.filter((item) => {
  //       if (
  //         item?.segmentId &&
  //         !item?.subSegmentId &&
  //         !segmentSet.has(item.segmentId)
  //       ) {
  //         segmentSet.add(item.segmentId);
  //         return true;
  //       } else if (
  //         item?.segmentId &&
  //         item?.subSegmentId &&
  //         !segmentSet.has(`${item.segmentId}-${item.subSegmentId}`)
  //       ) {
  //         segmentSet.add(`${item.segmentId}-${item.subSegmentId}`);
  //         return true;
  //       } else if (!item?.segmentId && !segmentSet.has(0)) {
  //         segmentSet.add(0);
  //         return true;
  //       }
  //       return false;
  //     });
  //     await createHistoryRecord({
  //       tableName: tableEnum.ACCOUNT_PO,
  //       moduleName: moduleName.ACCOUNTS,
  //       userId: user?.id,
  //       lastlogintime: user?.loginUserData?.logintimeutc,
  //       custom_message: await customHistoryViewMessage(user, tableEnum.ACCOUNT_PO, `All Segments Data!`),
  //       jsonData: parse(segmentsData),
  //       activity: statusEnum.VIEW,
  //     });
  //     return segmentsData;
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // }

  // async getAllSegmentsData(query: IQueryParameters, user: User) {
  //   try {
  //     const { clientId, startDate, endDate } = query;
  //     console.log("getAllSegmentsData~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", clientId, query, user);
  //     let { segment, subSegment } = query;
  //     const filterStartDate = moment(startDate, "DD-MM-YYYY").toDate();
  //     const filterEndDate = moment(endDate, "DD-MM-YYYY").toDate();
  //     const subSegmentIds = getSubSegmentAccessForUser(user);
  //     const segmentIds = getSegmentAccessForUser(user);
  //     if (segment === "") {
  //       segment = null;
  //     }
  //     if (subSegment === "") {
  //       subSegment = null;
  //     }
  //     const sendData = {
  //       segment: segment,
  //       subSegment: subSegment,
  //       clientId: +clientId,
  //       startDate: filterStartDate,
  //       endDate: filterEndDate,
  //       timesheetAttribute: ["id"],
  //       employeeAttribute: ["id"],
  //       segmentAttribute: ["id", "name", "code"],
  //     };
  //     const getTypeOfInclude = await this.fetchTypeOfInclude(sendData);
  //     console.log("getTypeOfInclude---------------------", getTypeOfInclude.include);
  //     console.log('segmentIds______', segmentIds, 'subSegmentIds', subSegmentIds);
  //     const logSqlQuery = (sql: string) => {
  //       console.log('SQL Query:', sql);  // or log to a file or service as needed
  //     };
  //     let segmentsData = await AccountPO.findAll({
  //       where: {
  //         ...getTypeOfInclude?.where,
  //         ...(segmentIds.length && { segmentId: { [Op.in]: segmentIds } }),
  //         ...(subSegmentIds.length && {
  //           subSegmentId: {
  //             [Op.or]: { [Op.eq]: null, [Op.in]: subSegmentIds },
  //           },
  //         }),
  //       },
  //       attributes: ["segmentId", "subSegmentId", "currency"],
  //       include: getTypeOfInclude?.include,
  //       order: [["segmentData", "name", "asc"]],
  //       logging: logSqlQuery, // Log the SQL query
  //     });
  //     segmentsData = parse(segmentsData);
  //     const segmentSet = new Set();
  //     segmentsData = segmentsData.filter((item) => {
  //       if (
  //         item?.segmentId &&
  //         !item?.subSegmentId &&
  //         !segmentSet.has(item.segmentId)
  //       ) {
  //         segmentSet.add(item.segmentId);
  //         return true;
  //       } else if (
  //         item?.segmentId &&
  //         item?.subSegmentId &&
  //         !segmentSet.has(`${item.segmentId}-${item.subSegmentId}`)
  //       ) {
  //         segmentSet.add(`${item.segmentId}-${item.subSegmentId}`);
  //         return true;
  //       } else if (!item?.segmentId && !segmentSet.has(0)) {
  //         segmentSet.add(0);
  //         return true;
  //       }
  //       return false;
  //     });

  //     return segmentsData.map((el: any) => {
  //       return { ...el };
  //     });
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // }

async getAllSegmentsData(query: IQueryParameters, user: User) {
  try {
    const { clientId, startDate, endDate } = query;
    let { segment, subSegment } = query;
      console.log("query-------2")
    console.log("getAllSegmentsData - Params Received:", {
      clientId,
      startDate,
      endDate,
      segment,
      subSegment,
      userId: user.id,
    });

    // Parse and validate dates
    // const filterStartDate = moment(startDate, "DD-MM-YYYY").startOf("day").toDate();
    // const filterEndDate = moment(endDate, "DD-MM-YYYY").endOf("day").toDate();
    const filterStartDate = startDate
  ? moment.tz(startDate, 'DD-MM-YYYY', 'Asia/Kolkata').startOf('day').toDate()
  : null;

const filterEndDate = endDate
  ? moment.tz(endDate, 'DD-MM-YYYY', 'Asia/Kolkata').endOf('day').toDate()
  : null;
   
  if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
      throw new Error("Invalid start or end date format.");
    }

    // Fallback to null if empty string
    segment = segment || null;
    subSegment = subSegment || null;

    // User access controls
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const segmentIds = getSegmentAccessForUser(user);

    console.log("Access Control - Segment IDs:", segmentIds);
    console.log("Access Control - SubSegment IDs:", subSegmentIds);

    // Build query payload
    const queryData = {
      segment,
      subSegment,
      clientId: +clientId,
      startDate: filterStartDate,
      endDate: filterEndDate,
      timesheetAttribute: ["id"],
      employeeAttribute: ["id"],
      segmentAttribute: ["id", "name", "code"],
    };

    // Fetch related include config
    const getTypeOfInclude = await this.fetchTypeOfInclude(queryData);
    console.log("Include Configuration Fetched:", getTypeOfInclude.include);

    // SQL query logger
    const logSqlQuery = (sql: string) => console.log("SQL Query:", sql);
   console.log("&&&&&&&&&&&&&&&&&&&&&",filterStartDate, filterEndDate)
    // Fetch raw segment data from AccountPO
    let segmentsData = await AccountPO.findAll({
      where: {
        ...getTypeOfInclude?.where,
        ...(segmentIds.length && { segmentId: { [Op.in]: segmentIds } }),
        ...(subSegmentIds.length && {
          subSegmentId: {
            [Op.or]: [{ [Op.eq]: null }, { [Op.in]: subSegmentIds }],
          },
        }),
      },
      attributes: ["segmentId", "subSegmentId", "currency"],
      include: getTypeOfInclude?.include,
      order: [["segmentData", "name", "asc"]],
      logging: logSqlQuery,
    });

    console.log("Raw segmentsData fetched:", segmentsData?.length || 0);

    // Normalize and deduplicate
    segmentsData = parse(segmentsData);

    const segmentSet = new Set();
    const uniqueSegments = segmentsData.filter((item) => {
      if (item?.segmentId && !item?.subSegmentId) {
        if (!segmentSet.has(item.segmentId)) {
          segmentSet.add(item.segmentId);
          return true;
        }
      } else if (item?.segmentId && item?.subSegmentId) {
        const key = `${item.segmentId}-${item.subSegmentId}`;
        if (!segmentSet.has(key)) {
          segmentSet.add(key);
          return true;
        }
      } else if (!item?.segmentId && !segmentSet.has("noSegment")) {
        segmentSet.add("noSegment");
        return true;
      }
      return false;
    });

    console.log("Filtered unique segments:", uniqueSegments.length);

    return uniqueSegments.map((el: any) => ({ ...el }));

  } catch (error: any) {
    console.error("getAllSegmentsData - Error:", error.message, error.stack);
    throw new Error(`getAllSegmentsData failed: ${error.message}`);
  }
}


  async getAllAccountPOData(
    clientId: number,
    query: IQueryParameters,
    user: User
  ) {
    try {
    console.log("query-------1");
const { startDate, endDate, segment, subSegment } = query;
console.log("-____", typeof startDate, typeof endDate)
const filterStartDate = startDate
  ? moment.tz(startDate, 'DD-MM-YYYY', 'Asia/Kolkata').startOf('day').toDate()
  : null;

const filterEndDate = endDate
  ? moment.tz(endDate, 'DD-MM-YYYY', 'Asia/Kolkata').endOf('day').toDate()
  : null;
console.log("********************", {
  filterStartDate,
  startDate,
  endDate,
  filterEndDate,
});

// Now pass as Date to function
let accountPODetails: any = await this.fetchAllAccountPOData(
  clientId,
  filterStartDate, // ✅ now it's a Date (or null)
  filterEndDate,   // ✅ now it's a Date (or null)
  user,
  segment,
  subSegment
);
      const respAccountData = new Map();
      const bonusData = await BonusType.findAll({
        where: {
          // isActive: true,
          deletedAt: null,
        },
      });
      for (const accountData of accountPODetails) {
        let employeeCatalogueNumber =
          accountData?.timesheet?.employee?.employeeCatalogueNumber?.[0]
            ?.catalogueNumber ?? null;
        if (
          accountData?.timesheet?.employee?.employeeCatalogueNumber?.length > 1
        ) {
          employeeCatalogueNumber =
            accountData?.timesheet?.employee?.employeeCatalogueNumber[1]
              ?.catalogueNumber;
        }

        if (accountData?.type !== "Salary") {
          const customBonus = JSON.parse(
            accountData?.timesheet?.employee?.customBonus
          );
          if (customBonus?.data && customBonus?.data?.length > 0) {
            if (accountData.type === "R" || accountData.type === "Rig") {
              const isExistCustomBonus = customBonus?.data?.findIndex(
                (e) => e.label === "R" || e.label === "Rig"
              );
              if (isExistCustomBonus >= 0) {
                employeeCatalogueNumber =
                  customBonus?.data[isExistCustomBonus]?.catalogueNumber;
              }
            } else {
              const isExistBonus = bonusData.findIndex(
                (e) => e.timesheetName === accountData.type
              );
              if (isExistBonus >= 0) {
                const bonus = bonusData[isExistBonus];
                const isExistCustomBonus = customBonus?.data?.findIndex(
                  (e) => e.label === bonus.code
                );
                if (isExistCustomBonus >= 0) {
                  employeeCatalogueNumber =
                    customBonus?.data[isExistCustomBonus]?.catalogueNumber;
                }
              }
            }
          }
        }
        // const prevValue =
        // 	Number(
        // 		respAccountData.get(
        // 			`${accountData.type}:${accountData?.segmentData?.id ?? -1}:${accountData?.subSegmentData?.id ?? -1}`,
        // 		) || 0,
        // 	) +
        // 	accountData.timesheetQty * accountData.dailyRate;
        // respAccountData.set(
        // 	`${accountData.type}:${accountData?.segmentData?.id ?? -1}:${accountData?.subSegmentData?.id ?? -1}`,
        // 	prevValue,
        // );

        const prevValue = respAccountData.get(
          `${accountData.type}:${accountData?.segmentData?.id ?? -1}:${
            accountData?.subSegmentData?.id ?? -1
          }:${accountData?.managers}:${
            accountData?.timesheet?.employee.fonction ?? null
          }:${employeeCatalogueNumber}:${accountData.dailyRate}:${
            accountData?.poNumber
          }`
        );

        const rate =
          Number(prevValue?.rate || 0) +
          accountData.timesheetQty * accountData.dailyRate;
        const timesheetQty =
          Number(prevValue?.timesheetQty || 0) + accountData?.timesheetQty;
        // let manager: string;
        // if (prevValue?.manager) {
        // 	const splitManager = prevValue?.manager?.split(',');
        // 	if (!splitManager?.includes(accountData?.managers)) {
        // 		manager = `${prevValue?.manager},${accountData?.managers}`;
        // 	} else {
        // 		manager = prevValue?.manager;
        // 	}
        // } else {
        // 	manager = accountData?.managers;
        // }

        const dataObj = {
          id: accountData?.id,
          rate: rate,
          dailyRate: accountData?.dailyRate,
          timesheetQty: timesheetQty,
          segmentName: accountData?.segmentData?.name ?? null,
          subSegmentName: accountData?.subSegmentData?.name ?? null,
          type: accountData?.type,
          manager: accountData?.managers,
          catalogueNumber: employeeCatalogueNumber,
          fonction: accountData?.timesheet?.employee.fonction,
          employee: {
            id: accountData?.timesheet?.employee?.id,
            employeeNumber: accountData?.timesheet?.employee?.employeeNumber,
            loginUserData: accountData?.timesheet?.employee?.loginUserData,
          },
          client: accountData?.timesheet?.employee.client,
          timesheet: accountData?.timesheet,
          currency: accountData?.currency,
        };

        respAccountData.set(
          `${accountData.type}:${accountData?.segmentData?.id ?? -1}:${
            accountData?.subSegmentData?.id ?? -1
          }:${accountData?.managers}:${
            accountData?.timesheet?.employee.fonction ?? null
          }:${employeeCatalogueNumber}:${accountData.dailyRate}:${
            accountData?.poNumber
          }`,
          dataObj
        );
      }

      const finalCalculatedData = [];

      for (const [key, value] of respAccountData.entries()) {
        const stringArr = key.split(":");
        const obj = {
          id: value?.id,
          type: value?.type,
          segmentData: +stringArr[1]
            ? { id: +stringArr[1], name: value?.segmentName }
            : null,
          subSegmentData: +stringArr[2]
            ? { id: +stringArr[2], name: value?.subSegmentName }
            : null,
          position: value?.fonction ?? null,
          total: value?.rate,
          managers: value?.manager,
          catalogueNumber: value?.catalogueNumber,
          dailyRate: value?.dailyRate,
          timesheetQty: value?.timesheetQty,
          employee: value?.employee,
          client: value?.client,
          currency: value?.currency,
          // managerData: managerData,
        };
        finalCalculatedData.push(obj);
      }

      accountPODetails = finalCalculatedData;

      // await createHistoryRecord({
      //   tableName: tableEnum.ACCOUNT_PO,
      //   moduleName: moduleName.ACCOUNTS,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(
      //     user,
      //     tableEnum.ACCOUNT_PO,
      //     `All Account PO Data!`
      //   ),
      //   jsonData: parse(accountPODetails),
      //   activity: statusEnum.VIEW,
      // });
      return accountPODetails;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error });
    }
  }

  async getAllAccountPODataByEmployee(
    clientId: number,
    query: IQueryParameters,
    user: User
  ) {
    // const startDate = moment(query.startDate, "DD-MM-YYYY").toISOString();
    // const endDate = moment(query.endDate, "DD-MM-YYYY").toISOString();
    // console.log("getAllAccountPODataByEmployee", clientId, query, user);
    let {startDate, endDate} = query;
const filterStartDate = startDate
  ? moment.tz(startDate, 'DD-MM-YYYY', 'Asia/Kolkata').startOf('day').toDate()
  : null;

const filterEndDate = endDate
  ? moment.tz(endDate, 'DD-MM-YYYY', 'Asia/Kolkata').endOf('day').toDate()
  : null;
    let accountPODetails = await this.fetchAllAccountPOData(
      clientId,
      filterStartDate,
      filterEndDate,
      // query.startDate,
      // query.endDate,
      user,
      query.segment,
      query.subSegment
    );
    accountPODetails = parse(accountPODetails);
    // const bonusData = await BonusType.findAll({
    //   where: {
    //     // isActive: true,
    //     deletedAt: null,
    //   },
    // });
    for (const accountData of accountPODetails) {
      if (
        accountData["timesheet"]["employee"]["employeeCatalogueNumber"]
          ?.length > 1
      ) {
        accountData["timesheet"]["employee"]["employeeCatalogueNumber"] = {
          catalogueNumber:
            accountData["timesheet"]["employee"]["employeeCatalogueNumber"]?.[1]
              ?.catalogueNumber ?? null,
        };
      } else {
        accountData["timesheet"]["employee"]["employeeCatalogueNumber"] = {
          catalogueNumber:
            accountData["timesheet"]["employee"]["employeeCatalogueNumber"]?.[0]
              ?.catalogueNumber ?? null,
        };
      }
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.ACCOUNT_PO,
    //   moduleName: moduleName.ACCOUNTS,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(
    //     user,
    //     tableEnum.ACCOUNT_PO,
    //     `All Account PO Data of Specific Employee!`
    //   ),
    //   jsonData: parse(accountPODetails),
    //   activity: statusEnum.VIEW,
    // });
    return accountPODetails;
  }

  async getAccountPODataByID(
    id: number,
    user: User,
    transaction: Transaction = null
  ) {
    try {
      let data = await AccountPO.findOne({
        where: {
          id: id,
          deletedAt: null,
        },
        include: [
          {
            model: Timesheet,
            where: {
              deletedAt: null,
              status: "APPROVED",
            },
            include: [
              {
                model: Employee,
                attributes: ["id", "loginUserId", "employeeNumber"],
                required: true,
                include: [
                  {
                    model: LoginUser,
                    attributes: ["firstName", "lastName", "email"],
                  },
                  {
                    model: EmployeeCatalogueNumber,
                    attributes: ["startDate", "catalogueNumber"],
                    required: false,
                  },
                  {
                    model: EmployeeBonus,
                    required: false,
                    include: [
                      {
                        model: BonusType,
                        attributes: ["id", "name", "code", "timesheetName"],
                      },
                    ],
                  },
                ],
              },
              {
                model: Client,
                attributes: ["id", "clientName", "stampLogo"],
              },
            ],
          },
          {
            model: Segment,
            attributes: ["id", "name"],
            as: "segmentData",
          },
          {
            model: SubSegment,
            attributes: ["id", "name"],
            as: "subSegmentData",
          },
        ],
        transaction,
      });
      if (data) {
        data = parse(data);
      }
      // await createHistoryRecord({
      //   tableName: tableEnum.ACCOUNT_PO,
      //   moduleName: moduleName.ACCOUNTS,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(
      //     user,
      //     tableEnum.ACCOUNT_PO,
      //     `Specific Account PO Data!`
      //   ),
      //   jsonData: parse(data),
      //   activity: statusEnum.VIEW,
      // });
      return data;
    } catch (error) {
      // console.log("error---->", error);
      throw new HttpException(404, this.msg.notFound, {}, true);
    }
  }

  async updatePaymentStatus(
    { id, user }: { id: number; user: User },
    transaction: Transaction = null
  ) {
    let isExist = await this.getAccountPODataByID(id, user, transaction);
    isExist = parse(isExist);
    if (!isExist) {
      throw new HttpException(404, this.msg.notFound, {}, true);
    }
    await AccountPO.update(
      { isPaid: true, updatedBy: user?.id },
      { where: { id: id }, transaction }
    );
    const data = await this.getAccountPODataByID(id, user, transaction);
    await createHistoryRecord({
      tableName: tableEnum.CLIENT,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryUpdateMesage(
        null,
        isExist,
        user,
        data,
        tableEnum.CLIENT,
        `Update Payment Status`
      ),
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
    return data;
  }

  async fetchAllAccountPOData(
    clientId: number,
    startDate: Date,
    endDate: Date,
    user: User,
    segment?: string,
    subSegment?: string
  ) {
    if (segment === "") {
      segment = null;
    }
    if (subSegment === "") {
      subSegment = null;
    }
    const sendData = {
      segment: segment,
      subSegment: subSegment,
      clientId: clientId,
      // startDate: moment(startDate, 'DD-MM-YYYY').tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ssZ'),
      // endDate: moment(endDate, 'DD-MM-YYYY').tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ssZ'),
      startDate: startDate,
      endDate: endDate,
      timesheetAttribute: ["id", "startDate", "endDate"],
      employeeAttribute: [
        "id",
        "employeeNumber",
        "fonction",
        "customBonus",
        "clientId",
      ],
      segmentAttribute: ["id", "name"],
    };
    // console.log("sendData", sendData, startDate);
    
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const segmentIds = getSegmentAccessForUser(user);
    const getTypeOfInclude: any = await this.fetchTypeOfInclude(sendData);
    console.log("&&&&&&&&&&&", startDate, endDate)
    const accountPODetails = await AccountPO.findAll({
      where: {
        ...getTypeOfInclude?.where,
        ...(segmentIds.length && { segmentId: { [Op.in]: segmentIds } }),
        ...(subSegmentIds.length && {
          subSegmentId: { [Op.or]: { [Op.eq]: null, [Op.in]: subSegmentIds } },
        }),
        [Op.or]: {
          type: {
            [Op.ne]: "Medical",
          },
          dailyRate: {
            [Op.gt]: 0,
          },
        },
      },
      attributes: [
        "id",
        "type",
        "poNumber",
        "dailyRate",
        "timesheetQty",
        "isPaid",
        "invoiceNo",
        "managers",
        "startDate",
        "endDate",
        "currency",
      ],
      paranoid: false,
      include: getTypeOfInclude?.include,
      order: [
        ["timesheet", "employee", "loginUserData", "lastName"],
        [
          "timesheet",
          "employee",
          "employeeCatalogueNumber",
          "startDate",
          "desc",
        ],
      ],
      logging: (sql: string) => {
        console.log("SQL Query:", sql); // Log the SQL query
      }
    });
    const result = parse(accountPODetails);

    let index = 0;
    for (const item of result) {
      if (item?.type !== "Salary" && item?.type !== "Medical") {
        const catalogueNumberIndex = item?.timesheet?.employee?.employeeBonus?.findIndex(
          (e) => {
            return (
              e?.bonus?.name === item?.type &&
              moment(
                moment(e.startDate).format("DD/MM/YYYY"),
                "DD/MM/YYYY"
              ).isSameOrBefore(
                moment(moment(item?.endDate).format("DD/MM/YYYY"), "DD/MM/YYYY")
              ) &&
              (e.endDate === null ||
                moment(
                  moment(e.endDate).format("DD/MM/YYYY"),
                  "DD/MM/YYYY"
                ).isSameOrAfter(
                  moment(
                    moment(item?.startDate).format("DD/MM/YYYY"),
                    "DD/MM/YYYY"
                  )
                ))
            );
          }
        );
        if (item?.timesheet?.employee?.employeeCatalogueNumber?.length > 0) {
          item.timesheet.employee.employeeCatalogueNumber = [
            {
              startDate: null,
              catalogueNumber:
                item?.timesheet?.employee?.employeeBonus?.[catalogueNumberIndex]
                  ?.catalogueNumber,
            },
          ];
        }
      }
      const medicalRequestData = await MedicalRequest.findAll({
        where: {
          employeeId: item.timesheet.employee.id,
          status: medicalRequestStatus.ACTIVE,
          //   medicalDate: { [Op.between]: [startDate, endDate] },
          medicalDate: {
            [Op.between]: [
              moment(startDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
                "T00:00:00.000Z",
              moment(endDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
                "T23:59:59.999Z",
            ],
          },
        },
        include: [
          { model: MedicalType, where: { amount: { [Op.not]: null } } },
        ],
      });
      let total = 0;
      for (const medicalRequest of medicalRequestData) {
        total += medicalRequest.medicalTypeData.amount;
      }
      result[index]["medicalTotal"] = total;
      index++;
    }
    return result;
  }

  async fetchTypeOfInclude(data: {
    segment: string;
    subSegment: string;
    clientId: number;
    startDate: Date | string;
    endDate: Date | string;
    timesheetAttribute: string[];
    employeeAttribute: string[];
    segmentAttribute: string[];
  }) {
    let include = [];
    let where = {};

    // data["startDate"] =
    //   moment(data?.startDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
    //   "T00:00:00.000Z";
    // data["endDate"] =
    //   moment(data?.endDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
    //   "T23:59:59.999Z";
    if (
      data?.segment &&
      !isNull(data?.segment) &&
      data?.subSegment &&
      !isNull(data?.subSegment)
    ) {
      // console.log("condition 1 called..");
      include = [
        {
          model: Timesheet,
          where: {
            clientId: data?.clientId,
            deletedAt: null,
            // startDate: {
            //   [Op.or]: {
            //     [Op.between]: [data?.startDate, data?.endDate],
            //     [Op.eq]: data?.startDate,
            //   },
            // },
            // endDate: {
            //   [Op.or]: {
            //     [Op.between]: [data?.startDate, data?.endDate],
            //     [Op.eq]: data?.endDate,
            //   },
            // },
            startDate: {
    [Op.gte]: data.startDate,
    [Op.lte]: data.endDate
  },
  endDate: {
    [Op.gte]: data.startDate,
    [Op.lte]: data.endDate
  },
            status: "APPROVED",
          },
          attributes: data?.timesheetAttribute,
          include: [
            {
              model: Employee,
              attributes: data?.employeeAttribute,
              required: true,
              include: [
                {
                  model: LoginUser,
                  attributes: ["id", "firstName", "lastName", "name"],
                },
                {
                  model: EmployeeCatalogueNumber,
                  attributes: ["startDate", "catalogueNumber"],
                  required: false,
                  where: {
                    startDate: {
                      [Op.or]: {
                        [Op.between]: [data?.startDate, data.endDate],
                        [Op.lte]: data?.startDate,
                        [Op.eq]: null,
                      },
                    },
                  },
                },
                {
                  model: EmployeeBonus,
                  required: false,
                  where: {
                    startDate: {
                      [Op.lte]: data?.endDate,
                    },
                    endDate: {
                      [Op.or]: {
                        [Op.eq]: null,
                        [Op.gte]: data?.startDate,
                      },
                    },
                  },
                  include: [
                    {
                      model: BonusType,
                      attributes: ["id", "name", "code", "timesheetName"],
                    },
                  ],
                },
                // {
                //   model: Client,
                //   attributes: ["id", "currency", "loginUserId"],
                //   include: [
                //     {
                //       model: LoginUser,
                //       attributes: ["id", "name"],
                //     },
                //   ]
                // },
              ],
            },
          ],
        },
        {
          model: Segment,
          attributes: data?.segmentAttribute,
          as: "segmentData",
          required: true,
          paranoid: false,
          where: {
            // code: data?.segment,
            // id: data?.segment,
            id: { [Op.in]: data?.segment?.split(",") },
            deletedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.and]: {
                  [Op.gt]: data?.startDate,
                  [Op.lt]: data?.endDate,
                },
              },
            },
          },
        },
        {
          model: SubSegment,
          attributes: data?.segmentAttribute,
          as: "subSegmentData",
          required: true,
          paranoid: false,
          where: {
            // code: data?.subSegment,
            id: data?.subSegment,
            deletedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.and]: {
                  [Op.gt]: data?.startDate,
                  [Op.lt]: data?.endDate,
                },
              },
            },
          },
        },
      ];
      where = {
        deletedAt: null,
      };
    } else if (data?.segment && !isNull(data?.segment) && !data?.subSegment) {
      console.log("Condition 2 called", data?.segment?.split(","));
      include = [
        {
          model: Timesheet,
          where: {
            clientId: data?.clientId,
            deletedAt: null,
            startDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.startDate,
              },
            },
            endDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.endDate,
              },
            },
            status: "APPROVED",
          },
          attributes: data?.timesheetAttribute,
          include: [
            {
              model: Employee,
              attributes: data?.employeeAttribute,
              required: true,
              include: [
                {
                  model: LoginUser,
                  attributes: ["id", "firstName", "lastName", "name"],
                },
                {
                  model: EmployeeCatalogueNumber,
                  required: false,
                  where: {
                    startDate: {
                      [Op.or]: {
                        [Op.between]: [data?.startDate, data.endDate],
                        [Op.lte]: data?.startDate,
                        [Op.eq]: null,
                      },
                    },
                  },
                },
                {
                  model: EmployeeBonus,
                  required: false,
                  where: {
                    startDate: {
                      [Op.lte]: data?.endDate,
                    },
                    endDate: {
                      [Op.or]: {
                        [Op.eq]: null,
                        [Op.gte]: data?.startDate,
                      },
                    },
                  },
                  include: [
                    {
                      model: BonusType,
                      attributes: ["id", "name", "code", "timesheetName"],
                    },
                  ],
                },
                // {
                //   model: Client,
                //   attributes: ["id", "currency", "loginUserId"],
                //   include: [
                //     {
                //       model: LoginUser,
                //       attributes: ["id", "name"],
                //     },
                //   ]
                // },
              ],
            },
          ],
        },
        {
          model: Segment,
          attributes: data?.segmentAttribute,
          as: "segmentData",
          required: true,
          paranoid: false,
          where: {
            // code: data?.segment,
            id: { [Op.in]: data?.segment?.split(",") },
            deletedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.and]: {
                  [Op.gt]: data?.startDate,
                  [Op.lt]: data?.endDate,
                },
              },
            },
          },
        },
        {
          model: SubSegment,
          attributes: data?.segmentAttribute,
          as: "subSegmentData",
        },
      ];
      where = {
        deletedAt: null,
        ...(isNull(data?.segment) && { segmentId: null }),
        ...(isNull(data?.subSegment) && { subSegmentId: null }),
      };
    } else {
      console.log("condition 3rd called----");
      include = [
        {
          model: Timesheet,
          where: {
            clientId: data?.clientId,
            deletedAt: null,
            startDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.startDate,
              },
            },
            endDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.endDate,
              },
            },
            status: "APPROVED",
          },
          attributes: data?.timesheetAttribute,
          include: [
            {
              model: Employee,
              attributes: data?.employeeAttribute,
              required: false,
              include: [
                {
                  model: LoginUser,
                  attributes: ["id", "firstName", "lastName", "name"],
                },
                {
                  model: EmployeeCatalogueNumber,
                  required: false,
                  where: {
                    startDate: {
                      [Op.or]: [
                        { startDate: { [Op.between]: [data?.startDate, data?.endDate] } },
                        { startDate: { [Op.lte]: data?.startDate } },
                        { startDate: { [Op.is]: null } },
                      ],
                    },
                  },
                },
                {
                  model: EmployeeBonus,
                  required: false,
                  where: {
                    startDate: {
                      [Op.lte]: data?.endDate,
                    },
                    endDate: {
                      [Op.or]: {
                        [Op.eq]: null,
                        [Op.gte]: data?.startDate,
                      },
                    },
                  },
                  include: [
                    {
                      model: BonusType,
                      attributes: ["id", "name", "code", "timesheetName"],
                    },
                  ],
                },
                // {
                //   model: Client,
                //   attributes: ["id", "currency", "loginUserId"],
                //   include: [
                //     {
                //       model: LoginUser,
                //       attributes: ["id", "name"],
                //     },
                //   ]
                // },
              ],
            },
          ],
        },
        {
          model: Segment,
          attributes: data?.segmentAttribute,
        },
        {
          model: SubSegment,
          attributes: data?.segmentAttribute,
          required: false,
        },
      ];
      where = {
        deletedAt: null,
        ...(isNull(data?.segment) && { segmentId: null }),
        ...(isNull(data?.subSegment) && { subSegmentId: null }),
      };
    }
    return { include, where };
  }

  async fetchTypeOfIncludeForMail(data: {
    segment: string;
    subSegment: string;
    clientId: number;
    startDate: Date | string;
    endDate: Date | string;
  }) {
    let include = [];
    let where = {};

    data["startDate"] =
      moment(data?.startDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
      "T00:00:00.000Z";
    data["endDate"] =
      moment(data?.endDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
      "T23:59:59.999Z";
    if (
      data?.segment &&
      !isNull(data?.segment) &&
      data?.subSegment &&
      !isNull(data?.subSegment)
    ) {
      // console.log("condition 1 called..");
      include = [
        {
          model: Timesheet,
          where: {
            clientId: data?.clientId,
            deletedAt: null,
            startDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.startDate,
              },
            },
            endDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.endDate,
              },
            },
            status: "APPROVED",
          },
          attributes: { exclude: [] },
          include: [
            {
              model: Employee,
              attributes: { exclude: [] },
              required: true,
              include: [
                {
                  model: LoginUser,
                  attributes: { exclude: [] },
                },
                {
                  model: EmployeeCatalogueNumber,
                  attributes: { exclude: [] },
                  required: false,
                  where: {
                    startDate: {
                      [Op.or]: {
                        [Op.between]: [data?.startDate, data.endDate],
                        [Op.lte]: data?.startDate,
                        [Op.eq]: null,
                      },
                    },
                  },
                },
                {
                  model: EmployeeBonus,
                  required: false,
                  attributes: { exclude: [] },
                  where: {
                    startDate: {
                      [Op.lte]: data?.endDate,
                    },
                    endDate: {
                      [Op.or]: {
                        [Op.eq]: null,
                        [Op.gte]: data?.startDate,
                      },
                    },
                  },
                  include: [
                    {
                      model: BonusType,
                      attributes: { exclude: [] },
                    },
                  ],
                },
                {
                  model: Client,
                  attributes: { exclude: [] },
                  include: [
                    {
                      model: LoginUser,
                      attributes: { exclude: [] },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Segment,
          attributes: { exclude: [] },
          as: "segmentData",
          required: true,
          paranoid: false,
          where: {
            id: { [Op.in]: data?.segment?.split(",") },
            deletedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.and]: {
                  [Op.gt]: data?.startDate,
                  [Op.lt]: data?.endDate,
                },
              },
            },
          },
        },
        {
          model: SubSegment,
          attributes: { exclude: [] },
          as: "subSegmentData",
          required: true,
          paranoid: false,
          where: {
            id: data?.subSegment,
            deletedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.and]: {
                  [Op.gt]: data?.startDate,
                  [Op.lt]: data?.endDate,
                },
              },
            },
          },
        },
      ];
      where = {
        deletedAt: null,
      };
    } else if (data?.segment && !isNull(data?.segment) && !data?.subSegment) {
      console.log("Condition 2 called", data?.segment?.split(","));
      include = [
        {
          model: Timesheet,
          where: {
            clientId: data?.clientId,
            deletedAt: null,
            startDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.startDate,
              },
            },
            endDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.endDate,
              },
            },
            status: "APPROVED",
          },
          attributes: { exclude: [] },
          include: [
            {
              model: Employee,
              attributes: { exclude: [] },
              required: true,
              include: [
                {
                  model: LoginUser,
                  attributes: { exclude: [] },
                },
                {
                  model: EmployeeCatalogueNumber,
                  required: false,
                  attributes: { exclude: [] },
                  where: {
                    startDate: {
                      [Op.or]: {
                        [Op.between]: [data?.startDate, data.endDate],
                        [Op.lte]: data?.startDate,
                        [Op.eq]: null,
                      },
                    },
                  },
                },
                {
                  model: EmployeeBonus,
                  required: false,
                  attributes: { exclude: [] },
                  where: {
                    startDate: {
                      [Op.lte]: data?.endDate,
                    },
                    endDate: {
                      [Op.or]: {
                        [Op.eq]: null,
                        [Op.gte]: data?.startDate,
                      },
                    },
                  },
                  include: [
                    {
                      model: BonusType,
                      attributes: { exclude: [] },
                    },
                  ],
                },
                {
                  model: Client,
                  attributes: { exclude: [] },
                  include: [
                    {
                      model: LoginUser,
                      attributes: { exclude: [] },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Segment,
          attributes: { exclude: [] },
          as: "segmentData",
          required: true,
          paranoid: false,
          where: {
            id: { [Op.in]: data?.segment?.split(",") },
            deletedAt: {
              [Op.or]: {
                [Op.eq]: null,
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.and]: {
                  [Op.gt]: data?.startDate,
                  [Op.lt]: data?.endDate,
                },
              },
            },
          },
        },
        {
          model: SubSegment,
          attributes: { exclude: [] },
          as: "subSegmentData",
        },
      ];
      where = {
        deletedAt: null,
        ...(isNull(data?.segment) && { segmentId: null }),
        ...(isNull(data?.subSegment) && { subSegmentId: null }),
      };
    } else {
      console.log("condition 3rd called----");
      include = [
        {
          model: Timesheet,
          where: {
            clientId: data?.clientId,
            deletedAt: null,
            startDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.startDate,
              },
            },
            endDate: {
              [Op.or]: {
                [Op.between]: [data?.startDate, data?.endDate],
                [Op.eq]: data?.endDate,
              },
            },
            status: "APPROVED",
          },
          attributes: { exclude: [] },
          include: [
            {
              model: Employee,
              attributes: { exclude: [] },
              required: true,
              include: [
                {
                  model: LoginUser,
                  attributes: { exclude: [] },
                },
                {
                  model: EmployeeCatalogueNumber,
                  required: false,
                  attributes: { exclude: [] },
                  where: {
                    startDate: {
                      [Op.or]: {
                        [Op.between]: [data?.startDate, data.endDate],
                        [Op.lte]: data?.startDate,
                        [Op.eq]: null,
                      },
                    },
                  },
                },
                {
                  model: EmployeeBonus,
                  required: false,
                  attributes: { exclude: [] },
                  where: {
                    startDate: {
                      [Op.lte]: data?.endDate,
                    },
                    endDate: {
                      [Op.or]: {
                        [Op.eq]: null,
                        [Op.gte]: data?.startDate,
                      },
                    },
                  },
                  include: [
                    {
                      model: BonusType,
                      attributes: { exclude: [] },
                    },
                  ],
                },
                {
                  model: Client,
                  attributes: { exclude: [] },
                  include: [
                    {
                      model: LoginUser,
                      attributes: { exclude: [] },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Segment,
          attributes: { exclude: [] },
        },
        {
          model: SubSegment,
          attributes: { exclude: [] },
          required: false,
        },
      ];
      where = {
        deletedAt: null,
        ...(isNull(data?.segment) && { segmentId: null }),
        ...(isNull(data?.subSegment) && { subSegmentId: null }),
      };
    }

    return { include, where };
  }

  async fetchAccountPODataById(
    clientId: number,
    startDate: Date,
    endDate: Date,
    user: User,
    segment?: string,
    subSegment?: string
  ) {
    if (segment === "") {
      segment = null;
    }
    if (subSegment === "") {
      subSegment = null;
    }
    const sendData = {
      segment: segment,
      subSegment: subSegment,
      clientId: clientId,
      startDate: startDate,
      endDate: endDate,
    };
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const segmentIds = getSegmentAccessForUser(user);
    const getTypeOfInclude = await this.fetchTypeOfIncludeForMail(sendData);
    console.log("getTypeOfInclude", getTypeOfInclude);
    const accountPODetails = await AccountPO.findAll({
      where: {
        ...getTypeOfInclude?.where,
        ...(segmentIds.length && { segmentId: { [Op.in]: segmentIds } }),
        ...(subSegmentIds.length && {
          subSegmentId: { [Op.or]: { [Op.eq]: null, [Op.in]: subSegmentIds } },
        }),
        [Op.or]: {
          type: {
            [Op.ne]: "Medical",
          },
          dailyRate: {
            [Op.gt]: 0,
          },
        },
      },
      attributes: [
        "id",
        "type",
        "poNumber",
        "dailyRate",
        "timesheetQty",
        "isPaid",
        "invoiceNo",
        "managers",
        "startDate",
        "endDate",
        "poSummaryUrl",
        "createdAt",
        "currency",
        "managerId",
      ],
      paranoid: false,
      include: getTypeOfInclude?.include,
      order: [
        ["timesheet", "employee", "loginUserData", "lastName"],
        [
          "timesheet",
          "employee",
          "employeeCatalogueNumber",
          "startDate",
          "desc",
        ],
      ],
    });
    const result = parse(accountPODetails);
    let index = 0;
    for (const item of result) {
      if (item?.type !== "Salary" && item?.type !== "Medical") {
        const catalogueNumberIndex = item?.timesheet?.employee?.employeeBonus?.findIndex(
          (e) => {
            return (
              e?.bonus?.name === item?.type &&
              moment(
                moment(e.startDate).format("DD/MM/YYYY"),
                "DD/MM/YYYY"
              ).isSameOrBefore(
                moment(moment(item?.endDate).format("DD/MM/YYYY"), "DD/MM/YYYY")
              ) &&
              (e.endDate === null ||
                moment(
                  moment(e.endDate).format("DD/MM/YYYY"),
                  "DD/MM/YYYY"
                ).isSameOrAfter(
                  moment(
                    moment(item?.startDate).format("DD/MM/YYYY"),
                    "DD/MM/YYYY"
                  )
                ))
            );
          }
        );
        if (item?.timesheet?.employee?.employeeCatalogueNumber?.length > 0) {
          item.timesheet.employee.employeeCatalogueNumber = [
            {
              startDate: null,
              catalogueNumber:
                item?.timesheet?.employee?.employeeBonus?.[catalogueNumberIndex]
                  ?.catalogueNumber,
            },
          ];
        }
      }
      const medicalRequestData = await MedicalRequest.findAll({
        where: {
          employeeId: item.timesheet.employee.id,
          status: medicalRequestStatus.ACTIVE,
          //   medicalDate: { [Op.between]: [startDate, endDate] },
          medicalDate: {
            [Op.between]: [
              moment(startDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
                "T00:00:00.000Z",
              moment(endDate, "DD-MM-YYYY").format("YYYY-MM-DD") +
                "T23:59:59.999Z",
            ],
          },
        },
        include: [
          { model: MedicalType, where: { amount: { [Op.not]: null } } },
        ],
      });
      let total = 0;
      for (const medicalRequest of medicalRequestData) {
        total += medicalRequest.medicalTypeData.amount;
      }
      result[index]["medicalTotal"] = total;
      result[index]["subTotal"] = item?.timesheetQty * item?.dailyRate;
      index++;
    }
    return result;
  }

  async recapPoSummaryMailer(
    clientId: number,
    query: IQueryParameters,
    user: User
  ) {
    const warnings: string[] = [];
    const accountPODetails: any = await this.fetchAccountPODataById(
      clientId,
      query.startDate,
      query.endDate,
      user,
      query.segment,
      query.subSegment
    );
    if (accountPODetails.length === 0) {
      throw new HttpException(
        404,
        "Account PO Data Are Not Found For Date Range or Segment",
        {},
        true
      );
    }
    function groupBySegment(data, key = "id") {
      return data.reduce((acc, item) => {
        const segmentKey = item.segmentData ? item.segmentData[key] : "Unknown"; // Use segmentData.id or segmentData.name
        if (!acc[segmentKey]) {
          acc[segmentKey] = []; // Initialize array if not already present
        }
        acc[segmentKey].push(item); // Push the current item into the array
        return acc;
      }, {});
    }
    const groupedBySegmentId = groupBySegment(accountPODetails, "slug");

    const uniqueSegmentData = { groupedBySegmentId };
    // const uniqueSegmentData = groupedBySegmentId.filter(item => item !== null);

    // const uniqueSegmentData = groupBySegment(accountPODetails);
    const accountWorkSheetGroup = {};
    const managerEmails = [];
    const poSummaryUrlArr: string[] = [];
    Object.keys(groupedBySegmentId).forEach(async (accountPODetailsKey) => {
      const accountWorkSheet = [];

      const clientEmails = [];
      for (const item of groupedBySegmentId[accountPODetailsKey]) {
        const managerDetails = await SegmentManager.findAll({
          where: {
            segmentId: item?.segmentData?.id,
            clientId,
          },
          include: [
            {
              model: LoginUser,
              attributes: { exclude: [] },
            },
          ],
        });
        if (managerDetails.length === 0) {
          warnings.push(
            `Segment manager missing for "${item?.segmentData?.name}". Please assign one.`
          );
        }
        for (const managerDetail of managerDetails) {
          clientEmails.push(managerDetail.loginUserData.email);
        }
        const contectDetail = await Contact.findOne({
          where: {
            id: item?.segmentData?.contactId,
            deletedAt: null,
          },
        });
        if (!contectDetail) {
          warnings.push(
            "Contact info missing in Account PO segment. Please add a contact person."
          );
        }
        clientEmails.push(item?.timesheet?.employee?.client?.clientEmail);
        // clientEmails.push(item?.timesheet?.employee?.client?.approvalEmail);

        accountWorkSheet.push({
          "*Contact Name": contectDetail?.name ?? "",
          "Email Address":
            item?.timesheet?.employee?.loginUserData?.email ?? "",
          "PO Address Line1": "",
          "PO Address Line2": "",
          "PO Address Line3": "",
          "PO Address Line4": "",
          "PO City": "",
          "PO Region": "",
          "PO Postal Code": "",
          "PO Country": "",
          "SA Address Line1": "",
          "SA Address Line2": "",
          "SA Address Line3": "",
          "SA Address Line4": "",
          "SA City": "",
          "SA Region": "",
          "SA Postal Code": "",
          "SA Country": "",
          "Invoice Number": item?.invoiceNo ?? "",
          "Reference ": "",
          "Invoice Date": moment(item?.createdAt ?? "").format("YYYY-MM-DD"),
          "Due Date": "",
          "Planned Date": "",
          "Total ": "",
          "Tax Total": "",
          "Invoice Amount Paid": "",
          "Invoice Amount Due": "",
          "Inventory Item Code": "",
          "*Description": `Prestation de service assistance Technique sur chantier PO: Segment : ${
            item?.segmentData?.code ?? ""
          } / ${item?.timesheet?.employee?.client?.clientName ?? ""} Periode : ${moment(item?.createdAt ?? "").format(
            "MM/YYYY"
          )}`,
          "*Quantity": "1",
          "*UnitAmount": item?.subTotal ?? "",
          "Discount ": "",
          "Line Amount": "",
          "*AccountCode": "200",
          "*TaxType": `Sales_VAT_${
            item?.timesheet?.employee?.client?.taxAmount > 0
              ? `${item?.timesheet?.employee?.client?.taxAmount}%`
              : "Exempt"
          }`, //  Tax on Sales_VAT taxAmount && taxAmount > 0 ? {taxAmount}%: "Exempt"
          "Tax Amount": `${
            item?.timesheet?.employee?.client?.taxAmount > 0
              ? `${item?.timesheet?.employee?.client?.taxAmount}%`
              : "Exempt"
          }`, // taxAmount && taxAmount > 0 ? {taxAmount}% : "Exempt"
          "*TrackingName1": "Segment",
          "*TrackingOption1": `${item?.segmentData?.code ?? ""} ${
            item?.subSegmentData?.code ?? ""
          } / ${item?.timesheet?.employee?.client?.clientName ?? ""}`,
          "*TrackingName2": "Entity",
          "*TrackingOption2": "EURL LRED",
          // "Currency ": "DZD",
          "Type ": "Sales Invoice",
          "Currency ": item?.currency ?? "",
          // "Type ": item?.type ?? "",
          "Sent ": "",
          "Status ": item?.timesheet?.employee?.employeeStatus ?? "",
          // "Address": item?.timesheet?.employee?.address ?? "",
          // "Position": item?.timesheet?.employee?.fonction ?? "",
          // "Managers": item?.managers ?? "",
          // "Segment": item?.segmentData?.name ?? "",
          // "Sub-Segment": item?.subSegmentData?.name ?? "",
          // "Daily Rate": item?.dailyRate ?? "",
          // "PO Number": item?.poNumber ?? "",
          // "PO Country": item?.timesheet?.employee?.client?.country ?? "",
          // "timesheetQty": item?.timesheetQty ?? "",
          // "Catalogue Number": employeeCatalogueNumber ?? "",
          // "Employee Number": item?.timesheet?.employee?.employeeNumber ?? "",
          // "Contract Number": item?.timesheet?.employee?.contractNumber ?? "",
          // "Phone": item?.timesheet?.employee?.loginUserData?.phone ?? "",
          // "Next Of Kin Mobile": item?.timesheet?.employee?.nextOfKinMobile ?? "",
          // "nSS": item?.timesheet?.employee?.nSS ?? "",
        });
        const managerDetaile = await LoginUser.findByPk(item?.managerId);
        if (!managerDetaile) {
          warnings.push("No manager reference found in the old data.");
        }
        if (managerDetaile) {
          managerEmails.push(managerDetaile.email);
        }
      }
      accountWorkSheetGroup[accountPODetailsKey] = accountWorkSheet;
      const MailIds = [...clientEmails, ...managerEmails];
      let uniqueManagerIds = [...new Set(MailIds)].flatMap((email) =>
        email.split(",")
      );
      uniqueManagerIds = uniqueManagerIds.filter(
        (email) => email !== "admin@lred.com"
      );
      uniqueManagerIds = uniqueManagerIds.filter(
        (email) => email !== "nihad@3spf.com"
      );
      console.log(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>uniqueManagerIds",
        uniqueManagerIds
      );

      // const existingRecord = await PoSummaryExcelUrl.findOne({
      //   where: {
      //     clientId: clientId,
      //     // segment: query.segment,
      //     // subSegment: query.subSegment,
      //     startDate: query.startDate,
      //     endDate: query.endDate,
      //   },
      // });

      // let checkForCreateFile: Boolean = true;

      // if (existingRecord) {
      //   if (checkS3FileExists(existingRecord.poSummaryUrl)) {
      //     checkForCreateFile = false;
      //   }
      // }
      // const to = [...uniqueManagerIds, 'financejr@lred.com', 'finance@lred.com'];
      const to = [...uniqueManagerIds];
      // let poSummaryUrl = "";
      
      const subject = `PO Request Distribution List`;
      const templete = "accountPOSummary";
      // if (existingRecord) {
      const prefix = "SalesInvoices";
      const suffix = "LRED";
      const folderName = "recap_po_summary";
      const fileName = `${generateFileName(prefix, suffix)}.xlsx`;
      const filepath = await createExcelFile(
        accountWorkSheet,
        folderName,
        fileName
      );
      poSummaryUrlArr.push(filepath);
      // poSummaryUrl = filepath;
      // if (existingRecord) {
      //   existingRecord.poSummaryUrl = filepath;
      //   await existingRecord.save();
      // } else {
      //   await PoSummaryExcelUrl.create({
      //     clientId: clientId,
      //     // segment: Number(query.segment),
      //     // subSegment: Number(query.subSegment),
      //     startDate: String(query.startDate),
      //     endDate: String(query.endDate),
      //     poSummaryUrl: filepath,
      //   });
      // }
      const response = await axios.get(filepath, {
        responseType: "arraybuffer",
      });
      const fileBuffer = response.data;

      const attechment = [
        {
          filename: fileName,
          content: fileBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ];
      const replacement = {
        data: filepath,
      };

      if (query.download !== "true") {
        // await sendMail(to, subject, templete, replacement, attechment);
      }
      // }
      // else {
      // }
    });
    if (query.download === "true") {
      await createHistoryRecord({
        tableName: tableEnum.ACCOUNT_PO,
        moduleName: moduleName.ACCOUNTS,
        userId: user?.id,
        lastlogintime: user?.loginUserData?.logintimeutc,
        custom_message: await customHistoryExportMessage(
          user,
          tableEnum.ACCOUNT_PO,
          `Account PO Summary Data Download!`
        ),
        jsonData: parse(accountPODetails),
        activity: statusEnum.EXPORT,
      });
    } else {
      await createHistoryRecord({
        tableName: tableEnum.ACCOUNT_PO,
        moduleName: moduleName.ACCOUNTS,
        userId: user?.id,
        lastlogintime: user?.loginUserData?.logintimeutc,
        custom_message: await customHistoryExportMessage(
          user,
          tableEnum.ACCOUNT_PO,
          `Account PO Summary Data Mail To Employee Manager!`
        ),
        jsonData: parse(accountPODetails),
        activity: statusEnum.EXPORT,
      });
    }

    return {
      warnings,
      // accountWorkSheetGroup,
      // accountPODetails,
    };
  }

  // async accountPOdataforDashboard(query: any) {
  //   try {
  //     const { clientId, year, dates, month } = query;
  //     const currentYear = year ? year : moment().year().toString();
  //     const currentMonth = month;
  //     const filter: any = {},
  //       data = [];
  //     let clientdata: any = {};
  //     if (clientId) {
  //       filter.clientId = clientId;
  //       clientdata = await Client.findOne({
  //         where: {
  //           id: clientId,
  //           deletedAt: null,
  //         },
  //         attributes: ["id", "loginUserId"],
  //         include: [
  //           {
  //             model: LoginUser,
  //             attributes: ["id", "name"],
  //           },
  //         ],
  //       });
  //     }
  //     if (!dates || dates.length == 0) {
  //       throw new HttpException(400, this.msg.notFound, {}, true);
  //     }
  //     let filteredDates = dates.filter((dateRange) =>
  //       dateRange.split(" - ")[1].includes(currentYear)
  //     );
  //     let limit = currentMonth || filteredDates.length,
  //       start = currentMonth || 0;

  //       console.log('filteredDates', filteredDates);

  //     for (let month = start; month <= limit; month++) {
  //       if (filteredDates[month]) {
  //         const filtreDate = filteredDates[month].split(" - ");
  //         const start =
  //           moment(filtreDate[0], "DD-MM-YYYY").format("YYYY-MM-DD") +
  //           "T00:00:00.000Z";
  //         const end =
  //           moment(filtreDate[1], "DD-MM-YYYY").format("YYYY-MM-DD") +
  //           "T23:59:59.999Z";
  //         let result = await AccountPO.findAll({
  //           where: {
  //             deletedAt: null,
  //             startDate: {
  //               [Op.between]: [start, end],
  //             },
  //             endDate: {
  //               [Op.between]: [start, end],
  //             },
  //           },
  //           include: [
  //             {
  //               model: Timesheet,
  //               attributes: ["id", "clientId", "employeeId", "status"],
  //               where: {
  //                 deletedAt: null,
  //                 ...filter,
  //                 status: "APPROVED",
  //               },
  //               include: [
  //                 {
  //                   model: Client,
  //                   attributes: ["id", "loginUserId"],
  //                   include: [
  //                     {
  //                       model: LoginUser,
  //                       attributes: ["id", "name"],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ],
  //           order: [["createdAt", "desc"]],
  //         });
  //         result = parse(result);
  //         data.push(
  //           await this.monthlyCalculateClientPo(
  //             result,
  //             start,
  //             end,
  //             parse(clientdata)
  //           )
  //         );
  //       }
  //     }
  //     return data;
  //   } catch (error) {
  //     console.log('error', error);
  //     throw new HttpException(400, this.msg.notFound, {}, true);
  //   }
  // }

  async accountPOdataforDashboardNew(query: any) {
    try {
      const { client, dates, startYear, endYear, isClientExists } = query;
      let data = [],
        clientdata: any = {};

      if (client) {
        clientdata = await this.findclientandsubclient(client);
      }

      if (!dates || dates.length == 0) {
        throw new HttpException(400, this.msg.notFound, {}, true);
      }

      const filteredDates = dates.filter((dateRange) => {
        let year = dateRange.split("-"); // Parse the year from the dateRange string
        year = year[year.length - 1];
        return year >= parseInt(startYear) && year <= parseInt(endYear); // Check if the year is between 2023 and 2024
      });

      for (let month = 0; month < 12; month++) {
        if (filteredDates[month]) {
          const filtreDate = filteredDates[month].split(" - ");
          // const start =
          //   moment(filtreDate[0], "DD-MM-YYYY").format("YYYY-MM-DD") +
          //   "T00:00:00.000Z";
          // const end =
          //   moment(filtreDate[1], "DD-MM-YYYY").format("YYYY-MM-DD") +
          //   "T23:59:59.999Z";
          const start = filtreDate[0]
          ? moment.tz(filtreDate[0], 'DD-MM-YYYY', 'Asia/Kolkata').startOf('day').toDate()
          : null;

          const end = filtreDate[1]
          ? moment.tz(filtreDate[1], 'DD-MM-YYYY', 'Asia/Kolkata').endOf('day').toDate()
          : null;
          let result = await AccountPO.findAll({
            where: {
              deletedAt: null,
              startDate: {
                [Op.between]: [start, end],
              },
              endDate: {
                [Op.between]: [start, end],
              },
            },
            include: [
              {
                model: Timesheet,
                attributes: ["id", "clientId", "employeeId", "status"],
                where: {
                  deletedAt: null,
                  clientId: client,
                  status: "APPROVED",
                },
              },
            ],
            order: [["createdAt", "desc"]],
          });
          result = parse(result);
          data.push(
            await this.monthlyCalculateClientPo(
              result,
              start,
              end,
              isClientExists,
              clientdata
            )
          );
        }
      }
      return data;
    } catch (error) {
      throw new HttpException(400, this.msg.notFound, {}, true);
    }
  }

  async monthlyCalculateClientPo(
    data: any,
    start: string,
    end: string,
    isClientExists: boolean,
    clientdata: any
  ) {
    let totalRevenue = 0;
    const result: any = {
      startDate: start,
      endDate: end,
      client: isClientExists ? clientdata : {},
    };
    if (data.length > 0) {
      //Total revenue calculation of all po's for a particular month
      data.forEach((element) => {
        totalRevenue += (element.dailyRate || 0) * (element.timesheetQty || 0);
      });
      const lastElement = data[data.length - 1];
      result.startDate = lastElement.startDate;
      result.endDate = lastElement.endDate;
    }
    result.totalRevenue = parseFloat(String(totalRevenue || 0)).toFixed(2);
    result.currency = "DZD";
    result.month = moment(result.endDate).subtract(1, "days").format("MMM YY");
    return result;
  }

  // this function is made in a compulsion situation need to update client and parent client relation
  async findclientandsubclient(client: number) {
    let clientdata: any = await Client.findOne({
      where: {
        id: client,
        deletedAt: null,
      },
      attributes: ["id", "parentClientId"],
      include: [
        {
          model: LoginUser,
          attributes: ["id", "name"],
        },
      ],
    });
    clientdata = parse(clientdata);
    if (clientdata?.parentClientId) {
      let parentClient = await LoginUser.findOne({
        where: {
          id: clientdata?.parentClientId,
          deletedAt: null,
        },
        attributes: ["id", "name"],
      });
      clientdata.parentClient = parse(parentClient);
    }
    return clientdata;
  }
  async recapPoSummaryDownload(
    clientId: number,
    query: IQueryParameters,
    user: User
  ) {
    const warnings: string[] = [];
    const accountPODetails: any = await this.fetchAccountPODataById(
      clientId,
      query.startDate,
      query.endDate,
      user,
      query.segment,
      query.subSegment
    );
    if (accountPODetails.length === 0) {
      throw new HttpException(
        404,
        "Account PO Data Are Not Found For Date Range or Segment",
        {},
        true
      );
    }
    const accountWorkSheet = [];

    for (const item of accountPODetails) {
      const contectDetail = await Contact.findOne({
        where: {
          id: item?.segmentData?.contactId,
          deletedAt: null,
        },
      });
      if (!contectDetail) {
        warnings.push(
          "Contact info missing in Account PO segment. Please add a contact person."
        );
      }
      accountWorkSheet.push({
        "*Contact Name": contectDetail?.name ?? "",
        "Email Address": item?.timesheet?.employee?.loginUserData?.email ?? "",
        "PO Address Line1": "",
        "PO Address Line2": "",
        "PO Address Line3": "",
        "PO Address Line4": "",
        "PO City": "",
        "PO Region": "",
        "PO Postal Code": "",
        "PO Country": "",
        "SA Address Line1": "",
        "SA Address Line2": "",
        "SA Address Line3": "",
        "SA Address Line4": "",
        "SA City": "",
        "SA Region": "",
        "SA Postal Code": "",
        "SA Country": "",
        "Invoice Number": item?.invoiceNo ?? "",
        "Reference ": "",
        "Invoice Date": moment(item?.createdAt ?? "").format("YYYY-MM-DD"),
        "Due Date": "",
        "Planned Date": "",
        "Total ": "",
        "Tax Total": "",
        "Invoice Amount Paid": "",
        "Invoice Amount Due": "",
        "Inventory Item Code": "",
        "*Description": `Prestation de service assistance Technique sur chantier PO: Segment : ${
          item?.segmentData?.code ?? ""
        } / ${item?.timesheet?.employee?.client?.clientName ?? ""} Periode : ${moment(item?.createdAt ?? "").format(
          "MM/YYYY"
        )}`,
        "*Quantity": "1",
        "*UnitAmount": item?.subTotal ?? "",
        "Discount ": "",
        "Line Amount": "",
        "*AccountCode": "200",
        "*TaxType": `Sales_VAT_${
          item?.timesheet?.employee?.client?.taxAmount > 0
            ? `${item?.timesheet?.employee?.client?.taxAmount}%`
            : "Exempt"
        }`, //  Tax on Sales_VAT taxAmount && taxAmount > 0 ? {taxAmount}%: "Exempt"
        "Tax Amount": `${
          item?.timesheet?.employee?.client?.taxAmount > 0
            ? `${item?.timesheet?.employee?.client?.taxAmount}%`
            : "Exempt"
        }`, // taxAmount && taxAmount > 0 ? {taxAmount}% : "Exempt"
        "*TrackingName1": "Segment",
        "*TrackingOption1": `${item?.segmentData?.code ?? ""} ${
          item?.subSegmentData?.code ?? ""
        } / ${item?.timesheet?.employee?.client?.clientName ?? ""}`,
        "*TrackingName2": "Entity",
        "*TrackingOption2": "EURL LRED",
        // "Currency ": "DZD",
        "Type ": "Sales Invoice",
        "Currency ": item?.currency ?? "",
        // "Type ": item?.type ?? "",
        "Sent ": "",
        "Status ": item?.timesheet?.employee?.employeeStatus ?? "",
        // "Address": item?.timesheet?.employee?.address ?? "",
        // "Position": item?.timesheet?.employee?.fonction ?? "",
        // "Managers": item?.managers ?? "",
        // "Segment": item?.segmentData?.name ?? "",
        // "Sub-Segment": item?.subSegmentData?.name ?? "",
        // "Daily Rate": item?.dailyRate ?? "",
        // "PO Number": item?.poNumber ?? "",
        // "PO Country": item?.timesheet?.employee?.client?.country ?? "",
        // "timesheetQty": item?.timesheetQty ?? "",
        // "Catalogue Number": employeeCatalogueNumber ?? "",
        // "Employee Number": item?.timesheet?.employee?.employeeNumber ?? "",
        // "Contract Number": item?.timesheet?.employee?.contractNumber ?? "",
        // "Phone": item?.timesheet?.employee?.loginUserData?.phone ?? "",
        // "Next Of Kin Mobile": item?.timesheet?.employee?.nextOfKinMobile ?? "",
        // "nSS": item?.timesheet?.employee?.nSS ?? "",
      });
    }

    const prefix = "SalesInvoices";
    const suffix = "LRED";
    const folderName = "recap_po_summary";
    const fileName = `${generateFileName(prefix, suffix)}.xlsx`;
    const filepath = await createExcelFile(
      accountWorkSheet,
      folderName,
      fileName
    );
    await createHistoryRecord({
      tableName: tableEnum.ACCOUNT_PO,
      moduleName: moduleName.ACCOUNTS,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryExportMessage(
        user,
        tableEnum.ACCOUNT_PO,
        `Account PO Summary Data Download!`
      ),
      jsonData: parse(accountPODetails),
      activity: statusEnum.EXPORT,
    });

    return {
      poSummaryUrl: filepath,
      accountWorkSheet,
      accountPODetails,
    };
  }
}
