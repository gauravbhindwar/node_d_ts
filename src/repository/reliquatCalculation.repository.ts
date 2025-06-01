import { FRONTEND_URL } from "@/config";
import { applyCustomPagination } from "@/helpers/common.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import EmployeeRotation from "@/models/employeeRotation.model";
import EmployeeSegment from "@/models/employeeSegment.model";
import LoginUser from "@/models/loginUser.model";
import ReliquatAdjustment from "@/models/reliquatAdjustment.model";
import ReliquatCalculation from "@/models/reliquatCalculation.model";
import ReliquatPayment from "@/models/reliquatPayment.model";
import Rotation from "@/models/rotation.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import TimesheetSchedule from "@/models/timesheetSchedule.model";
import {
  absenceArray,
  absenceArrOptions,
  bonusOptions,
  caOptions,
  leaveArray,
  parse,
  presenceOptions,
} from "@/utils/common.util";
import { Request } from "express";
import _ from "lodash";
import moment from "moment";
import { Op, Sequelize, Transaction } from "sequelize";
import BaseRepository from "./base.repository";

export default class ReliquatCalculationRepo extends BaseRepository<
  ReliquatCalculation
> {
  constructor() {
    super(ReliquatCalculation.name);
  }

  async getAllReliquatCalculationService(
    req: Request,
    query: IQueryParameters
  ) {
    let data;
    const { page, limit, sort, sortBy, clientId, employeeId } = query;
    const sortedColumn = sortBy || null;

    const filter = {
      endDate: {
        [Op.lte]: moment().endOf("month").toDate(),
      },
    };

    if (_.isUndefined(req.query.listView)) {
      data = await this.getAllData({
        where: {
          ...(clientId !== undefined && { clientId: clientId }),
          deletedAt: null,
          ...filter,
        },
        include: [
          {
            model: Employee,
            attributes: [
              "id",
              "loginUserId",
              "contractEndDate",
              "employeeNumber",
              "slug",
              "utccontractEndDate",
              "employeeType",
            ],
            as: "employee",
            where: {
              // ...(employeeLoginData?.loginUserId && { loginUserId: employeeLoginData?.loginUserId }),
              // ...(isEmployeeLogin?.id === req?.user?.roleId && {
              // 	id: employeeLoginData.id,
              // }),
              ...(employeeId !== undefined && { id: employeeId }),
            },
            include: [
              {
                model: EmployeeSegment,
                attributes: ["id", "date", "rollover", "employeeId"],
                include: [
                  {
                    model: Segment,
                    attributes: ["name", "id"],
                  },
                  {
                    model: SubSegment,
                    attributes: ["name", "id"],
                  },
                ],
              },
              { model: LoginUser, attributes: ["firstName", "lastName"] },
              {
                model: Rotation,
                attributes: ["name", "id", "weekOn", "weekOff", "description", "isResident"],
              },
              {
                model: Segment,
                attributes: ["name", "id"],
              },
              {
                model: SubSegment,
                attributes: ["name", "id"],
              },
            ],
          },
          {
            model: Timesheet,
            attributes: ["id", "status"],
          },
        ],
        order: [[sortedColumn ?? "createdAt", sort ?? "asc"]],
      });
      data = parse(data);
      const uniqueArray = data?.rows.filter(
        (obj, index, self) =>
          index === self.findIndex((t) => t.startDate === obj.startDate)
      );
      let newData = await applyCustomPagination(uniqueArray, query);

      const newTotals = {
        totalWorked: 0,
        totalEarned: 0,
        totalTaken: 0,
        totalReliquat: 0,
      };

      uniqueArray?.forEach((item) => {
        newTotals.totalWorked += item.presentDay || 0;
        newTotals.totalEarned += item.monthly_earned || 0;
        newTotals.totalTaken += item.leave || 0;
        newTotals.totalReliquat += item.monthly_reliquat || 0;
      });

      const responseObj = {
        data: newData,
        count: uniqueArray.length,
        currentPage: page ?? undefined,
        limit: limit ?? undefined,
        lastPage:
          page && limit ? Math.ceil(uniqueArray.length / +limit) : undefined,
        newTotals: newTotals,
      };

      return responseObj;
    } else {
      data = await this.getAll({
        where: {
          ...(clientId !== undefined && { clientId: clientId }),
          deletedAt: null,
        },
        include: [
          {
            model: Employee,
            attributes: [
              "id",
              "loginUserId",
              "contractEndDate",
              "employeeNumber",
              "utccontractEndDate",
            ],
            as: "employee",
            where: {
              // ...(employeeLoginData?.loginUserId && { loginUserId: employeeLoginData?.loginUserId }),
              // ...(isEmployeeLogin?.id === req?.user?.roleId && {
              // 	id: employeeLoginData.id,
              // }),
              ...(employeeId !== undefined && { id: employeeId }),
            },
            include: [
              {
                model: EmployeeSegment,
                attributes: ["id", "date", "rollover", "employeeId"],
              },
              { model: LoginUser, attributes: ["firstName", "lastName"] },
              {
                model: Rotation,
                attributes: ["name", "id", "weekOn", "weekOff", "description"],
              },
              {
                model: Timesheet,
                attributes: ["id", "status"],
              },
            ],
          },
        ],
      });
      data = parse(data);
      return data;
    }
  }

  // comman titre de conge Reliquat Calculation...
  async generateReliquatCalculationService(
    { employeeId, date }: { employeeId: string; date: Date },
    transaction: Transaction = null
  ) {
    try {
      const lastDate = moment(date).subtract(1, "month").toDate();
      const ReliquatCalculationLastRecord = await ReliquatCalculation.findOne({
        where: {
          employeeId: +employeeId,
          deletedAt: null,
          startDate: { [Op.lte]: lastDate },
        },
        order: [["startDate", "desc"]],
        transaction,
      });
      console.log(
        "ReliquatCalculationLastRecord",
        parse(ReliquatCalculationLastRecord)
      );

      if (ReliquatCalculationLastRecord) {
        console.log("step 1 called----------");
        const timesheetData = await Timesheet.findOne({
          where: {
            employeeId: +employeeId,
            deletedAt: null,
            startDate: { [Op.lte]: date },
          },
          order: [["startDate", "desc"]],
          attributes: ["startDate", "endDate", "clientId", "id"],
          transaction,
        });
        if (timesheetData) {
          console.log("step 2 called----------");
          const calculationDataJSON: any = {};
          let employeeData = await Employee.findOne({
            include: [
              {
                model: Segment,
              },
              {
                model: SubSegment,
              },
              {
                model: EmployeeSegment,
                as: "employeeSegment",
                order: [["date", "asc"]],
                separate: true,
                attributes: ["employeeId", "segmentId", "rollover", "date"],
              },
              {
                model: LoginUser,
                attributes: ["firstName", "lastName", "email"],
              },
              {
                model: Client,
                attributes: ["endDate"],
              },
            ],
            where: {
              deletedAt: null,
              id: +employeeId,
            },
            transaction,
          });
          employeeData = parse(employeeData);
          let Wb1 = 2;
          // O2 = 2;
          let Wb2 = 1;
          // O1 = 1;
          if (employeeData?.subSegmentId) {
            Wb1 = Number(employeeData?.subSegment?.fridayBonus);
            Wb2 = Number(employeeData?.subSegment?.saturdayBonus);
            // O1 = Number(employeeData?.subSegment?.overtime01Bonus);
            // O2 = Number(employeeData?.subSegment?.overtime02Bonus);
          }
          if (employeeData?.segmentId && employeeData?.subSegmentId == null) {
            Wb1 = Number(employeeData?.segment?.fridayBonus);
            Wb2 = Number(employeeData?.segment?.saturdayBonus);
            // O1 = Number(employeeData?.segment?.overtime01Bonus);
            // O2 = Number(employeeData?.segment?.overtime02Bonus);
          }
          const statusCountQuery = presenceOptions
            .map((dataItem) => `WHEN status = '${dataItem}' THEN 1`)
            .join(" ");
          const statusCRCountQuery = leaveArray
            .map((dataItem) => `WHEN status = '${dataItem}' THEN 1`)
            .join(" ");
          // const statusAbsenseCountQuery = absenceArray
          // 	.map((dataItem) => `WHEN status = '${dataItem}' THEN 1`)
          // 	.join(' ');
          console.log("step 3 called----------");
          const statusBonusCountQuery = bonusOptions
            .map(
              (dataItem) =>
                `WHEN "TimesheetSchedule"."bonusCode" = '${dataItem}' THEN ${
                  dataItem === "O1" ? 1 : dataItem === "O2" && 2
                }`
            )
            .join(" ");
          const calculationdata = await TimesheetSchedule.findAndCountAll({
            transaction,
            where: {
              deletedAt: null,
              employeeId: +employeeId,
              [Op.or]: [
                {
                  status: {
                    [Op.in]: presenceOptions.map((dataItem) => dataItem),
                  },
                },
                {
                  bonusCode: "W",
                },
                {
                  status: { [Op.in]: leaveArray.map((dataItem) => dataItem) },
                },
                {
                  bonusCode: {
                    [Op.in]: bonusOptions.map((dataItem) => dataItem),
                  },
                },
                // {
                // 	status: { [Op.in]: absenceArray.map((dataItem) => dataItem) },
                // },
              ],
              date: {
                [Op.between]: [timesheetData.startDate, date],
              },
            },
            include: [
              {
                model: Employee,
                attributes: ["id", "loginUserId", "startDate"],
                as: "employee",
                include: [
                  { model: LoginUser, attributes: ["firstName", "lastName"] },
                ],
              },
            ],
            attributes: [
              [
                Sequelize.literal(
                  `cast(SUM(CASE ${statusCountQuery} ELSE 0 END) as float)`
                ),
                "statusCount",
              ],
              [
                Sequelize.literal(
                  `cast(SUM(CASE ${statusCRCountQuery} ELSE 0 END) as float)`
                ),
                "statusCRCount",
              ],
              // [
              // 	Sequelize.literal(`cast(SUM(CASE ${statusAbsenseCountQuery} ELSE 0 END) as float)`),
              // 	'statusAbsenseCount',
              // ],
              [
                Sequelize.literal(
                  `cast(SUM(CASE ${statusBonusCountQuery} ELSE 0 END) as float)`
                ),
                "statusBonusCount",
              ],
              [
                Sequelize.literal(
                  `cast(bool_or(CASE WHEN "TimesheetSchedule"."bonusCode" = 'W' THEN true ELSE false END) as boolean)`
                ),
                "hasWStatus",
              ],
            ],
            group: ["employee.id", "employee->loginUserData.id"],
          });
          if (calculationdata?.rows?.length > 0) {
            console.log("step 4 called----------");
            const timeSheetDataCount: any = parse(calculationdata?.rows[0]);
            let rotationData = await EmployeeRotation.findAll({
              include: [
                {
                  model: Rotation,
                  paranoid: false,
                },
              ],
              where: {
                employeeId: +employeeId,
                date: { [Op.lte]: date },
              },
              order: [["date", "desc"]],
              transaction,
            });
            rotationData = parse(rotationData);
            const rotationDayCount: any = [];
            console.log("step 5 called----------");

            let dateListing = await TimesheetSchedule.findAll({
              where: {
                employeeId: +employeeId,
                status: {
                  [Op.in]: ["CR", ...absenceArray],
                },
                date: {
                  [Op.between]: [timesheetData.startDate, date],
                },
              },
              transaction,
            });
            dateListing = parse(dateListing);

            let adjustmentValue = 0;

            let reliquatAdjustmentData = await ReliquatAdjustment.findAll({
              where: {
                employeeId: employeeData?.id,
                clientId: employeeData?.clientId,
              },
              transaction,
            });
            reliquatAdjustmentData = parse(reliquatAdjustmentData);
            console.log("step 6 called----------");
            reliquatAdjustmentData?.map((adjustment) => {
              const isBetween = moment(adjustment.startDate).isBetween(
                timesheetData.startDate,
                date,
                null,
                "[]"
              );
              if (isBetween) adjustmentValue = adjustment.adjustment;
            });

            let paymentValue = 0;
            let reliquatPaymentData = await ReliquatPayment.findAll({
              where: {
                employeeId: employeeData?.id,
                clientId: employeeData?.clientId,
              },
              transaction,
            });
            reliquatPaymentData = parse(reliquatPaymentData);
            reliquatPaymentData?.map((payment) => {
              const isBetween = moment(payment.startDate).isBetween(
                timesheetData.startDate,
                date,
                null,
                "[]"
              );
              if (isBetween) paymentValue += payment.amount;
            });
            console.log("step 7 called----------");
            const temprotationData = [...rotationData];
            await temprotationData.reduce(
              (accumulator: any, currentValue, i, arr) => {
                const tempData: any = {
                  rId: currentValue?.rotationId,
                  date: moment(accumulator).format("MM/DD/YYYY"),
                };
                const countDatesInRange = dateListing.reduce(
                  (count, dateEntry) => {
                    const entryDate = moment(dateEntry.date);

                    if (
                      entryDate.isSameOrAfter(currentValue.date) &&
                      entryDate.isSameOrBefore(accumulator)
                    ) {
                      return count + 1;
                    }

                    return count;
                  },
                  0
                );

                const startDate = moment(timesheetData.startDate);
                const currentDate = moment(currentValue.date);
                const diffDate = moment(currentDate).isSameOrBefore(startDate)
                  ? timesheetData.startDate
                  : currentValue.date;
                if (moment(startDate).isBefore(diffDate)) {
                  tempData.count =
                    moment(accumulator)
                      .add(1, "days")
                      .diff(moment(diffDate), "days") - countDatesInRange;
                } else {
                  if (timesheetData.startDate === diffDate) {
                    tempData.count =
                      moment(accumulator)
                        .add(1, "days")
                        .diff(moment(diffDate), "days") - countDatesInRange;
                  } else {
                    tempData.count =
                      moment(accumulator).diff(moment(diffDate), "days") -
                      countDatesInRange;
                  }
                  arr.splice(i);
                }
                rotationDayCount.push(tempData);
                return moment(currentValue.date);
              },
              moment(employeeData.client.endDate).isBetween(
                timesheetData.startDate,
                timesheetData.endDate
              )
                ? employeeData.client.endDate
                : date
            );
            console.log("step 8 called----------");

            let sumOfWStatus = 0;

            if (timeSheetDataCount?.hasWStatus) {
              sumOfWStatus = await this.calculateWStatus(
                employeeId,
                timesheetData.startDate,
                date,
                Wb1,
                Wb2,
                transaction
              );
            }

            const tempRotationDayCount = await Promise.all(
              rotationDayCount.map(async (e) => {
                const rotation: any = await rotationData.find(
                  (e1) => e1?.rotationId == e?.rId
                );
                const temp =
                  (rotation?.rotation.weekOff / rotation?.rotation.weekOn) *
                  e.count;
                e.rotationCalculation = temp;
                return { ...e };
              })
            );

            calculationDataJSON.monthData = { ...tempRotationDayCount };
            console.log("step 9 called----------");

            const reliquatCalculationsData: any = {};

            const isWithinDateRange = employeeData?.employeeSegment.some(
              (segment) => {
                const segmentDate = moment(segment.date);
                return segmentDate.isBetween(
                  timesheetData.startDate,
                  date,
                  null,
                  "[]"
                );
              }
            );

            const rolloverData = isWithinDateRange
              ? employeeData.employeeSegment.find((segment) => {
                  const segmentDate = moment(segment.date);
                  return segmentDate.isBetween(
                    timesheetData.startDate,
                    date,
                    null,
                    "[]"
                  );
                })?.rollover
              : null;
            console.log("step 10 called----------");
            let tempRotationDayCountForLoop: any = [];
            if (ReliquatCalculationLastRecord) {
              console.log("step 11 called----------");
              if (isWithinDateRange && !rolloverData) {
                console.log("step 12 called----------");
                reliquatCalculationsData.totalWorked = +timeSheetDataCount.statusCount;
                reliquatCalculationsData.overtime = +timeSheetDataCount?.statusBonusCount;
                reliquatCalculationsData.reliquatPayment = +paymentValue;
                reliquatCalculationsData.reliquatAdjustment = +adjustmentValue;
                reliquatCalculationsData.weekend = +sumOfWStatus;
                reliquatCalculationsData.weekendBonus = +sumOfWStatus;
                reliquatCalculationsData.overtimeBonus = +timeSheetDataCount?.statusBonusCount;
                reliquatCalculationsData.totalTakenLeave = +timeSheetDataCount.statusCRCount;
                tempRotationDayCountForLoop = [...rotationDayCount];
              } else {
                reliquatCalculationsData.totalWorked =
                  +ReliquatCalculationLastRecord?.totalWorked +
                  +timeSheetDataCount?.statusCount;
                reliquatCalculationsData.overtime =
                  ReliquatCalculationLastRecord?.overtime +
                    +timeSheetDataCount?.statusBonusCount || 0;
                reliquatCalculationsData.weekend =
                  ReliquatCalculationLastRecord?.weekend + +sumOfWStatus || 0;
                reliquatCalculationsData.reliquatPayment =
                  ReliquatCalculationLastRecord?.reliquatPayment +
                  +paymentValue;
                reliquatCalculationsData.reliquatAdjustment =
                  ReliquatCalculationLastRecord?.reliquatAdjustment +
                  +adjustmentValue;
                reliquatCalculationsData.totalTakenLeave =
                  ReliquatCalculationLastRecord.totalTakenLeave +
                    +timeSheetDataCount.statusCRCount || 0;
                console.log(
                  "step 13 called----------",
                  ReliquatCalculationLastRecord.calculationDataJSON
                );
                const lastRotationData = JSON.parse(
                  ReliquatCalculationLastRecord.calculationDataJSON
                ).finalRotationCount;
                tempRotationDayCountForLoop = [
                  ...rotationDayCount,
                  ...lastRotationData,
                ];
              }
            } else {
              reliquatCalculationsData.totalWorked = +timeSheetDataCount.statusCount;
              reliquatCalculationsData.overtime = +timeSheetDataCount?.statusBonusCount;
              reliquatCalculationsData.reliquatPayment = +paymentValue;
              reliquatCalculationsData.reliquatAdjustment = +adjustmentValue;
              reliquatCalculationsData.weekend = +sumOfWStatus;
              reliquatCalculationsData.weekendBonus = +sumOfWStatus;
              reliquatCalculationsData.overtimeBonus = +timeSheetDataCount?.statusBonusCount;
              reliquatCalculationsData.totalTakenLeave = +timeSheetDataCount.statusCRCount;
              tempRotationDayCountForLoop = [...rotationDayCount];
            }
            let earned = 0;
            let calculateEquation = "";
            console.log("step 14 called----------");
            const finalRotationCount = tempRotationDayCountForLoop.reduce(
              (accumulator, currentValue: any) => {
                const rotationExitData = accumulator.findIndex(
                  (e) => e.rId === currentValue.rId
                );
                if (rotationExitData > -1) {
                  accumulator[rotationExitData].count += currentValue.count;
                  accumulator[rotationExitData].rotationCalculation +=
                    currentValue.rotationCalculation;
                } else {
                  accumulator.push(currentValue);
                }
                return accumulator;
              },
              []
            );

            calculationDataJSON.finalRotationCount = [...finalRotationCount];
            for (const item of finalRotationCount) {
              earned += item.rotationCalculation;
              const rotation: any = rotationData.find(
                (e1) => e1.rotationId == item.rId
              );
              calculateEquation += `((${rotation?.rotation.weekOff || 0}/${
                rotation?.rotation.weekOn || 0
              }) * ${item.count || 0} = ${
                parseFloat(item?.rotationCalculation?.toFixed(2) || "0") || 0
              }) + `;
            }
            earned +=
              reliquatCalculationsData?.weekend +
              reliquatCalculationsData?.overtime +
              reliquatCalculationsData?.reliquatAdjustment -
              reliquatCalculationsData?.reliquatPayment;
            reliquatCalculationsData.earned = parseFloat(
              earned?.toFixed(2) || "0"
            );
            reliquatCalculationsData.calculation = parseFloat(
              earned.toString() || "0"
            );
            reliquatCalculationsData.calculateEquation = `${calculateEquation.substring(
              0,
              calculateEquation.length - 3
            )} ${
              !(
                reliquatCalculationsData?.weekend ||
                reliquatCalculationsData?.overtime ||
                reliquatCalculationsData?.reliquatAdjustment
              )
                ? ""
                : `+ (${
                    +reliquatCalculationsData?.weekend +
                    +reliquatCalculationsData?.overtime +
                    +reliquatCalculationsData?.reliquatAdjustment
                  })`
            }`;

            reliquatCalculationsData.calculateEquation += `${
              reliquatCalculationsData?.reliquatPayment
                ? ` - ${reliquatCalculationsData?.reliquatPayment}`
                : ""
            }`;

            reliquatCalculationsData.reliquat =
              earned - reliquatCalculationsData.totalTakenLeave;
            reliquatCalculationsData.reliquat = parseFloat(
              reliquatCalculationsData?.reliquat || "0"
            ).toFixed(2);
            reliquatCalculationsData.reliquatValue = parseFloat(
              reliquatCalculationsData?.reliquat || "0"
            ).toFixed(2);
            reliquatCalculationsData.reliquat = Math.round(
              reliquatCalculationsData?.reliquat || "0"
            );
            reliquatCalculationsData.calculationDataJSON = JSON.stringify(
              calculationDataJSON
            );
            return reliquatCalculationsData.reliquat;
          }
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  // till end date Reliquat Calculation...

  async addReliquatCalculationService(
    {
      employeeId,
      timesheetId,
      userId = null,
      isApproved = false,
    }: {
      employeeId: string;
      timesheetId: number;
      userId: number | null;
      isApproved?: boolean;
    },
    transaction: Transaction
  ) {
    try {
      let isExist = await ReliquatCalculation.findOne({
        where: {
          timesheetId: timesheetId,
        },
        transaction,
      });
      isExist = parse(isExist);

      if (isExist?.timesheetId) {
        if (isApproved) {
          await ReliquatCalculation.destroy({
            where: {
              timesheetId: isExist.timesheetId,
            },
            transaction,
          });
        } else {
          await ReliquatCalculation.destroy({
            where: {
              employeeId: parseInt(employeeId),
              timesheetId: timesheetId,
              deletedAt: null,
            },
            transaction,
            force: true,
          });
        }
      }
      // if (isExist) {
      //   await createHistoryRecord(
      //     {
      //       tableName: tableEnum.RELIQUAT_CALCULATION,
      //       userId: userId,
      //       custom_message: await customHistoryCreateMessage(
      //         user,
      //         tableEnum.BONUS_TYPE,
      //         data
      //       ),

      //       jsonData: parse(isExist),
      //       activity: statusEnum.CREATE,
      //     },
      //     transaction
      //   );
      // }
      await this.timesheetData(
        employeeId,
        timesheetId,
        userId || null,
        transaction
      );
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  }

  async timesheetData(
    empData: string,
    timesheetId: number,
    userId: number | null,
    transaction: Transaction = null
  ) {
    try {
      const calculationDataJSON: any = {};
      let timesheetData = await Timesheet.findOne({
        where: {
          id: timesheetId,
        },
        attributes: ["startDate", "endDate", "clientId", "id"],
        transaction,
      });
      timesheetData = parse(timesheetData);
      if (timesheetData) {
        let employeeData = await Employee.findOne({
          include: [
            {
              model: Segment,
            },
            {
              model: SubSegment,
            },
            {
              model: EmployeeSegment,
              as: "employeeSegment",
              order: [["date", "asc"]],
              separate: true,
              attributes: ["employeeId", "segmentId", "rollover", "date"],
            },
            {
              model: LoginUser,
              attributes: ["firstName", "lastName", "email"],
            },
            {
              model: Client,
              attributes: ["endDate"],
            },
          ],
          where: {
            deletedAt: null,
            id: +empData,
          },
          transaction,
        });
        employeeData = parse(employeeData);
        const absenceFlag = employeeData?.isAbsenseValueInReliquat ?? false;
        let Wb1 = 2;
        // O2 = 2;
        let Wb2 = 1;
        // O1 = 1;
        if (employeeData?.subSegmentId) {
          Wb1 = Number(employeeData?.subSegment?.fridayBonus);
          Wb2 = Number(employeeData?.subSegment?.saturdayBonus);
          // O1 = Number(employeeData?.subSegment?.overtime01Bonus);
          // O2 = Number(employeeData?.subSegment?.overtime02Bonus);
        } else if (
          employeeData?.segmentId &&
          employeeData?.subSegmentId == null
        ) {
          Wb1 = Number(employeeData?.segment?.fridayBonus);
          Wb2 = Number(employeeData?.segment?.saturdayBonus);
          // O1 = Number(employeeData?.segment?.overtime01Bonus);
          // O2 = Number(employeeData?.segment?.overtime02Bonus);
        }

        const statusCountQuery = presenceOptions
          .map((dataItem) => `WHEN status = '${dataItem}' THEN 1`)
          .join(" ");
        const statusCACountQuery = caOptions
          .map((dataItem) => `WHEN status = '${dataItem}' THEN 1`)
          .join(" ");
        const statusCRCountQuery = leaveArray
          .map((dataItem) => `WHEN status = '${dataItem}' THEN 1`)
          .join(" ");
        const statusAbsenseCountQuery = absenceArrOptions
          .map((dataItem) => `WHEN status = '${dataItem}' THEN 1`)
          .join(" ");
        // const statusAbsenseCountQuery = absenceArray.map((dataItem) => `WHEN status = '${dataItem}' THEN 1`).join(' ');
        const statusBonusCountQuery = bonusOptions
          .map(
            (dataItem) =>
              `WHEN "TimesheetSchedule"."bonusCode" like '%${dataItem}%' THEN ${
                dataItem === "O1" ? 1 : dataItem === "O2" ? 2 : 0
              }`
          )
          .join(" ");
        const momentStartDate = moment(timesheetData.startDate);
        const momentEndDate = moment(timesheetData.endDate);

        const calculationdata = await TimesheetSchedule.findAndCountAll({
          transaction,
          where: {
            deletedAt: null,
            employeeId: +empData,
            [Op.or]: [
              {
                status: {
                  [Op.in]: presenceOptions.map((dataItem) => dataItem),
                },
              },
              {
                status: { [Op.in]: caOptions.map((dataItem) => dataItem) },
              },
              Sequelize.where(
                Sequelize.fn(
                  "concat",
                  Sequelize.col("status"),
                  ",",
                  Sequelize.col("bonusCode")
                ),
                {
                  [Op.like]: "%W%",
                }
              ),
              {
                status: { [Op.in]: leaveArray.map((dataItem) => dataItem) },
              },
              // {
              // 	bonusCode: { [Op.in]: bonusOptions.map((dataItem) => dataItem) },
              // },
              {
                [Op.and]: [
                  Sequelize.where(
                    Sequelize.fn(
                      "concat",
                      Sequelize.col("status"),
                      ",",
                      Sequelize.col("bonusCode")
                    ),
                    {
                      [Op.like]: "%O1%",
                    }
                  ),
                  Sequelize.where(
                    Sequelize.fn(
                      "concat",
                      Sequelize.col("status"),
                      ",",
                      Sequelize.col("bonusCode")
                    ),
                    {
                      [Op.like]: "%O2%",
                    }
                  ),
                ],
              },
              absenceFlag
                ? {
                    status: {
                      [Op.in]: absenceArrOptions.map((dataItem) => dataItem),
                    },
                  }
                : {},
              // {
              // 	status: { [Op.in]: absenceArray.map((dataItem) => dataItem) },
              // },
            ],
            date: {
              [Op.between]: [momentStartDate, momentEndDate],
            },
          },
          include: [
            {
              model: Employee,
              attributes: ["id", "loginUserId", "startDate", "rotationId"],
              as: "employee",
              include: [
                { model: LoginUser, attributes: ["firstName", "lastName"] },
              ],
            },
          ],
          attributes: [
            [
              Sequelize.literal(
                `cast(SUM(CASE ${statusCountQuery} ELSE 0 END) as float)`
              ),
              "statusCount",
            ],
            [
              Sequelize.literal(
                `cast(SUM(CASE ${statusCACountQuery} ELSE 0 END) as float)`
              ),
              "statusCACount",
            ],
            [
              Sequelize.literal(
                `cast(SUM(CASE ${statusCRCountQuery} ELSE 0 END) as float)`
              ),
              "statusCRCount",
            ],
            ...(absenceFlag
              ? [
                  [
                    Sequelize.literal(
                      `cast(SUM(CASE ${statusAbsenseCountQuery} ELSE 0 END) as float)`
                    ),
                    "statusAbsenseCount",
                  ],
                ]
              : []),
            [
              Sequelize.literal(
                `cast(SUM(CASE ${statusBonusCountQuery} ELSE 0 END) as float)`
              ),
              "statusBonusCount",
            ],
            [
              Sequelize.literal(
                `cast(bool_or(CASE WHEN "TimesheetSchedule"."bonusCode" like '%W%' THEN true ELSE false END) as boolean)`
              ),
              "hasWStatus",
            ],
          ] as (string | [string, string])[],
          group: ["employee.id", "employee->loginUserData.id"],
        });
        if (calculationdata?.rows?.length > 0) {
          let paymentValue = 0;
          let adjustmentValue = 0;
          let sumOfWStatus = 0;
          let earned = 0;
          let calculateEquation = "";
          const timeSheetDataCount: any = parse(calculationdata?.rows[0]);
          // start payment and adjustment...

          let reliquatAdjustmentData = await ReliquatAdjustment.findAll({
            where: {
              employeeId: employeeData?.id,
              clientId: employeeData?.clientId,
            },
            transaction,
          });
          reliquatAdjustmentData = parse(reliquatAdjustmentData);

          reliquatAdjustmentData?.map((adjustment) => {
            const isBetween = moment(adjustment.startDate).isBetween(
              momentStartDate,
              momentEndDate,
              null,
              "[]"
            );
            if (isBetween) adjustmentValue = adjustment.adjustment ?? 0;
          });

          let reliquatPaymentData = await ReliquatPayment.findAll({
            where: {
              employeeId: employeeData?.id,
              clientId: employeeData?.clientId,
            },
            transaction,
          });
          reliquatPaymentData = parse(reliquatPaymentData);

          reliquatPaymentData?.map((payment) => {
            const isBetween = moment(payment.startDate).isBetween(
              momentStartDate,
              momentEndDate,
              null,
              "[]"
            );
            if (isBetween) paymentValue += payment.amount ?? 0;
          });

          // end payment and adjustment...

          const reliquatCalculationsData: any = {
            startDate: timesheetData?.startDate,
            endDate: timesheetData?.endDate,
            employeeId: +empData,
            timesheetId: timesheetId,
            clientId: timesheetData.clientId,
            presentDay: +timeSheetDataCount.statusCount,
            annualLeave: +timeSheetDataCount.statusCACount || 0,
            absenseDay: +timeSheetDataCount?.statusAbsenseCount || 0,
            leave: +timeSheetDataCount.statusCRCount,
            reliquatPayment: +paymentValue || 0,
            reliquatPaymentValue: +paymentValue || 0,
            reliquatAdjustment: +adjustmentValue || 0,
            reliquatAdjustmentValue: +adjustmentValue || 0,
            weekend: +sumOfWStatus,
            weekendBonus: +sumOfWStatus,
            overtime: +timeSheetDataCount?.statusBonusCount,
            overtimeBonus: +timeSheetDataCount?.statusBonusCount,
            createdBy: userId || null,
          };

          const ReliquatCalculationLastRecord = await ReliquatCalculation.findOne(
            {
              where: {
                employeeId: +empData,
                deletedAt: null,
                startDate: { [Op.lte]: moment(timesheetData.endDate).toDate() },
              },
              order: [["startDate", "desc"]],
              transaction,
            }
          );

          let rotationData = await EmployeeRotation.findAll({
            include: [
              {
                model: Rotation,
                paranoid: false,
              },
            ],
            where: {
              employeeId: +empData,
              date: { [Op.lte]: moment(timesheetData.endDate).toDate() },
            },
            order: [["date", "desc"]],
            transaction,
          });
          rotationData = parse(rotationData);

          if (
            rotationData?.length > 0 &&
            rotationData?.find(
              (findRotationData) =>
                findRotationData?.rotation?.name !== "Call Out"
            )
          ) {
            const rotationCalculationData = rotationData.find(
              (data) =>
                data.rotationId === timeSheetDataCount.employee.rotationId
            );
            if (
              timeSheetDataCount.statusCount === 0 &&
              timeSheetDataCount.statusCRCount === 0 &&
              !ReliquatCalculationLastRecord
            ) {
              console.log("condition 1 called...");
              reliquatCalculationsData.totalWorked = +timeSheetDataCount.statusCount;
              reliquatCalculationsData.absenseDay =
                +timeSheetDataCount.statusAbsenseCount || 0;
              reliquatCalculationsData.annualLeave =
                +timeSheetDataCount.statusCACount || 0;
              reliquatCalculationsData.overtime = +timeSheetDataCount?.statusBonusCount;
              reliquatCalculationsData.weekend = +sumOfWStatus;
              reliquatCalculationsData.weekendBonus = +sumOfWStatus;
              reliquatCalculationsData.overtimeBonus = +timeSheetDataCount?.statusBonusCount;
              reliquatCalculationsData.totalTakenLeave =
                +timeSheetDataCount.statusCRCount +
                +timeSheetDataCount.statusCACount;
              reliquatCalculationsData.earned =
                (rotationCalculationData?.rotation.weekOff /
                  rotationCalculationData?.rotation.weekOn) *
                  (timeSheetDataCount.statusCount +
                    timeSheetDataCount.statusAbsenseCount) +
                reliquatCalculationsData?.reliquatAdjustment -
                reliquatCalculationsData?.reliquatPayment;
              reliquatCalculationsData.reliquat =
                earned - timeSheetDataCount.statusCRCount;
              reliquatCalculationsData.reliquat = parseFloat(
                reliquatCalculationsData?.reliquat || "0"
              ).toFixed(2);
              reliquatCalculationsData.reliquatValue = parseFloat(
                reliquatCalculationsData?.reliquat || "0"
              ).toFixed(2);
              reliquatCalculationsData.reliquat = Math.round(
                reliquatCalculationsData?.reliquat || "0"
              );
              reliquatCalculationsData.calculation = parseFloat(
                reliquatCalculationsData?.earned?.toString() || "0"
              );
              const calculationString = `((${
                rotationCalculationData?.rotation.weekOff || 0
              }/${rotationCalculationData?.rotation.weekOn || 0}) * ${
                timeSheetDataCount.statusCount
              } = ${
                parseFloat(
                  reliquatCalculationsData.earned?.toFixed(2) || "0"
                ) || 0
              }) +`;
              reliquatCalculationsData.calculateEquation = `${calculationString.substring(
                0,
                calculationString.length - 3
              )} ${
                !reliquatCalculationsData?.reliquatAdjustment
                  ? ""
                  : `+ (${+reliquatCalculationsData?.reliquatAdjustment})`
              }`;

              reliquatCalculationsData.calculateEquation += `${
                reliquatCalculationsData?.reliquatPayment
                  ? ` - ${reliquatCalculationsData?.reliquatPayment}`
                  : ""
              }`;
              const calculateJSONData = {
                rId: timeSheetDataCount.employee.rotationId,
                count: timeSheetDataCount.statusCount,
                rotationCalculation: earned,
                date: moment(timesheetData.endDate).format("MM-DD-YYYY"),
              };
              calculationDataJSON.monthData = { ...calculateJSONData };
              calculationDataJSON.finalRotationCount = [
                { ...calculateJSONData },
              ];
              reliquatCalculationsData.calculationDataJSON = JSON.stringify(
                calculationDataJSON
              );
            } else if (
              timeSheetDataCount.statusCount === 0 &&
              (timeSheetDataCount.statusCRCount === 0 ||
                timeSheetDataCount.statusCRCount !== 0) &&
              ReliquatCalculationLastRecord
            ) {
              console.log("condition 2 called...");
              reliquatCalculationsData.calculation = +ReliquatCalculationLastRecord.calculation;
              reliquatCalculationsData.totalWorked = +ReliquatCalculationLastRecord.totalWorked;
              reliquatCalculationsData.overtime = +ReliquatCalculationLastRecord?.overtime;
              reliquatCalculationsData.absenseDay =
                +ReliquatCalculationLastRecord?.absenseDay || 0;
              reliquatCalculationsData.reliquatPayment = +ReliquatCalculationLastRecord?.reliquatPayment;
              reliquatCalculationsData.reliquatAdjustment = +ReliquatCalculationLastRecord?.reliquatAdjustment;
              reliquatCalculationsData.weekend = +ReliquatCalculationLastRecord?.weekend;
              reliquatCalculationsData.weekendBonus = +ReliquatCalculationLastRecord?.weekendBonus;
              reliquatCalculationsData.overtimeBonus = +timeSheetDataCount?.statusBonusCount;
              reliquatCalculationsData.totalTakenLeave =
                +ReliquatCalculationLastRecord?.totalTakenLeave +
                (timeSheetDataCount.statusCRCount !== 0
                  ? +timeSheetDataCount.statusCRCount +
                    +timeSheetDataCount.statusCACount
                  : 0);
              reliquatCalculationsData.earned =
                ReliquatCalculationLastRecord.earned;
              reliquatCalculationsData.reliquat =
                timeSheetDataCount.statusCRCount !== 0
                  ? ReliquatCalculationLastRecord?.reliquat -
                    timeSheetDataCount.statusCRCount
                  : ReliquatCalculationLastRecord?.reliquat;
              reliquatCalculationsData.reliquatValue =
                timeSheetDataCount.statusCRCount !== 0
                  ? ReliquatCalculationLastRecord?.reliquat -
                    timeSheetDataCount.statusCRCount
                  : ReliquatCalculationLastRecord?.reliquat;
              // reliquatCalculationsData.reliquat = ReliquatCalculationLastRecord?.reliquat;
              reliquatCalculationsData.calculateEquation =
                ReliquatCalculationLastRecord?.calculateEquation;
              reliquatCalculationsData.calculationDataJSON =
                ReliquatCalculationLastRecord?.calculationDataJSON;
            } else {
              console.log(
                "condition 3 called...",
                momentStartDate,
                momentEndDate
              );
              const rotationDayCount: any = [];
              const rolloverData =
                employeeData.employeeSegment.find((segment) => {
                  return moment(segment.date).isBetween(
                    momentStartDate,
                    momentEndDate,
                    null,
                    "[]"
                  );
                })?.rollover ?? null;

              let combinedListing = await TimesheetSchedule.findAll({
                where: {
                  employeeId: +empData,
                  status: {
                    [Op.in]: ["", "CR", ...absenceArray, ...absenceArrOptions],
                  },
                  date: {
                    [Op.between]: [momentStartDate, momentEndDate],
                  },
                },
                transaction,
              });

              combinedListing = parse(combinedListing);

              const dateListing = combinedListing.filter((item) =>
                [
                  "",
                  "CR",
                  ...absenceArray,
                  ...(absenceFlag ? [] : absenceArrOptions),
                ].includes(item.status)
              );
              const leaveListing = combinedListing.filter((item) =>
                [...absenceArrOptions].includes(item.status)
              );
              const temprotationData = [...rotationData];

              await temprotationData.reduce(
                (accumulator: any, currentValue, i, arr) => {
                  const tempData: any = {
                    rId: currentValue?.rotationId,
                    date: moment(accumulator).format("MM/DD/YYYY"),
                  };

                  const countDatesInRange = dateListing.reduce(
                    (count, dateEntry) => {
                      const entryDate = moment(dateEntry.date);
                      if (
                        entryDate.isSameOrAfter(currentValue.date) &&
                        entryDate.isSameOrBefore(accumulator)
                      ) {
                        return count + 1;
                      }
                      return count;
                    },
                    0
                  );

                  if (absenceFlag) {
                    const countAbsenceDatesInRange = leaveListing.filter(
                      (dateItem) => {
                        const absenceDate = moment(dateItem.date);
                        return (
                          absenceDate.isSameOrAfter(currentValue.date) &&
                          absenceDate.isSameOrBefore(accumulator)
                        );
                      }
                    ).length;
                    tempData.absence = countAbsenceDatesInRange;
                  }
                  const startDate = moment(employeeData.startDate).isBetween(
                    timesheetData.startDate,
                    timesheetData.endDate
                  )
                    ? moment(employeeData.startDate)
                    : moment(timesheetData.startDate);
                  const currentDate = moment(currentValue.date);

                  const diffDate = moment(currentDate).isSameOrBefore(startDate)
                    ? startDate
                    : currentValue.date;

                  if (moment(startDate).isBefore(diffDate)) {
                    tempData.count =
                      moment(accumulator)
                        .add(1, "days")
                        .diff(moment(diffDate), "days") - countDatesInRange;
                  } else {
                    if (moment(startDate).isSameOrAfter(diffDate)) {
                      tempData.count =
                        moment(accumulator)
                          .add(1, "days")
                          .diff(moment(diffDate), "days") - countDatesInRange;
                    } else {
                      tempData.count =
                        moment(accumulator).diff(moment(diffDate), "days") -
                        countDatesInRange;
                    }
                    arr.splice(i);
                  }

                  rotationDayCount.push(tempData);

                  return moment(currentValue.date).isBetween(
                    startDate,
                    moment(timesheetData.endDate)
                  )
                    ? moment(currentValue.date).subtract(1, "days")
                    : moment(currentValue.date);
                },
                moment(employeeData.terminationDate).isBetween(
                  timesheetData.startDate,
                  timesheetData.endDate
                )
                  ? employeeData.terminationDate
                  : moment(employeeData.client.endDate).isBetween(
                      timesheetData.startDate,
                      timesheetData.endDate
                    )
                  ? employeeData.client.endDate
                  : timesheetData.endDate
              );

              if (timeSheetDataCount?.hasWStatus) {
                sumOfWStatus = await this.calculateWStatus(
                  empData,
                  timesheetData.startDate,
                  timesheetData.endDate,
                  Wb1,
                  Wb2,
                  transaction
                );
              }

              const tempRotationDayCount = await Promise.all(
                rotationDayCount.map((e) => {
                  const rotation: any = rotationData.find(
                    (e1) => e1?.rotationId == e?.rId
                  );
                  const temp =
                    (rotation?.rotation.weekOff / rotation?.rotation.weekOn) *
                    e.count;
                  e.rotationCalculation = temp;
                  return { ...e };
                })
              );
              calculationDataJSON.monthData = { ...tempRotationDayCount };
              let tempRotationDayCountForLoop: any = [];

              if (ReliquatCalculationLastRecord) {
                if (!rolloverData && rolloverData !== null) {
                  reliquatCalculationsData.totalWorked = +timeSheetDataCount.statusCount;
                  reliquatCalculationsData.annualLeave =
                    +timeSheetDataCount.statusCACount || 0;
                  reliquatCalculationsData.absenseDay =
                    +timeSheetDataCount.statusAbsenseCount || 0;
                  reliquatCalculationsData.overtime = +timeSheetDataCount?.statusBonusCount;
                  reliquatCalculationsData.weekend = +sumOfWStatus;
                  reliquatCalculationsData.weekendBonus = +sumOfWStatus;
                  reliquatCalculationsData.overtimeBonus = +timeSheetDataCount?.statusBonusCount;
                  reliquatCalculationsData.totalTakenLeave =
                    +timeSheetDataCount.statusCRCount +
                    +timeSheetDataCount.statusCACount;
                  tempRotationDayCountForLoop = [...rotationDayCount];
                } else {
                  reliquatCalculationsData.totalWorked =
                    ReliquatCalculationLastRecord?.totalWorked +
                    +timeSheetDataCount?.statusCount;
                  reliquatCalculationsData.absenseDay =
                    +ReliquatCalculationLastRecord?.absenseDay +
                      +timeSheetDataCount?.statusAbsenseCount || 0;
                  reliquatCalculationsData.overtime =
                    ReliquatCalculationLastRecord?.overtime +
                      +timeSheetDataCount?.statusBonusCount || 0;
                  reliquatCalculationsData.weekend =
                    ReliquatCalculationLastRecord?.weekend + +sumOfWStatus || 0;
                  reliquatCalculationsData.weekendBonus = +sumOfWStatus || 0;
                  reliquatCalculationsData.reliquatPayment =
                    ReliquatCalculationLastRecord?.reliquatPayment +
                    +paymentValue;
                  reliquatCalculationsData.reliquatAdjustment =
                    ReliquatCalculationLastRecord?.reliquatAdjustment +
                    +adjustmentValue;
                  reliquatCalculationsData.totalTakenLeave =
                    ReliquatCalculationLastRecord.totalTakenLeave +
                    +timeSheetDataCount.statusCRCount +
                    +timeSheetDataCount.statusCACount;
                  const lastRotationData = JSON.parse(
                    ReliquatCalculationLastRecord.calculationDataJSON
                  ).finalRotationCount;
                  tempRotationDayCountForLoop = [
                    ...rotationDayCount,
                    ...lastRotationData,
                  ];
                }
              } else {
                reliquatCalculationsData.absenseDay =
                  +timeSheetDataCount?.statusAbsenseCount || 0;
                reliquatCalculationsData.totalWorked = +timeSheetDataCount.statusCount;
                reliquatCalculationsData.overtime = +timeSheetDataCount?.statusBonusCount;
                reliquatCalculationsData.weekend = +sumOfWStatus;
                reliquatCalculationsData.weekendBonus = +sumOfWStatus;
                reliquatCalculationsData.overtimeBonus = +timeSheetDataCount?.statusBonusCount;
                reliquatCalculationsData.totalTakenLeave =
                  +timeSheetDataCount.statusCRCount +
                  +timeSheetDataCount.statusCACount;
                tempRotationDayCountForLoop = [...rotationDayCount];
              }

              const finalRotationCount = tempRotationDayCountForLoop.reduce(
                (accumulator, currentValue: any) => {
                  const rotationExitData = accumulator.findIndex(
                    (e) => e.rId === currentValue.rId
                  );
                  if (rotationExitData > -1) {
                    accumulator[rotationExitData].count += currentValue.count;
                    accumulator[rotationExitData].rotationCalculation +=
                      currentValue.rotationCalculation;
                  } else {
                    accumulator.push(currentValue);
                  }
                  return accumulator;
                },
                []
              );

              calculationDataJSON.finalRotationCount = [...finalRotationCount];
              for (const item of finalRotationCount) {
                earned += item.rotationCalculation;
                const rotation: any = rotationData.find(
                  (e1) => e1.rotationId == item.rId
                );
                calculateEquation += `((${rotation?.rotation.weekOff || 0}/${
                  rotation?.rotation.weekOn || 0
                }) * ${item.count || 0} = ${
                  parseFloat(item?.rotationCalculation?.toFixed(2) || "0") || 0
                }) + `;
              }
              earned +=
                reliquatCalculationsData?.weekend +
                reliquatCalculationsData?.overtime +
                reliquatCalculationsData?.reliquatAdjustment -
                reliquatCalculationsData?.reliquatPayment;
              reliquatCalculationsData.earned = parseFloat(
                earned?.toFixed(2) || "0"
              );
              reliquatCalculationsData.calculation = parseFloat(
                earned.toString() || "0"
              );

              reliquatCalculationsData.calculateEquation = `${calculateEquation.substring(
                0,
                calculateEquation.length - 3
              )} ${
                !(
                  reliquatCalculationsData?.weekend ||
                  reliquatCalculationsData?.overtime ||
                  reliquatCalculationsData?.reliquatAdjustment
                )
                  ? ""
                  : `+ (${
                      +reliquatCalculationsData?.weekend +
                      +reliquatCalculationsData?.overtime +
                      +reliquatCalculationsData?.reliquatAdjustment
                    })`
              }`;

              reliquatCalculationsData.calculateEquation += `${
                reliquatCalculationsData?.reliquatPayment
                  ? ` - ${reliquatCalculationsData?.reliquatPayment}`
                  : ""
              }`;

              reliquatCalculationsData.reliquat =
                earned - reliquatCalculationsData.totalTakenLeave;
              // sumOfWStatus !== 0 || timeSheetDataCount?.statusBonusCount
              // 	? earned + sumOfWStatus + timeSheetDataCount?.statusBonusCount - reliquatCalculationsData.totalTakenLeave
              // 	: earned - reliquatCalculationsData.totalTakenLeave;

              reliquatCalculationsData.reliquat = parseFloat(
                reliquatCalculationsData?.reliquat || "0"
              ).toFixed(2);
              reliquatCalculationsData.reliquatValue = parseFloat(
                reliquatCalculationsData?.reliquat || "0"
              ).toFixed(2);
              reliquatCalculationsData.reliquat = Math.round(
                reliquatCalculationsData?.reliquat || "0"
              );
              reliquatCalculationsData.calculationDataJSON = JSON.stringify(
                calculationDataJSON
              );

              const currentDate = moment();
              // const isInCurrentMonth = momentStartDate.isSame(currentDate, 'month');
              const isInCurrentMonth = currentDate.isSame(moment(), "month");
              const isBetweenStartAndEnd = currentDate.isBetween(
                momentStartDate,
                momentEndDate,
                null,
                "[]"
              );

              if (
                isInCurrentMonth &&
                isBetweenStartAndEnd &&
                reliquatCalculationsData.reliquat < 0
              ) {
                const emails = [];
                emails.push("admin@lred.com");
                if (employeeData?.loginUserData?.email) {
                  emails.push(employeeData?.loginUserData?.email);
                }
                // if (employeeData?.loginUserData?.email) {
                const context = {
                  userName:
                    employeeData?.loginUserData?.firstName +
                    " " +
                    employeeData?.loginUserData?.lastName,
                  startDate: moment(timesheetData.startDate).format(
                    "DD/MM/YYYY"
                  ),
                  endDate: moment(timesheetData.endDate).format("DD/MM/YYYY"),
                  reliquat: Number(reliquatCalculationsData.reliquat),
                  logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
                  checkReliquatUrl:
                    employeeData?.id && employeeData?.clientId
                      ? FRONTEND_URL +
                        `/employee/reliquat-calculation/${employeeData?.id}_${employeeData?.clientId}`
                      : "",
                };
                // await sendMail(
                // emails,
                // 	'Low Reliquat',
                // 	'lowReliquat',
                // 	context,
                // );
                // }
              }
            }
            let response = await ReliquatCalculation.create(
              reliquatCalculationsData,
              { transaction }
            );
            response = parse(response);
            if (response) {
              await this.createmonthly(response, transaction);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async calculateWStatus(
    empData: string,
    startDate: Date,
    endDate: Date,
    weekendBonus1: number,
    weekendBonus2: number,
    transaction: Transaction = null
  ) {
    let foundWdata = await TimesheetSchedule.findAll({
      where: {
        deletedAt: null,
        employeeId: empData,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn(
              "concat",
              Sequelize.col("status"),
              ",",
              Sequelize.col("bonusCode")
            ),
            {
              [Op.like]: "%W%",
            }
          ),
        ],
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      transaction,
    });

    foundWdata = parse(foundWdata);
    const itemOfW = foundWdata.map((itemData) => {
      const date =
        (moment(itemData.date).format("d") === "5" && weekendBonus1) ||
        (moment(itemData.date).format("d") === "6" && weekendBonus2);

      return date;
    });

    const sumOfWeekData = itemOfW.reduce((a, b) => a + b, 0);
    return sumOfWeekData;
  }

  async createmonthly(reliquat: any, transaction: Transaction = null) {
    try {
      let empData: any = reliquat?.employee || null;
      let obj: any = {};
      if (!reliquat?.employee) {
        empData = await Employee.findOne({
          where: { id: reliquat?.employeeId },
          attributes: ["id", "loginUserId", "rotationId"],
          include: [
            {
              model: Rotation,
              attributes: ["id", "name", "weekOn", "weekOff", "description"],
            },
          ],
          transaction,
        });
        empData = parse(empData);
      }

      if (reliquat && empData) {
        const monthly_reliquat = parseFloat(
          (
            (empData?.rotation?.weekOff / empData?.rotation?.weekOn) *
            reliquat.presentDay
          ).toFixed(2)
        );

        obj = {
          monthly_earned: monthly_reliquat,
          monthly_calc_equation: `((${empData?.rotation?.weekOff || 0} / ${
            empData?.rotation?.weekOn || 0
          }) * ${reliquat.presentDay || 0} = ${monthly_reliquat || 0})`,
          monthly_calc_formula: `(Rotation week off / Rotation week on) * Worked`,
        };

        //Check if reliquat overtime Bonus is there
        if (reliquat?.overtimeBonus) {
          (obj.monthly_earned += reliquat?.overtimeBonus),
            (obj.monthly_calc_equation += ` + (${reliquat?.overtimeBonus})`),
            (obj.monthly_calc_formula += ` + (Overtime)`);
        }

        //Check if reliquat overtime Bonus is there
        if (reliquat?.weekendBonus) {
          (obj.monthly_earned += reliquat?.weekendBonus),
            (obj.monthly_calc_equation += ` + (${reliquat?.weekendBonus})`),
            (obj.monthly_calc_formula += ` + (Weekend overtime)`);
        }

        //Check if reliquat adjustment is there
        if (reliquat?.reliquatAdjustmentValue) {
          (obj.monthly_earned += reliquat?.reliquatAdjustmentValue),
            (obj.monthly_calc_equation += ` + (${reliquat?.reliquatAdjustmentValue})`),
            (obj.monthly_calc_formula += ` + (Reliquat Adjustment)`);
        }

        // CHeck if the reliquatPaymentValue is there. Note: the reliquatPaymentValue will be deducted from the monthly_earned
        if (reliquat?.reliquatPaymentValue) {
          (obj.monthly_earned -= reliquat?.reliquatPaymentValue),
            (obj.monthly_calc_equation += ` - (${reliquat?.reliquatPaymentValue})`),
            (obj.monthly_calc_formula += ` - (Reliquat Payment)`);
        }
        //monthly reliquat
        obj.monthly_reliquat = obj.monthly_earned - reliquat?.leave;

        const response = await ReliquatCalculation.update(obj, {
          where: { id: reliquat?.id },
          transaction,
          individualHooks: true,
        });
        console.log("monthly calculated", response);
      }
      return;
    } catch (error) {
      console.log("error", error);
    }
  }

  async employeContractList(query: IQueryParameters) {
    let { clientId } = query;

    let data = await Employee.findAll({
      where: {
        deletedAt: null,
        clientId: clientId,
      },
      attributes: ["id", "clientId", "employeeNumber", "loginUserId"],
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });
    data = parse(data);

    let response = data
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.loginUserId === value.loginUserId)
      )
      .map((el) => {
        return {
          ...el?.loginUserData,
          contracts: data
            .filter((doc) => el?.loginUserId === doc?.loginUserId)
            .map((i) => {
              delete i.loginUserData;
              return i;
            }),
        };
      });
    return response;
  }
}