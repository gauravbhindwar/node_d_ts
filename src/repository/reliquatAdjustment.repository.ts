import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { IReliquatAdjustmentCreate } from "@/interfaces/model/reliquatAdjustment.interface";
import db from "@/models";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import LoginUser from "@/models/loginUser.model";
import ReliquatAdjustment from "@/models/reliquatAdjustment.model";
import Timesheet from "@/models/timesheet.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { generateModalData } from "@/utils/generateModal";
import moment from "moment";
import { Op, Sequelize, Transaction } from "sequelize";
import BaseRepository from "./base.repository";
import ReliquatCalculationRepo from "./reliquatCalculation.repository";
import TimesheetRepo from "./timesheet.repository";

export default class ReliquatAdjustmentRepo extends BaseRepository<
  ReliquatAdjustment
> {
  constructor() {
    super(ReliquatAdjustment.name);
  }

  private timesheetRepo = new TimesheetRepo();
  private reliquatCalculationRepo = new ReliquatCalculationRepo();
  // private reliquatCalculationV2Repo = new ReliquatCalculationV2Repo();
  private msg = new MessageFormation("Reliquat Adjustment").message;

  async getAllReliquatAdjustment(query: IQueryParameters) {
    const { page, limit, clientId, employeeId, sortBy, sort } = query;
    const sortedColumn = sortBy || null;
    let whereClause: any = {
      deletedAt: null,
      clientId: clientId,
    };
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    let data = await this.getAllData({
      where: whereClause,
      include: [
        {
          model: Client,
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id"],
          include: [
            { model: LoginUser, attributes: ["firstName", "lastName", "name"] },
          ],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["id"],
          include: [
            { model: LoginUser, attributes: ["firstName", "lastName", "name"] },
          ],
        },
        {
          model: Employee,
          attributes: ["id"],
          include: [
            { model: LoginUser, attributes: ["firstName", "lastName"] },
          ],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "startDate", sort ?? "asc"]],
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

  async getReliquatAdjustmentById(id: number, transaction?: Transaction) {
    let data = await ReliquatAdjustment.findOne({
      where: { id: id, deletedAt: null },
      include: [
        {
          model: Client,
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
        {
          model: Employee,
          attributes: ["id"],
          include: [
            { model: LoginUser, attributes: ["firstName", "lastName"] },
          ],
        },
      ],
      transaction,
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    data = parse(data);
    return data;
  }

  async addReliquatAdjustment({
    body,
    user,
  }: {
    body: IReliquatAdjustmentCreate;
    user: User;
  }) {
    await generateModalData({
      user: user,
      percentage: 0,
      message: "Updating Reliquat Calculation",
    });
    const transaction = await db.transaction();
    const promises = [];
    let isExist = await this.get({
      where: {
        [Op.and]: [Sequelize.literal(`DATE("startDate")='${body.startDate}'`)],
        clientId: body.clientId,
        employeeId: body.employeeId,
        deletedAt: null,
      },
      transaction,
    });
    isExist = parse(isExist);
    let data = null;
    if (isExist) {
      data = await ReliquatAdjustment.update(
        { adjustment: body.adjustment },
        { where: { id: isExist.id }, transaction, individualHooks: true }
      );
    } else {
      data = await ReliquatAdjustment.create(
        { ...body, createdBy: user.id },
        { transaction }
      );
    }
    data = parse(data);
    await generateModalData({
      user: user,
      percentage: 40,
      message: "Updating Reliquat Calculation",
    });
    if (body.employeeId) {
      const lastDayOfNextMonth = moment()
        .clone()
        .add(2, "month")
        .endOf("month");
      const timesheetData = await Timesheet.findAll({
        where: {
          employeeId: body.employeeId,
          clientId: body.clientId,
          endDate: {
            [Op.or]: {
              [Op.between]: [body.startDate, lastDayOfNextMonth],
              [Op.eq]: lastDayOfNextMonth,
            },
          },
        },
        order: [["startDate", "asc"]],
        transaction,
      }).then((value) => parse(value));
      // const timesheetData = await this.timesheetRepo.getTimesheetDataForReliquet(
      // 	data.clientId,
      // 	[body.employeeId],
      // 	[],
      // 	transaction,
      // );
      for (const tempTimeSheetData of timesheetData) {
        const promise = new Promise(async (resolve) => {
          await this.reliquatCalculationRepo.addReliquatCalculationService(
            {
              employeeId: String(tempTimeSheetData?.employeeId),
              timesheetId: tempTimeSheetData?.id,
              userId: user?.id || null,
            },
            transaction
          );
          resolve(true);
        });
        promises.push(promise);

        await promise;
      }
      await generateModalData({
        user: user,
        percentage: 100,
        message: "Updating Reliquat Calculation",
      });
      await Promise.all(promises);

      // const timesheet = await this.timesheetRepo.getTimesheetDataUsingDate(
      // 	body.employeeId,
      // 	body.startDate,
      // 	transaction,
      // );
      // if (timesheet) {
      // 	const promise = new Promise(async (resolve) => {
      // 		await this.reliquatCalculationRepo.addReliquatCalculationService(
      // 			{
      // 				employeeId: String(body.employeeId),
      // 				timesheetId: timesheet.id,
      // 				userId: user.id,
      // 			},
      // 			transaction,
      // 		);
      // 		resolve(true);
      // 	});
      // 	promises.push(promise);
      // 	await promise;
      // }
      // await Promise.all(promises);
    }
    data = await this.getReliquatAdjustmentById(
      isExist ? isExist.id : data.id,
      transaction
    );

    await createHistoryRecord({
      tableName: tableEnum.RELIQUAT_ADJUSTMENT,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created</b> Reliquat Adjustment for employee id ${data.employeeId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });
    await transaction.commit();
    return data;
  }

  async updateReliquatAdjustment({
    body,
    user,
    id,
  }: {
    body: IReliquatAdjustmentCreate;
    user: User;
    id: number;
  }) {
    await generateModalData({
      user: user,
      percentage: 0,
      message: "Updating Reliquat Calculation",
    });
    const transaction = await db.transaction();

    const isDataFound = await ReliquatAdjustment.findOne({
      where: { id: id, deletedAt: null },
      transaction,
    });

    if (!isDataFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    await ReliquatAdjustment.update(
      { ...body, updatedBy: user.id },
      { where: { id: id, deletedAt: null }, transaction, individualHooks: true }
    );
    await generateModalData({
      user: user,
      percentage: 40,
      message: "Updating Reliquat Calculation",
    });
    const updatedData = await this.getReliquatAdjustmentById(id, transaction);
    const promises = [];
    if (updatedData.employeeId) {
      const timesheet = await this.timesheetRepo.getTimesheetDataUsingDate(
        updatedData.employeeId,
        body.startDate,
        transaction
      );
      if (timesheet) {
        const lastDayOfNextMonth = moment()
          .clone()
          .add(2, "month")
          .endOf("month");
        const timesheetData = await Timesheet.findAll({
          where: {
            employeeId: updatedData.employeeId,
            clientId: updatedData.clientId,
            endDate: {
              [Op.or]: {
                [Op.between]: [body.startDate, lastDayOfNextMonth],
                [Op.eq]: lastDayOfNextMonth,
              },
            },
          },
          order: [["startDate", "asc"]],
          transaction,
        }).then((value) => parse(value));

        for (const tempTimeSheetData of timesheetData) {
          const promise = new Promise(async (resolve) => {
            await this.reliquatCalculationRepo.addReliquatCalculationService(
              {
                employeeId: String(tempTimeSheetData?.employeeId),
                timesheetId: tempTimeSheetData?.id,
                userId: user?.id || null,
              },
              transaction
            );
            resolve(true);
          });
          promises.push(promise);
          await promise;
        }
        await Promise.all(promises);
        await generateModalData({
          user: user,
          percentage: 100,
          message: "Updating Reliquat Calculation",
        });
      }
    }

    await createHistoryRecord({
      tableName: tableEnum.RELIQUAT_ADJUSTMENT,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Reliquat Adjustment for employee id ${isDataFound.employeeId}`,
      jsonData: parse(updatedData),
      activity: statusEnum.UPDATE,
    });
    await transaction.commit();
    return updatedData;
  }

  async deleteReliquatAdjustment(id: number, user: User) {
    await generateModalData({
      user: user,
      percentage: 0,
      message: "Updating Reliquat Calculation",
    });
    const transaction = await db.transaction();
    const isDataFound = await ReliquatAdjustment.findOne({
      where: { id: id, deletedAt: null },
      transaction,
    });
    const promises = [];
    if (!isDataFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    await generateModalData({
      user: user,
      percentage: 40,
      message: "Updating Reliquat Calculation",
    });
    const data = await ReliquatAdjustment.update(
      { updatedBy: user.id, deletedAt: new Date() },
      { where: { id: id }, individualHooks: true }
    );
    if (isDataFound.employeeId) {
      const lastDayOfNextMonth = moment()
        .clone()
        .add(2, "month")
        .endOf("month");
      const timesheetData = await Timesheet.findAll({
        where: {
          employeeId: isDataFound.employeeId,
          clientId: isDataFound.clientId,
          endDate: {
            [Op.or]: {
              [Op.between]: [isDataFound.startDate, lastDayOfNextMonth],
              [Op.eq]: lastDayOfNextMonth,
            },
          },
        },
        order: [["startDate", "asc"]],
        transaction,
      }).then((value) => parse(value));
      // const timesheetData = await this.timesheetRepo.getTimesheetDataForReliquet(
      // 	isDataFound.clientId,
      // 	[isDataFound.employeeId],
      // 	[],
      // 	transaction,
      // );
      for (const tempTimeSheetData of timesheetData) {
        const promise = new Promise(async (resolve) => {
          await this.reliquatCalculationRepo.addReliquatCalculationService(
            {
              employeeId: String(tempTimeSheetData?.employeeId),
              timesheetId: tempTimeSheetData?.id,
              userId: user?.id || null,
            },
            transaction
          );
          resolve(true);
        });
        promises.push(promise);
        await promise;
      }
      await Promise.all(promises);
      await generateModalData({
        user: user,
        percentage: 100,
        message: "Updating Reliquat Calculation",
      });
      // 	const timesheet = await this.timesheetRepo.getTimesheetDataUsingDate(
      // 		isDataFound.employeeId,
      // 		moment(isDataFound.startDate).format('YYYY-MM-DD'),
      // 		transaction,
      // 	);
      // 	if (timesheet)
      // 		await this.reliquatCalculationV2Repo.generateReliquatCalculationV2(
      // 			[isDataFound.employeeId],
      // 			timesheet.id,
      // 			user.id,
      // 			transaction,
      // 		);
    }
    await createHistoryRecord({
      tableName: tableEnum.RELIQUAT_ADJUSTMENT,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Reliquat Adjustment for employee id ${isDataFound.employeeId}`,
      jsonData: parse(data),
      activity: statusEnum.DELETE,
    });
    await transaction.commit();
    return data;
  }
}
