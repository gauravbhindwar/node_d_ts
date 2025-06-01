import { FRONTEND_URL, SERVER_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryUpdateMesage,
  customHistoryViewMessage,
  formatKeyString,
} from "@/helpers/history.helper";
import { DefaultRoles } from "@/interfaces/functional/feature.interface";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  EmployeeLeavePdfAttributes,
  IEmployeeLeaveCreate,
  employeeLeaveStatus,
} from "@/interfaces/model/employeeLeave.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import AccountPO from "@/models/accountPO.model";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import EmployeeLeave from "@/models/employeeLeave.model";
import LoginUser from "@/models/loginUser.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import TimesheetSchedule from "@/models/timesheetSchedule.model";
import User from "@/models/user.model";
import { fileDelete, folderExistCheck, parse } from "@/utils/common.util";
import { pdf } from "@/utils/puppeteer.pdf";
import moment from "moment";
import path from "path";
import { Op, Transaction } from "sequelize";
import BaseRepository from "./base.repository";
import ReliquatCalculationRepo from "./reliquatCalculation.repository";
import TimesheetRepo from "./timesheet.repository";
import TimesheetScheduleRepo from "./timesheetSchedule.repository";

export default class EmployeeLeaveRepo extends BaseRepository<EmployeeLeave> {
  constructor() {
    super(EmployeeLeave.name);
  }

  private dateFormat = "DD-MM-YYYY";
  private msg = new MessageFormation("EmployeeLeave").message;
  private TimesheetService = new TimesheetRepo();
  private TimesheetScheduleService = new TimesheetScheduleRepo();
  private reliquatCalculationRepo = new ReliquatCalculationRepo();

  async getAllEmployeeLeaveTypes(query: IQueryParameters, user: User) {
    const { page, limit, employeeId, sortBy, sort, clientId } = query;
    const currentDate = moment();
    const sortedColumn = sortBy || null;
    const filter: any = {
      deletedAt: null,
    };
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    let data = await this.getAllData({
      where: filter,
      include: [
        ...(user.roleData.isViewAll &&
        user.roleData.name === DefaultRoles.Employee
          ? [
              {
                model: Employee,
                where: { loginUserId: user.loginUserId },
              },
            ]
          : [
              {
                model: Employee,
                where: { clientId: clientId },
                attributes: ["id"],
                include: [{ model: LoginUser, attributes: ["id","firstName", "lastName","email"] }],
              },
            ]),
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "startDate", sort ?? "desc"]],
    });

    data = parse(data);
    const dataLeave = await Promise.all(
      data?.rows.map(async (row) => {
        const temp: any = { ...row };
        const inputDate = moment(temp.startDate, "YYYY-MM-DD");
        const monthDiff = currentDate.diff(inputDate, "months");
        const dataOfMonth = monthDiff < 6;
        temp.employeeLeaveFlag = dataOfMonth;
        return temp;
      })
    );
    const responseObj = {
      data: dataLeave,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };

    return responseObj;
  }

  async getEmployeeLeavePdfData(
    id: number,
    user?: User,
    transaction: Transaction = null
  ) {
    let data = await EmployeeLeave.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      attributes: [
        "employeeId",
        "reference",
        "startDate",
        "endDate",
        "createdAt",
        "status",
        "updatedAt",
        "leaveType",
      ],
      transaction,
      include: [
        {
          model: User,
          as: "createdByUser",
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
        {
          model: Employee,
          attributes: ["fonction", "address", "employeeNumber"],
          include: [
            {
              model: Segment,
              attributes: ["id", "name"],
            },
            {
              model: SubSegment,
              attributes: ["id", "name"],
            },
            {
              model: LoginUser,
              attributes: ["firstName", "lastName", "email"],
            },
            {
              model: Client,
              attributes: ["id", "titreDeConge", "stampLogo"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });

    let dateDeReprise = [];

    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    let reliquatCalculationData;
    if (data) {
      reliquatCalculationData = await this.reliquatCalculationRepo.generateReliquatCalculationService(
        {
          employeeId: String(data.employeeId),
          date: data.endDate,
        },
        transaction
      );

      dateDeReprise = await EmployeeLeave.findAll({
        where: {
          employeeId: data.employeeId,
          endDate: {
            [Op.ne]: data.endDate,
            [Op.lt]: data.startDate,
          },
          deletedAt: null,
        },
        transaction,
        attributes: ["id", "endDate"],
        order: [["endDate", "desc"]],
        limit: 1,
      });
    }

    data = parse(data);
    reliquatCalculationData = reliquatCalculationData ?? null;
    dateDeReprise = parse(dateDeReprise);
    const dateDeRepriseEndDate =
      dateDeReprise.length > 0
        ? moment(dateDeReprise[0].endDate).format("DD MMMM YYYY")
        : null;
    const debutDeConge = moment(data.startDate).format("DD MMMM YYYY");
    const dateDuRetour = moment(data.endDate)
      .add(1, "days")
      .format("DD MMMM YYYY");
    const droitDeConge =
      data.endDate && data.startDate
        ? moment(data.endDate).add(1, "days").diff(data.startDate, "days")
        : null;
    const lieuDeSejour = data.employeeDetail.address
      ? data.employeeDetail.address
      : null;
    const createdAt = moment(data.createdAt).format("DD MMMM YYYY");
    const createdAtTime = moment(data.createdAt).format("LT");
    const updatedAt =
      data?.status === "CANCELLED"
        ? moment(data.updatedAt).format("DD MMMM YYYY")
        : null;
    const updatedAtTime =
      data?.status === "CANCELLED" ? moment(data.updatedAt).format("LT") : null;

    if (user) {
      await createHistoryRecord({
        tableName: tableEnum.EMPLOYEE_LEAVE,
        moduleName: moduleName.TITREDECONGE,
        userId: user?.id,
        lastlogintime: user?.loginUserData?.logintimeutc,
        custom_message: await customHistoryViewMessage(
          user,
          tableEnum.EMPLOYEE_LEAVE,
          `All Employee Leave Pdf Details!`
        ),
        jsonData: parse({
          ...data,
          reliquatCalculationData,
          dateDeRepriseEndDate,
          debutDeConge,
          dateDuRetour,
          droitDeConge,
          lieuDeSejour,
          createdAt,
          createdAtTime,
          updatedAt,
          updatedAtTime,
        }),
        activity: statusEnum.EXPORT,
      });
    }
    return {
      ...data,
      reliquatCalculationData,
      dateDeRepriseEndDate,
      debutDeConge,
      dateDuRetour,
      droitDeConge,
      lieuDeSejour,
      createdAt,
      createdAtTime,
      updatedAt,
      updatedAtTime,
    };
  }

  async getEmployeeLeaveById(id: number) {
    let data = await EmployeeLeave.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: User,
          as: "createdByUser",
          attributes: ["loginUserId"],
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

async addEmployeeLeave(
  { body, user }: { body: IEmployeeLeaveCreate; user: User },
  transaction: Transaction = null
) {
  try {
    console.log("STEP 1: Parsing leave start/end dates");

    const leaveStartDate = moment(body.startDate, "YYYY-MM-DD").startOf("day").toDate();
    const leaveEndDate = moment(body.endDate, "YYYY-MM-DD").endOf("day").toDate();
    console.log("body.startDate", body.startDate, leaveStartDate)
    body = { ...body, startDate: leaveStartDate, endDate: leaveEndDate };

    console.log("STEP 2: Generating form reference");

    const previousLeaves = await EmployeeLeave.findAndCountAll({
      where: { employeeId: body.employeeId },
      transaction,
    });

    const formId = previousLeaves.count + 1;

    const employee = parse(await Employee.findOne({
      where: { id: body.employeeId, deletedAt: null },
      include: [{ model: LoginUser, attributes: ["id", "email", "firstName", "lastName"] }],
      transaction,
    }));

    console.log("Employee fetched:", employee?.loginUserData?.email);

    let contractNumber = employee?.contractNumber || employee?.employeeNumber;
    if (!contractNumber) {
      console.log("No contract number found, using last leave ID as fallback");
      const lastLeave = await EmployeeLeave.findOne({
        order: [["createdAt", "DESC"]],
        transaction,
      });
      contractNumber = lastLeave ? lastLeave.id.toString() : "1";
    }

    const year = leaveStartDate.getFullYear();
    const reference = `${formId}/${contractNumber}/${year}/LRED`;

    console.log("STEP 3: Checking for duplicate leave with reference:", reference);

    const existingLeave = await EmployeeLeave.findOne({
      where: {
        status: { [Op.not]: employeeLeaveStatus.CANCELLED },
        employeeId: body.employeeId,
        [Op.or]: [
          { reference },
          {
            [Op.and]: [
              {
                [Op.or]: [
                  { startDate: { [Op.between]: [leaveStartDate, leaveEndDate] } },
                  { endDate: { [Op.between]: [leaveStartDate, leaveEndDate] } },
                  {
                    startDate: { [Op.lte]: leaveStartDate },
                    endDate: { [Op.gte]: leaveEndDate },
                  },
                ],
              },
            ],
          },
        ],
        deletedAt: null,
      },
      transaction,
      include: [{
        model: User,
        as: "createdByUser",
        attributes: ["id"],
        include: [{ model: LoginUser, attributes: ["email"] }],
      }],
    });

    if (existingLeave) {
      console.warn("Duplicate leave found, throwing exception");
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    console.log("STEP 4: Creating leave record");

    const totalDays = moment(leaveEndDate).diff(moment(leaveStartDate), "days");

    let data = await EmployeeLeave.create({
      ...body,
      reference,
      segmentId: employee?.segmentId,
      rotationId: employee?.rotationId,
      employeeContractEndDate: employee?.contractEndDate,
      totalDays,
      createdBy: user.id,
    }, { transaction });

    data = parse(data);

    console.log("Leave record created with ID:", data.id);

    // STEP 5: Generate PDF and Send Email
    if (data) {
      console.log("Generating PDF...");
      let leaveDetails: EmployeeLeavePdfAttributes = parse(
        await this.getEmployeeLeavePdfData(data.id, null, transaction)
      );

      leaveDetails.date = moment(leaveDetails?.createdAt).format("D MMMM YYYY");

      const pdfName = `${moment().unix()}-titre-de-conge.pdf`;
      const stampLogo = leaveDetails?.employeeDetail?.client?.stampLogo
        ? SERVER_URL + leaveDetails?.employeeDetail?.client?.stampLogo
        : null;

      const footerContent = `Submitted by ${
        leaveDetails?.createdByUser?.loginUserData?.name
      } on ${leaveDetails?.createdAt} at ${leaveDetails?.createdAtTime}${
        leaveDetails?.status === "CANCELLED"
          ? `, cancelled by ${leaveDetails?.updatedByUser?.loginUserData?.name} on ${leaveDetails?.updatedAt} at ${leaveDetails?.updatedAtTime}`
          : ""
      }`;

      await pdf(
        leaveDetails,
        pdfName,
        "employeeLeavePdf",
        false,
        false,
        stampLogo,
        footerContent
      );

      const clientEmails = leaveDetails?.employeeDetail?.client?.titreDeConge?.split(",") || [];
      const loginEmail = employee?.loginUserData?.email;
      const emails = Array.from(new Set([
        ...clientEmails,
        ...(loginEmail ? [loginEmail] : []),
        "admin@lred.com"
      ]));

      const replacement = {
        client: leaveDetails?.employeeDetail?.client?.loginUserData?.name,
        firstName: leaveDetails?.employeeDetail?.loginUserData?.firstName,
        lastName: leaveDetails?.employeeDetail?.loginUserData?.lastName,
        employeeNumber: leaveDetails?.employeeDetail?.employeeNumber,
        email: leaveDetails?.employeeDetail?.loginUserData?.email,
        mailHeader: `Employee Leave Details`,
        logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
        checkReliquatUrl: "",
        message: `Please find attached Titre de Congé for ${
          leaveDetails?.employeeDetail?.loginUserData?.firstName
        } ${leaveDetails?.employeeDetail?.loginUserData?.lastName}.<br>Reference: ${
          data.reference
        }<br>${moment(data.startDate).format("DD MMMM YYYY")} - ${
          moment(data.endDate).add(1, "days").format("DD MMMM YYYY")
        }<br>Submitted By <a href="mailto:${leaveDetails?.createdByUser?.loginUserData?.email}">${
          leaveDetails?.createdByUser?.loginUserData?.email
        }</a><br>LRED Timesheet System`,
      };

      const publicFolder = path.join(__dirname, "../../secure-file/");
      folderExistCheck(publicFolder);
      const filePath = path.join(publicFolder, `employeeLeavePdf/${pdfName}`);

      if (emails.length > 0) {
        // await sendMail(emails, "Leave Details", "generalMailTemplate", replacement, [{ path: filePath }]);
      } else {
        fileDelete(filePath);
      }

      console.log("PDF handling and email sending complete");
    }

    console.log("STEP 6: Logging history");

    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE_LEAVE,
      moduleName: moduleName.TITREDECONGE,
      userId: user.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created</b> a leave for employee ${employee?.loginUserData?.firstName} ${employee?.loginUserData?.lastName}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    console.log("Leave successfully processed and saved");

    return data;
  } catch (error) {
    console.error("Error in addEmployeeLeave:", error);
    throw new Error(error);
  }
}



  // updateEmployeeLeave
  async updateEmployeeLeave(
    { body, user, id }: { body: IEmployeeLeaveCreate; user: User; id: number },
    transaction: Transaction = null
  ) {
    try {
      const isExistEmployeeLeave = await EmployeeLeave.findOne({
        where: {
          id: id,
          deletedAt: null,
        },
        include: [
          {
            model: User,
            as: "createdByUser",
            attributes: ["id"],
            include: [{ model: LoginUser, attributes: ["email"] }],
          },
          {
            model: Employee,
            attributes: ["employeeNumber", "loginUserId", "clientId"],
            include: [
              {
                model: LoginUser,
                attributes: ["firstName", "lastName", "email"],
              },
              {
                model: Client,
                attributes: ["id", "titreDeConge"],
                include: [{ model: LoginUser, attributes: ["name"] }],
              },
            ],
          },
        ],
        transaction,
      }).then((dat) => parse(dat));
      if (!isExistEmployeeLeave) {
        throw new HttpException(404, this.msg.notFound);
      }
      const oldLeaveStartDate = moment(
        moment(isExistEmployeeLeave.startDate).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate();
      const oldLeaveEndDate = moment(
        moment(isExistEmployeeLeave.endDate).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate();
      await TimesheetSchedule.update(
        { status: "P", isLeaveForTitreDeConge: false },
        {
          where: {
            date: {
              [Op.or]: {
                [Op.between]: [oldLeaveStartDate, oldLeaveEndDate],
                // [Op.eq]: oldLeaveStartDate,
                // [Op.eq]: oldLeaveEndDate,
              },
            },
            employeeId: isExistEmployeeLeave.employeeId,
          },
          transaction,
          individualHooks: true,
        }
      );

      // ***************************Update Employee Leave Email Functionality***************************
      const leaveStartDate = moment(
        moment(body.startDate).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate();
      const leaveEndDate = moment(
        moment(body.endDate).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate();
      body = { ...body, startDate: leaveStartDate, endDate: leaveEndDate };
      const updateEmployeeLeave = await EmployeeLeave.update(
        {
          ...body,
          updatedBy: user.id,
          updatedAt: moment(
            moment().format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
        },
        {
          where: { id: id, status: employeeLeaveStatus.ACTIVE },
          transaction,
          individualHooks: true,
        }
      );
      let employeeLeaveDetails: EmployeeLeavePdfAttributes;
      if (updateEmployeeLeave) {
        employeeLeaveDetails = await this.getEmployeeLeavePdfData(
          id,
          null,
          transaction
        );
        employeeLeaveDetails = parse(employeeLeaveDetails);
        const date = moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").format(
          "D MMMM YYYY"
        );
        employeeLeaveDetails.date = date;
        let emails = [];
        const pdfName = `${moment().unix()}-titre-de-conge.pdf`;
        const resizeHeaderFooter = false;
        const footerContent = `Submitted by ${
          employeeLeaveDetails.createdByUser.loginUserData.name
        } on ${employeeLeaveDetails.createdAt} at ${
          employeeLeaveDetails.createdAtTime
        } ${
          employeeLeaveDetails.status === "CANCELLED"
            ? `, cancelled by ${employeeLeaveDetails.updatedByUser.loginUserData.name} on ${employeeLeaveDetails.updatedAt} at ${employeeLeaveDetails.updatedAtTime}`
            : ""
        }`;
        const stampLogo =
          employeeLeaveDetails?.employeeDetail?.client?.stampLogo !== null
            ? SERVER_URL +
              employeeLeaveDetails?.employeeDetail?.client?.stampLogo
            : null;
        await pdf(
          employeeLeaveDetails,
          `${pdfName}`,
          "employeeLeavePdf",
          false,
          resizeHeaderFooter,
          stampLogo,
          footerContent
        );

        if (
          employeeLeaveDetails?.employeeDetail?.client?.titreDeConge &&
          employeeLeaveDetails?.employeeDetail?.client?.titreDeConge !== ""
        ) {
          emails = employeeLeaveDetails.employeeDetail.client.titreDeConge.split(
            ","
          );
          // emails.unshift(isExistEmployeeLeave?.loginUserData?.email);
        }
        if (
          employeeLeaveDetails?.employeeDetail?.loginUserData?.email &&
          !emails.includes(
            employeeLeaveDetails?.employeeDetail?.loginUserData?.email
          )
        ) {
          emails.push(
            employeeLeaveDetails?.employeeDetail?.loginUserData?.email
          );
        }
        if (!emails.includes("admin@lred.com")) {
          emails.push("admin@lred.com");
        }

        const replacement = {
          client: employeeLeaveDetails.employeeDetail.client.loginUserData.name,
          firstName:
            employeeLeaveDetails.employeeDetail.loginUserData.firstName,
          lastName: employeeLeaveDetails.employeeDetail.loginUserData.lastName,
          employeeNumber: employeeLeaveDetails.employeeDetail.employeeNumber,
          email: employeeLeaveDetails.employeeDetail.loginUserData.email,
          mailHeader: `Employee Leave Details`,
          logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          checkReliquatUrl: "",
          message: `Please find attached Titre de Congé for ${
            employeeLeaveDetails.employeeDetail.loginUserData.firstName
          } ${
            employeeLeaveDetails.employeeDetail.loginUserData.firstName
          }. <br>Reference: ${isExistEmployeeLeave.reference} <br>${moment(
            isExistEmployeeLeave.startDate
          ).format("DD MMMM YYYY")}-${moment(isExistEmployeeLeave.endDate)
            .add(1, "days")
            .format("DD MMMM YYYY")} <br>Submitted By <a href="mailto:${
            employeeLeaveDetails.createdByUser.loginUserData.email
          }">${
            employeeLeaveDetails.createdByUser.loginUserData.email
          }</a> <br>LRED Timesheet System`,
        };
        const publicFolder = path.join(__dirname, "../../secure-file/");
        folderExistCheck(publicFolder);
        const filePath = path.join(publicFolder, `employeeLeavePdf/${pdfName}`);
        if (emails && emails.length > 0) {
          // sendMail(emails, 'Leave Details', 'generalMailTemplate', replacement, [{ path: filePath }]);
        } else {
          fileDelete(filePath);
        }
      }

      // *****************************************************************************************

      await createHistoryRecord({
        tableName: tableEnum.EMPLOYEE_LEAVE,
        moduleName: moduleName.TITREDECONGE,
        userId: user?.id,
        custom_message: await customHistoryUpdateMesage(
          body,
          isExistEmployeeLeave,
          user,
          updateEmployeeLeave,
          tableEnum.EMPLOYEE_LEAVE
        ),
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(isExistEmployeeLeave),
        activity: statusEnum.UPDATE,
      });
      return employeeLeaveDetails;
    } catch (error) {
      throw new Error(error);
    }
  }
  // updateTimesheetsAndAccounts

  async updateTimesheetAndAccounts(
    { body, user }: { body: IEmployeeLeaveCreate; user: User },
    transaction: Transaction = null
  ) {
    try {
      const timesheetData = await Timesheet.findAll({
        where: {
          employeeId: body.employeeId,
          [Op.and]: {
            [Op.or]: [
              {
                startDate: {
                  [Op.between]: [body.startDate, body.endDate],
                },
              },
              {
                endDate: {
                  [Op.between]: [body.startDate, body.endDate],
                },
              },
              {
                startDate: {
                  [Op.lte]: body.startDate,
                },
                endDate: {
                  [Op.gte]: body.endDate,
                },
              },
            ],
          },
        },
        include: [
          {
            model: Client,
            attributes: ["id", "isCountCR"],
          },
        ],
        transaction,
      });
      console.log("step 1", parse(timesheetData));
      let responseData;

      if (timesheetData?.length > 0) {
        for (const timesheet of timesheetData) {
          let getTimesheetScheduleData = await TimesheetSchedule.findAll({
            where: {
              date: {
                [Op.or]: {
                  [Op.between]: [timesheet.startDate, timesheet.endDate],
                  // [Op.eq]: timesheet.startDate,
                  // [Op.eq]: timesheet.endDate,
                },
              },
              employeeId: body?.employeeId,
            },
            transaction,
          });
          getTimesheetScheduleData = parse(getTimesheetScheduleData);
          const timesheetScheduleIds = getTimesheetScheduleData.map((e) => {
            return e.id;
          });
          const isTimesheetApproved = timesheet?.status === "APPROVED";
          const timesheetScheduleData = getTimesheetScheduleData.filter(
            (data: { status: string; date: Date | string }) =>
              data.status === "P" &&
              moment(data?.date).isBetween(
                timesheet.startDate,
                timesheet.endDate,
                null,
                "[]"
              )
          );
          if (isTimesheetApproved && timesheetScheduleData.length > 0) {
            console.log("condition 1 called------------");
            const timesheetUpdateIds = timesheetScheduleData.map((e) => {
              return e.id;
            });
            responseData = await this.TimesheetScheduleService.updateTimesheetScheduleById(
              timesheetUpdateIds,
              body.leaveType,
              user as User,
              true,
              false,
              false,
              transaction
            );
            let empids = responseData.map((dat) => dat.employeeId);
            empids = empids.filter(
              (item, index) => empids.indexOf(item) === index
            );

            await this.TimesheetService.generateReliquetResponse(
              user,
              empids,
              transaction,
              null,
              timesheetUpdateIds
            );
          } else if (isTimesheetApproved && timesheetScheduleIds?.length > 0) {
            console.log("condition 2 called------------");
            responseData = await this.TimesheetScheduleService.updateTimesheetScheduleById(
              timesheetScheduleIds,
              body.leaveType,
              user as User,
              true,
              false,
              false,
              transaction
            );
            let empids = responseData.map((dat) => dat.employeeId);
            empids = empids.filter(
              (item, index) => empids.indexOf(item) === index
            );
            // const date = responseData[0]?.date;

            await this.TimesheetService.generateReliquetResponse(
              user,
              empids,
              transaction,
              null,
              timesheetScheduleIds
            );

            // await this.TimesheetService.getTimesheetDataForAccount(user, empids, date, transaction);
          } else {
            console.log("condition 3 called------------");
            responseData = await this.TimesheetScheduleService.updateTimesheetScheduleByEmployeeId(
              {
                startDate: moment(body?.startDate).toDate(),
                endDate: moment(body?.endDate).toDate(),
                employeeId: body?.employeeId,
                updateStatus: body.leaveType,
                isBonus: false,
                isTimesheetApplied: false,
                user: user as User,
                transaction,
              }
            );
            // const date = responseData[0]?.date;

            // await this.TimesheetService.getTimesheetDataForAccount(user as User, [body?.employeeId], date, transaction);
            await this.TimesheetService.generateReliquetResponse(
              user as User,
              [body?.employeeId],
              transaction,
              null,
              [responseData[0]?.id]
            );
          }
        }
      }

      // if (timesheetData?.length > 0) {
      // 	const isTimesheetApproved = timesheetData?.findIndex((data) => {
      // 		return data?.status === 'APPROVED';
      // 	});

      // if (isTimesheetApproved >= 0 && timesheetScheduleData.status === 'P') {

      // 	const timesheetId = timesheetData[isTimesheetApproved]?.id;
      // 	const isCountCR = timesheetData[isTimesheetApproved]?.client?.isCountCR;
      // 	const timesheetStartDate = timesheetData[isTimesheetApproved]?.startDate;
      // 	const timesheetEndDate = timesheetData[isTimesheetApproved]?.endDate;
      // 	await this.updateAccountPos(
      // 		{
      // 			body,
      // 			timesheetId,
      // 			isCountCR,
      // 			timesheetStartDate,
      // 			timesheetEndDate,
      // 		},
      // 		transaction,
      // 	);
      // }
      // }
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateAccountPos(
    {
      body,
      timesheetId,
      isCountCR,
      timesheetStartDate,
      timesheetEndDate,
    }: {
      body: IEmployeeLeaveCreate;
      timesheetId: number;
      isCountCR: boolean;
      timesheetStartDate: Date;
      timesheetEndDate: Date;
    },
    transaction: Transaction = null
  ) {
    try {
      const timesheetData = await TimesheetSchedule.findAll({
        where: {
          employeeId: body?.employeeId,
          date: {
            [Op.or]: {
              [Op.between]: [timesheetStartDate, timesheetEndDate],
              [Op.eq]: timesheetEndDate,
            },
          },
        },
        transaction,
      });
      if (timesheetData?.length > 0) {
        const status = timesheetData?.filter((presentDays) => {
          return (
            (presentDays.status === "P" ||
              (isCountCR ? presentDays.status === "CR" : "")) &&
            (presentDays?.bonusCode === null ||
              presentDays?.bonusCode === "O1" ||
              presentDays?.bonusCode === "O2")
          );
        });
        const totalPresentDays = status?.length || 0;
        await AccountPO.update(
          {
            timesheetQty: totalPresentDays,
          },
          {
            where: {
              timesheetId: timesheetId,
              type: "Salary",
            },
            transaction,
          }
        );
      }
      return;
    } catch (error) {
      throw error;
    }
  }

  async updateEmployeeLeaveStatus(
    { user, id }: { user: User; id: number },
    transaction: Transaction = null
  ) {
    const isExistEmployeeLeave = await EmployeeLeave.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      transaction,
      include: [
        {
          model: User,
          as: "createdByUser",
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["email"] }],
        },
        {
          model: Employee,
          attributes: ["employeeNumber", "loginUserId", "clientId"],
          include: [
            {
              model: LoginUser,
              attributes: ["firstName", "lastName", "email"],
            },
            {
              model: Client,
              attributes: ["id", "titreDeConge"],
              include: [{ model: LoginUser, attributes: ["name"] }],
            },
          ],
        },
      ],
    }).then((dat) => parse(dat));

    if (!isExistEmployeeLeave) {
      throw new HttpException(404, this.msg.notFound);
    }

    const employeeStatus = await EmployeeLeave.update(
      { status: employeeLeaveStatus.CANCELLED, updatedBy: user.id },
      {
        where: { id: id, status: employeeLeaveStatus.ACTIVE },
        transaction,
        individualHooks: true,
      }
    );

    let employeeLeaveDetails: EmployeeLeavePdfAttributes;
    if (employeeStatus) {
      employeeLeaveDetails = await this.getEmployeeLeavePdfData(id);
      const date = moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").format(
        "D MMMM YYYY"
      );
      employeeLeaveDetails.status = employeeLeaveStatus.CANCELLED;
      employeeLeaveDetails.date = date;
      const pdfName = `${moment().unix()}-titre-de-conge.pdf`;
      const stampLogo =
        employeeLeaveDetails?.employeeDetail?.client?.stampLogo !== null
          ? SERVER_URL + employeeLeaveDetails?.employeeDetail?.client?.stampLogo
          : null;
      await pdf(
        employeeLeaveDetails,
        `${pdfName}`,
        "employeeLeavePdf",
        false,
        false,
        stampLogo
      );
      let emails = [];
      if (
        employeeLeaveDetails?.employeeDetail?.client?.titreDeConge &&
        employeeLeaveDetails?.employeeDetail?.client?.titreDeConge !== ""
      ) {
        emails = employeeLeaveDetails?.employeeDetail?.client?.titreDeConge.split(
          ","
        );
        // emails.unshift(isExistEmployeeLeave.employeeDetail.loginUserData.email);
      }
      if (
        employeeLeaveDetails?.employeeDetail?.loginUserData?.email &&
        !emails.includes(
          employeeLeaveDetails?.employeeDetail?.loginUserData?.email
        )
      ) {
        emails.push(employeeLeaveDetails?.employeeDetail?.loginUserData?.email);
      }
      if (!emails.includes("admin@lred.com")) {
        emails.push("admin@lred.com");
      }

      const replacement = {
        client: isExistEmployeeLeave.employeeDetail.client.loginUserData.name,
        firstName: isExistEmployeeLeave.employeeDetail.loginUserData.firstName,
        lastName: isExistEmployeeLeave.employeeDetail.loginUserData.lastName,
        employeeNumber: isExistEmployeeLeave.employeeDetail.employeeNumber,
        email: isExistEmployeeLeave.employeeDetail.loginUserData.email,
        mailHeader: `Employee Leave Details`,
        logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
        checkReliquatUrl: "",
        message: `The attached Titre de Congé for ${
          isExistEmployeeLeave.employeeDetail.loginUserData.firstName
        } ${
          isExistEmployeeLeave.employeeDetail.loginUserData.lastName
        } has been cancelled. <br>Reference: ${
          isExistEmployeeLeave.reference
        } <br>${moment(isExistEmployeeLeave.startDate).format(
          "DD MMMM YYYY"
        )}-${moment(isExistEmployeeLeave.endDate)
          .add(1, "days")
          .format("DD MMMM YYYY")} <br>Submitted By <a href="mailto:${
          isExistEmployeeLeave.createdByUser.loginUserData.email
        }">${
          isExistEmployeeLeave.createdByUser.loginUserData.email
        }</a> <br>LRED Timesheet System`,
      };
      const publicFolder = path.join(__dirname, "../../secure-file/");
      folderExistCheck(publicFolder);
      const filePath = path.join(publicFolder, `employeeLeavePdf/${pdfName}`);
      if (emails && emails.length > 0) {
        // sendMail(emails, 'Leave Details', 'generalMailTemplate', replacement, [{ path: filePath }]);
      } else {
        fileDelete(filePath);
      }
    }

    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE_LEAVE,
      moduleName: moduleName.TITREDECONGE,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${formatKeyString(tableEnum.EMPLOYEE_LEAVE)}, Employee Leave Status`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isExistEmployeeLeave),
      activity: statusEnum.UPDATE,
    });

    return isExistEmployeeLeave;
  }

  async getEmployeeLastLeaveByEmployeeId(id: number) {
    try {
      let data = await EmployeeLeave.findOne({
        where: {
          employeeId: id,
          deletedAt: null,
        },
        include: [
          {
            model: Employee,
            attributes: ["terminationDate"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      data = parse(data);
      let reliquatCalculation = null;
      reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService(
        {
          employeeId: String(id),
          date: moment(
            moment(data?.endDate).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
        }
      );
      const finalData = { ...data, reliquatCalculation };
      return finalData;
    } catch (error) {
      throw new Error(error);
    }
  }
}