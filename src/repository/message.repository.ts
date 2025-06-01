import { FRONTEND_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, customHistoryDeleteMessage, customHistoryUpdateMesage } from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";
import { DefaultRoles } from "@/interfaces/functional/feature.interface";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import {
  IMessageCreate,
  messageStatus,
} from "@/interfaces/model/message.interface";
import { status } from "@/interfaces/model/user.interface";
import Employee from "@/models/employee.model";
import LoginUser from "@/models/loginUser.model";
import Message from "@/models/message.model";
import MessageDetail from "@/models/messageDetail.model";
import MessageSalary from "@/models/messageSalary.model";
import Role from "@/models/role.model";
import Segment from "@/models/segment.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import _ from "lodash";
import moment from "moment";
import { Op, Sequelize, Transaction } from "sequelize";
import BaseRepository from "./base.repository";
import ErrorLogsRepo from "./errorLog.repository";

export default class MessageRepo extends BaseRepository<Message> {
  constructor() {
    super(Message.name);
  }

  private msg = new MessageFormation("Message").message;
  private errorRepository = new ErrorLogsRepo();

  async getAllMessageService(query: IQueryParameters) {
    const { page, limit, clientId, statusValue, sort, sortBy, search } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        ...(search && {
          message: { [Op.iLike]: "%" + search.toLowerCase() + "%" },
        }),
        deletedAt: null,
        clientId: clientId,
        ...(statusValue != undefined && { status: statusValue }),
      },

      include: [
        {
          model: MessageDetail,
          where: {
            segmentId: null,
          },
          required: false,
          attributes: ["employeeId", "messageId", "segmentId", "managerUserId"],
          include: [
            {
              model: Employee,
              attributes: ["id", "clientId", "contractEndDate", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["firstName", "name", "lastName"],
                },
              ],
            },
            {
              model: User,
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["email", "firstName", "lastName", "name", "phone"],
                },
              ],
            },
            // {
            //   model: Segment,
            //   attributes: ["id"],
            //   include: [
            //     {
            //       model: Employee,
            //       attributes: ["id", "loginUserId"],
            //       include: [
            //         {
            //           model: LoginUser,
            //           attributes: ["email", "firstName", "name", "lastName", "phone"],
            //         },
            //       ],
            //     },
            //   ],
            // },
          ],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "createdAt", sort ?? "desc"]],
    });

    // await createHistoryRecord({
    //   tableName: tableEnum.MESSAGE,
    //   moduleName: moduleName.ADMIN,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MESSAGE, `All Message Service!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });

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

  async getAllSalaryMessageService(query: IQueryParameters, user: User) {
    const { page, limit, clientId, sort, sortBy, search } = query;
    const sortedColumn = sortBy || null;
    let data = await MessageSalary.findAndCountAll({
      where: {
        // ...(search && {
        // 	message: { [Op.iLike]: '%' + search.toLowerCase() + '%' },
        // }),
        deletedAt: null,
        ...(clientId && { clientId: clientId }),
      },
      include: [
        {
          model: Employee,
          as: "employeeDetail",
          required: true,
          attributes: ["id", "loginUserId"],
          include: [
            {
              model: LoginUser,
              where: {
                ...(user.roleData.isViewAll &&
                  user.roleData.name === DefaultRoles.Employee && {
                    id: user.loginUserId,
                  }),
                ...(search && {
                  [Op.or]: [
                    Sequelize.where(
                      Sequelize.fn(
                        "concat",
                        Sequelize.col("lastName"),
                        " ",
                        Sequelize.col("firstName")
                      ),
                      {
                        [Op.iLike]: `%${search}%`,
                      }
                    ),
                    Sequelize.where(
                      Sequelize.fn(
                        "concat",
                        Sequelize.col("firstName"),
                        " ",
                        Sequelize.col("lastName")
                      ),
                      {
                        [Op.iLike]: `%${search}%`,
                      }
                    ),
                  ],
                }),
              },
              attributes: ["email", "firstName", "lastName", "phone"],
            },
          ],
        },
        {
          model: User,
          as: "managerUser",
          attributes: ["id", "loginUserId"],
          include: [
            {
              model: LoginUser,
              attributes: ["email", "firstName", "lastName", "phone"],
            },
          ],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "createdAt", sort ?? "desc"]],
    });

    // await createHistoryRecord({
    //   tableName: tableEnum.MESSAGE,
    //   moduleName: moduleName.ADMIN,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MESSAGE, `All Salary Message Service!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });

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

  async getSalaryMessageEmployeeDataSuggestiveDropdown(
    query: IQueryParameters,
    transaction: Transaction = null
  ) {
    const { clientId } = query;
    const condition = {
      deletedAt: null,
      clientId: clientId,
    };

    const data = await MessageSalary.findAll({
      where: {
        ...condition,
      },
      include: [
        {
          model: Employee,
          as: "employeeDetail",
          attributes: ["id", "loginUserId"],
          include: [
            {
              model: LoginUser,
              attributes: ["email", "firstName", "lastName", "name", "phone"],
            },
          ],
        },
        // {
        // 	model: User,
        // 	as: 'managerUser',
        // 	attributes: ['id', 'loginUserId'],
        // 	include: [
        // 		{
        // 			model: LoginUser,
        // 			attributes: ['email', 'firstName', 'lastName',' 'phone'],
        // 		},
        // 	],
        // },
      ],
      transaction,
    });
    const dropdownData = data?.map((finalData) => {
      return {
        label: `${finalData?.employeeDetail?.loginUserData?.lastName} ${finalData?.employeeDetail?.loginUserData?.firstName}`,
        value: `${finalData?.employeeDetail?.loginUserData?.firstName} ${finalData?.employeeDetail?.loginUserData?.lastName}`,
      };
    });
    const uniqueValues = new Set();
    const uniqueDropdownData = dropdownData.filter((item) => {
      const value = item.value;
      if (!uniqueValues.has(value)) {
        uniqueValues.add(value);
        return true;
      }
      return false;
    });
    return uniqueDropdownData;
  }

  async getMessageByIdService(id: number) {
    let isFound = await Message.findOne({
      where: { id: id, deletedAt: null },
      attributes: [
        "id",
        "message",
        "errorMessage",
        "status",
        "isSchedule",
        "scheduleDate",
        "createdAt",
        "createdatutc",
      ],
      include: [
        {
          model: MessageDetail,
          attributes: ["employeeId", "messageId", "segmentId", "managerUserId"],
          include: [
            {
              model: Employee,
              attributes: ["id", "clientId", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["firstName", "lastName", "phone", "email"],
                },
              ],
            },
            {
              model: User,
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["email", "firstName", "lastName", "phone"],
                },
              ],
            },
            {
              model: Segment,
              attributes: ["id"],
              include: [
                {
                  model: Employee,
                  attributes: ["id", "loginUserId"],
                  include: [
                    {
                      model: LoginUser,
                      attributes: ["email", "firstName", "lastName", "phone"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    isFound = parse(isFound);

    const insertData = [];
    const commanData = {
      id: isFound.id,
      message: isFound.message,
      errorMessage: isFound.errorMessage ? isFound.errorMessage : null,
      status: isFound.status,
      isSchedule: isFound.isSchedule,
      scheduleDate: isFound.scheduleDate ? isFound.scheduleDate : null,
      createdAt: isFound.createdAt,
      createdatutc: isFound.createdatutc,
    };
    for (const key in isFound.messageDetail) {
      insertData.push({ ...isFound.messageDetail[key], ...commanData });
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.MESSAGE,
    //   moduleName: moduleName.ADMIN,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MESSAGE, `Specific Message Service!`),
    //   jsonData: parse(insertData),
    //   activity: statusEnum.VIEW,
    // });

    return insertData;
  }

  async addMessage({ body, user }: { body: IMessageCreate; user: User }) {
    let insertEmpData;
    let insertSegmentData;
    let insertManagerUserData;

    let messageData = await Message.create({
      clientId: body.clientId,
      message: body.message,
      status: body.status ? body.status : messageStatus.ERROR,
      errorMessage: null,
      createdBy: user.id,
      isSchedule: body.isSchedule ? body.isSchedule : false,
      scheduleDate: body.scheduleDate ? body.scheduleDate : null,
    });
    messageData = parse(messageData);
    const uniqueEmployeeIds: any = [...new Set(body.employeeId)];
    const uniqueManagerUserIds: any = [...new Set(body.managerUserId)];
    const uniqueSegmentIds: any = [...new Set(body.segmentId)];

    if (!_.isUndefined(body.employeeId)) {
      insertEmpData = uniqueEmployeeIds.map((e: string) => ({
        messageId: messageData.id,
        employeeId: e,
        managerUserId: null,
        segmentId: null,
      }));
    }
    if (!_.isUndefined(body.managerUserId)) {
      insertManagerUserData = uniqueManagerUserIds.map((e: string) => ({
        messageId: messageData.id,
        managerUserId: e,
        employeeId: null,
        segmentId: null,
      }));
    }
    if (!_.isUndefined(body.segmentId)) {
      insertSegmentData = uniqueSegmentIds.map((e: string) => ({
        messageId: messageData.id,
        segmentId: e,
        managerUserId: null,
        employeeId: null,
      }));
    }

    await MessageDetail.bulkCreate([
      ...(insertEmpData || []),
      ...(insertSegmentData || []),
      ...(insertManagerUserData || []),
    ]);

    const segmentEmpData =
      !_.isUndefined(insertSegmentData) &&
      insertSegmentData.map((e) => e.segmentId);
    const managerUserData =
      !_.isUndefined(insertManagerUserData) &&
      insertManagerUserData.map((e) => e.managerUserId);
    const empData =
      !_.isUndefined(insertEmpData) && insertEmpData.map((e) => e.employeeId);

    let userEmpData = await Message.findAll({
      paranoid: false,
      attributes: ["id", "status"],
      include: [
        {
          model: MessageDetail,

          where: {
            messageId: messageData.id,
            [Op.or]: [
              {
                segmentId: {
                  [Op.in]: segmentEmpData,
                },
              },
              {
                employeeId: {
                  [Op.in]: empData,
                },
              },
              {
                managerUserId: {
                  [Op.in]: managerUserData,
                },
              },

              {
                [Op.or]: [
                  {
                    segmentId: {
                      [Op.in]: segmentEmpData,
                    },
                  },
                  {
                    employeeId: {
                      [Op.in]: empData,
                    },
                  },
                  {
                    managerUserId: {
                      [Op.in]: managerUserData,
                    },
                  },
                ],
              },
            ],
          },
          attributes: ["messageId", "segmentId", "managerUserId", "employeeId"],
          include: [
            {
              model: Employee,
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["email", "firstName", "lastName", "phone"],
                },
              ],
            },

            {
              model: User,
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["email", "firstName", "lastName", "phone"],
                },
              ],
            },
          ],
        },
      ],
    });

    userEmpData = parse(userEmpData);

    await createHistoryRecord({
      tableName: tableEnum.MESSAGE,
      userId: user?.id,
      moduleName: moduleName.ADMIN,
      custom_message: `<b>${user?.loginUserData?.name}</b> has created a new ${tableEnum.MESSAGE} <b>${body.message}</b>`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(userEmpData),
      activity: statusEnum.CREATE,
    });

    try {
      await Promise.all(
        userEmpData?.map(async (value) => {
          if (value.status !== (messageStatus.ERROR && messageStatus.DRAFT)) {
            return await Promise.all(
              value.messageDetail.map(async (item) => {
                try {
                  return await this.buildObject(item, messageData, body, user);
                } catch (error) {
                  return error.message;
                }
              })
            );
          }
        })
      );

    } catch (error) {
      throw new Error(error);
    }
  }

  async addSalaryMessage({ body, user }: { body: any; user: User }) {
    let insertEmpData;
    let insertManagerUserData;

    const roleData = await Role.findAll({
      where: {
        [Op.or]: [
          {
            name: "Employee",
          },
          {
            name: "manager",
          },
        ],
      },
    });

    const managerId = roleData.find((data) => data.name === "manager").id;
    // const employeeId = roleData.find((data) => data.name === 'Employee').id;
    const managerUser = body.messageSalary?.filter(
      (e) => e.roleId === managerId
    );
    // const employeeData = body.messageSalary?.filter((e) => e.roleId === employeeId);

    if (!_.isUndefined(body.messageSalary)) {
      const sentence = body.message;
      insertEmpData = await Promise.all(
        body.messageSalary.map(async (e) => {
          const stringsToReplace = [
            { "[Total]": e?.total ?? 0 },
            { "[BonusPrice]": e?.bonusPrice ?? 0 },
            { "[SalaryMonth]": body.salaryMonth },
            { "[MonthlySalary]": e?.monthlySalary ?? 0 },
            { "[SalaryDate]": moment(e?.salaryDate).format("DD/MM/YYYY") },
          ];

          const replacedSentence = await this.replaceStringsInSentence(
            sentence,
            stringsToReplace
          );
          return {
            message: replacedSentence,
            employeeId: e.id,
            name: e.name,
            clientId: body.clientId,
            email: e.email ?? null,
            phone: e.phone ?? null,
            salaryMonth: body.salaryMonth,
            monthlySalary: e?.monthlySalary ?? 0,
            bonusPrice: e.bonusPrice ?? 0,
            salaryDate: moment(
              moment(e?.salaryDate || null).format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
            total: e.monthlySalary + e.bonusPrice || 0,
            managerUserId: null,
            createdBy: user.id,
          };
        })
      );
    }
    if (!_.isUndefined(managerUser)) {
      const originalString =
        "LRED: Transfer of Janvier salary sent on with the bonus . Salary total. Replies to this mobile aren't monitored.";
      const removeData = originalString.replace(body.message, "").trim();
      insertManagerUserData = managerUser.map((e) => ({
        message:
          `LRED: Transfer of Janvier salary sent on ${moment(
            e?.salaryDate
          ).format("DD/MM/YYYY")} with the bonus ${
            e?.bonusPrice ?? 0
          }. Salary total ${
            e?.total ?? 0
          }. Replies to this mobile aren't monitored.` + removeData,
        managerUserId: e.id,
        name: e.name,
        email: e.email,
        clientId: body.clientId,
        salaryMonth: body.salaryMonth,
        phone: e.phone,
        monthlySalary: e?.monthlySalary ?? 0,
        bonusPrice: e.bonusPrice ?? 0,
        salaryDate: moment(
          moment(e?.salaryDate || null).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate(),
        total: e.monthlySalary + e.bonusPrice || 0,
        employeeId: null,
        createdBy: user.id,
      }));
    }

    // const areAllEmailsAndPhonesNonNull = insertEmpData.every((item) => item.email !== '' || item.phone !== '');

    // if (areAllEmailsAndPhonesNonNull) {
    let bulkCreateResult = await MessageSalary.bulkCreate([
      ...(insertEmpData || []),
      ...(insertManagerUserData || []),
    ]);
    bulkCreateResult = parse(bulkCreateResult);

    const id =
      !_.isUndefined(bulkCreateResult) && bulkCreateResult.map((e) => e.id);
    const managerUserData =
      !_.isUndefined(insertManagerUserData) &&
      insertManagerUserData.map((e) => e.managerUserId);
    const empData =
      !_.isUndefined(insertEmpData) && insertEmpData.map((e) => e.employeeId);

    let userEmpData = await MessageSalary.findAll({
      paranoid: false,
      where: {
        id: { [Op.in]: id },
        [Op.or]: [
          {
            employeeId: {
              [Op.in]: empData,
            },
          },
          {
            managerUserId: {
              [Op.in]: managerUserData,
            },
          },

          {
            [Op.or]: [
              {
                employeeId: {
                  [Op.in]: empData,
                },
              },
              {
                managerUserId: {
                  [Op.in]: managerUserData,
                },
              },
            ],
          },
        ],
      },
      include: [
        {
          model: Employee,
          as: "employeeDetail",
          attributes: ["id", "loginUserId"],
          include: [
            {
              model: LoginUser,
              attributes: ["email", "firstName", "lastName", "phone"],
            },
          ],
        },
        {
          model: User,
          as: "managerUser",
          attributes: ["id", "loginUserId"],
          include: [
            {
              model: LoginUser,
              attributes: ["email", "firstName", "lastName", "phone"],
            },
          ],
        },
      ],
    });

    userEmpData = parse(userEmpData);
    await createHistoryRecord({
      tableName: tableEnum.MESSAGE,
      userId: user?.id,
      moduleName: moduleName.ADMIN,
      custom_message: `<b>${user?.loginUserData?.name}</b> has created a new salary ${tableEnum.MESSAGE}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(bulkCreateResult),
      activity: statusEnum.CREATE,
    });

    try {
      await Promise.all(
        userEmpData?.map(async (value) => {
          try {
            return await this.buildSalaryObject(value, user);
          } catch (error) {
            return error.message;
          }
        })
      );
    } catch (error) {
      throw new Error(error);
    }
    // }
    // else {
    // 	return null;
    // }
  }

  async replaceStringsInSentence(sentence, replacementArray) {
    let result = sentence;

    for (const element of replacementArray) {
      const replacementObject = element;
      const searchString = Object.keys(replacementObject)[0];
      const replacementValue = replacementObject[searchString];

      result = result.split(searchString).join(replacementValue);
    }

    return result;
  }

  async buildSalaryObject(value, user: User) {
    const emailId = value?.email;

    const employeeData = {
      email: emailId,
      firstName:
        value?.employeeDetail?.loginUserData?.firstName !== undefined
          ? value?.employeeDetail?.loginUserData?.firstName
          : value?.managerUser?.loginUserData?.firstName !== undefined &&
            value?.managerUser?.loginUserData?.firstName,
      lastName:
        value?.employeeDetail?.loginUserData?.lastName !== undefined
          ? value?.employeeDetail?.loginUserData?.lastName
          : value?.managerUser?.loginUserData?.lastName !== undefined &&
            value?.managerUser?.loginUserData?.lastName,
      mobileNumber:
        value?.employeeDetail?.loginUserData?.phone !== undefined
          ? value?.employeeDetail?.loginUserData?.phone
          : value?.managerUser?.loginUserData?.phone !== undefined &&
            value?.managerUser?.loginUserData?.phone,
      message: value?.message,
      monthlySalary: value.monthlySalary,
      bonusPrice: value.bonusPrice,
      total: value.total,
      salaryDate: moment(value.salaryDate).format("DD/MM/YYYY"),
      logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
    };

    try {
      if (emailId) {
        // await sendMail(
        //   [emailId, "admin@lred.com"],
        //   "Email",
        //   "employeeEmail",
        //   employeeData
        // );
      }
      // if (employeeData?.mobileNumber) {
      // 	await twilioMessages(employeeData.mobileNumber, employeeData.message);
      // }
    } catch (error) {
      const parts = error.message.split("Error:");
      const errorPart = parts.find((part) => part.trim() !== "");
      const finalErrorMessage = errorPart ? errorPart.trim() : "Unknown Error";

      await this.errorRepository.addErrorLogs({
        body: {
          type: "message",
          status: messageStatus.ERROR,
          isActive: status.ACTIVE,
          email: emailId,
          createdBy: user.id,
          clientId: value.clientId,
          full_error: JSON.stringify(finalErrorMessage),
          error_message: finalErrorMessage,
        },
        user
      });
      throw new Error(error);
    }
  }

  async buildObject(item, messageData, body, user) {
    const emailId =
      item?.employeeDetail?.loginUserData?.email !== undefined
        ? item?.employeeDetail?.loginUserData?.email
        : item?.managerUser?.loginUserData?.email !== undefined &&
          item?.managerUser?.loginUserData?.email;
    const employeeData = {
      email: emailId,
      firstName:
        item?.employeeDetail?.loginUserData?.firstName !== undefined
          ? item?.employeeDetail?.loginUserData?.firstName
          : item?.managerUser?.loginUserData?.firstName !== undefined &&
            item?.managerUser?.loginUserData?.firstName,
      lastName:
        item?.employeeDetail?.loginUserData?.lastName !== undefined
          ? item?.employeeDetail?.loginUserData?.lastName
          : item?.managerUser?.loginUserData?.lastName !== undefined &&
            item?.managerUser?.loginUserData?.lastName,
      mobileNumber:
        item?.employeeDetail?.loginUserData?.phone !== undefined
          ? item?.employeeDetail?.loginUserData?.phone
          : item?.managerUser?.loginUserData?.phone !== undefined &&
            item?.managerUser?.loginUserData?.phone,
      message: body.message,
      monthlySalary: "",
      bonusPrice: "",
      total: "",
      salaryDate: "",
      logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
    };
    // console.log("emailId", emailId);
    // console.log("employeeData", employeeData);

    try {
      if (emailId) {
        await sendMail(
          [emailId, "admin@lred.com"],
          "Email",
          "employeeEmail",
          employeeData
        );
      }
      // if (employeeData.mobileNumber) {
      // 	await twilioMessages(employeeData.mobileNumber, employeeData.message);
      // }
    } catch (error) {
      const parts = error.message.split("Error:");
      const errorPart = parts.find((part) => part.trim() !== "");
      const finalErrorMessage = errorPart ? errorPart.trim() : "Unknown Error";
      await Message.update(
        {
          status: messageStatus.ERROR,
          errorMessage: finalErrorMessage,
        },
        {
          where: {
            id: messageData.id,
          },
        }
      );

      await this.errorRepository.addErrorLogs({
        body: {
          type: "message",
          status: messageStatus.ERROR,
          isActive: status.ACTIVE,
          email: emailId,
          createdBy: user.id,
          clientId: body.clientId,
          full_error: JSON.stringify(finalErrorMessage),
          error_message: finalErrorMessage,
        },
        user
      });
      throw new Error(error);
    }
  }

  async updateMessageService({
    body,
    user,
    id,
  }: {
    body: IMessageCreate;
    user: User;
    id: number;
  }) {
    let isExist = await Message.findOne({
      where: { id: id, deletedAt: null },
      include: [
        {
          model: MessageDetail,
          where: {
            messageId: id,
          },
        },
      ],
    });

    if (!isExist) {
      throw new HttpException(200, this.msg.notFound, {}, true);
    }

    await Message.update(
      {
        clientId: body.clientId,
        message: body.message,
        status: body.status ? body.status : messageStatus.ERROR,
        updatedBy: user.id,
        isSchedule: body.isSchedule ? body.isSchedule : false,
        scheduleDate: body.scheduleDate ? body.scheduleDate : null,
      },
      { where: { id: id, deletedAt: null } }
    );

    let insertEmpData;
    let insertSegmentData;
    let insertManagerUserData;

    await MessageDetail.destroy({ where: { messageId: id } });

    if (!_.isNull(body.employeeId)) {
      insertEmpData = body.employeeId.map((e: string) => ({
        messageId: id,
        employeeId: e,
        segmentId: null,
        managerUserId: null,
      }));
    }
    if (!_.isNull(body.managerUserId)) {
      insertManagerUserData = body.managerUserId.map((e: string) => ({
        messageId: id,
        employeeId: null,
        segmentId: null,
        managerUserId: e,
      }));
    }
    if (!_.isNull(body.segmentId)) {
      insertSegmentData = body.segmentId.map((e: string) => ({
        messageId: id,
        segmentId: e,
        employeeId: null,
        managerUserId: null,
      }));
    }

    await MessageDetail.bulkCreate([
      ...(insertEmpData ?? []),
      ...(insertSegmentData ?? []),
      ...(insertManagerUserData ?? []),
    ]);

    const segmentEmpData =
      !_.isUndefined(insertSegmentData) &&
      insertSegmentData.map((e) => e.segmentId);
    const managerEmpData =
      !_.isUndefined(insertManagerUserData) &&
      insertManagerUserData.map((e) => e.managerUserId);
    const empData =
      !_.isUndefined(insertEmpData) && insertEmpData.map((e) => e.employeeId);

    let userEmpData = await Message.findAll({
      paranoid: false,
      attributes: ["id", "status"],
      include: [
        {
          model: MessageDetail,

          where: {
            messageId: id,
            [Op.or]: [
              {
                segmentId: {
                  [Op.in]: segmentEmpData,
                },
              },
              {
                employeeId: {
                  [Op.in]: empData,
                },
              },
              {
                managerUserId: {
                  [Op.in]: managerEmpData,
                },
              },

              {
                [Op.or]: [
                  {
                    segmentId: {
                      [Op.in]: segmentEmpData,
                    },
                  },
                  {
                    employeeId: {
                      [Op.in]: empData,
                    },
                  },
                  {
                    managerUserId: {
                      [Op.in]: managerEmpData,
                    },
                  },
                ],
              },
            ],
          },
          attributes: ["messageId", "segmentId", "managerUserId", "employeeId"],
          include: [
            {
              model: Employee,
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["email", "firstName", "lastName", "phone"],
                },
              ],
            },
            {
              model: User,
              attributes: ["id", "loginUserId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["email", "firstName", "lastName", "phone"],
                },
              ],
            },
          ],
        },
      ],
    });

    userEmpData = parse(userEmpData);
    try {
      await Promise.all(
        userEmpData?.map(async (value) => {
          if (value.status !== (messageStatus.ERROR && messageStatus.DRAFT)) {
            return await Promise.all(
              value.messageDetail.map(async (item) => {
                try {
                  return await this.buildObject(item, id, body, user);
                } catch (error) {
                  return error.message;
                }
              })
            );
          }
        })
      );
    } catch (error) {
      throw new Error(error);
    }

    await createHistoryRecord({
      tableName: tableEnum.MESSAGE,
      moduleName: moduleName.ADMIN,
      userId: user?.id,
      custom_message: await customHistoryUpdateMesage(body, isExist, user,  userEmpData, tableEnum.MESSAGE),
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(userEmpData),
      activity: statusEnum.UPDATE,
    });

    isExist = parse(isExist);
    return isExist;
  }

  async deleteMessageService({ id, authuser }: { id: number, authuser: User }) {
    const isExistUser = await this.get({
      where: { id, deletedAt: null },
      attributes: ["id"],
    });
    if (isExistUser) {
      const user = await this.update(
        { deletedAt: new Date() },
        { where: { id: +isExistUser.id }, individualHooks: true }
      );
      await createHistoryRecord({
        tableName: tableEnum.MESSAGE,
        moduleName: moduleName.ADMIN,
        userId: authuser?.id,
        lastlogintime: authuser?.loginUserData?.logintimeutc,
        custom_message: await customHistoryDeleteMessage(authuser, tableEnum.MESSAGE, {name: isExistUser.message}),
        jsonData: parse(user),
        activity: statusEnum.DELETE,
      });
      return user;
    }
  }
}
