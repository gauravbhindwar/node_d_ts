import { FRONTEND_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import TimesheetController from "@/controllers/timesheet.controller";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryDeleteMessage
} from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";
import { DefaultRoles } from "@/interfaces/functional/feature.interface";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  clientTypeEnum,
  IClientCreate,
} from "@/interfaces/model/client.interface";
import {
  client_attendance_type,
  clientNewCreateType,
  employee_type,
} from "@/interfaces/model/clientleavetype.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { queueStatus } from "@/interfaces/model/queue.interface";
import { status } from "@/interfaces/model/user.interface";
import db from "@/models";
import Account from "@/models/account.model";
import AttendanceTypeModel from "@/models/attendanceType.model";
import BonusTypeMaster from "@/models/bonusTypesMaster.model";
import ClientAttendanceType from "@/models/clientNewAttendance.model";
import ClientTimesheetStartDay from "@/models/clientTimesheetStartDay.model";
import Contact from "@/models/contact.model";
import ContractTemplate from "@/models/contractTemplete.model";
import ContractTemplateVersion from "@/models/contractTempleteVersion.model";
import Employee from "@/models/employee.model";
import EmployeeContract from "@/models/employeeContract.model";
import EmployeeFile from "@/models/employeeFile.model";
import EmployeeLeave from "@/models/employeeLeave.model";
import EmployeeRotation from "@/models/employeeRotation.model";
import EmployeeSalary from "@/models/employeeSalary.model";
import EmployeeSegment from "@/models/employeeSegment.model";
import ErrorLogs from "@/models/errorLogs.model";
import HolidayTypeMaster from "@/models/holidayTypes.model";
import ImportLog from "@/models/importLog.model";
import ImportLogItems from "@/models/importLogItem.model";
import LeaveTypeMaster from "@/models/leaveType.model";
import LoginUser from "@/models/loginUser.model";
import MedicalRequest from "@/models/medicalRequest.model";
import Message from "@/models/message.model";
import MessageDetail from "@/models/messageDetail.model";
import Queue from "@/models/queue.model";
import ReliquatAdjustment from "@/models/reliquatAdjustment.model";
import ReliquatCalculation from "@/models/reliquatCalculation.model";
import ReliquatCalculationV2 from "@/models/reliquatCalculationV2.model";
import ReliquatPayment from "@/models/reliquatPayment.model";
import RequestDocument from "@/models/request.document.model";
import Request from "@/models/request.model";
import Role from "@/models/role.model";
import RolePermission from "@/models/rolePermission.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import TimesheetSchedule from "@/models/timesheetSchedule.model";
import TransportCapacity from "@/models/transport.capacity.model";
import TransportDriverDocument from "@/models/transport.driver.document.model";
import TransportDriver from "@/models/transport.driver.model";
import TransportModels from "@/models/transport.models.model";
import TransportPositions from "@/models/transport.positions.model";
import TransportRequest from "@/models/transport.request.model";
import TransportRequestVehicle from "@/models/transport.request.vehicle.model";
import TransportType from "@/models/transport.type.model";
import TransportVehicleDocument from "@/models/transport.vehicle.document.model";
import TransportVehicle from "@/models/transport.vehicle.model";
import User from "@/models/user.model";
import UserClient from "@/models/userClient.model";
import UserPermission from "@/models/userPermission.model";
import UserSegment from "@/models/userSegment.model";
import UserSegmentApproval from "@/models/userSegmentApproval.model";
import {
  fileDelete,
  generateUniquePassword,
  getClientAccessForUser,
  parse,
} from "@/utils/common.util";
import { generateModalData } from "@/utils/generateModal";
import * as bcrypt from "bcrypt";
import _ from "lodash";
import moment from "moment";
import { col, fn, Op, Transaction } from "sequelize";
import slugify from "slugify";
import { default as Client } from "../models/client.model";
import BaseRepository from "./base.repository";
import TimesheetRepo from "./timesheet.repository";
import UserRepo from "./user.repository";

export default class ClientRepo extends BaseRepository<Client> {
  constructor() {
    super(Client.name);
  }

  private msg = new MessageFormation("Client").message;
  private TimesheetService = new TimesheetRepo();
  private TimesheetController = new TimesheetController();
  private userRepository = new UserRepo();

  private getparentClientData = async (data: any) => {
    let parentClient = await LoginUser.findOne({
      where: {
        id: data.parentClientId,
      },
    });
    parentClient = parse(parentClient);
    return {
      id: parentClient.id,
      name: parentClient.name,
      email: parentClient.email,
      timezone: parentClient.timezone,
    };
  };

  private getApprovalUsers = async (clientId: number) => {
    const role = await Role.findOne({
      where: {
        name: "Approvals",
      },
      attributes: ["id", "name"],
    }).then((roleData) => parse(roleData));
    let result = await UserClient.findAll({
      include: [
        {
          model: User,
          as: "userData",
          include: [
            {
              model: LoginUser,
              as: "loginUserData",
              attributes: ["id", "name", "email"],
            },
          ],
          attributes: ["id", "loginUserId"],
        },
      ],
      where: {
        clientId: clientId,
        roleId: role?.id,
      },
    });
    result = parse(result).map((el) => el.userData.loginUserData);
    return result;
  };

  async getAllClientService(query: IQueryParameters, user: User) {
    const {
      page,
      limit,
      isActive,
      sortBy,
      sort,
      search,
      country,
      // currency,
      clienttype,
      // segment,
      // subSegment,
      startDate,
      endDate,
      clientId,
      subClientId,
      // name,
    } = query;
    const clientIds = getClientAccessForUser(user);

    const sortedColumn = sortBy || null;
    // for matching to exist db startdate and endDate format as it also includes time zone
    const start = startDate
      ? new Date(startDate + "T00:00:00Z").toISOString()
      : undefined;
    const end = endDate
      ? new Date(endDate + "T23:59:59Z").toISOString()
      : undefined;

    const prentClient = clientId ? await Client.findByPk(clientId) : null;

    let data = await this.getAllData({
      where: {
        deletedAt: null,
        ...(isActive != undefined && { isActive: isActive }),
        ...(clientIds?.length > 0 && { id: { [Op.in]: clientIds } }),
        ...(prentClient
          ? {
              [Op.or]: [
                { parentClientId: prentClient.loginUserId },
                ...(clientId && [{ id: clientId }]),
              ],
            }
          : clientId
          ? { id: clientId }
          : {}),
        ...(subClientId && { id: subClientId }),
        ...(search &&
          search.trim() && {
            [Op.or]: [
              // {
              //   country: {
              //     [Op.iLike]: "%" + search.trim().toLowerCase() + "%",
              //   },
              // },
              {
                clientName: {
                  [Op.iLike]: "%" + search.trim().toLowerCase() + "%",
                },
              },
              // {
              //   clientEmail: {
              //     [Op.iLike]: "%" + search.trim().toLowerCase() + "%",
              //   },
              // },
              // {
              //   clienttype: {
              //     [Op.iLike]: "%" + search.trim().toLowerCase() + "%",
              //   },
              // },
            ],
          }),
        ...(country &&
          country.trim() && {
            country: { [Op.iLike]: "%" + country.trim().toLowerCase() + "%" },
          }),
        ...(clienttype &&
          clienttype.trim() && {
            clienttype: clienttype.trim().toLowerCase(),
          }),
        // ...(segment &&
        //   segment.trim() && {
        //     segment: { [Op.iLike]: "%" + segment.trim().toLowerCase() + "%" },
        //   }),
        // ...(subSegment &&
        //   subSegment.trim() && {
        //     subSegment: {
        //       [Op.iLike]: "%" + subSegment.trim().toLowerCase() + "%",
        //     },
        // }),
        ...(start && {
          startDate: { [Op.gte]: new Date(start).toISOString() },
        }),
        ...(end && { endDate: { [Op.lte]: new Date(end).toISOString() } }), // Filter endDate <= given endDate
      },
      include: [
        { model: ClientTimesheetStartDay },
        {
          model: LoginUser,
          as: "loginUserData",
          required: true,
          // where: {
          //   ...(search && {
          //     name: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
          //   }),
          //   ...(name &&
          //     name.trim() && {
          //       name: { [Op.iLike]: "%" + name.trim().toLowerCase() + "%" },
          //     }),
          // },
          attributes: ["email", "timezone", "name"],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "code", sort ?? "asc"]],
    });
    data = parse(data);

    for (const index in data?.rows) {
      data.rows[index]["parentClient"] = data?.rows[index]?.parentClientId
        ? await this.getparentClientData(data?.rows[index])
        : {};
      data.rows[index]["approvalUsers"] = await this.getApprovalUsers(
        data.rows[index].id
      );
    }
    const responseObj = {
      data: data?.rows,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    // await createHistoryRecord({
    //   tableName: tableEnum.CLIENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.CLIENT, `All Client Data!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    return responseObj;
  }

  async findAllClientForSearchDropdown(query: IQueryParameters, user: User) {
    const { isActive } = query;
    const clientIds = getClientAccessForUser(user);
    const data = await this.getAll({
      where: {
        deletedAt: null,
        ...(isActive != undefined && { isActive: isActive }),
        ...(clientIds?.length > 0 && { id: { [Op.in]: clientIds } }),
      },
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: ["name"],
        },
      ],
    });
    const dropdownData = data?.map((finalData) => {
      return {
        label: `${finalData?.loginUserData?.name}`,
        value: `${finalData?.loginUserData?.name}`,
      };
    });
    return dropdownData;
  }

  async getAllClientData(user: User) {
    let detailedUserData = await this.userRepository.get({
      where: { id: user?.id },
      include: [
        {
          model: UserClient,
          attributes: ["clientId"],
        },
        {
          model: UserSegment,
          attributes: ["id", "segmentId", "subSegmentId"],
        },
      ],
      attributes: ["id", "loginUserId", "roleId", "status"],
      rejectOnEmpty: false,
    });
    detailedUserData = parse(detailedUserData);
    const clientId = getClientAccessForUser(detailedUserData);
    if (user.roleData.name === DefaultRoles.Employee) {
      const employee = await Employee.findAll({
        where: { loginUserId: user.loginUserId },
      });
      if (employee?.length > 0) {
        for (const employeeData of employee) {
          if (!clientId.includes(employeeData?.clientId)) {
            clientId.push(employeeData?.clientId);
          }
        }
      }
    }
    if (user.roleData.name === DefaultRoles.Client) {
      const client = await Client.findOne({
        where: { loginUserId: user.loginUserId },
      });
      if (client?.id && !clientId.includes(client?.id)) {
        clientId.push(client?.id);
      }
    }
    let data = await this.getAllData({
      where: {
        isActive: true,
        deletedAt: null,
        ...(clientId?.length > 0 && { id: { [Op.in]: clientId } }),
      },
      include: [
        {
          model: LoginUser,
          as: "loginUserData",
          required: true,
          attributes: ["email", "timezone", "name"],
        },
        { model: ClientTimesheetStartDay },
      ],
      attributes: [
        "id",
        "slug",
        "code",
        "startDate",
        "endDate",
        "autoUpdateEndDate",
        "isShowSalaryInfo",
        "isShowCarteChifa",
        "isShowBalance",
        "weekendDays",
        "isAllDays",
        "isShowPrices",
        "isShowNSS",
        "isCountCR",
        "isShowRotation",
        "clienttype",
      ],
      order: [
        [{ model: LoginUser, as: "loginUserData" }, "name", "ASC"],
        ["clientTimesheetStartDay", "date", "asc"],
      ],
    });
    // await createHistoryRecord({
    //   tableName: tableEnum.CLIENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.CLIENT, `Specific Client Data!`),
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

  async getClientDataNew(user: User) {
    let detailedUserData = await this.userRepository.get({
      where: { id: user?.id },
      include: [
        {
          model: UserClient,
          attributes: ["clientId"],
        },
        {
          model: UserSegment,
          attributes: ["id", "segmentId", "subSegmentId"],
        },
      ],
      attributes: ["id", "loginUserId", "roleId", "status"],
      rejectOnEmpty: false,
    });
    detailedUserData = parse(detailedUserData);
    const clientId = getClientAccessForUser(detailedUserData);
    if (user.roleData.name === DefaultRoles.Employee) {
      const employee = await Employee.findAll({
        where: { loginUserId: user.loginUserId },
      });
      if (employee?.length > 0) {
        for (const employeeData of employee) {
          if (!clientId.includes(employeeData?.clientId)) {
            clientId.push(employeeData?.clientId);
          }
        }
      }
    }
    if (user.roleData.name === DefaultRoles.Client) {
      const client = await Client.findOne({
        where: { loginUserId: user.loginUserId },
      });
      if (client?.id && !clientId.includes(client?.id)) {
        clientId.push(client?.id);
      }
    }
    let data = await this.getAllData({
      where: {
        isActive: true,
        deletedAt: null,
        clienttype: clientTypeEnum.CLIENT,
        ...(clientId?.length > 0 && { id: { [Op.in]: clientId } }),
      },
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: ["email", "timezone", "name"],
        },
        { model: ClientTimesheetStartDay },
      ],
      attributes: [
        "id",
        "slug",
        "code",
        "startDate",
        "endDate",
        "autoUpdateEndDate",
        "isShowSalaryInfo",
        "isShowCarteChifa",
        "isShowBalance",
        "weekendDays",
        "isAllDays",
        "isShowPrices",
        "isShowNSS",
        "isCountCR",
        "isShowRotation",
        "clienttype",
      ],
      order: [
        [{ model: LoginUser, as: "loginUserData" }, "name", "ASC"],
        ["clientTimesheetStartDay", "date", "asc"],
      ],
    });
    // await createHistoryRecord({
    //   tableName: tableEnum.CLIENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.CLIENT, `Specific Client Data!`),
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

  async getSubClientDataByClientId(clientId: string, user: User) {
    try {
      const isFound = await Client.findOne({
        where: { id: clientId, deletedAt: null },
      });
      if (!isFound) {
        throw new HttpException(404, this.msg.notFound);
      }
      let data = await Client.findAll({
        where: {
          parentClientId: isFound?.loginUserId,
          isActive: true,
          deletedAt: null,
          clienttype: clientTypeEnum.SUB,
        },
        attributes: [
          "id",
          "slug",
          "code",
          "startDate",
          "endDate",
          "autoUpdateEndDate",
          "isShowSalaryInfo",
          "isShowCarteChifa",
          "isShowBalance",
          "weekendDays",
          "isAllDays",
          "isShowPrices",
          "isShowNSS",
          "isCountCR",
          "isShowRotation",
          "clienttype",
        ],
        include: [
          {
            model: LoginUser,
            as: "loginUserData",
            attributes: ["email", "timezone", "name"],
          },
        ],
        order: [[{ model: LoginUser, as: "loginUserData" }, "name", "ASC"]],
      });
      data = parse(data);

      const responseObj = {
        data: data,
        count: data?.length,
      };
      return responseObj;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getClientByIdService(
    id: number,
    user: User,
    transaction: Transaction = null
  ) {
    try {
      const isFound = await Client.findOne({
        where: { id: id, deletedAt: null },
        include: [
          {
            model: LoginUser,
            attributes: ["email", "timezone", "name"],
          },
        ],
        transaction,
      });
      if (!isFound) {
        throw new HttpException(404, this.msg.notFound);
      }
      const isQueueInProcess = await Queue.findOne({
        where: {
          clientId: id,
          status: {
            [Op.or]: [
              {
                [Op.eq]: queueStatus.INPROGRESS,
              },
              {
                [Op.eq]: queueStatus.RETAKE,
              },
              {
                [Op.eq]: queueStatus.PENDING,
              },
            ],
          },
        },
      });
      let data = parse(isFound);
      if (isQueueInProcess) {
        data = { ...data, isUpdateInProcess: true };
      } else {
        data = { ...data, isUpdateInProcess: false };
      }
      if (data?.clienttype == "sub-client" && data?.parentClientId) {
        data["parentClient"] = await this.getparentClientData(data);
      }
      data["approvalUsers"] = await this.getApprovalUsers(data.id);
      // await createHistoryRecord({
      //   tableName: tableEnum.CLIENT,
      //   moduleName: moduleName.SETUP,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(user, tableEnum.CLIENT, `Specific Client Data!`),
      //   jsonData: parse(data),
      //   activity: statusEnum.VIEW,
      // });
      return data;
    } catch (error) {
      console.log("error", error);
      throw new Error(error);
    }
  }

  async getClientForTimesheet(id: number) {
    const isFound = await Client.findOne({
      where: { id: id, deletedAt: null },
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: ["email", "timezone", "name"],
        },
        { model: ClientTimesheetStartDay },
      ],
      order: [["clientTimesheetStartDay", "date", "asc"]],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    // await createHistoryRecord({
    //   tableName: tableEnum.CLIENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.CLIENT, `Specific Client For Timesheet Data!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    return data;
  }

  async getClientBySlugService(slug: string) {
    const isFound = await Client.findOne({
      where: { slug: slug, deletedAt: null },
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: ["email", "timezone", "name"],
        },
      ],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    if (data?.clienttype == "sub-client" && data?.parentClientId) {
      data["parentClient"] = await this.getparentClientData(data);
    }
    data["approvalUsers"] = await this.getApprovalUsers(data.id);
    // await createHistoryRecord({
    //   tableName: tableEnum.CLIENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.CLIENT, `Specific Client Data By Slug!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    return data;
  }

  async addClientService({ body, user }: { body: IClientCreate; user: User }) {
    const bodyData = _.omit(body, [
      "approvalEmail",
      "titreDeConge",
      "isShowPrices",
      "medicalEmailSubmission",
      "medicalEmailToday",
      "medicalEmailMonthly",
    ]);
    bodyData.startDate = moment(
      moment(bodyData?.startDate).format("DD-MM-YYYY"),
      "DD-MM-YYYY"
    ).toDate();
    bodyData.endDate = moment(
      moment(bodyData?.endDate).format("DD-MM-YYYY"),
      "DD-MM-YYYY"
    ).toDate();
    if (body.email) {
      const isExistEmail = await LoginUser.findOne({
        where: { email: { [Op.iLike]: body.email }, deletedAt: null },
      });
      if (isExistEmail) {
        throw new HttpException(
          200,
          "Email Already Exist in this platform",
          {},
          true
        );
      }
    }
    const isExist = await Client.findOne({
      where: { code: body.code.toString(), createdBy: user.id },
    });
    if (isExist) {
      throw new HttpException(200, "Client Code Already Exist", {}, true);
    }

    const uniqueSlug = body.name + body.code;

    const slug = slugify(uniqueSlug, { lower: true, replacement: "-" });
    const randomPassword = generateUniquePassword();
    const loginUserData = await LoginUser.create({
      email: body.email,
      name: body.name,
      timezone: body.timezone ? body.timezone : null,
      randomPassword: randomPassword,
      profileImage: body.logo ? body.logo : null,
      isMailNotification: false,
      uniqueLoginId: null,
    });
    const daysWorked = body.weekendDays ? body.weekendDays.split(",") : [];
    let isAllDays = false;

    if (daysWorked.length == 7) {
      isAllDays = true;
    }

    let data = await Client.create({
      ...bodyData,
      slug,
      loginUserId: loginUserData.id,
      clientName: loginUserData.name,
      clientEmail: loginUserData.email,
      isShowPrices: body.isShowPrices,
      weekendDays: body.weekendDays ? body.weekendDays : "",
      isAllDays: isAllDays,
      approvalEmail: body.approvalEmail ? body.approvalEmail.toString() : null,
      clienttype: body.clienttype, //client type field from body
      titreDeConge: body.titreDeConge ? body.titreDeConge.toString() : null,
      medicalEmailSubmission: body.medicalEmailSubmission
        ? body.medicalEmailSubmission.toString()
        : "",
      medicalEmailToday: body.medicalEmailToday
        ? body.medicalEmailToday.toString()
        : "",
      medicalEmailMonthly: body.medicalEmailMonthly
        ? body.medicalEmailMonthly.toString()
        : "",
      createdBy: user.id,
    });
    data = await this.getClientByIdService(data.id, user);
    await ClientTimesheetStartDay.create({
      clientId: data.id,
      timesheetStartDay: data.timeSheetStartDay,
      date: moment(
        moment(data.startDate).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate(),
      createdBy: user.id,
    });

    const roleData = await Role.findOne({
      where: {
        name: "Client",
        deletedAt: null,
      },
      include: {
        model: RolePermission,
        attributes: ["permissionId"],
      },
    });

    if (roleData) {
      const userData = await User.create({
        loginUserId: loginUserData.id,
        roleId: roleData.id,
        status: status.ACTIVE,
      });

      if (userData) {
        await UserClient.create({
          clientId: data.id,
          roleId: roleData.id,
          userId: userData.id,
          status: status.ACTIVE,
          createdBy: user.id,
        });
        for (const permissions of roleData.assignedPermissions) {
          await UserPermission.create({
            permissionId: permissions.permissionId,
            loginUserId: loginUserData.id,
            roleId: roleData.id,
            createdBy: user.id,
          });
          await UserPermission.create({
            clientId: data.id,
            permissionId: permissions.permissionId,
            loginUserId: loginUserData.id,
            roleId: roleData.id,
            createdBy: user.id,
          });
        }
        const replacement = {
          username: body.name,
          useremail: body.email,
          password: randomPassword,
          logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          url: FRONTEND_URL,
        };

        // if (body.email) {
        //   await sendMail(
        //     [body.email, "admin@lred.com"],
        //     "Credentials",
        //     "userCredentials",
        //     replacement
        //   );
        // }
      }
    }

    await createHistoryRecord({
      tableName: tableEnum.CLIENT,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryCreateMessage(
        user,
        tableEnum.CLIENT,
        loginUserData
      ),
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateClientStatus({
    body,
    id,
    user,
  }: {
    body: IClientCreate;
    id: number;
    user: User;
  }) {
    const isExistClient = await Client.findOne({ where: { id: id } });
    if (!isExistClient) {
      throw new HttpException(404, this.msg.notFound);
    }

    await Client.update(
      { isActive: body.isActive },
      { where: { id: id }, individualHooks: true }
    );
    const data = await this.getClientByIdService(id, user);
    await createHistoryRecord({
      tableName: tableEnum.CLIENT,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${
        user?.loginUserData?.name
      }</b> has <b>updated</b> the ${tableEnum.CLIENT}, isActive from ${
        body.isActive === true ? "false" : "true"
      } to ${body.isActive === true ? "true" : "false"}`,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
    return data;
  }

  async changeInEndDate(
    bodyData,
    isExistClient,
    transaction: Transaction = null
  ) {
    try {
      console.log(
        "Starting changeInEndDate for Client ID:",
        isExistClient.id,
        "with endDate:",
        bodyData?.endDate
      );
  
      if (!bodyData?.endDate) {
        console.error("Error: bodyData.endDate is undefined or null");
        throw new Error("Invalid endDate provided");
      }
  
      const ed = moment(bodyData.endDate, "YYYY-MM-DD", true);
      if (!ed.isValid()) {
        console.error("Error: Invalid endDate format", bodyData.endDate);
        throw new Error("Invalid endDate format");
      }
  
      let lastApprovedDate;
      if (ed.isSameOrBefore(moment().startOf("day"))) {
        console.log("Fetching last approved date before today");
        lastApprovedDate = await Timesheet.findOne({
          where: {
            clientId: isExistClient.id,
            startDate: {
              [Op.lte]: moment().startOf("day").toDate(),
            },
            status: "APPROVED",
          },
          order: [["endDate", "desc"]],
          transaction,
        });
      } else {
        console.log("Fetching last approved date before", ed.format("YYYY-MM-DD"));
        lastApprovedDate = await Timesheet.findOne({
          where: {
            clientId: isExistClient.id,
            startDate: {
              [Op.lt]: ed.toDate(),
            },
            status: "APPROVED",
          },
          order: [["endDate", "desc"]],
          transaction,
        });
      }
  
      console.log("Last approved timesheet:", lastApprovedDate);
      lastApprovedDate = parse(lastApprovedDate);
  
      let allEmp = await Employee.findAll({
        attributes: ["id"],
        where: {
          clientId: isExistClient.id,
        },
        transaction,
      });
      allEmp = parse(allEmp);
      console.log(`Found ${allEmp.length} employees for client.`);
  
      if (!lastApprovedDate || !lastApprovedDate.endDate) {
        console.warn("No approved timesheet found. Skipping deletions.");
        return;
      }
  
      const deleteStartDate = moment(lastApprovedDate.endDate).isSameOrBefore(ed)
        ? moment(lastApprovedDate.endDate)
        : ed;
      console.log("Deleting timesheets starting from:", deleteStartDate.format("YYYY-MM-DD"));
  
      await Timesheet.destroy({
        where: {
          clientId: isExistClient.id,
          startDate: {
            [Op.gte]: deleteStartDate.toDate(),
          },
        },
        transaction,
      });
      console.log("Timesheets deleted successfully.");
  
      console.log("Deleting timesheet schedules after:", deleteStartDate.format("YYYY-MM-DD"));
      await TimesheetSchedule.destroy({
        where: {
          employeeId: { [Op.in]: allEmp.map((dat) => dat.id) },
          date: {
            [Op.gt]: deleteStartDate.toDate(),
          },
        },
        transaction,
      });
      console.log("Timesheet schedules deleted successfully.");
  
      return;
    } catch (error) {
      console.error("Error in changeInEndDate:", error);
      throw new Error(error);
    }
  }
  
  async updateClientService({
    body,
    user,
    id,
  }: {
    body: IClientCreate;
    user: User;
    id: number;
  }) {
    const transaction = await db.transaction();
    try {
      console.log("Starting updateClientService for ID:", id);
  
      await generateModalData({
        user: user,
        percentage: 0,
        message: "Updating Client",
      });
  
      const bodyData = _.omit(body, [
        "approvalEmail",
        "titreDeConge",
        "medicalEmailSubmission",
        "isShowPrices",
        "medicalEmailToday",
        "medicalEmailMonthly",
      ]);
  
      const isExistClient = await Client.findOne({
        where: { id: id },
        include: [
          {
            model: LoginUser,
            attributes: ["email"],
          },
        ],
        transaction,
      });
  
      console.log("Fetched Client Data:", isExistClient);
  
      if (!isExistClient) {
        console.error("Client not found with ID:", id);
        throw new HttpException(404, this.msg.notFound);
      }
  
      // Debugging bodyData.endDate before processing
      console.log("Received startDate:", bodyData?.startDate);
      console.log("Received endDate:", bodyData?.endDate);
  
      if (!bodyData?.endDate) {
        throw new Error("End date is missing in request body");
      }
  
      try {
        bodyData.startDate = moment(
          moment(bodyData?.startDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();
  
        bodyData.endDate = moment(
          moment(bodyData?.endDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();
      } catch (dateError) {
        console.error("Error formatting dates:", dateError);
        throw new Error("Invalid date format in request body");
      }
  
      // Debugging formatted endDate
      console.log("Formatted endDate:", bodyData.endDate);
  
      bodyData.clienttype = body.clienttype;
  
      if (body.email) {
        const isExistEmail = await LoginUser.findOne({
          where: {
            email: { [Op.iLike]: body.email },
            id: { [Op.ne]: isExistClient.loginUserId },
            deletedAt: null,
          },
          transaction,
        });
  
        if (isExistEmail) {
          throw new HttpException(
            200,
            "Email Already Exists in this platform",
            {},
            true
          );
        }
      }
  
      let randomPassword: string;
      if (
        isExistClient?.loginUserData?.email !== bodyData?.email &&
        !isExistClient?.loginUserData?.password
      ) {
        randomPassword = generateUniquePassword();
      }
  
      await LoginUser.update(
        {
          email: bodyData.email,
          name: bodyData.name,
          timezone: bodyData.timezone ? bodyData.timezone : null,
          profileImage: bodyData.logo ? bodyData.logo : null,
          ...(randomPassword && {
            randomPassword: await bcrypt.hash(randomPassword, 10),
          }),
        },
        {
          where: { id: isExistClient.loginUserId },
          transaction,
          individualHooks: true,
        }
      );
  
      // Debugging client update
      console.log("Updating client with processed data...");
  
      await Client.update(
        {
          ...bodyData,
          isShowPrices: body.isShowPrices,
          clientEmail: bodyData.email,
          clientName: bodyData.name,
          updatedBy: user.id,
        },
        { where: { id: id }, transaction, individualHooks: true }
      );
  
      console.log("Client update successful.");
  
      if (!moment(isExistClient.endDate).isSame(bodyData.endDate)) {
        console.log("End date has changed. Processing updates...");
  
        if (moment(bodyData.endDate).isBefore(isExistClient.endDate)) {
          console.log("End date shortened. Updating timesheets...");
          await this.changeInEndDate(bodyData, isExistClient, transaction);
        } else {
          console.log("End date extended. Updating employees...");
        }
      }
  
      const data = await this.getClientByIdService(id, user, transaction);
  
      if (randomPassword) {
        if (bodyData?.email) {
          const replacement = {
            username: bodyData?.name,
            useremail: bodyData?.email,
            password: randomPassword,
            logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          };
          sendMail(
            [bodyData?.email, "admin@lred.com"],
            "Credentials",
            "userCredentials",
            replacement
          );
        }
      }
  
      await transaction.commit();
      console.log("Transaction committed successfully.");
      return data;
    } catch (error) {
      await transaction.rollback();
      console.error("Error in updateClientService:", error);
      throw new Error(error);
    }
  }
  

  async deleteClientService({ id, user }: { id: number; user: User }) {
    try {
      await db.transaction(async (transaction) => {
        const isFound = await Client.findOne({
          where: { id: id },
          transaction,
        });

        if (!isFound) {
          throw new HttpException(404, this.msg.notFound);
        }
        const EmployeeData = await Employee.findAll({
          where: { clientId: id },
          include: [{ model: LoginUser }],
          transaction,
        });
        const EmployeeIds = [];
        for (const data of EmployeeData) {
          EmployeeIds.push(data?.loginUserData?.id);
        }
        fileDelete(`public${isFound.logo}`);

        let employeeData = await Employee.findAll({
          where: { clientId: isFound.id, deletedAt: null },
          attributes: ["id"],
        });
        employeeData = parse(employeeData);
        const clientWiseEmployeeData = [];
        for (const data of employeeData) {
          clientWiseEmployeeData.push(data.id);
        }

        let segmentData = await Segment.findAll({
          where: {
            clientId: isFound.id,
            deletedAt: null,
          },
          attributes: ["id"],
        });
        segmentData = parse(segmentData);
        const clientWiseSegmentData = [];
        for (const data of segmentData) {
          clientWiseSegmentData.push(data.id);
        }

        let requestData = await Request.findAll({
          where: {
            clientId: isFound.id,
            deletedAt: null,
          },
          attributes: ["id"],
        });
        requestData = parse(requestData);
        const clientWiseRequestData = [];
        for (const data of requestData) {
          clientWiseRequestData.push(data.id);
        }

        let importData = await ImportLog.findAll({
          where: {
            clientId: isFound.id,
            deletedAt: null,
          },
          attributes: ["id"],
        });
        importData = parse(importData);
        const clientWiseimportLogData = [];
        for (const data of importData) {
          clientWiseimportLogData.push(data.id);
        }

        let versionData = await ContractTemplate.findAll({
          where: {
            clientId: isFound.id,
            deletedAt: null,
          },
          attributes: ["id"],
        });
        versionData = parse(versionData);
        const clientWiseVersionData = [];
        for (const data of versionData) {
          clientWiseVersionData.push(data.id);
        }

        const data = await Client.destroy({ where: { id: id }, transaction });
        await Promise.all([
          LoginUser.destroy({
            where: { id: isFound.loginUserId, deletedAt: null },
            transaction,
          }),
          User.destroy({
            where: { loginUserId: isFound.loginUserId },
            transaction,
          }),
          LoginUser.destroy({ where: { id: EmployeeIds }, transaction }), // Delete Employee Login User
          User.findAll({ where: { loginUserId: EmployeeIds }, transaction }), // Delete Employee User
          Contact.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          UserClient.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          Segment.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportCapacity.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportModels.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportType.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportPositions.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportVehicle.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportDriver.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportDriverDocument.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportVehicleDocument.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportRequest.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TransportRequestVehicle.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          Message.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          Account.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          Employee.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          Timesheet.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          Request.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ContractTemplate.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ReliquatAdjustment.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ReliquatCalculation.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ReliquatCalculationV2.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ReliquatPayment.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ImportLogItems.destroy({
            where: { importLogId: clientWiseimportLogData, deletedAt: null },
            transaction,
          }),
          ImportLog.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ErrorLogs.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          TimesheetSchedule.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          MedicalRequest.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          EmployeeFile.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          EmployeeRotation.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          EmployeeSegment.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          EmployeeSalary.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          EmployeeLeave.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          EmployeeContract.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          SubSegment.destroy({
            where: { segmentId: clientWiseSegmentData, deletedAt: null },
            transaction,
          }),
          RequestDocument.destroy({
            where: { requestId: clientWiseRequestData, deletedAt: null },
            transaction,
          }),
          MessageDetail.destroy({
            where: { employeeId: clientWiseEmployeeData, deletedAt: null },
            transaction,
          }),
          UserPermission.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          UserSegment.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          UserSegmentApproval.destroy({
            where: { clientId: isFound.id, deletedAt: null },
            transaction,
          }),
          ContractTemplateVersion.destroy({
            where: {
              contractTemplateId: clientWiseVersionData,
              deletedAt: null,
            },
            transaction,
          }),
        ]);
        await createHistoryRecord(
          {
            tableName: tableEnum.CLIENT,
            moduleName: moduleName.SETUP,
            userId: user?.id,
            lastlogintime: user?.loginUserData?.logintimeutc,
            custom_message: await customHistoryDeleteMessage(
              user,
              tableEnum.CLIENT,
              isFound
            ),
            jsonData: parse(data),
            activity: statusEnum.DELETE,
          },
          transaction
        );
        return data;
      });
    } catch (error) {
      console.log(error, "err.");
      throw new HttpException(
        400,
        "Something went wrong! Please try again",
        null,
        true
      );
    }
  }

  async findClientFonction(clientId: number, transaction: Transaction = null) {
    try {
      let isFound = await Employee.findAll({
        attributes: [[fn("DISTINCT", col("fonction")), "fonction"]],
        raw: true,
        where: { deletedAt: null },
        // transaction,
        logging: console.log,
      });
      if (isFound.length === 0) {
        throw new HttpException(404, this.msg.notFound);
      }
  
      const formattedArray = isFound.map((a) => String(a.fonction));
      return parse(formattedArray);
    } catch (error) {
      console.error("Error in findClientFonction:", error);
      throw new HttpException(500, "An error occurred while fetching client functions");
    }
  }
  async getClientLeavesData(id: number, query: any = {}) {
    let attendanceType = [],
      leaveType = [],
      overtimeBonusType = [],
      holidayType = [];

    let filter: any = {};
    if (query?.type) {
      filter.employee_type = query?.type.toUpperCase();
    }
    let docs = await ClientAttendanceType.findAll({
      where: {
        deletedAt: null,
        clientId: { [Op.eq]: id },
        // status_code: { [Op.ne]: "CR" },
        ...filter,
      },
    });
    docs = parse(docs);

    for (const element of docs) {
      let obj = {
        id: element?.id,
        clientId: element?.clientId,
        statusId: element?.statusId,
        employee_type: element?.employee_type,
        status_type: element?.status_type,
      };
      let doc: any = {};
      switch (element?.status_type) {
        case client_attendance_type.WORKED:
          doc = await AttendanceTypeModel.findOne({
            where: { id: element?.statusId, deletedAt: null },
            attributes: ["id", "name", "code"],
          });
          attendanceType.push({ ...obj, attendanceData: parse(doc) });
          break;

        case client_attendance_type.LEAVE:
          doc = await LeaveTypeMaster.findOne({
            where: { id: element?.statusId, deletedAt: null },
            attributes: ["id", "name", "code"],
          });
          leaveType.push({
            ...obj,
            payment_type: element?.payment_type,
            leaveData: parse(doc),
          });
          break;

        case client_attendance_type.BONUS:
          doc = await BonusTypeMaster.findOne({
            where: { id: element?.statusId, deletedAt: null },
            attributes: ["id", "name", "code"],
          });
          overtimeBonusType.push({
            ...obj,
            reliquatValue: element?.reliquatValue,
            bonus_type: element?.bonus_type,
            bonusData: parse(doc),
            conditions: JSON.parse(element?.conditions) ?? null,
          });
          break;

        case client_attendance_type.HOLIDAY:
          doc = await HolidayTypeMaster.findOne({
            where: { id: element?.statusId, deletedAt: null },
            attributes: ["id", "name", "code"],
          });
          holidayType.push({
            ...obj,
            dates: element?.dates,
            holidayData: parse(doc),
          });
          break;

        default:
          break;
      }
    }

    return {
      attendanceType,
      leaveType,
      overtimeBonusType,
      holidayType,
    };
  }

  async updateClientLeaves(
    id: number,
    body: any,
    transaction: Transaction = null
  ) {
    const {
      employee_type,
      attendanceType,
      leaveType,
      overtimeBonusType,
      holidayType,
    } = body;
    console.log("body", 
      employee_type,
      attendanceType,
      leaveType,
      overtimeBonusType,
      holidayType,
    );
    const { WORKED, LEAVE, BONUS, HOLIDAY } = client_attendance_type;
  
    console.log(`🔍 Checking if client exists for ID: ${id}`);
    const isFound = await Client.findOne({
      where: { id: id, deletedAt: null },
      transaction,
    });
    
    if (!isFound) {
      console.error("❌ Client not found");
      throw new HttpException(404, this.msg.notFound);
    }
  
    console.log("✅ Client found", isFound);
  
    if (attendanceType?.length > 0) {
      console.log("📌 Handling Attendance Type");
      await this.handleAttendance(id, attendanceType, employee_type, WORKED, transaction);
    }
  
    if (leaveType?.length > 0) {
      console.log("📌 Handling Leave Type");
      await this.handleAttendance(id, leaveType, employee_type, LEAVE, transaction);
    }
  
    if (overtimeBonusType?.length > 0) {
      console.log("📌 Handling Overtime/Bonus Type");
      await this.handleAttendance(id, overtimeBonusType, employee_type, BONUS, transaction);
    }
  
    if (holidayType?.length > 0) {
      console.log("📌 Handling Holiday Type");
      await this.handleAttendance(id, holidayType, employee_type, HOLIDAY, transaction);
    }
  
    console.log("✅ Finished updating client leaves");
    return;
  }
  async handleAttendance(
    clientId: number,
    Data: [clientNewCreateType],
    employee_type: string,
    statusType: string,
    transaction: Transaction = null
  ) {
    console.log(`🛠️  handleAttendance START | statusType: ${statusType}, clientId: ${clientId}`);
    console.log("📦 Incoming Data:", JSON.stringify(Data, null, 2));
  
    for (const element of Data) {
      console.log(`🔍 Checking existing attendance for statusId: ${element?.id}`);
      
      const isExists = await ClientAttendanceType.findOne({
        where: {
          deletedAt: null,
          statusId: element?.id,
          clientId: clientId,
          status_type: statusType,
        },
      });
  
      if (!isExists) {
        console.log(`🆕 Creating new record for statusId: ${element?.id}`);
  
        await ClientAttendanceType.create(
          {
            statusId: element?.id,
            status_type: statusType,
            clientId: clientId,
            employee_type: employee_type,
            status_code: element?.code,
            reliquatValue: element?.reliquatValue ?? null,
            bonus_type: element?.bonus_type ?? null,
            dates: element?.dates ?? [],
            payment_type: element?.payment_type ?? null,
            conditions: JSON.stringify(element?.conditions) ?? null,
          },
          { transaction }
        );
  
        console.log("✅ Created successfully");
      } else {
        console.log(`✏️  Updating existing record for statusId: ${element?.id}`);
  
        await ClientAttendanceType.update(
          {
            employee_type: employee_type,
            reliquatValue: element?.reliquatValue ?? null,
            bonus_type: element?.bonus_type ?? null,
            dates: element?.dates ?? [],
            payment_type: element?.payment_type ?? null,
            conditions: JSON.stringify(element?.conditions) ?? null,
          },
          { where: { id: isExists?.id }, transaction, individualHooks: true }
        );
  
        console.log("✅ Updated successfully");
      }
    }
  
    if (Data.length > 0) {
      const idsToKeep = Data.map((el: any) => parseInt(el?.id));
      console.log(`🧹 Deleting stale records for statusType: ${statusType}, except statusIds:`, idsToKeep);
  
      const deleted = await ClientAttendanceType.destroy({
        where: {
          clientId,
          status_type: statusType,
          statusId: { [Op.notIn]: idsToKeep },
        },
        transaction,
      });
  
      console.log(`🗑️  Deleted ${deleted} records`);
    }
  
    console.log(`✅ handleAttendance DONE for ${statusType}`);
  }
  

  async addDefaultAttendancetoClient(clientId: number) {
    await this.checkAndCreateAttendanceType(
      clientId,
      "P",
      client_attendance_type.WORKED,
      AttendanceTypeModel,
      employee_type?.ALL
    );

    // Check and create for "CR"
    // await this.checkAndCreateAttendanceType(
    //   clientId,
    //   "CR",
    //   client_attendance_type.LEAVE,
    //   LeaveTypeMaster,
    //   employee_type?.ROTATION
    // );
  }

  async checkAndCreateAttendanceType(
    clientId: number,
    statusCode: string,
    statusType: string,
    model: any,
    employee_type: string
  ) {
    // Check if record already exists
    const existingRecord = await ClientAttendanceType.findOne({
      where: { deletedAt: null, clientId, status_code: statusCode },
      attributes: ["id", "status_code", "statusId"],
    });

    if (!existingRecord) {
      // Find corresponding data for the given status code
      const statusData = await model.findOne({
        where: { code: statusCode, deletedAt: null },
        attributes: ["id", "code", "name"],
      });

      if (statusData) {
        // Create new record if data is found
        await ClientAttendanceType.create({
          clientId,
          status_type: statusType,
          status_code: statusData.code,
          statusId: statusData.id,
          employee_type: employee_type,
        });
      }
    }
  }

  // async handleAttendance(
  //   clientId: number,
  //   Data: [clientNewCreateType],
  //   statusType,
  //   transaction: Transaction = null
  // ) {
  //   console.log('Data', Data);
  //   for (const element of Data) {
  //     let isExists = await ClientAttendanceType.findOne({
  //       where: {
  //         deletedAt: null,
  //         statusId: element?.id,
  //         clientId: clientId,
  //         status_type: statusType,
  //       },
  //     });
  //     console.log("isExists", parse(isExists));

  //     if (!isExists) {
  //       //   await ClientAttendanceType.create(
  //       //     {
  //       //       statusId: element?.id,
  //       //       status_type: statusType,
  //       //       clientId: clientId,
  //       //       employee_type: element?.employee_type,
  //       //       status_code: element?.code,
  //       //       reliquatValue: element?.reliquatValue ?? null,
  //       //       factor1: element?.factor1 ?? null,
  //       //       factor2: element?.factor2 ?? null,
  //       //       bonus_type: element?.bonus_type ?? null,
  //       //       dates: element?.dates ?? [],
  //       //       payment_type: element?.payment_type ?? null,
  //       //     },
  //       //     { transaction }
  //       //   );
  //     } else {
  //       // await ClientAttendanceType.update(
  //       //   {
  //       //     employee_type: element?.employee_type,
  //       //     reliquatValue: element?.reliquatValue ?? null,
  //       //     factor1: element?.factor1 ?? null,
  //       //     factor2: element?.factor2 ?? null,
  //       //     bonus_type: element?.bonus_type ?? null,
  //       //     dates: element?.dates ?? [],
  //       //     payment_type: element?.payment_type ?? null,
  //       //   },
  //       //   { where: { id: isExists?.id }, transaction, individualHooks: true }
  //       // );
  //     }
  //   }
  //   // await ClientAttendanceType.destroy({
  //   //   where: {
  //   //     clientId: clientId,
  //   //     status_type: statusType,
  //   //     [Op.or]: {
  //   //       statusId: { [Op.notIn]: Data.map((el) => el?.id) },
  //   //     },
  //   //   },
  //   //   transaction,
  //   // });
  // }
}
