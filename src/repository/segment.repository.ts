import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryDeleteMessage,
  customHistoryUpdateMesage
} from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { ISegmentCreate } from "@/interfaces/model/segment.interface";
import db from "@/models";
import Client from "@/models/client.model";
import ClientTimesheetStartDay from "@/models/clientTimesheetStartDay.model";
import Contact from "@/models/contact.model";
import Employee from "@/models/employee.model";
import LoginUser from "@/models/loginUser.model";
import SegmentManager from "@/models/segmentManagers.model";
import SegmentTimesheetStartDay from "@/models/segmentTimesheetStartDay.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import User from "@/models/user.model";
import UserSegment from "@/models/userSegment.model";
import UserSegmentApproval from "@/models/userSegmentApproval.model";
import { getSegmentAccessForUser, parse } from "@/utils/common.util";
import moment from "moment";
import { Op } from "sequelize";
import slugify from "slugify";
import { default as Segment } from "../models/segment.model";
import BaseRepository from "./base.repository";
import TimesheetRepo from "./timesheet.repository";

export default class SegmentRepo extends BaseRepository<Segment> {
  constructor() {
    super(Segment.name);
  }

  private msg = new MessageFormation("Segment").message;
  private TimesheetService = new TimesheetRepo();

  async updateSegmentManager(body: any, isExist: any) {
    let existed = await SegmentManager.findAll({
      where: {
        segmentId: isExist?.id,
        clientId: isExist.clientId,
      },
      attributes: ["id", "loginUserId", "segmentId", "clientId"],
    });
    existed = parse(existed);
    if (existed && existed.length > 0) {
      for (const element of existed) {
        if (!body?.segmentManager.includes(element.loginUserId)) {
          await SegmentManager.destroy({
            where: {
              id: element?.id,
            },
          });
        }
      }
    }
    body?.segmentManager?.map(async (loginUserId: number) => {
      if (!existed.some((item) => item.loginUserId === loginUserId)) {
        await SegmentManager.create({
          segmentId: isExist?.id,
          loginUserId: loginUserId,
          clientId: isExist.clientId,
        });
      }
    });
  }

  async getAllSegmentService(query: IQueryParameters, user: User) {
    const { page, limit, clientId, sortBy, sort, search, isActive } = query;
    const sortedColumn = sortBy || null;
    const segmentIds = getSegmentAccessForUser(user);
    let data = await this.getAllData({
      include: [
        {
          model: Contact,
          attributes: ["email"],
        },
        {
          model: Employee,
          attributes: ["id", "employeeNumber"],
          include: [
            { model: LoginUser, attributes: ["firstName", "lastName"] },
          ],
        },
        {
          model: SubSegment,
          attributes: ["id", "code", "name"],
        },
        {
          model: SegmentManager,
          attributes: ["id", "loginUserId", "clientId"],
          include: [{ model: LoginUser, attributes: ["id", "name", "email"] }],
        },
      ],
      where: {
        deletedAt: null,
        ...(isActive !== undefined && { isActive }),
        ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
        clientId: clientId,
        ...(search && {
          name: {
            [Op.iLike]:
              "%" +
              (typeof search === "string" ? search.toLowerCase() : search) +
              "%",
          },
        }),
      },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "code", sort ?? "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    // await createHistoryRecord({
    //   tableName: tableEnum.SEGMENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.SEGMENT, "All Segments Services!"),
    //   jsonData: parse(responseObj),
    //   activity: statusEnum.VIEW,
    // });
    return responseObj;
  }

  async getSegmentsForSearchDropdown(query: IQueryParameters, user: User) {
    const { clientId } = query;
    const segmentIds = getSegmentAccessForUser(user);
    const data = await this.getAll({
      where: {
        deletedAt: null,
        ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
        clientId: clientId,
      },
      attributes: ["name"],
    });
    const dropdownData = data?.map((finalData) => {
      return {
        label: `${finalData?.name}`,
        value: `${finalData?.name}`,
      };
    });

    return dropdownData;
  }

  async getSegmentDataService(query: IQueryParameters, user: User) {
    const { clientId, isActive } = query;
    const segmentIds = getSegmentAccessForUser(user);
    let data = await this.getAllData({
      where: {
        deletedAt: null,
        clientId: clientId,
        ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
        ...(isActive === true && { isActive }),
      },
      attributes: ["id", "name", "isActive"],
      order: [["code", "asc"]],
    });
    data = parse(data);
    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    // await createHistoryRecord({
    //   tableName: tableEnum.SEGMENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.SEGMENT, "All Segments Services!"),
    //   jsonData: parse(responseObj),
    //   activity: statusEnum.VIEW,
    // });
    return responseObj;
  }

  async getSegmentEmployeeDataService(query: IQueryParameters, user: User) {
    const { clientId, isActive } = query;
    const segmentIds = getSegmentAccessForUser(user);
    let data = await this.getAll({
      where: {
        deletedAt: null,
        clientId: clientId,
        ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
        ...(isActive?.toString() === "true" && { isActive }),
      },
      include: [
        {
          model: Employee,
          attributes: ["id", "employeeNumber"],
          include: [
            { model: LoginUser, attributes: ["firstName", "lastName", "name"] },
          ],
        },
      ],
      attributes: ["id", "name"],
      order: [["code", "asc"]],
    });
    // await createHistoryRecord({
    //   tableName: tableEnum.SEGMENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.SEGMENT, "Segment Employee Data Services!"),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    data = parse(data);
    return data;
  }

  async getSegmentDataForClientTimesheetService(id: number) {
    const isFound = await Client.findOne({
      where: { id: id, deletedAt: null },
      include: [{ model: ClientTimesheetStartDay }],
      order: [["clientTimesheetStartDay", "date", "asc"]],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.SEGMENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.SEGMENT, "Segment Data For Client Timesheet Services!"),
    //   jsonData: parse(isFound),
    //   activity: statusEnum.VIEW,
    // });
    const data = parse(isFound);
    return data;
  }

  async getSegmentByIdService(id: number) {
    const isFound = await Segment.findOne({
      where: { id: id, deletedAt: null },
      include: [
        {
          model: SegmentManager,
          attributes: ["id", "loginUserId", "clientId"],
          include: [{ model: LoginUser, attributes: ["id", "name", "email"] }],
        },
      ],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.SEGMENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.SEGMENT, "Segment Services!"),
    //   jsonData: parse(isFound),
    //   activity: statusEnum.VIEW,
    // });
    const data = parse(isFound);
    return data;
  }

  async getSegmentBySlugService(slug: string) {
    const isFound = await Segment.findOne({
      include: [
        {
          model: Contact,
          attributes: ["email", "name"],
        },
        {
          model: SegmentManager,
          attributes: ["id", "loginUserId", "clientId"],
          include: [{ model: LoginUser, attributes: ["id", "name", "email"] }],
        },
      ],
      where: { slug: slug, deletedAt: null },
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.SEGMENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.SEGMENT, "Search Segment Services!"),
    //   jsonData: parse(isFound),
    //   activity: statusEnum.VIEW,
    // });
    const data = parse(isFound);
    return data;
  }

  async addSegmentService({
    body,
    user,
  }: {
    body: ISegmentCreate;
    user: User;
  }) {
    const isExist = await Segment.findOne({
      where: { code: body.code.toString(), clientId: body.clientId },
    });

    if (isExist) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }

    const uniqueSlug = body.name + body.code;

    const slug = slugify(uniqueSlug, { lower: true, replacement: "-" });

    let data = await Segment.create({ ...body, slug, createdBy: user.id });

    data = parse(data);

    if (body?.segmentManagers?.length > 0) {
      body?.segmentManagers?.map(async (loginUserId: number) => {
        const exits = await SegmentManager.findOne({
          where: {
            segmentId: data?.id,
            loginUserId: loginUserId,
            clientId: data.clientId,
          },
        });
        if (!exits) {
          await SegmentManager.create({
            segmentId: data?.id,
            loginUserId: loginUserId,
            clientId: data?.clientId,
          });
        }
      });
    }

    const newData = await this.getSegmentByIdService(data.id);
    await SegmentTimesheetStartDay.create({
      clientId: newData.clientId,
      segmentId: newData.id,
      timesheetStartDay: newData.timeSheetStartDay,
      date: moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate(),
      createdBy: user.id,
    });

    await createHistoryRecord({
      tableName: tableEnum.SEGMENT,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      moduleName: moduleName.SETUP,
      custom_message: await customHistoryCreateMessage(user, tableEnum.SEGMENT, newData),
      jsonData: parse(newData),
      activity: statusEnum.CREATE,
    });

    return newData;
  }

  async updateSegmentService({
    body,
    user,
    id,
  }: {
    body: ISegmentCreate;
    user: User;
    id: number;
  }) {
    const transaction = await db.transaction();
    let isExist = await Segment.findOne({
      where: {
        code: body.code.toString(),
        id: { [Op.ne]: id },
        clientId: body.clientId,
      },
    });

    if (isExist) {
      throw new HttpException(200, this.msg.exist, {}, true);
    }
    isExist = await Segment.findOne({ where: { id: id, deletedAt: null } });
    isExist = parse(isExist);
    if (!isExist) {
      throw new HttpException(200, this.msg.notFound, {}, true);
    }
    if (isExist?.timeSheetStartDay !== body.timeSheetStartDay) {
      let ifExist = await SegmentTimesheetStartDay.findOne({
        where: {
          segmentId: isExist.id,
          clientId: isExist.clientId,
          date: moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate(),
        },
        transaction,
      });
      ifExist = parse(ifExist);
      if (!ifExist) {
        await SegmentTimesheetStartDay.create({
          segmentId: isExist.id,
          clientId: isExist.clientId,
          timesheetStartDay: body.timeSheetStartDay,
          date: moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate(),
          createdBy: user.id,
        });
      } else {
        await SegmentTimesheetStartDay.update(
          {
            segmentId: isExist.id,
            clientId: isExist.clientId,
            timesheetStartDay: body.timeSheetStartDay,
            date: moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate(),
            createdBy: user.id,
          },
          {
            where: {
              segmentId: isExist.id,
              clientId: isExist.clientId,
              date: moment(
                moment().format("DD-MM-YYYY"),
                "DD-MM-YYYY"
              ).toDate(),
            },
            transaction,
            individualHooks: true,
          }
        );
      }

      const diffDate = body.timeSheetStartDay - isExist.timeSheetStartDay;
      const today = moment();
      let allEmp = await Employee.findAll({
        attributes: ["id"],
        where: {
          clientId: isExist.clientId,
          segmentId: isExist.id,
        },
        transaction,
      });
      allEmp = parse(allEmp);
      await Promise.all(
        allEmp.map(async (empDat) => {
          const timeSheetData = await this.TimesheetService.getAllTimesheetByEmployeeId(
            empDat.id,
            transaction
          );
          await Promise.all(
            timeSheetData?.map(
              async (timesheet: {
                id: number;
                startDate: Date;
                endDate: Date;
                segmentId: number;
                subSegmentId: number;
              }) => {
                if (
                  today.isSameOrBefore(timesheet.endDate) &&
                  today.isSameOrAfter(timesheet.startDate)
                ) {
                  await this.TimesheetService.updateTimesheetService({
                    body: {
                      endDate: moment(timesheet.endDate)
                        .add(diffDate, "days")
                        .toDate(),
                    },
                    user,
                    id: timesheet.id,
                    transaction,
                  });
                } else if (moment(timesheet.startDate).isAfter(today)) {
                  await this.TimesheetService.updateTimesheetService({
                    body: {
                      startDate: moment(timesheet.startDate)
                        .add(diffDate, "days")
                        .toDate(),
                      endDate: moment(timesheet.endDate)
                        .add(diffDate, "days")
                        .toDate(),
                      dbKey: `${moment(
                        timesheet.startDate,
                        "YYYY-MM-DD"
                      ).format("DDMMYYYY")}${timesheet.segmentId}${
                        timesheet.subSegmentId || ""
                      }${empDat.id}`,
                    },
                    user,
                    id: timesheet.id,
                    transaction,
                  });
                }
              }
            )
          );
        })
      );
    }

    const uniqueSlug = body.name + body.code;

    const slug = slugify(uniqueSlug, { lower: true, replacement: "-" });

    await Segment.update(
      { ...body, slug, updatedBy: user.id },
      { where: { id: id }, individualHooks: true }
    );

    if (body?.segmentManagers?.length > 0) {
      body?.segmentManagers?.map(async (loginUserId: number) => {
        const exits = await SegmentManager.findOne({
          where: {
            segmentId: id,
            loginUserId: loginUserId,
            clientId: isExist.clientId,
          },
        });
        if (!exits) {
          await SegmentManager.create({
            segmentId: id,
            loginUserId: loginUserId,
            clientId: isExist.clientId,
          });
        }
      });
    }
    const data = await this.getSegmentByIdService(id);
    await createHistoryRecord({
      tableName: tableEnum.SEGMENT,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      moduleName: moduleName.SETUP,
      custom_message: await customHistoryUpdateMesage(
        body,
        isExist,
        user,
        data,
        tableEnum.SEGMENT
      ),
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });

    return data;
  }

  async updateSegmentStatus({
    body,
    id,
    user,
  }: {
    body: ISegmentCreate;
    id: number;
    user: User;
  }) {
    let isExistClient = await Segment.findOne({ where: { id: id } });
    isExistClient = parse(isExistClient);
    if (!isExistClient) {
      throw new HttpException(404, this.msg.notFound);
    }

    await Segment.update({ isActive: body.isActive }, { where: { id: id } });
    await SubSegment.update(
      { isActive: body.isActive },
      { where: { segmentId: id } }
    );
    const data = await this.getSegmentByIdService(id);
    await createHistoryRecord({
      tableName: tableEnum.SEGMENT,
      moduleName: moduleName.SETUP,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryUpdateMesage(
        body,
        isExistClient,
        user,
        data,
        tableEnum.SEGMENT
      ),
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
    return data;
  }

  async deleteSegmentService({ id, user }: { id: number; user: User }) {
    try {
      await db.transaction(async (transaction) => {
        let isFound = await Segment.findOne({ where: { id: id } });
        if (!isFound) {
          throw new HttpException(404, this.msg.notFound);
        }
        isFound = parse(isFound);
        const data = await Segment.destroy({ where: { id: id }, transaction });
        const currentDate = moment(
          moment().format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();

        await Promise.all([
          SubSegment.destroy({
            where: { segmentId: isFound.id, deletedAt: null },
            transaction,
          }),
          Employee.update(
            { segmentId: null, subSegmentId: null },
            { where: { segmentId: isFound.id, deletedAt: null } }
          ),
          Timesheet.update(
            { segmentId: null, subSegmentId: null },
            {
              where: {
                segmentId: isFound.id,
                deletedAt: null,
                startDate: { [Op.gte]: currentDate },
              },
            }
          ),
          UserSegment.destroy({
            where: { segmentId: isFound.id, deletedAt: null },
          }),
          UserSegmentApproval.destroy({
            where: { segmentId: isFound.id, deletedAt: null },
          }),
        ]);
        await createHistoryRecord({
          tableName: tableEnum.SEGMENT,
          moduleName: moduleName.SETUP,
          userId: user?.id,
          lastlogintime: user?.loginUserData?.logintimeutc,
          custom_message: await customHistoryDeleteMessage(user, tableEnum.SEGMENT, isFound),
          jsonData: parse(isFound),
          activity: statusEnum.DELETE,
        });
        return data;
      });
    } catch (error) {
      throw new HttpException(
        400,
        "Something went wrong! Please try again",
        null,
        true
      );
    }
  }

  async getAllSegmentsByClientIdsService(query: IQueryParameters) {
    const { clientIds } = query;
    let responseData = await this.getAllData({
      where: {
        ...(clientIds
          ? { clientId: { [Op.in]: clientIds.split(",") } }
          : { clientId: 0 }),
      },
      include: [
        {
          model: Client,
          attributes: ["code"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
        {
          model: SubSegment,
          attributes: ["id", "code", "name"],
        },
      ],
      attributes: ["id", "name"],
    });
    // await createHistoryRecord({
    //   tableName: tableEnum.SEGMENT,
    //   moduleName: moduleName.SETUP,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.SEGMENT, "All Segments data of client"),
    //   jsonData: parse(responseData),
    //   activity: statusEnum.VIEW,
    // });
    responseData = parse(responseData);
    return responseData?.rows;
  }
}
