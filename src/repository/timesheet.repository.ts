/* eslint-disable no-console */
import { FRONTEND_URL, SERVER_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { DefaultRoles } from "@/interfaces/functional/feature.interface";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { medicalRequestStatus } from "@/interfaces/model/medicalRequest.interface";
import { ITimesheetCreate } from "@/interfaces/model/timesheet.interface";
import { TimesheetScheduleAttributes } from "@/interfaces/model/timesheetSchedule.interface";
import AccountPO from "@/models/accountPO.model";
import BonusType from "@/models/bonusType.model";
import Client from "@/models/client.model";
import ClientTimesheetStartDay from "@/models/clientTimesheetStartDay.model";
import Employee from "@/models/employee.model";
import EmployeeBonus from "@/models/employeeBonus.model";
import EmployeeContract from "@/models/employeeContract.model";
import EmployeeRotation from "@/models/employeeRotation.model";
import EmployeeSalary from "@/models/employeeSalary.model";
import EmployeeSegment from "@/models/employeeSegment.model";
import LoginUser from "@/models/loginUser.model";
import MedicalRequest from "@/models/medicalRequest.model";
import MedicalType from "@/models/medicalType.model";
import ReliquatAdjustment from "@/models/reliquatAdjustment.model";
import ReliquatCalculation from "@/models/reliquatCalculation.model";
import ReliquatCalculationV2 from "@/models/reliquatCalculationV2.model";
import ReliquatPayment from "@/models/reliquatPayment.model";
import Role from "@/models/role.model";
import Rotation from "@/models/rotation.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import TimesheetLogs from "@/models/timesheetLogs.model";
import TimesheetSchedule from "@/models/timesheetSchedule.model";
import User from "@/models/user.model";
import {
  accountStatusOptionData,
  folderExistCheck,
  generateFourDigitNumber,
  getSegmentAccessForUser,
  getSubSegmentAccessForUser,
  parse
} from "@/utils/common.util";
import { generateModalData } from "@/utils/generateModal";
import moment from "moment";
import path from "path";
import { Op, Sequelize, Transaction } from "sequelize";
import util from "util";
import AccountRepo from "./account.repository";
import BaseRepository from "./base.repository";
import ReliquatCalculationRepo from "./reliquatCalculation.repository";

export default class TimesheetRepo extends BaseRepository<Timesheet> {
  constructor() {
    super(Timesheet.name);
  }

  private msg = new MessageFormation("Timesheet").message;
  private reliquatCalculationRepo = new ReliquatCalculationRepo();
  // private reliquatCalculationV2Repo = new ReliquatCalculationV2Repo();
  private accountRepo = new AccountRepo();
  private dateFormat = "DD-MM-YYYY";
  async getLatestTimeSheet(clientId: number) {
    const isFound = await Timesheet.findOne({
      where: { clientId: clientId, deletedAt: null, status: "UNAPPROVED" },
      order: [["startDate", "desc"]],
    });
    return isFound;
  }

  async getAllTimesheetService(query: IQueryParameters, user: User) {
    try {
      const {
        page,
        limit,
        clientId,
        activeTab,
        startDate,
        endDate,
        segmentId,
        subSegmentId,
        search,
      } = query;
  
      const condition: any = {};
      const dateRange = {
        startDate: moment(startDate, "DD-MM-YYYY").startOf('day').toDate(),
        endDate: moment(endDate, "DD-MM-YYYY").endOf('day').toDate(),
      };
  
      const dateCondition = {
        [Op.and]: [
          {
            [Op.or]: [
              { startDate: { [Op.between]: [dateRange.startDate, dateRange.endDate] } },
              { startDate: { [Op.eq]: dateRange.startDate } },
            ],
          },
          {
            [Op.or]: [
              { endDate: { [Op.between]: [dateRange.startDate, dateRange.endDate] } },
              { endDate: { [Op.eq]: dateRange.endDate } },
            ],
          },
        ],
      };
     console.log('*******', dateCondition);
      // Handle tab-based filtering
      switch (activeTab) {
        case "all":
          console.log("-------------------",util.inspect({
            employeeId: { [Op.not]: null },
            ...dateCondition
          }, { depth: null, colors: true }));
          Object.assign(condition, {
            employeeId: { [Op.not]: null },
            ...dateCondition,
          });
          break;
  
        case "allSegment":
          const subSegmentIds = getSubSegmentAccessForUser(user);
          const segmentIds = getSegmentAccessForUser(user);
          Object.assign(condition, {
            employeeId: { [Op.not]: null },
            ...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
            ...(subSegmentIds?.length > 0 && {
              [Op.or]: [
                { subSegmentId: { [Op.in]: subSegmentIds } },
                { subSegmentId: null },
              ],
            }),
            ...dateCondition,
          });
          break;
  
        case "employee":
          Object.assign(condition, {
            employeeId: { [Op.not]: null },
            segmentId: null,
            subSegmentId: null,
            [Op.or]: [dateCondition],
          });
          break;
  
        case "segment":
          Object.assign(condition, {
            segmentId: segmentId,
            subSegmentId: null,
            [Op.or]: [dateCondition],
          });
          break;
  
        default:
          Object.assign(condition, {
            subSegmentId: subSegmentId,
            [Op.or]: [dateCondition],
          });
          break;
      }
  
      // Log search filter conditions
      console.log("\n🔍 Filter Conditions:");
      console.log(JSON.stringify(condition, null, 2));
  
      const data = await Timesheet.findAndCountAll({
        include: [
          {
            model: Segment,
            attributes: ["name", "id"],
            paranoid: false,
          },
          {
            model: SubSegment,
            attributes: ["name", "id"],
            include: [{ model: Segment, attributes: ["name", "id"] }],
            paranoid: false,
          },
          {
            model: User,
            as: "approvedByUser",
            attributes: ["id"],
            include: [{ model: LoginUser, attributes: ["id", "name", "email"] }],
            paranoid: false,
          },
          {
            model: Employee,
            attributes: ["id", "loginUserId", "contractEndDate", "contractNumber", "deletedAt"],
            required: true,
            paranoid: false,
            include: [
              {
                model: LoginUser,
                attributes: ["firstName", "lastName"],
                paranoid: false,
                where: {
                  ...(user.roleData.isViewAll &&
                    user.roleData.name === DefaultRoles.Employee && {
                      id: user.loginUserId,
                    }),
                  ...(search && {
                    [Op.or]: [
                      Sequelize.where(
                        Sequelize.fn("concat", Sequelize.col("firstName"), " ", Sequelize.col("lastName")),
                        { [Op.iLike]: `%${search}%` }
                      ),
                      Sequelize.where(
                        Sequelize.fn("concat", Sequelize.col("lastName"), " ", Sequelize.col("firstName")),
                        { [Op.iLike]: `%${search}%` }
                      ),
                    ],
                  }),
                },
              },
              {
                model: EmployeeContract,
                separate: true,
                attributes: ["endDate"],
              },
            ],
          },
        ],
        where: { clientId, ...condition },
        offset: page && limit ? (page - 1) * limit : undefined,
        limit: limit ?? undefined,
        order: [
          ["updatedAt", "desc"],
          ["segment", "name", "asc"],
          ["employee", "loginUserData", "lastName", "asc"],
        ],
        logging: (sql) => {
          console.log("\n🧾 Generated SQL Query:\n", sql);
        },
      });
  
      console.log("\n📦 Timesheet Fetch Result:");
      console.log(`Count: ${data.count}`);
      console.log(`Current Page: ${page}, Limit: ${limit}`);
  
      const parsed = parse(data);
  
      const responseObj = {
        data: parsed?.rows,
        count: parsed?.count,
        currentPage: page ?? undefined,
        limit: limit ?? undefined,
        lastPage: page && limit ? Math.ceil(parsed?.count / +limit) : undefined,
      };
  
      // Log the final response shape
      console.log("\n📤 Final Response Object:");
      console.log(JSON.stringify(responseObj, null, 2));
  
      return responseObj;
    } catch (error) {
      console.error("\n❌ Error in getAllTimesheetService:");
      console.error(error);
    }
  }
  

  async getTimesheetByIdService(id: number, transaction: Transaction = null) {
    const isFound = await Timesheet.findOne({
      where: { id: id, deletedAt: null },
      attributes: [
        "id",
        "segmentId",
        "subSegmentId",
        "employeeId",
        "startDate",
        "endDate",
        "clientId",
      ],
      include: [
        {
          model: Employee,
          attributes: ["id"],
          include: [
            {
              model: LoginUser,
              attributes: ["firstName", "lastName"],
            },
          ],
        },
        {
          model: TimesheetLogs,
          separate: true,
          required: false,
          where: {
            timesheetId: id,
          },
          include: [
            {
              model: User,
              as: "actionByUser",
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["firstName", "lastName", "name"],
                },
              ],
            },
          ],
        },
        {
          model: Client,
          attributes: ["id", "isShowPrices"],
          include: [
            {
              model: LoginUser,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Segment,
          attributes: ["id", "name"],
        },
        {
          model: SubSegment,
          attributes: ["id", "name"],
        },
      ],
      transaction,
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);

    return data;
  }

  async addTimesheetService(
    { body, user = null }: { body: ITimesheetCreate; user: User },
    transaction: Transaction
  ) {
    let data = await Timesheet.findOrCreate({
      where: {
        startDate: body.startDate,
        endDate: body.endDate,
        segmentId: body.segmentId,
        subSegmentId: body.subSegmentId,
        employeeId: body.employeeId,
        clientId: body.clientId,
        // dbKey: body.dbKey,
        deletedAt: null,
      },
      defaults: { ...body, createdBy: user?.id || null },
      transaction,
    });
    data = parse(data);
    // await createHistoryRecord(
    //   {
    //     tableName: tableEnum.TIMESHEET,
    //     userId: user?.id,
    //     lastlogintime: user?.loginUserData?.logintimeutc,
    //     jsonData: parse(data),
    //     activity: statusEnum.CREATE,
    //   },
    //   transaction
    // );

    return data;
  }

  async updateTimesheetService({
    body,
    user,
    id,
    transaction,
  }: {
    body: ITimesheetCreate;
    user: User;
    id: number;
    transaction: Transaction;
  }) {
    try {
      const isExist = await Timesheet.findOne({
        where: { id: id, deletedAt: null },
        transaction,
      });
      if (!isExist) {
        throw new HttpException(200, this.msg.notFound, {}, true);
      }
      await Timesheet.update(
        { ...body, updatedBy: user?.id || null, updatedAt: new Date() },
        { where: { id: id }, transaction }
      );
      const data = await this.getTimesheetByIdService(id, transaction);
      // await createHistoryRecord(
      //   {
      //     tableName: tableEnum.TIMESHEET,
      //     userId: user?.id,
      //     jsonData: parse(data),
      //     activity: statusEnum.UPDATE,
      //   },
      //   transaction
      // );

      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteTimesheetService({ id }: { id: number }) {
    const isFound = await Timesheet.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = await Timesheet.destroy({ where: { id: id } });
    return data;
  }

  async deleteTimesheetSummaryService(
    deleteData,
    transaction: Transaction = null
  ) {
    const data = await Timesheet.destroy({
      where: { ...deleteData },
      transaction,
    });
    return data;
  }

  async sendPdf(data, emails, pdfName, title, attribute, stampLogo) {
    const resizeHeaderFooter = true;
    const itemData = data?.timesheetData?.timesheetLogsData?.map(
      (item, index) => {
        return `Version ${index + 1} ${item?.status} by ${
          item?.actionByUser?.loginUserData?.firstName &&
          item?.actionByUser?.loginUserData?.lastName
            ? item?.actionByUser?.loginUserData?.firstName +
              +item?.actionByUser?.loginUserData?.lastName
            : item?.actionByUser?.loginUserData?.firstName
            ? item?.actionByUser?.loginUserData?.firstName
            : item?.actionByUser?.loginUserData?.name
        } on ${moment(item?.actionDate).format("LL")} at ${moment(
          item?.actionDate
        ).format("LT")}`;
      }
    );

    data.allMonthData.forEach((dataItem, index) => {
      const dayNumber = moment(dataItem?.rawDate).day();
      const isWeekend =
        ((data?.employeeData?.client.country === "Algeria" ||
          data?.employeeData?.client.country === "Libya") &&
          (dayNumber === 5 || dayNumber === 6)) ||
        data?.employeeData?.client?.weekendDays?.includes(dayNumber);
      data.allMonthData[index].weekendDays = isWeekend || false;
    });

    const footerContent = itemData
      .join(",")
      .replaceAll("UNAPPROVED", "unapproved")
      .replaceAll("APPROVED", "approved");
    const footer = "Page 1 of 1";
    const isTimesheetPdf = true;
    // await pdf(data, pdfName, title, attribute, resizeHeaderFooter, stampLogo, footerContent, footer, isTimesheetPdf);
    const replacement = {
      mailHeader: "Timesheet approval details",
      firstName: data.employeeData.loginUserData.firstName,
      lastName: data.employeeData.loginUserData.lastName,
      employeeNumber: data.employeeData.employeeNumber,
      email: data.employeeData.loginUserData.email,
      tableHeader: data.status,
      tableData: data.statusCounts,
      timesheetPeriod:
        data.timesheetData.startDate + "-" + data.timesheetData.endDate,
      logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
      message:
        "Your timesheet has been successfully approved. We have attached the file containing the detailed timesheet information for your reference.",
    };
    if (data.employeeData.loginUserData.email) {
      emails.push(data.employeeData.loginUserData.email);
    }
    if (!emails.includes("admin@lred.com")) {
      emails.push("admin@lred.com");
    }
    const publicFolder = path.join(__dirname, "../../secure-file/");
    folderExistCheck(publicFolder);
    const pdfPath = path.join(publicFolder, `timesheetPdf/${pdfName}`);
    const mailData = {
      replacement,
      pdfData: {
        data,
        pdfName,
        title,
        attribute,
        resizeHeaderFooter,
        stampLogo,
        footerContent,
        footer,
        isTimesheetPdf,
      },
      emails,
      pdfPath,
    };
    // if (emails && emails.length > 0) {
    // await sendMail(emails, 'Timesheet Approval Details', 'generalMailTemplateTable', replacement, [
    // 	{ path: pdfPath },
    // ]);
    // } else {
    // fileDelete(pdfPath);
    // }
    return mailData;
  }

  generateConditionForDropdown(activeDate, isActiveDate) {
    if (isActiveDate) {
      if (activeDate) {
        return moment(activeDate, "DD-MM-YYYY").toDate();
      } else {
        return moment(moment().endOf("day")).toDate();
      }
    } else {
      return null;
    }
  }

  async getTimesheetDropdownDetails(
    clientId,
    user: User,
    activeDate = null,
    isActiveDate = false
  ) {
    const condition = this.generateConditionForDropdown(
      activeDate,
      isActiveDate
    );
    const output = {
      dates: [],
      segment: [],
      subSegment: [],
      deletedSection: [],
      isEnded: false,
    };
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const segmentIds = getSegmentAccessForUser(user);
    let timesheetData;
    // let timesheetData = await Timesheet.findAll({
    // 	attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('startDate')), 'startDate'], 'endDate'],
    // 	where: { clientId },
    // 	order: [['startDate', 'Asc']],
    // });

    // timesheetData = parse(timesheetData);

    // timesheetData.forEach((timesheet) => {
    // 	const { startDate, endDate } = timesheet;
    // 	const current = moment(startDate);
    // 	const lastDate = moment(endDate);
    // 	if (!dates.includes(current.format('DD-MM-YYYY'))) {
    // 		dates.push(current.format('DD-MM-YYYY'));
    // 		output.dates.push(`${current.format('DD-MM-YYYY')} - ${lastDate.format('DD-MM-YYYY')}`);
    // 	}
    // });

    timesheetData = await Timesheet.findAll({
      raw: true,
      subQuery: false,
      attributes: [
        [
          Sequelize.fn(
            "DISTINCT",
            Sequelize.literal('concat("segment"."id", "subSegment"."id")')
          ),
          "segmentUniqueId",
        ],
      ],
      include: [
        {
          model: Segment,
          ...(isActiveDate ? { required: true } : {}),
          attributes: ["name", "id", "deletedAt"],
          as: "segment",
          where: {
            ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
          },
          paranoid: false,
        },
        {
          model: SubSegment,
          ...(isActiveDate ? { required: true } : {}),
          required: false,
          attributes: ["name", "id", "segmentId", "deletedAt"],
          as: "subSegment",
          where: {
            ...(subSegmentIds?.length > 0 && {
              id: { [Op.in]: subSegmentIds },
            }),
          },
          paranoid: false,
        },
      ],
      where: {
        clientId,
        ...(condition
          ? {
              startDate: { [Op.lte]: condition },
              endDate: { [Op.gte]: condition },
            }
          : {}),
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
    });
    timesheetData = parse(timesheetData);

    timesheetData.forEach((timesheet) => {
      const segment = {
        name: timesheet["segment.name"],
        id: timesheet["segment.id"],
        deletedAt: timesheet["segment.deletedAt"],
      };
      const subSegment = {
        name: timesheet["subSegment.name"],
        id: timesheet["subSegment.id"],
        segmentId: timesheet["subSegment.segmentId"],
        segmentName: timesheet["segment.name"],
        deletedAt: timesheet["subSegment.deletedAt"],
      };
      if (
        segment &&
        output.segment.findIndex((dat) => dat?.id == segment?.id) == -1
      ) {
        if (!segment?.deletedAt) {
          if (!subSegment?.id) {
            output.segment.push(segment);
          }
        } else {
          if (
            output.deletedSection.findIndex((dat) => dat?.id == segment?.id) ==
            -1
          ) {
            output.deletedSection.push({ ...segment, type: "segment" });
          }
        }
      }
      if (
        subSegment &&
        output.subSegment.findIndex((dat) => dat?.id == subSegment?.id) == -1
      ) {
        if (!subSegment?.deletedAt) {
          output.subSegment.push(subSegment);
        } else {
          if (
            output.deletedSection.findIndex(
              (dat) =>
                dat?.id == subSegment?.id &&
                dat?.segmentId == subSegment?.segmentId
            ) == -1
          ) {
            output.deletedSection.push({ ...subSegment, type: "subsegment" });
          }
        }
      }
    });
    let clientData = await Client.findOne({
      where: { id: clientId },
      include: [
        {
          model: ClientTimesheetStartDay,
          attributes: ["id", "timesheetStartDay"],
        },
      ],
      attributes: [
        "id",
        "autoUpdateEndDate",
        "startDate",
        "endDate",
        "timeSheetStartDay",
      ],
    });
    clientData = parse(clientData);
    let clientStartDate = moment(clientData?.startDate);
    clientStartDate = moment([
      clientStartDate.year(),
      clientStartDate.month(),
      clientData.clientTimesheetStartDay[0].timesheetStartDay,
    ]);
    const clientEndDate = moment(clientData?.endDate);
    let currentDate = moment(clientStartDate);
    while (moment(currentDate).isBefore(clientEndDate)) {
      output.dates.push(
        `${currentDate.format("DD-MM-YYYY")} - ${moment(currentDate)
          .add(1, "month")
          .subtract(1, "day")
          .format("DD-MM-YYYY")}`
      );
      currentDate = moment(currentDate).add(1, "month");
    }
    if (
      clientData.autoUpdateEndDate == 0 &&
      moment().isAfter(clientData.endDate)
    ) {
      output.isEnded = true;
    }
    return output;
  }

  async approveTimesheet(
    body: {
      timesheetId: number;
      newStatus: string;
      timesheetLogsData: any;
      user: User;
    },
    transaction: Transaction = null
  ) {
    try {
      const isExist = await Timesheet.findOne({
        where: { id: body.timesheetId, deletedAt: null },
        include: [{ model: Client, attributes: ["id", "approvalEmail"] }],
        transaction,
      });

      if (!isExist) {
        throw new HttpException(200, this.msg.notFound, {}, true);
      }
      let mailData = null;
      await generateModalData({
        user: body?.user,
        percentage: 25,
        message:
          body.newStatus === "APPROVED"
            ? "Approving Timesheet"
            : "Unapproving Timesheet",
      });
      await Timesheet.update(
        {
          status: body?.newStatus,
          approvedAt: new Date(),
          approvedBy: body?.user?.id || null,
          updatedBy: body?.user?.id || null,
        },
        { where: { id: body.timesheetId }, transaction, logging: console.log }
      );

      let timesheetData = await this.getTimesheetByIdService(
        body.timesheetId,
        transaction
      );

      timesheetData = parse(timesheetData);

      const pdfName = `${moment().unix()}${generateFourDigitNumber()}-timesheet.pdf`;
      if (body.newStatus === "APPROVED") {
        console.log("body.newStatus", body.newStatus);

        const data = await this.findTimesheetSummaryById(
          body.timesheetId,
          transaction
        );
        if (data) {
          let startDate = moment(timesheetData.startDate).toDate();
          let endDate = moment(timesheetData.endDate).toDate();
          let employeeSegmentWiseData = await EmployeeSegment.findAll({
            where: {
              employeeId: timesheetData.employee.id,
              deletedAt: null,
              date: {
                [Op.or]: {
                  [Op.between]: [startDate, endDate],
                  // [Op.eq]: startDate,
                  // [Op.eq]: endDate,
                },
              },
            },
            transaction,
            attributes: ["id", "date", "segmentId", "subSegmentId"],
          });
          employeeSegmentWiseData = parse(employeeSegmentWiseData);
          await generateModalData({
            user: body?.user,
            percentage: 50,
            message: "Generating Account PO's",
          });

          if (employeeSegmentWiseData?.length > 0) {
            for (const employeeSegment of employeeSegmentWiseData) {
              if (
                employeeSegment.segmentId !== isExist.segmentId &&
                employeeSegment.subSegmentId !== isExist.subSegmentId
              ) {
                endDate = moment(employeeSegment.date).toDate();
                await this.generateAccountPO(
                  {
                    timesheetId: body.timesheetId,
                    startDate: startDate,
                    endDate: endDate,
                    segmentId: employeeSegment.segmentId,
                    subSegmentId: employeeSegment.subSegmentId,
                    user: body?.user,
                  },
                  transaction
                );
                startDate = moment(employeeSegment.date)
                  .add(1, "days")
                  .toDate();
              }
            }
            endDate = moment(timesheetData.endDate).toDate();
          }
          await this.generateAccountPO(
            {
              timesheetId: body.timesheetId,
              startDate: startDate,
              endDate: endDate,
              segmentId: isExist.segmentId,
              subSegmentId: isExist.subSegmentId,
              user: body?.user,
            },
            transaction
          );

          data.timesheetData.timesheetLogsData = [
            ...data.timesheetData.timesheetLogsData,
          ];
          const stampLogo = data?.employeeData?.client?.stampLogo
            ? SERVER_URL + data?.employeeData?.client?.stampLogo
            : null;
          mailData = await this.sendPdf(
            data,
            [],
            `${pdfName}`,
            "timesheetPdf",
            true,
            stampLogo
          );
        }
      }

      if (body.newStatus === "UNAPPROVED") {
        await generateModalData({
          user: body?.user as User,
          percentage: 75,
          message: "Updating Accounts",
        });
        await TimesheetSchedule.update(
          {
            isLeaveForTitreDeConge: false,
          },
          {
            where: {
              employeeId: isExist?.employeeId,
              date: {
                [Op.or]: {
                  [Op.between]: [
                    moment(
                      moment(isExist.startDate).format("DD-MM-YYYY"),
                      "DD-MM-YYYY"
                    ).toDate(),
                    moment(
                      moment(isExist.endDate).format("DD-MM-YYYY"),
                      "DD-MM-YYYY"
                    ).toDate(),
                  ],
                  [Op.eq]: moment(
                    moment(isExist.endDate).format("DD-MM-YYYY"),
                    "DD-MM-YYYY"
                  ).toDate(),
                },
              },
              isLeaveForTitreDeConge: true,
            },
            transaction,
          }
        );
        await AccountPO.destroy({
          where: {
            timesheetId: body?.timesheetId,
          },
          force: true,
          transaction,
        });

        if (timesheetData?.employee?.id) {
          await this.accountRepo.generateAccountRelatedData(
            {
              employeeId: timesheetData?.employee?.id,
              timesheetId: body?.timesheetId,
              userId: body?.user?.id,
              type: "unApproveTimesheetAccount",
            },
            transaction
          );
        }
      }

      return { timesheetData, mailData };
    } catch (error) {
      console.log("error------>", error);
      throw error;
    }
  }

  async generateAccountData(
    user,
    employeeId = [],
    type: string,
    clientId = null,
    transaction: Transaction = null
  ) {
    try {
      const timesheetData = await this.getTimesheetDataForReliquet(
        clientId,
        employeeId,
        [],
        transaction
      );
      const promises = [];
      for (const tempTimeSheetData of timesheetData) {
        const promise = new Promise(async (resolve) => {
          if (tempTimeSheetData?.status === "UNAPPROVED") {
            await this.accountRepo.generateAccountRelatedData(
              {
                employeeId: String(tempTimeSheetData.employeeId),
                timesheetId: tempTimeSheetData.id,
                userId: user?.id || null,
                type: type,
              },
              transaction
            );
          }
          resolve(true);
        });
        promises.push(promise);
        await promise;
      }
      await Promise.all(promises);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getReliquatAdjustmentDate(
    clientId: number,
    type: string,
    employeeId: number
  ) {
    let respo = await Timesheet.findOne({
      where: {
        clientId: clientId,
        employeeId: employeeId,
        deletedAt: null,
        status: "APPROVED",
      },
      // attributes: [
      // 	[Sequelize.fn('min', Sequelize.col('startDate')), 'startDate'],
      // 	[Sequelize.fn('max', Sequelize.col('endDate')), 'endDate'],
      // ],
      attributes: ["startDate", "endDate"],
      order: [["startDate", "desc"]],
    });
    respo = parse(respo);
    let isExistClient = await Client.findOne({
      where: { id: clientId, deletedAt: null },
    });
    isExistClient = parse(isExistClient);
    let result = [];
    if (isExistClient && respo?.startDate && respo?.endDate) {
      const startDate = moment(respo.startDate);
      const endDate = moment(respo.endDate);
      if (type === "adjustment") {
        while (startDate.isSameOrBefore(endDate)) {
          const startDateOfTimesheet = await Timesheet.findAll({
            where: {
              clientId: clientId,
              employeeId: employeeId,
              deletedAt: null,
              endDate: {
                [Op.gt]: endDate,
              },
              // status: 'UNAPPROVED',
            },
            order: [["startDate", "asc"]],
          }).then((data) => parse(data));
          startDateOfTimesheet &&
            startDateOfTimesheet.forEach((ele) => {
              ele.startDate &&
                result.push(moment(ele?.startDate).format("YYYY-MM-DD"));
              startDate.add(1, "month");
            });
        }
      } else if (type === "payment") {
        result = [];
        while (startDate.isSameOrBefore(endDate)) {
          const startOfTimesheet = await Timesheet.findAll({
            where: {
              clientId: clientId,
              employeeId: employeeId,
              deletedAt: null,
              endDate: {
                [Op.gt]: endDate,
              },
              // status: 'UNAPPROVED',
            },
            order: [["startDate", "asc"]],
          }).then((data) => parse(data));
          startOfTimesheet.forEach((ele) => {
            const currentDate =
              ele?.startDate && moment(ele?.startDate).startOf("day");
            const endDateOfMonth =
              ele?.endDate && moment(ele?.endDate).endOf("month");
            while (
              currentDate &&
              endDateOfMonth &&
              currentDate.isSameOrBefore(endDateOfMonth, "day")
            ) {
              const formattedDate = currentDate.format("YYYY-MM-DD");
              if (!result.includes(formattedDate)) {
                result.push(formattedDate);
              }
              currentDate.add(1, "day");
            }
            startDate.add(1, "day");
          });
        }
      }
    } else {
      if (type === "adjustment") {
        const startDateOfTimesheet = await Timesheet.findAll({
          where: {
            clientId: clientId,
            employeeId: employeeId,
            deletedAt: null,
            // status: 'UNAPPROVED',
          },
          order: [["startDate", "asc"]],
        }).then((data) => parse(data));
        startDateOfTimesheet &&
          startDateOfTimesheet.forEach((ele) => {
            ele.startDate &&
              result.push(moment(ele?.startDate).format("YYYY-MM-DD"));
          });
      } else if (type === "payment") {
        const startOfTimesheet = await Timesheet.findAll({
          where: {
            clientId: clientId,
            employeeId: employeeId,
            deletedAt: null,
            // status: 'UNAPPROVED',
          },
          order: [["startDate", "asc"]],
        }).then((data) => parse(data));
        startOfTimesheet.forEach((ele) => {
          const currentDate =
            ele?.startDate && moment(ele?.startDate).startOf("day");
          const endDateOfMonth =
            ele?.endDate && moment(ele?.endDate).endOf("month");
          while (
            currentDate &&
            endDateOfMonth &&
            currentDate.isSameOrBefore(endDateOfMonth, "day")
          ) {
            const formattedDate = currentDate.format("YYYY-MM-DD");
            if (!result.includes(formattedDate)) {
              result.push(formattedDate);
            }
            currentDate.add(1, "day");
          }
        });
      }
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.TIMESHEET,
    //   moduleName: moduleName.TIMESHEETS,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.TIMESHEET, `Reliquat Adjustment Date!`),
    //   jsonData: parse(result),
    //   activity: statusEnum.VIEW,
    // });
    return result;
  }

  async getTimesheetDataForReliquet(
    clientId = null,
    employeeId = [],
    timesheetScheduleIds = [],
    transaction: Transaction = null
  ) {
    try {
      let timesheetScheduleData = [];
      const condition =
        employeeId?.length > 0
          ? { employeeId: { [Op.in]: employeeId } }
          : { clientId };
      let resp = null;
      if (timesheetScheduleIds?.length > 0) {
        let timesheetFound = null;
        let starterDate = null;
        let endDate = null;
        timesheetScheduleData = await TimesheetSchedule.findAll({
          where: { id: { [Op.in]: timesheetScheduleIds } },
          transaction,
        });
        timesheetScheduleData = parse(timesheetScheduleData);

        timesheetFound = await Timesheet.findOne({
          paranoid: false,
          transaction,
          attributes: ["startDate", "endDate"],
          where: {
            startDate: { [Op.lte]: timesheetScheduleData[0].date },
            endDate: { [Op.gte]: timesheetScheduleData[0].date },
            employeeId: { [Op.in]: employeeId },
          },
        });
        timesheetFound = parse(timesheetFound);
        starterDate = timesheetFound.startDate;
        endDate = timesheetFound.endDate;

        const reliquatCalculationLastRecord = await ReliquatCalculation.findOne(
          {
            where: {
              ...condition,
              deletedAt: null,
            },
            order: [["startDate", "desc"]],
            transaction,
          }
        ).then((dat) => parse(dat));
        if (
          reliquatCalculationLastRecord &&
          moment(starterDate).isSameOrBefore(
            reliquatCalculationLastRecord.startDate
          )
        ) {
          resp = await Timesheet.findAll({
            paranoid: false,
            where: {
              deletedAt: null,
              endDate: { [Op.gte]: moment(starterDate).toDate() },
              startDate: {
                [Op.lte]: moment(
                  reliquatCalculationLastRecord.startDate
                ).toDate(),
              },
              ...condition,
            },
            order: [["startDate", "asc"]],
            transaction,
          });
        } else if (reliquatCalculationLastRecord) {
          resp = await Timesheet.findAll({
            paranoid: false,
            where: {
              deletedAt: null,
              endDate: { [Op.lte]: moment(endDate).toDate() },
              startDate: {
                [Op.gte]: moment(
                  reliquatCalculationLastRecord.startDate
                ).toDate(),
              },
              ...condition,
            },
            order: [["startDate", "asc"]],
            transaction,
          });
        } else {
          resp = [];
        }
        resp = parse(resp);
      } else {
        const lastDayOfNextMonth = moment().add(2, "month").endOf("month");
        resp = await Timesheet.findAll({
          paranoid: false,
          where: {
            deletedAt: null,
            ...condition,
            endDate: {
              [Op.lte]: lastDayOfNextMonth.toDate(),
            },
          },
          order: [
            ["startDate", "asc"],
            ["approvedAt", "asc"],
          ],
          transaction,
        });
        resp = parse(resp);
        resp = resp.reduce((acc, timesheet) => {
          const indexData = acc.find(
            (e) => e.startDate === timesheet.startDate
          );
          if (indexData === -1 || indexData === undefined) {
            acc.push(timesheet);
          }
          return acc;
        }, []);
      }
      return resp;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTimesheetDataForAccount(
    user,
    employeeId = [],
    date,
    transaction: Transaction = null
  ) {
    let resp = await Timesheet.findAll({
      paranoid: false,
      where: {
        deletedAt: null,
        startDate: { [Op.lte]: moment(date).toDate() },
        endDate: { [Op.gte]: moment(date).toDate() },
        employeeId: { [Op.in]: employeeId },
      },
      order: [["id", "ASC"]],
      transaction,
    });
    resp = parse(resp);

    for (const timesheetData of resp) {
      await this.accountRepo.generateAccountRelatedData(
        {
          employeeId: String(timesheetData?.employeeId),
          timesheetId: timesheetData?.id,
          userId: user.id,
          type: "updateAccount",
        },
        transaction
      );
    }

    return resp;
  }

  async generateReliquetResponse(
    user,
    employeeId = [],
    transaction: Transaction = null,
    clientId = null,
    timesheetScheduleIds = []
  ) {
    try {
      const timesheetData = await this.getTimesheetDataForReliquet(
        clientId,
        employeeId,
        timesheetScheduleIds,
        transaction
      );
      console.log("reliquat creation on update status------------------------()(()()()", timesheetData )
      const promises = [];
      if (timesheetData && timesheetData?.length > 0) {
        for (const tempTimeSheetData of timesheetData) {
          const promise = new Promise(async (resolve, reject) => {
            try {
              await this.reliquatCalculationRepo.addReliquatCalculationService(
                {
                  employeeId: String(tempTimeSheetData?.employeeId),
                  timesheetId: tempTimeSheetData?.id,
                  userId: user?.id || null,
                },
                transaction
              );
              resolve(true);
            } catch (error) {
              reject(error);
            }
          });
          promises.push(promise);
          await promise;
        }
        await Promise.all(promises);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllTimesheetByClientId(clientId: number) {
    const data = await Timesheet.findAll({
      where: { deletedAt: null, clientId: clientId },
      attributes: ["id", "startDate", "endDate"],
      order: [["startDate", "asc"]],
    });
  }

  async getAllTimesheet(data1) {
    const data = await Timesheet.findAll(data1);
    return parse(data);
  }

  async getAllTimesheetByEmployeeId(
    employeeId: number,
    transaction: Transaction = null
  ) {
    try {
      const data = await Timesheet.findAll({
        where: { deletedAt: null, employeeId: employeeId },
        attributes: ["id", "startDate", "endDate", "segmentId", "subSegmentId"],
        order: [["startDate", "asc"]],
        transaction,
      });
      return parse(data);
    } catch (error) {
      throw new Error(error);
    }
  }

  async clearEmployeeTimesheetByEmployeeId(
    employeeId: number | string,
    transaction: Transaction = null
  ) {
    await Timesheet.destroy({ where: { employeeId }, transaction });
    await TimesheetSchedule.destroy({ where: { employeeId }, transaction });
    await ReliquatCalculation.destroy({ where: { employeeId }, transaction });
    await ReliquatCalculationV2.destroy({ where: { employeeId }, transaction });
  }

  async getTimesheetDataUsingDate(
    employeeId: number,
    date: string | Date,
    transaction: Transaction
  ) {
    const timesheetData = await this.getAll({
      where: { employeeId: employeeId },
      transaction,
    });
    return timesheetData?.find(
      (value) =>
        moment(date) >= moment(moment(value.startDate).format("YYYY-MM-DD")) &&
        moment(date) <= moment(moment(value.endDate).format("YYYY-MM-DD"))
    );
  }

  async getStatus({
    overtimeHours,
    initialStatus,
    bonusCode,
  }: {
    overtimeHours: number | null;
    initialStatus: string | null;
    bonusCode: string | null;
  }) {
    if (overtimeHours !== null && bonusCode !== null) {
      return `P,${overtimeHours}HOB`;
    }
    if (overtimeHours !== null && bonusCode === null) {
      return `${overtimeHours}H`;
    }
    if (initialStatus == "" && bonusCode == null) {
      return "-";
    }
    if (initialStatus == "" && bonusCode != null) {
      return bonusCode;
    }
    if (initialStatus != "" && bonusCode == null) {
      return initialStatus;
    }
    if (initialStatus != "" && bonusCode != null) {
      return `${initialStatus},${bonusCode}`;
    }
    if (bonusCode != null) {
      return bonusCode;
    }
  }

  async findTimesheetSummaryById(id: number, transaction: Transaction = null) {
    try {
      const allMonthData = [];
      let timesheetData = await this.getTimesheetByIdService(id, transaction);
      timesheetData = parse(timesheetData);
      if (timesheetData) {
        const momentStartDate = moment(timesheetData.startDate);
        const momentEndDate = moment(timesheetData.endDate);
        const segmentStartDate = moment(timesheetData.startDate)
          .add(1, "month")
          .toDate();
        const segmentEndDate = moment(timesheetData.endDate)
          .add(1, "month")
          .toDate();
        const startDate = moment(timesheetData.startDate).format(
          "Do MMMM YYYY"
        );
        const endDate = moment(timesheetData.endDate).format("Do MMMM YYYY");
        let employeeData: any = await Employee.findAll({
          where: {
            clientId: timesheetData.clientId,
            id: timesheetData?.employeeId,
          },
          transaction,
          attributes: [
            "id",
            "medicalCheckDate",
            "medicalCheckExpiry",
            "fonction",
            "employeeNumber",
            "dailyCost",
            "customBonus",
            "terminationDate",
          ],
          include: [
            {
              model: TimesheetSchedule,
              attributes: [
                "employeeId",
                "status",
                "isLeaveForTitreDeConge",
                "date",
                "bonusCode",
                "overtimeHours",
              ],
              where: {
                date: {
                  [Op.between]: [momentStartDate, momentEndDate],
                },
              },
              required: true,
            },
            {
              model: EmployeeRotation,
              separate: true,
              attributes: ["rotationId"],
              order: [["date", "desc"]],
              where: {
                date: {
                  [Op.or]: {
                    [Op.lte]: momentStartDate,
                    [Op.between]: [momentStartDate, momentEndDate],
                  },
                },
              },
              include: [
                {
                  model: Rotation,
                  attributes: ["isResident", "name", "weekOn", "weekOff"],
                },
              ],
            },
            {
              model: ReliquatCalculation,
              attributes: ["reliquat", "presentDay", "leave", "overtime"],
              where: {
                timesheetId: id,
              },
              required: false,
            },
            {
              model: LoginUser,
              attributes: ["firstName", "lastName", "email"],
            },
            {
              model: Client,
              attributes: [
                "isShowPrices",
                "weekendDays",
                "country",
                "stampLogo",
                "isCountCR",
                "approvalEmail",
              ],
              include: [
                {
                  model: LoginUser,
                  attributes: ["name"],
                },
              ],
            },
            { model: Rotation, attributes: ["id", "name"] },
            {
              model: ReliquatPayment,
              where: {
                startDate: {
                  [Op.gte]: momentStartDate.toDate(),
                  [Op.lte]: momentEndDate.toDate(),
                },
              },
              required: false,
              attributes: ["id", "amount"],
            },
            {
              model: ReliquatAdjustment,
              where: {
                startDate: momentStartDate.toDate(),
              },
              required: false,
              attributes: ["id", "adjustment"],
            },
            {
              model: EmployeeSegment,
              where: {
                date: {
                  [Op.gte]: segmentStartDate,
                  [Op.lte]: segmentEndDate,
                },
              },
              required: false,
              attributes: ["id", "rollover", "date"],
            },
          ],
          order: [
            ["timeSheetSchedule", "date", "DESC"],
            ["employeeSegment", "date", "desc"],
          ],
        });
        employeeData = parse(employeeData);

        const hourlyBonusTypeArr = [
          "P,DAILY",
          "P,NIGHT",
          "P,HOLIDAY",
          "CHB,DAILY",
          "CHB,NIGHT",
          "CHB,WEEKEND",
          "CHB,HOLIDAY",
        ];
        if (employeeData?.length > 0) {
          let isCallOutRotation = true;

          if (
            employeeData &&
            employeeData[0]?.employeeRotation &&
            employeeData &&
            employeeData[0]?.employeeRotation?.length > 0 &&
            employeeData &&
            employeeData[0]?.employeeRotation[0]?.rotation?.name &&
            employeeData &&
            employeeData[0]?.employeeRotation[0]?.rotation?.name !== "Call Out"
          ) {
            isCallOutRotation = false;
          } else {
            isCallOutRotation = true;
          }

          for (
            let m = moment(momentStartDate);
            m.isSameOrBefore(momentEndDate);
            m.add(1, "days")
          ) {
            const index = employeeData[0]?.timeSheetSchedule
              ?.map((dat) => moment(dat.date).toDate())
              ?.findIndex((dat) => m.isSame(dat));
            if (index >= 0) {
              const bonusCode =
                employeeData[0]?.timeSheetSchedule[index]?.bonusCode;
              const initialStatus =
                employeeData[0]?.timeSheetSchedule[index]?.status;
              const overtimeHours =
                employeeData[0]?.timeSheetSchedule[index]?.overtimeHours ??
                null;
              const isLeaveForTitreDeConge =
                employeeData[0]?.timeSheetSchedule[index]
                  ?.isLeaveForTitreDeConge ?? null;
              let status = "";
              status = await this.getStatus({
                overtimeHours,
                initialStatus,
                bonusCode,
              });
              // if (bonusCode && hourlyBonusTypeArr?.includes(`${initialStatus}${bonusCode ? ',' + bonusCode : ''}`)) {
              // 	status = 'HOB';
              // }
              // if (initialStatus === 'X') {
              // 	status = initialStatus;
              // }
              // if (
              // 	bonusCode &&
              // 	initialStatus !== 'X' &&
              // 	!hourlyBonusTypeArr?.includes(`${initialStatus}${bonusCode ? ',' + bonusCode : ''}`)
              // ) {
              // 	status = `${initialStatus},${bonusCode}`;
              // }
              // if (!bonusCode && initialStatus !== 'X') {
              // 	status = initialStatus !== '' ? initialStatus : '-';
              // }

              allMonthData.push({
                status: status,
                bonusCode: bonusCode,
                date: m.format("DD"),
                isLeaveForTitreDeConge: isLeaveForTitreDeConge,
                rawDate: m.toISOString(),
              });
            } else {
              allMonthData.push({
                status: "X",
                bonusCode: null,
                isLeaveForTitreDeConge: false,
                date: m.format("DD"),
                rawDate: m.toISOString(),
              });
            }
          }

          const medicalCheckDate = employeeData[0]?.medicalCheckDate
            ? moment(employeeData[0].medicalCheckDate).format("Do MMMM YYYY")
            : null;
          const medicalCheckExpiry = employeeData[0]?.medicalCheckExpiry
            ? moment(employeeData[0].medicalCheckExpiry).format("Do MMMM YYYY")
            : null;

          const status = ["P", "AP", "CA", "CSS", "CR", "M", "CE", "A", "TR"];
          const statusPdf = [];
          const statusCounts = [];
          const statusPdfCounts = [];
          for (const statusType of status) {
            const result = employeeData[0]?.timeSheetSchedule.filter(
              (element) => {
                return (
                  element.status === statusType && element?.bonusCode === null
                );
              }
            );

            if (result && result.length > 0) {
              statusPdf.push(statusType);
              statusPdfCounts.push(result.length);
            }
            statusCounts.push(result.length || 0);
          }

          const pdfStatusArr = [...status];
          // const pdfStatusArr = [...status, ...hourlyBonusTypeArr];

          const statusMap = new Map();
          for (const accountType of employeeData[0].timeSheetSchedule) {
            const isExist = statusMap.get(
              `${accountType.status}${
                accountType.bonusCode ? "," + accountType.bonusCode : ""
              }`
            );
            if (!isExist) {
              const index = pdfStatusArr?.findIndex(
                (t) =>
                  t ===
                  `${accountType.status}${
                    accountType.bonusCode ? "," + accountType.bonusCode : ""
                  }`
              );
              if (index !== -1) {
                statusMap.set(
                  `${accountType.status}${
                    accountType.bonusCode ? "," + accountType.bonusCode : ""
                  }`,
                  accountStatusOptionData[index]
                );
              }
            }
          }
          const statusArr = [...statusMap.values()];

          const totalPresentDays = statusCounts[0];
          const dailyCost = employeeData[0]?.dailyCost || 0;
          let bonusData = await BonusType.findAll({
            where: {
              deletedAt: null,
              // isActive: true,
            },
            transaction,
            attributes: ["id", "code", "name", "basePrice"],
          });
          bonusData = parse(bonusData);
          const bonusCount = [];
          let customBonus = JSON.parse(employeeData[0]?.customBonus);
          customBonus = customBonus?.data;
          for (const bonusType of bonusData) {
            const result = employeeData[0]?.timeSheetSchedule.filter(
              (element) => {
                return (
                  element?.bonusCode?.split(",")?.indexOf(bonusType?.code) >= 0
                );
              }
            );
            if (result?.length > 0) {
              const currentBonus = customBonus?.find(
                (a) => a?.id == bonusType?.id
              );
              bonusCount.push({
                bonusType: bonusType.code,
                bonusName: bonusType.name,
                length: result?.length,
                basePrice:
                  currentBonus && currentBonus?.label === bonusType?.code
                    ? currentBonus.price
                    : bonusType.basePrice,
              });
            }
          }
          const overtimeWeekendBonus: {
            label: string;
            title?: string;
            length: number;
          }[] = [];
          if (employeeData[0]?.timeSheetSchedule?.length > 0) {
            if (
              employeeData[0]?.timeSheetSchedule?.findIndex(
                (e) => e.bonusCode?.split(",")?.indexOf("O1") >= 0
              ) >= 0
            ) {
              const o1Length = employeeData[0]?.timeSheetSchedule?.filter(
                (e) => e.bonusCode?.split(",")?.indexOf("O1") >= 0
              )?.length;
              overtimeWeekendBonus?.push({
                label: "O1",
                title: "Overtime 1",
                length: o1Length,
              });
            }
            if (
              employeeData[0]?.timeSheetSchedule?.findIndex(
                (e) => e.bonusCode?.split(",")?.indexOf("O2") >= 0
              ) >= 0
            ) {
              const o2Length = employeeData[0]?.timeSheetSchedule?.filter(
                (e) => e.bonusCode?.split(",")?.indexOf("O2") >= 0
              )?.length;
              overtimeWeekendBonus?.push({
                label: "O2",
                title: "Overtime 2",
                length: o2Length,
              });
            }
            if (
              employeeData[0]?.timeSheetSchedule?.findIndex(
                (e) => e.bonusCode?.split(",")?.indexOf("W") >= 0
              ) >= 0
            ) {
              const wLength = employeeData[0]?.timeSheetSchedule?.filter(
                (e) => e.bonusCode?.split(",")?.indexOf("W") >= 0
              )?.length;
              overtimeWeekendBonus?.push({
                label: "W",
                title: "Weekend Overtime",
                length: wLength,
              });
            }
            if (
              employeeData[0]?.timeSheetSchedule?.findIndex((e) =>
                hourlyBonusTypeArr?.includes(
                  `${e.status}${e.bonusCode ? "," + e.bonusCode : ""}`
                )
              ) >= 0
            ) {
              const hobLength = employeeData[0]?.timeSheetSchedule
                ?.filter(
                  (e) =>
                    hourlyBonusTypeArr?.includes(
                      `${e.status}${e.bonusCode ? "," + e.bonusCode : ""}`
                    ) &&
                    e.bonusCode !== null &&
                    (e.status === "CHB" || e.status === "P") &&
                    e.overtimeHours !== null
                )
                .reduce((sum, ele) => sum + ele.overtimeHours, 0);
              overtimeWeekendBonus?.push({
                label: "HOB",
                title: "Hourly Overtime Bonus",
                length: hobLength,
              });
            }
            if (
              employeeData[0]?.timeSheetSchedule?.findIndex(
                (e) =>
                  e.bonusCode === null &&
                  e.status === "H" &&
                  e.overtimeHours !== null
              ) >= 0
            ) {
              const hobLength = employeeData[0]?.timeSheetSchedule
                ?.filter(
                  (e) =>
                    e.bonusCode === null &&
                    e.status === "H" &&
                    e.overtimeHours !== null
                )
                ?.reduce((sum, ele) => sum + ele.overtimeHours, 0);
              overtimeWeekendBonus?.push({
                label: "H",
                title: "Hourly Bonus",
                length: hobLength,
              });
            }
          }
          const bonusCalculation = bonusCount.map((item) => {
            if (item.basePrice && item.basePrice !== null) {
              return item?.length * item.basePrice;
            } else {
              return 0;
            }
          });
          let bonusTotal = 0;
          bonusCalculation.forEach((item) => {
            bonusTotal += item;
          });
          const totalCost = dailyCost * totalPresentDays + bonusTotal;

          let reliquatValue: number;
          const reliquatCalculationData = await ReliquatCalculation.findOne({
            where: {
              [Op.and]: [
                {
                  startDate: { [Op.lte]: momentStartDate.toDate() },
                },
                {
                  endDate: { [Op.lte]: momentEndDate.toDate() },
                },
              ],
              employeeId: employeeData[0].id,
            },
            order: [["startDate", "desc"]],
          });
          employeeData[0].reliquatCalculation = [];
          employeeData[0].reliquatCalculation.push(reliquatCalculationData);
          if (
            moment(employeeData[0]?.terminationDate).isBetween(
              momentStartDate.toDate(),
              momentEndDate.toDate()
            ) ||
            moment(employeeData[0]?.terminationDate).isSame(
              momentStartDate.toDate()
            ) ||
            moment(employeeData[0]?.terminationDate).isSame(
              momentEndDate.toDate()
            )
          ) {
            const reliquatCalculation = reliquatCalculationData?.reliquat;
            // const reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService({
            // 	employeeId: String(employeeData[0]?.id),
            // 	date: moment(moment(employeeData[0]?.terminationDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
            // });
            // const reliquatCalculation = employeeData[0]?.reliquatCalculation?.[0]?.reliquat;
            reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
          } else if (
            employeeData[0]?.employeeSegment?.length > 0 &&
            !employeeData[0]?.employeeSegment?.[0]?.rollover
          ) {
            const reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService(
              {
                employeeId: String(employeeData[0]?.id),
                date: moment(
                  moment(employeeData[0]?.employeeSegment[0]?.date)
                    .subtract(1, "day")
                    .format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
              }
            );
            reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
          } else {
            reliquatValue = 0;
          }

          let presentValue = this.countStatus(
            employeeData[0]?.timeSheetSchedule,
            "P"
          );
          presentValue += this.countStatus(
            employeeData[0]?.timeSheetSchedule,
            "CHB"
          );
          let CRValue = 0;
          if (employeeData[0]?.client?.isCountCR) {
            CRValue = this.countStatus(
              employeeData[0]?.timeSheetSchedule,
              "CR"
            );
          }
          let trValue = this.countStatus(
            employeeData[0]?.timeSheetSchedule,
            "TR"
          );
          let apValue = this.countStatus(
            employeeData[0]?.timeSheetSchedule,
            "AP"
          );
          let caValue = this.countStatus(
            employeeData[0]?.timeSheetSchedule,
            "CA"
          );
          let reliquatPayment = 0;
          // let reliquatAdjustment = 0;
          employeeData[0]?.reliquatPayment?.map((paymentData) => {
            reliquatPayment += paymentData?.amount ?? 0;
          });
          // employeeData[0]?.reliquatAdjustment?.map((adjustmentData) => {
          // 	reliquatAdjustment += adjustmentData?.adjustment ?? 0;
          // });
          if (
            employeeData[0]?.employeeRotation &&
            employeeData[0]?.employeeRotation?.length > 0 &&
            employeeData[0]?.employeeRotation[0]?.rotation?.name === "Call Out"
          ) {
            presentValue = 0;
            CRValue = 0;
            trValue = 0;
            apValue = 0;
            caValue = 0;
            // reliquatAdjustment = 0;
            reliquatPayment = 0;
            reliquatValue = 0;
          }
          const totalBonusCount = employeeData[0]?.timeSheetSchedule?.filter(
            (bonusCountData) =>
              !bonusCountData?.status && bonusCountData?.bonusCode
          )?.length;
          const totalCount =
            presentValue +
            CRValue +
            trValue +
            apValue +
            caValue +
            totalBonusCount +
            reliquatPayment +
            reliquatValue;
          // const totalCount =
          // 	presentValue +
          // 	CRValue +
          // 	trValue +
          // 	apValue +
          // 	caValue +
          // 	totalBonusCount +
          // 	reliquatAdjustment +
          // 	reliquatPayment +
          // 	reliquatValue;

          const isHourlyBonusNote = overtimeWeekendBonus?.some(
            (e) => e?.label === "HOB"
          )
            ? true
            : false;

          const data = {
            timesheetData: {
              ...timesheetData,
              startDate,
              endDate,
            },
            employeeData: {
              ...employeeData[0],
              medicalCheckDate,
              medicalCheckExpiry,
            },
            employeeCost: {
              totalPresentDays,
              dailyCost,
              bonusTotal,
              totalCost,
            },
            allMonthData,
            isCallOutRotation,
            status,
            statusPdfCounts,
            statusPdf,
            statusCounts,
            statusArr,
            bonusCount,
            finalTotalCount: totalCount,
            presentValue,
            CRValue,
            overtimeWeekendBonus,
            isHourlyBonusNote,
          };
          return data;
        } else {
          return null;
        }
      }
    } catch (error) {
      console.log({ error });
      throw new Error(error);
    }
  }

  countStatus(
    allRows: TimesheetScheduleAttributes[],
    field: string,
    isBonus = false
  ) {
    const presentStatus = ["P", "TR"];
    const leaveStatus = ["CR"];
    const absentStatus = ["AP", "CA", "CS", "A", "M", "CE"];
    return allRows.reduce((count, obj) => {
      if (
        this.getStatusName(obj, false, true)?.indexOf(field) >= 0 &&
        !(
          obj.bonusCode?.split(",").indexOf("P") >= 0 &&
          field == "P" &&
          obj.status == ""
        ) &&
        field != "TR"
      ) {
        count++;
      }
      // if (this.getStatusName(obj, false, true)?.indexOf(field) >= 0 && field === 'TR') {
      // 	count++;
      // }
      if (
        this.getStatusName(obj, true, true)?.indexOf("TR") >= 0 &&
        field == "P"
      ) {
        count++;
      }
      if (isBonus) {
        if (
          this.getStatusName(obj, isBonus, true)?.indexOf("P") >= 0 &&
          field == "P"
        ) {
          count++;
        }
      }
      if (
        ![
          ...presentStatus,
          ...leaveStatus,
          ...absentStatus,
          // ...bonusStatus,
        ].includes(field) &&
        this.getStatusName(obj, true, true).indexOf(field) >= 0 &&
        !field.startsWith("CHB")
      ) {
        count++;
      }
      if (
        ![
          ...presentStatus,
          ...leaveStatus,
          ...absentStatus,
          // ...bonusStatus,
        ].includes(field) &&
        this.getStatusName(obj, true, true).indexOf("HOB") >= 0 &&
        field.startsWith("CHB")
      ) {
        count++;
      }
      return count;
    }, 0);
  }

  getStatusName(
    rowData: TimesheetScheduleAttributes,
    isBonus = false,
    isCount = false
  ) {
    if (rowData.overtimeHours !== null && rowData.bonusCode !== null) {
      if (isCount) {
        return ["HOB"];
      } else {
        return `P,${rowData.overtimeHours}HOB`;
      }
    }
    if (rowData.overtimeHours !== null && rowData.bonusCode === null) {
      if (isCount) {
        return ["H"];
      } else {
        return `${rowData.overtimeHours}H`;
      }
    }
    if (rowData?.status == "" && rowData?.bonusCode == null) {
      if (isCount) {
        return ["-"];
      } else {
        return "-";
      }
    }
    if (rowData?.status == "" && rowData?.bonusCode != null && !isBonus) {
      if (isCount) {
        return [rowData?.status];
      } else {
        return rowData?.status;
      }
    }
    if (rowData?.status == "" && rowData?.bonusCode != null && isBonus) {
      if (isCount) {
        return rowData?.bonusCode?.split(",");
      } else {
        return rowData?.bonusCode;
      }
    }
    if (rowData?.status != "" && rowData?.bonusCode == null) {
      if (isCount) {
        return [rowData?.status];
      } else {
        return rowData?.status;
      }
    }
    if (rowData?.status != "" && rowData?.bonusCode != null && isBonus) {
      if (isCount) {
        if (rowData?.bonusCode?.includes(",")) {
          const arr: string[] = [];
          rowData?.bonusCode?.split(",")?.forEach((e) => {
            arr.push(`${rowData?.status},${e}`);
          });
          return arr;
        } else {
          return [`${rowData?.status},${rowData?.bonusCode}`];
        }
      } else {
        return `${rowData?.status},${rowData?.bonusCode}`;
      }
    }
    if (rowData?.status != "" && rowData?.bonusCode != null && !isBonus) {
      if (isCount) {
        return [rowData?.status];
      } else {
        return rowData?.status;
      }
    }
    if (rowData?.bonusCode != null && isBonus) {
      if (isCount) {
        return rowData?.bonusCode?.split(",");
      } else {
        return rowData?.bonusCode;
      }
    }
    return [];
  }

  async generateAccountPO(
    data: {
      timesheetId: number;
      startDate: Date;
      endDate: Date;
      segmentId: number;
      subSegmentId: number;
      user: User;
    },
    transaction: Transaction = null
  ) {
    try {
      await AccountPO.destroy({
        where: {
          timesheetId: data.timesheetId,
        },
        force: true,
        transaction,
      });
      const momentStartDate = moment(data.startDate).toDate();
      const momentEndDate = moment(data.endDate).toDate();
      const segmentStartDate = moment(data.startDate).add(1, "month").toDate();
      const segmentEndDate = moment(data.endDate).add(1, "month").toDate();
      const serviceMonth = moment(data?.startDate).format("MMM");
      const serviceYear = moment(data?.startDate).format("YY");

      let timesheetData = await Timesheet.findAll({
        where: {
          id: data.timesheetId,
          deletedAt: null,
          status: "APPROVED",
        },
        transaction,
        attributes: ["id"],
        include: [
          {
            model: Employee,
            attributes: [
              "id",
              "employeeNumber",
              "fonction",
              "customBonus",
              "dailyCost",
              "terminationDate",
              "hourlyRate",
            ],
            required: true,
            include: [
              {
                model: TimesheetSchedule,
                attributes: [
                  "employeeId",
                  "status",
                  "date",
                  "overtimeHours",
                  "bonusCode",
                ],
                where: {
                  date: {
                    [Op.between]: [momentStartDate, momentEndDate],
                  },
                },
                required: true,
              },
              {
                model: EmployeeRotation,
                separate: true,
                attributes: ["rotationId"],
                include: [
                  {
                    model: Rotation,
                    attributes: ["isResident", "name", "weekOn", "weekOff"],
                  },
                ],
              },
              {
                model: ReliquatCalculation,
                attributes: ["reliquat", "presentDay", "leave", "overtime"],
                required: false,
              },
              {
                model: ReliquatPayment,
                where: {
                  startDate: {
                    [Op.gte]: momentStartDate,
                    [Op.lte]: momentEndDate,
                  },
                },
                required: false,
                attributes: ["id", "amount", "startDate"],
              },
              {
                model: ReliquatAdjustment,
                where: {
                  startDate: momentStartDate,
                },
                required: false,
                attributes: ["id", "adjustment"],
              },
              {
                model: EmployeeSegment,
                where: {
                  date: {
                    [Op.gte]: segmentStartDate,
                    [Op.lte]: segmentEndDate,
                  },
                },
                required: false,
                attributes: ["id", "rollover", "date"],
              },
              {
                model: EmployeeBonus,
                required: false,
                where: {
                  startDate: {
                    [Op.lte]: momentEndDate,
                  },
                  endDate: {
                    [Op.or]: {
                      [Op.eq]: null,
                      [Op.gt]: momentStartDate,
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

              {
                model: EmployeeSalary,
                required: false,
                where: {
                  startDate: {
                    [Op.lte]: momentEndDate,
                  },
                  endDate: {
                    [Op.or]: {
                      [Op.eq]: null,
                      [Op.gte]: momentStartDate,
                    },
                  },
                },
                attributes: [
                  "id",
                  "monthlySalary",
                  "dailyCost",
                  "endDate",
                  "startDate",
                ],
              },
            ],
          },
          {
            model: Client,
            attributes: ["code", "id", "isCountCR"],
          },
        ],
        order: [
          ["employee", "employeeSalary", "startDate", "desc"],
          ["employee", "employeeSegment", "date", "desc"],
          ["employee", "employeeBonus", "startDate", "desc"],
          ["employee", "reliquatCalculation", "startDate", "desc"],
        ],
      });
      timesheetData = parse(timesheetData);
      if (timesheetData?.length > 0) {
        let poNumber =
          "PO" +
          String(data.timesheetId) +
          String(Math.floor(1000 + Math.random() * 9000));
        let customBonus = timesheetData?.[0].employee?.employeeBonus;
        const filterBonus = new Map();
        for (const employeeBonusData of customBonus) {
          const isExist = filterBonus.get(
            `${employeeBonusData?.bonus?.code}-${
              employeeBonusData?.price ?? 0
            }-${employeeBonusData?.coutJournalier ?? 0}`
          );
          if (!isExist) {
            filterBonus.set(
              `${employeeBonusData?.bonus?.code}-${
                employeeBonusData?.price ?? 0
              }-${employeeBonusData?.coutJournalier ?? 0}`,
              employeeBonusData
            );
          }
        }
        customBonus = [...filterBonus.values()];
        const empSalary = timesheetData?.[0].employee?.employeeSalary;
        // let price = 0;
        // if (customBonus?.data) {
        // 	customBonus = customBonus?.data;
        // 	// if (customBonus.length > 0) {
        // 	// 	customBonus.forEach((bonus) => {
        // 	// 		if (bonus.price) {
        // 	// 			price += Number(bonus.price);
        // 	// 		}
        // 	// 	});
        // 	// }
        // }
        const bonusData = await BonusType.findAll({
          where: {
            // isActive: true,
            deletedAt: null,
          },
          transaction,
        });

        let medicalTypeData = await MedicalType.findAll({
          where: {
            deletedAt: null,
          },
          transaction,
        });
        medicalTypeData = parse(medicalTypeData);

        let medicalData = await MedicalRequest.findAll({
          where: {
            status: medicalRequestStatus.ACTIVE,
            employeeId: timesheetData[0]?.employee?.id,
            medicalDate: {
              [Op.between]: [momentStartDate, momentEndDate],
            },
          },
          include: [
            {
              model: Employee,
              attributes: ["clientId"],
              where: {
                clientId: timesheetData[0]?.client?.id,
              },
            },
            {
              model: MedicalType,
              attributes: ["id", "name", "amount"],
            },
            {
              model: User,
              as: "createdByUser",
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["firstName", "name", "lastName", "email"],
                },
              ],
            },
          ],
        });
        medicalData = parse(medicalData);

        const bonusArr = [];
        const salaryArr = [];
        const medicalArr = [];
        const hourlyOvertimeBonus = [
          "P,DAILY",
          "P,NIGHT",
          "P,HOLIDAY",
          "CHB,DAILY",
          "CHB,NIGHT",
          "CHB,WEEKEND",
          "CHB,HOLIDAY",
          "W,WEEKEND",
          "W,NIGHT",
        ];

        medicalTypeData?.forEach((medicalTypeValue) => {
          if (
            medicalData.some(
              (element) =>
                element?.medicalTypeData?.name === medicalTypeValue.name
            )
          ) {
            const isExist = medicalData.filter((medicalType) => {
              return (
                medicalTypeValue.name === medicalType?.medicalTypeData?.name
              );
            });

            if (isExist?.length > 0) {
              const medicalItem = isExist
                ? Object.assign({}, ...isExist)
                : null;

              medicalArr.push({
                label: medicalTypeValue?.name,
                count: isExist?.length || 0,
                price: Number(medicalTypeValue?.amount)?.toFixed(2) ?? 0,
                medicalDate: medicalItem?.medicalDate,
                manager: medicalItem?.createdByUser?.loginUserData?.name
                  ? medicalItem?.createdByUser?.loginUserData?.name
                  : medicalItem?.createdByUser?.loginUserData?.firstName +
                    " " +
                    medicalItem?.createdByUser?.loginUserData?.lastName,
              });
            }
          }
        });

        bonusData?.forEach((bonus) => {
          if (
            timesheetData[0].employee?.timeSheetSchedule.some(
              (element) =>
                element?.bonusCode?.split(",")?.indexOf(bonus?.code) >= 0
            )
          ) {
            const isExist = timesheetData[0].employee?.timeSheetSchedule.filter(
              (bonusType) => {
                return (
                  bonusType?.bonusCode?.split(",")?.indexOf(bonus?.code) >= 0
                );
              }
            );
            if (isExist?.length > 0) {
              if (customBonus && customBonus?.length > 0) {
                const isExistingCustomBonus = customBonus?.findIndex(
                  (customBonusIndex) =>
                    customBonusIndex?.bonus?.code === bonus?.code
                );
                if (isExistingCustomBonus >= 0) {
                  const filteredCustomBonus = customBonus?.filter(
                    (e) => e?.bonus?.code === bonus?.code
                  );
                  filteredCustomBonus.forEach((bonusValue, index) => {
                    let startDate;
                    let endDate;
                    if (filteredCustomBonus?.length - 1 === index) {
                      startDate = momentStartDate;
                    } else {
                      startDate = moment(bonusValue.startDate);
                    }

                    if (
                      bonusValue?.endDate &&
                      moment(bonusValue?.endDate)
                        .subtract(1, "days")
                        .isAfter(momentEndDate)
                    ) {
                      endDate = momentEndDate;
                    } else {
                      endDate = moment(
                        bonusValue?.endDate
                          ? moment(bonusValue.endDate).subtract(1, "days")
                          : momentEndDate
                      );
                    }
                    const items = [];
                    isExist.forEach((itemValue) => {
                      const itemDate = moment(itemValue.date);
                      if (itemDate.isBetween(startDate, endDate, null, "[]")) {
                        items.push(itemValue);
                      }
                    });

                    bonusArr.push({
                      label: bonusValue.bonus?.name,
                      count: items?.length || 0,
                      price:
                        Number(bonusValue?.coutJournalier)?.toFixed(2) ?? 0,
                      startDate,
                      endDate,
                    });
                  });
                } else {
                  bonusArr.push({
                    label: bonus.name,
                    count: isExist?.length || 0,
                    price: Number(bonus.basePrice.toFixed(2)),
                  });
                }
              } else {
                bonusArr.push({
                  label: bonus.name,
                  count: isExist?.length,
                  price: Number(bonus.basePrice.toFixed(2)),
                });
              }
            }
          }
        });

        // Salary Data.....

        if (empSalary && empSalary?.length > 0) {
          empSalary.forEach((salaryValue, index) => {
            let startDate;
            let endDate;
            if (empSalary?.length - 1 === index) {
              startDate = momentStartDate;
            } else {
              startDate = moment(salaryValue.startDate);
            }

            if (
              salaryValue?.endDate &&
              moment(salaryValue?.endDate).isAfter(momentEndDate)
            ) {
              endDate = momentEndDate;
            } else {
              endDate = moment(salaryValue.endDate ?? momentEndDate);
            }
            const presentSalaryDays = timesheetData[0]?.employee?.timeSheetSchedule?.filter(
              (itemValue) => {
                const itemDate = moment(itemValue.date);
                return (
                  itemDate.isBetween(startDate, endDate, null, "[]") &&
                  (itemValue.status === "P" ||
                    (timesheetData[0].client?.isCountCR &&
                      itemValue.status === "CR") ||
                    itemValue.status === "CHB" ||
                    itemValue?.status === "TR" ||
                    itemValue?.status === "AP" ||
                    itemValue?.status === "CA")
                );
              }
            );
            salaryArr.push({
              dailyCost: Number(salaryValue?.dailyCost)?.toFixed(2) ?? 0,
              startDate,
              count: presentSalaryDays?.length || 0,
              endDate,
            });
          });
        }

        // End Salary Data.....

        let hourlyBonusPrice = 0;
        const respData = new Map();
        for (const timesheetDataFilter of timesheetData[0].employee
          ?.timeSheetSchedule) {
          let length = 0;
          if (
            hourlyOvertimeBonus.includes(
              `${timesheetDataFilter?.status}${
                timesheetDataFilter?.bonusCode
                  ? "," + timesheetDataFilter?.bonusCode
                  : ""
              }`
            )
          ) {
            length = 1;
            const prevValue = respData.get(
              `${timesheetDataFilter?.status}-${timesheetDataFilter?.overtimeHours}`
            );
            if (prevValue) {
              length = prevValue?.length + 1;
            }
            respData.set(
              `${timesheetDataFilter?.status}-${timesheetDataFilter?.overtimeHours}`,
              {
                ...timesheetDataFilter,
                length: length,
              }
            );
          }
        }
        const hourlyBonusArr = [];
        for (const hourlyBonusData of respData.values()) {
          hourlyBonusArr.push(hourlyBonusData);
        }

        const hourlyCallOutBonus = new Map();
        const hourlyCallOutFilteredData = timesheetData[0]?.employee?.timeSheetSchedule?.filter(
          (e) =>
            e.status === "H" && e.bonusCode === null && e.overtimeHours !== null
        );

        for (const timesheetDataFilter of hourlyCallOutFilteredData) {
          const isExist = hourlyCallOutBonus.get(
            `${timesheetDataFilter?.status}${timesheetDataFilter?.overtimeHours}`
          );
          if (isExist) {
            const length = isExist.length + 1;
            hourlyCallOutBonus.set(
              `${timesheetDataFilter?.status}${timesheetDataFilter?.overtimeHours}`,
              {
                overtimeHours: timesheetDataFilter.overtimeHours,
                length,
              }
            );
          } else {
            hourlyCallOutBonus.set(
              `${timesheetDataFilter?.status}${timesheetDataFilter?.overtimeHours}`,
              {
                overtimeHours: timesheetDataFilter.overtimeHours,
                length: 1,
              }
            );
          }
        }

        const hourlyCallOutArr = [];
        for (const hourlyCallOutData of hourlyCallOutBonus.values()) {
          hourlyCallOutArr.push(hourlyCallOutData);
        }

        const clientCode = timesheetData[0]?.client?.code;
        let invoiceNo = `${Math.floor(
          Math.random() * 100000
        )}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
        const hourlyBonusInvoiceNumber = `${Math.floor(
          Math.random() * 100000
        )}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
        const hourlyBonusPONumber =
          "PO" +
          String(data.timesheetId) +
          String(Math.floor(1000 + Math.random() * 9000));
        const medicalPONumber =
          "PO" +
          String(data.timesheetId) +
          String(Math.floor(1000 + Math.random() * 9000));
        const manager = data?.user?.loginUserData?.name
          ? data?.user?.loginUserData?.name
          : `${data?.user?.loginUserData?.lastName}+" "+${data?.user?.loginUserData?.firstName}`;
        const managerId = data?.user?.loginUserData?.id;
        if (
          timesheetData[0]?.employee?.employeeRotation?.[0]?.rotation?.name !==
          "Call Out"
        ) {
          // const status = timesheetData[0].employee?.timeSheetSchedule.filter((presentDays) => {
          // 	return (
          // 		presentDays.status === 'P' ||
          // 		(timesheetData[0].client?.isCountCR ? presentDays.status === 'CR' : '') ||
          // 		presentDays?.status === 'TR' ||
          // 		presentDays?.status === 'AP' ||
          // 		presentDays?.status === 'CA'
          // 		// 	&&
          // 		// presentDays?.bonusCode !== 'W' &&
          // 		// presentDays?.bonusCode !== 'O1' &&
          // 		// presentDays?.bonusCode !== 'O2'
          // 	);
          // });

          // const totalPresentDays = status?.length || 0;
          // let reliquatAdjustment = 0;
          let reliquatValue: number;
          // if (
          // 	moment(timesheetData[0]?.employee?.terminationDate).isBetween(momentStartDate, momentEndDate) ||
          // 	moment(timesheetData[0]?.employee?.terminationDate).isSame(momentStartDate) ||
          // 	moment(timesheetData[0]?.employee?.terminationDate).isSame(momentEndDate)
          // ) {
          // 	const reliquatCalculation = timesheetData[0]?.employee?.reliquatCalculation?.[0]?.reliquat;
          // 	reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
          // } else if (
          // 	timesheetData[0]?.employee?.employeeSegment?.length > 0 &&
          // 	!timesheetData[0]?.employee?.employeeSegment[0]?.rollover
          // ) {
          // 	const reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService({
          // 		employeeId: String(timesheetData[0]?.employee?.id),
          // 		date: moment(
          // 			moment(timesheetData[0]?.employee?.employeeSegment[0]?.date).subtract(1, 'day').format('DD-MM-YYYY'),
          // 			'DD-MM-YYYY',
          // 		).toDate(),
          // 	});
          // 	reliquatValue = reliquatCalculation >= 0 ? reliquatCalculation : 0;
          // } else {
          // 	reliquatValue = 0;
          // }

          // timesheetData[0]?.employee?.reliquatAdjustment?.map((adjustmentData) => {
          // 	reliquatAdjustment += adjustmentData?.adjustment ?? 0;
          // });

          // const finalTotal = totalPresentDays + reliquatAdjustment + reliquatPayment + reliquatValue;
          for (const element of salaryArr) {
            if (
              moment(timesheetData[0]?.employee?.terminationDate).isBetween(
                element?.startDate ?? momentStartDate,
                element?.endDate ?? momentEndDate
              ) ||
              moment(timesheetData[0]?.employee?.terminationDate).isSame(
                element?.startDate ?? momentStartDate
              ) ||
              moment(timesheetData[0]?.employee?.terminationDate).isSame(
                element?.endDate ?? momentEndDate
              )
            ) {
              const reliquatCalculation =
                timesheetData[0]?.employee?.reliquatCalculation?.[0]?.reliquat;
              reliquatValue =
                reliquatCalculation >= 0 ? reliquatCalculation : 0;
            } else if (
              moment(
                timesheetData[0]?.employee?.employeeSegment[0]?.date
              ).isSameOrBefore(element?.startDate ?? momentStartDate) &&
              moment(
                timesheetData[0]?.employee?.employeeSegment[0]?.date
              ).isSameOrAfter(element?.endDate ?? momentEndDate) &&
              timesheetData[0]?.employee?.employeeSegment?.length > 0 &&
              !timesheetData[0]?.employee?.employeeSegment[0]?.rollover
            ) {
              const findEmpIndex = timesheetData[0]?.employee?.employeeSegment.findIndex(
                (ele) =>
                  moment(ele.date).isSameOrAfter(
                    element?.startDate ?? momentStartDate
                  ) &&
                  moment(ele.date).isSameOrBefore(
                    element?.endDate ?? momentEndDate
                  )
              );

              const reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService(
                {
                  employeeId: String(timesheetData[0]?.employee?.id),
                  date: moment(
                    moment(
                      timesheetData[0]?.employee?.employeeSegment[findEmpIndex]
                        ?.date
                    )
                      .subtract(1, "day")
                      .format("DD-MM-YYYY"),
                    "DD-MM-YYYY"
                  ).toDate(),
                }
              );
              reliquatValue =
                reliquatCalculation >= 0 ? reliquatCalculation : 0;
            } else {
              reliquatValue = 0;
            }

            const paymentValueData = timesheetData[0]?.employee?.reliquatPayment?.find(
              (paymentData) =>
                moment(paymentData.startDate).isSameOrAfter(
                  element?.startDate ?? momentStartDate
                ) &&
                moment(paymentData.startDate).isSameOrBefore(
                  element?.endDate ?? momentEndDate
                )
            );
            let finalTotal;
            if (paymentValueData) {
              finalTotal =
                element?.count + Number(paymentValueData?.amount) ??
                0 + reliquatValue;
            } else {
              finalTotal = element?.count + reliquatValue;
            }
            await AccountPO.create(
              {
                timesheetId: data.timesheetId,
                type: "Salary",
                poNumber: poNumber,
                dailyRate: element.dailyCost ? Number(element.dailyCost) : 0,
                timesheetQty: finalTotal,
                startDate: element?.startDate ?? momentStartDate,
                endDate: element?.endDate ?? momentEndDate,
                segmentId: data?.segmentId ?? null,
                subSegmentId: data?.subSegmentId ?? null,
                invoiceNo: invoiceNo,
                managers: manager,
                managerId: managerId,
              },
              { transaction }
            );
          }
        }
        const hourlyCallOutPONumber =
          "PO" +
          String(data.timesheetId) +
          String(Math.floor(1000 + Math.random() * 9000));
        const hourlyCallOutInvoiceNumber = `${Math.floor(
          Math.random() * 100000
        )}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
        if (hourlyCallOutArr.length > 0) {
          let timesheetQtyOfH = 0;
          for (const element of hourlyCallOutArr) {
            timesheetQtyOfH += element.length * element?.overtimeHours;
          }
          await AccountPO.create(
            {
              timesheetId: data.timesheetId,
              type: "H",
              poNumber: hourlyCallOutPONumber,
              dailyRate: timesheetData[0]?.employee?.hourlyRate ?? 0,
              timesheetQty: timesheetQtyOfH,
              startDate: momentStartDate,
              endDate: momentEndDate,
              segmentId: data?.segmentId ?? null,
              subSegmentId: data?.subSegmentId ?? null,
              invoiceNo: hourlyCallOutInvoiceNumber,
              managers: manager,
              managerId: managerId,
            },
            { transaction }
          );
        }
        for (const element of bonusArr) {
          invoiceNo = `${Math.floor(
            Math.random() * 100000
          )}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
          poNumber =
            "PO" +
            String(data.timesheetId) +
            String(Math.floor(1000 + Math.random() * 9000));
          await AccountPO.create(
            {
              timesheetId: data.timesheetId,
              type: element.label,
              poNumber: poNumber,
              dailyRate: element.price,
              timesheetQty: element.count,
              startDate: element?.startDate ?? momentStartDate,
              endDate: element?.endDate ?? momentEndDate,
              segmentId: data?.segmentId ?? null,
              subSegmentId: data?.subSegmentId ?? null,
              invoiceNo: invoiceNo,
              managers: manager,
              managerId: managerId,
            },
            { transaction }
          );
        }
        for (const e of hourlyBonusArr) {
          const dailyRateMultipliedBy =
            e.bonusCode === "NIGHT" ||
            e.bonusCode === "WEEKEND" ||
            e.bonusCode === "HOLIDAY"
              ? 2
              : e.bonusCode === "DAILY" && e?.overtimeHours < 4
              ? 1.5
              : e.bonusCode === "DAILY" && e?.overtimeHours > 4
              ? 1.75
              : 1;
          hourlyBonusPrice =
            (timesheetData[0].employee?.dailyCost / 8) *
            e.overtimeHours *
            dailyRateMultipliedBy;
          await AccountPO.create(
            {
              timesheetId: data.timesheetId,
              type: `${e.status}${e.bonusCode ? "," + e.bonusCode : ""}`,
              poNumber: hourlyBonusPONumber,
              dailyRate: hourlyBonusPrice,
              timesheetQty: e?.length || 0,
              startDate: momentStartDate,
              endDate: momentEndDate,
              segmentId: data?.segmentId ?? null,
              subSegmentId: data?.subSegmentId ?? null,
              invoiceNo: hourlyBonusInvoiceNumber,
              managers: manager,
              managerId: managerId,
            },
            { transaction }
          );
        }

        for (const element of medicalArr) {
          const serviceMedicalMonth = moment(element?.medicalDate).format(
            "MMM"
          );
          const serviceMedicalYear = moment(element?.medicalDate).format("YY");

          invoiceNo = `${Math.floor(
            Math.random() * 100000
          )}/${serviceMedicalMonth.toLocaleUpperCase()}${serviceMedicalYear}/${clientCode}`;
          await AccountPO.create(
            {
              timesheetId: data.timesheetId,
              type: "Medical",
              poNumber: medicalPONumber,
              dailyRate: element?.price ? Number(element?.price) : 0,
              timesheetQty: element?.count ?? 1,
              startDate: momentStartDate,
              endDate: momentEndDate,
              segmentId: data?.segmentId ?? null,
              subSegmentId: data?.subSegmentId ?? null,
              invoiceNo: invoiceNo,
              managers: element?.manager,
              managerId: managerId,
            },
            { transaction }
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async approveTimesheetRequest(
    user: User,
    body: { timesheetIds: []; status: string }
  ) {
    try {
      const {
          timesheetIds,
          //  status
        } = body,
        promises = [];
      if (timesheetIds.length > 0) {
        let timesheets = await Timesheet.findAll({
          where: {
            id: {
              [Op.in]: timesheetIds,
            },
          },
        });
        timesheets = parse(timesheets);

        if (timesheets.length > 0) {
          for (const element of timesheets) {
            const promise = new Promise(async (resolve) => {
              try {
                await Timesheet.update(
                  {
                    requestedUserId: user?.id || null,
                    requestedDate: new Date().toISOString(),
                  },
                  { where: { id: element?.id } }
                );
                resolve(element?.id);
              } catch (error) {
                resolve(error);
              }
            });
            await createHistoryRecord({
              tableName: tableEnum.TIMESHEET_REQUEST,
              moduleName: moduleName.TIMESHEETS,
              userId: user?.id,
              custom_message: `<b>${user?.loginUserData?.name}</b> has created a ${tableEnum.TIMESHEET_REQUEST}, Bulk Request For Timesheet Approve!`,
              lastlogintime: user?.loginUserData?.logintimeutc,
              jsonData: parse(element),
              activity: statusEnum.CREATE,
            });
            promises.push(promise);
          }
        }
        await Promise.all(promises);
      }
      return;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getapprovalrequests(query: IQueryParameters) {
    try {
      const {
        page,
        limit,
        clientId,
        startDate,
        endDate,
        employeeId,
        // search,
      } = query;
      const filter: any = {};

      if (employeeId) {
        filter["employeeId"] = { [Op.eq]: employeeId };
      }
      if (clientId) {
        filter["clientId"] = { [Op.eq]: clientId };
      }
      const dates = {
        requestedDate: {
          [Op.or]: {
            [Op.between]: [
              new Date(moment(startDate, "DD-MM-YYYY").format("YYYY-MM-DD")),
              new Date(
                moment(endDate, "DD-MM-YYYY")
                  .add(1, "days")
                  .format("YYYY-MM-DD")
              ),
            ],
          },
        },
      };

      let result = await Timesheet.findAll({
        include: [
          {
            model: Segment,
            attributes: ["name", "id"],
            paranoid: false,
          },
          {
            model: SubSegment,
            attributes: ["name", "id"],
            paranoid: false,
          },
          {
            model: Client,
            attributes: ["id", "loginUserId"],
            paranoid: false,
            include: [
              {
                model: LoginUser,
                attributes: ["id", "name"],
                paranoid: false,
              },
            ],
          },
          {
            model: Employee,
            attributes: ["id", "loginUserId"],
            paranoid: false,
            include: [
              {
                model: LoginUser,
                attributes: ["id", "firstName", "lastName", "name"],
                paranoid: false,
              },
            ],
          },
          {
            model: User,
            as: "requestedUser",
            attributes: ["id", "loginUserId", "roleId"],
            include: [
              {
                model: LoginUser,
                attributes: ["firstName", "name", "lastName", "email"],
              },
              {
                model: Role,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        where: {
          status: "UNAPPROVED",
          requestedUserId: { [Op.ne]: null },
          ...filter,
          ...dates,
        },
        offset: page && limit ? (page - 1) * limit : undefined,
        limit: limit ?? undefined,
        order: [["requestedDate", "desc"]],
      });
      // await createHistoryRecord({
      //   tableName: tableEnum.TIMESHEET,
      //   moduleName: moduleName.TIMESHEETS,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(user, tableEnum.TIMESHEET, `Timesheet Approval Requests!`),
      //   jsonData: parse(result),
      //   activity: statusEnum.VIEW,
      // });
      result = parse(result);
      return result;
    } catch (error) {
      console.log("error", error);
    }
  }
}
