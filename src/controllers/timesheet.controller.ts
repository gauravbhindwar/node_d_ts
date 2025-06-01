/* eslint-disable no-console */
import { FRONTEND_URL, SERVER_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord, formatKeyString } from "@/helpers/history.helper";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { TimesheetPDFAttributes } from "@/interfaces/model/timesheet.interface";
import { timesheetLogsStatus } from "@/interfaces/model/timesheetLogs.interface";
import db from "@/models";
import Client from "@/models/client.model";
import ClientTimesheetStartDay from "@/models/clientTimesheetStartDay.model";
import Employee from "@/models/employee.model";
import EmployeeRotation from "@/models/employeeRotation.model";
import EmployeeSegment from "@/models/employeeSegment.model";
import LoginUser from "@/models/loginUser.model";
import Rotation from "@/models/rotation.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import TimesheetLogs from "@/models/timesheetLogs.model";
import TimesheetSchedule from "@/models/timesheetSchedule.model";
import User from "@/models/user.model";
import AccountRepo from "@/repository/account.repository";
import TimesheetRepo from "@/repository/timesheet.repository";
import TimesheetScheduleRepo from "@/repository/timesheetSchedule.repository";
import {
  fileDelete,
  folderExistCheck,
  generateFourDigitNumber,
  parse,
} from "@/utils/common.util";
import generalResponse from "@/utils/generalResponse";
import { generateModalData } from "@/utils/generateModal";
import { pdf } from "@/utils/puppeteer.pdf";
import { Request, Response } from "express";
import moment from "moment";
import path from "path";
import { Op, Transaction } from "sequelize";
import { catchAsync } from "../utils/catchAsync";
class TimesheetController {
  private TimesheetService = new TimesheetRepo();
  private allEmployeeTimesheetSchedule = [];
  private allSubSegment = [];
  private dataToDelete = [];
  private TimesheetScheduleService = new TimesheetScheduleRepo();
  private AccountService = new AccountRepo();
  private msg = new MessageFormation("Timesheet").message;
  private empRotationDetail = {
    totalWorkingDays: 0,
    totalOffDays: 0,
    activeSegment: 1,
    activeCount: 0,
  };

  private lastEndDate = moment();
  private setNewScheduleValue = (
    employeeDate,
    employeeData,
    userId,
    rotationDetails,
    clientData
  ) => {
    let employeeMonthSchedule = [];
    if (
      moment(employeeData.startDate).isSameOrBefore(employeeDate) &&
      (employeeData.terminationDate == null ||
        moment(employeeData.terminationDate).isSameOrAfter(employeeDate)) &&
      (clientData.autoUpdateEndDate != 0 ||
        (clientData.autoUpdateEndDate == 0 &&
          moment(employeeDate).isSameOrBefore(clientData.endDate)))
    ) {
      if (!rotationDetails?.weekOn || !rotationDetails?.weekOff) {
        if (
          employeeData.timeSheetSchedule.findIndex(
            (dat) =>
              dat.dbKey ==
              `${employeeDate.format("DDMMYYYY")}${employeeData.id}`
          ) < 0
        ) {
          employeeMonthSchedule = [
            ...employeeMonthSchedule,
            {
              employeeId: Number(employeeData.id),
              date: employeeDate.toDate(),
              status: "",
              createdBy: userId,
              dbKey: `${employeeDate.format("DDMMYYYY")}${employeeData.id}`,
            },
          ];
        }
      } else {
        if (this.empRotationDetail.activeSegment == 1) {
          if (
            employeeData.timeSheetSchedule.findIndex(
              (dat) =>
                dat.dbKey ==
                `${employeeDate.format("DDMMYYYY")}${employeeData.id}`
            ) < 0
          ) {
            employeeMonthSchedule = [
              ...employeeMonthSchedule,
              {
                employeeId: Number(employeeData.id),
                date: employeeDate.toDate(),
                status: "P",
                createdBy: userId,
                dbKey: `${employeeDate.format("DDMMYYYY")}${employeeData.id}`,
              },
            ];
          }
          if (
            this.empRotationDetail.activeCount ==
            this.empRotationDetail.totalWorkingDays
          ) {
            this.empRotationDetail = {
              ...this.empRotationDetail,
              activeCount: 0,
              activeSegment: 2,
            };
          }
        } else if (this.empRotationDetail.activeSegment == 2) {
          if (
            this.empRotationDetail.totalOffDays > 0 &&
            employeeData.timeSheetSchedule.findIndex(
              (dat) =>
                dat.dbKey ==
                `${employeeDate.format("DDMMYYYY")}${employeeData.id}`
            ) < 0
          ) {
            employeeMonthSchedule = [
              ...employeeMonthSchedule,
              {
                employeeId: Number(employeeData.id),
                date: employeeDate.toDate(),
                status: "CR",
                createdBy: userId,
                dbKey: `${employeeDate.format("DDMMYYYY")}${employeeData.id}`,
              },
            ];
          }
          if (
            this.empRotationDetail.activeCount ==
              this.empRotationDetail.totalOffDays ||
            this.empRotationDetail.totalOffDays == 0
          ) {
            if (
              this.empRotationDetail.totalOffDays == 0 &&
              employeeData.timeSheetSchedule.findIndex(
                (dat) =>
                  dat.dbKey ==
                  `${employeeDate.format("DDMMYYYY")}${employeeData.id}`
              ) < 0
            ) {
              employeeMonthSchedule = [
                ...employeeMonthSchedule,
                {
                  employeeId: Number(employeeData.id),
                  date: employeeDate.toDate(),
                  status: "P",
                  createdBy: userId,
                  dbKey: `${employeeDate.format("DDMMYYYY")}${employeeData.id}`,
                },
              ];
            }
            this.empRotationDetail = {
              ...this.empRotationDetail,
              activeCount: 0,
              activeSegment: 1,
            };
          }
        }
        this.empRotationDetail = {
          ...this.empRotationDetail,
          activeCount: this.empRotationDetail.activeCount + 1,
        };
      }
      return employeeMonthSchedule;
    } else {
      if (
        (employeeData.terminationDate != null &&
          moment(employeeData.terminationDate).isBefore(employeeDate)) ||
        moment(employeeDate).isBefore(employeeData.startDate) ||
        (clientData.autoUpdateEndDate == 0 &&
          moment(employeeDate).isAfter(clientData.endDate))
      ) {
        this.dataToDelete.push({
          employeeId: employeeData.id,
          date: employeeDate.toDate(),
        });
      }
    }
  };

  private getObjectFromNestedArray = (arr) => {
    for (const item of arr) {
      if (Array.isArray(item)) {
        this.getObjectFromNestedArray(item);
      } else if (typeof item === "object") {
        this.allEmployeeTimesheetSchedule = [
          ...this.allEmployeeTimesheetSchedule,
          { ...item },
        ];
      }
    }
    return null;
  };

  private extractSubSegment = (arr) => {
    for (const item of arr) {
      if (Array.isArray(item)) {
        this.extractSubSegment(item);
      } else if (
        typeof item === "object" &&
        !this.allSubSegment.find((a) => a.id == item.id)
      ) {
        this.allSubSegment = [...this.allSubSegment, { ...item }];
      }
    }
    return null;
  };

  private addMultipleDataToTimesheet = async (
    dataArray,
    clientId,
    startDate,
    endDate,
    user = null,
    isSegmentAdd = false,
    transaction: Transaction = null
  ) => {
    await Promise.all(
      dataArray?.map(async (data) => {
        if (
          moment(data.startDate).isSameOrBefore(endDate.toDate()) &&
          (data.terminationDate == null ||
            moment(data.terminationDate)
              .add(1, "month")
              .isAfter(endDate.toDate()))
        ) {
          const findEmployeeSegment = await EmployeeSegment.findAll({
            where: {
              employeeId: data?.id,
              date: {
                [Op.and]: {
                  [Op.gte]: startDate.toDate(),
                  [Op.lte]: endDate.toDate(),
                },
              },
            },
            attributes: ["id", "segmentId", "subSegmentId", "date"],
            order: [["date", "asc"]],
            transaction,
          }).then((datasss) => parse(datasss));
          const isTimesheetApprovedData = await Timesheet.findAll({
            where: {
              startDate,
              endDate,
              employeeId: data.id,
            },
          });
          if (
            findEmployeeSegment?.length > 0 &&
            isSegmentAdd &&
            !isTimesheetApprovedData?.some((e) => e.status === "APPROVED")
          ) {
            for (const segmentData in findEmployeeSegment) {
              if (
                !moment(startDate).isSame(
                  findEmployeeSegment[Number(segmentData)]?.date
                )
              ) {
                let newStartDate = startDate;
                let newEndDate = endDate;
                data.segmentId =
                  findEmployeeSegment[Number(segmentData)]?.segmentId ?? null;
                data.subSegmentId =
                  findEmployeeSegment[Number(segmentData)]?.subSegmentId ??
                  null;
                if (findEmployeeSegment?.length > 1) {
                  if (+segmentData === 0) {
                    newEndDate = moment(
                      moment(
                        findEmployeeSegment[Number(segmentData)]?.date
                      ).format("DD-MM-YYYY"),
                      "DD-MM-YYYY"
                    ).subtract(1, "days");
                    continue;
                  } else if (+segmentData === findEmployeeSegment?.length - 1) {
                    await Timesheet.update(
                      {
                        endDate: moment(
                          moment(
                            findEmployeeSegment[Number(segmentData)]?.date
                          ).format("DD-MM-YYYY"),
                          "DD-MM-YYYY"
                        ).subtract(1, "days"),
                      },
                      {
                        where: {
                          startDate: moment(
                            moment(
                              findEmployeeSegment[Number(segmentData) - 1]?.date
                            ).format("DD-MM-YYYY"),
                            "DD-MM-YYYY"
                          ),
                          employeeId: data?.id,
                        },
                        transaction,
                        individualHooks: true,
                      }
                    );
                    newStartDate = moment(
                      moment(
                        findEmployeeSegment[Number(segmentData)]?.date
                      ).format("DD-MM-YYYY"),
                      "DD-MM-YYYY"
                    );
                  } else {
                    await Timesheet.update(
                      {
                        endDate: moment(
                          moment(
                            findEmployeeSegment[Number(segmentData) + 1]?.date
                          ).format("DD-MM-YYYY"),
                          "DD-MM-YYYY"
                        ).subtract(1, "days"),
                      },
                      {
                        where: {
                          startDate: moment(
                            moment(
                              findEmployeeSegment[Number(segmentData)]?.date
                            ).format("DD-MM-YYYY"),
                            "DD-MM-YYYY"
                          ),
                          employeeId: data?.id,
                        },
                        transaction,
                        individualHooks: true,
                      }
                    );
                    newStartDate = moment(
                      moment(
                        findEmployeeSegment[Number(segmentData) + 1]?.date
                      ).format("DD-MM-YYYY"),
                      "DD-MM-YYYY"
                    );
                    continue;
                  }
                } else {
                  newEndDate = moment(
                    moment(
                      findEmployeeSegment[Number(segmentData)]?.date
                    ).format("DD-MM-YYYY"),
                    "DD-MM-YYYY"
                  ).subtract(1, "days");
                  await Timesheet.update(
                    { endDate: newEndDate },
                    {
                      where: {
                        employeeId: data?.id,
                        clientId,
                        startDate,
                        endDate,
                      },
                      transaction,
                      individualHooks: true,
                    }
                  );
                  newStartDate = moment(
                    moment(
                      findEmployeeSegment[Number(segmentData)]?.date
                    ).format("DD-MM-YYYY"),
                    "DD-MM-YYYY"
                  );
                  newEndDate = endDate;
                }
                const body = {
                  clientId,
                  startDate: newStartDate.toDate(),
                  endDate: newEndDate.toDate(),
                  // segmentId: findEmployeeSegment?.segmentId,
                  // subSegmentId: findEmployeeSegment?.subSegmentId,
                  segmentId: data.segmentId,
                  subSegmentId: data.subSegmentId,
                  employeeId: data.id,
                  // dbKey: `${startDate.format('DDMMYYYY')}${data.id}`,
                  dbKey: `${moment(newStartDate).format("DDMMYYYY")}${
                    data.segmentId
                  }${data?.subSegmentId || ""}${data.id}`,
                };
                const isExistTimesheet = await this.TimesheetService.get({
                  where: {
                    employeeId: body.employeeId,
                    startDate: newStartDate.toDate(),
                    endDate: newEndDate.toDate(),
                    // dbKey: body.dbKey,
                  },
                  transaction,
                });
                if (!isExistTimesheet) {
                  let responseData = await this.TimesheetService.addTimesheetService(
                    {
                      body: {
                        ...body,
                        clientId,
                      },
                      user: user || null,
                    },
                    transaction
                  );
                  responseData = parse(responseData);
                  return responseData;
                }
              } else if (
                moment(startDate).isSame(
                  findEmployeeSegment[Number(segmentData)]?.date
                )
              ) {
                await this.TimesheetService.update(
                  {
                    segmentId: data.segmentId,
                    subSegmentId: data.subSegmentId,
                    updatedBy: user?.id,
                    dbKey: `${moment(startDate).format("DDMMYYYY")}${
                      data.segmentId
                    }${data?.subSegmentId || ""}${data.id}`,
                  },
                  {
                    where: {
                      startDate: {
                        [Op.eq]: startDate,
                      },
                      employeeId: data?.id,
                      clientId,
                    },
                    transaction,
                    individualHooks: true,
                  }
                );
              }
            }
          } else {
            const body = {
              clientId,
              startDate: startDate.toDate(),
              endDate: endDate.toDate(),
              // segmentId: findEmployeeSegment?.segmentId,
              // subSegmentId: findEmployeeSegment?.subSegmentId,
              segmentId: data.segmentId,
              subSegmentId: data.subSegmentId,
              employeeId: data.id,
              // dbKey: `${startDate.format('DDMMYYYY')}${data.id}`,
              dbKey: `${moment(startDate).format("DDMMYYYY")}${data.segmentId}${
                data?.subSegmentId || ""
              }${data.id}`,
            };
            const isExistTimesheet = await this.TimesheetService.get({
              where: {
                employeeId: body.employeeId,
                startDate: {
                  [Op.or]: {
                    [Op.between]: [startDate.toDate(), endDate.toDate()],
                    [Op.eq]: startDate.toDate(),
                  },
                },
                endDate: {
                  [Op.or]: {
                    [Op.between]: [startDate.toDate(), endDate.toDate()],
                    [Op.eq]: endDate.toDate(),
                  },
                },
                // startDate: startDate.toDate(),
                // endDate: endDate.toDate(),
                // dbKey: body.dbKey,
              },
              transaction,
            });
            if (!isExistTimesheet) {
              let responseData = await this.TimesheetService.addTimesheetService(
                {
                  body: {
                    ...body,
                    clientId,
                  },
                  user: user || null,
                },
                transaction
              );
              responseData = parse(responseData);
              return responseData;
            } else if (
              !isTimesheetApprovedData?.some((e) => e.status === "APPROVED")
            ) {
              await this.TimesheetService.update(
                {
                  ...body,
                  updatedBy: user?.id,
                },
                {
                  where: {
                    startDate: {
                      [Op.eq]: startDate.toDate(),
                    },
                    employeeId: data?.id,
                    clientId,
                  },
                  transaction,
                  individualHooks: true,
                }
              );
            }
          }
        } else {
          const body = {
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
            employeeId: data.id,
          };
          await this.TimesheetService.deleteTimesheetSummaryService(
            { ...body },
            transaction
          );
        }
      })
    );
  };

  public getAllTimesheetData = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.TimesheetService.getAllTimesheetService(
        req.query,
        req.user as User
      );
      return generalResponse(
        req,
        res,
        responseData,
        this.msg.fetch,
        "success",
        false
      );
    }
  );

  public constructTimesheetDate = async (ClientData, isExtendDate: boolean) => {
    let startDate;
    startDate = moment(ClientData.startDate);
    startDate = moment([
      startDate.year(),
      startDate.month(),
      ClientData.clientTimesheetStartDay[0].timesheetStartDay,
    ]);
    const endDate = moment(startDate).add(1, "month").subtract(1, "day");

    let ClientEndDate: Date = null;
    if (
      moment(ClientData.endDate)
        .endOf("month")
        .isBefore(moment().startOf("month")) &&
      ClientData.autoUpdateEndDate
    ) {
      ClientEndDate = moment().utc().toDate();
    } else {
      ClientEndDate = moment(ClientData.endDate).utc().toDate();
    }
    let difference = 0;

    if (ClientData.autoUpdateEndDate && isExtendDate) {
      difference =
        Math.ceil(moment(ClientEndDate).diff(startDate, "months", true)) +
        ClientData.autoUpdateEndDate;
    } else {
      difference = Math.ceil(
        moment(ClientEndDate).diff(startDate, "months", true)
      );
    }

    return {
      startDate,
      endDate,
      difference,
    };
  };

  public getTimesheetEmployeeDetails = async (
    clientId,
    employeeIds = [],
    transaction: Transaction = null
  ) => {
    const condition =
      employeeIds.length > 0
        ? { id: { [Op.in]: employeeIds } }
        : { clientId: clientId };
    let allEmployees = await Employee.findAll({
      include: [
        {
          model: LoginUser,
          attributes: [
            "firstName",
            "lastName",
            "gender",
            "birthDate",
            "placeOfBirth",
            "email",
            "phone",
            "profileImage",
          ],
        },
        {
          model: EmployeeRotation,
          attributes: ["id", "date"],
          as: "employeeRotation",
          include: [
            {
              model: Rotation,
              as: "rotation",
            },
          ],
        },
        {
          model: TimesheetSchedule,
          attributes: ["dbKey"],
        },
      ],
      where: condition,
      transaction,
      order: [["employeeRotation", "date", "asc"]],
    });
    allEmployees = parse(allEmployees);
    return allEmployees;
  };

  public generateTimesheetSummary = async (
    difference,
    allEmployees,
    ClientData,
    startDate,
    endDate,
    user = null,
    isSegmentAdd = false,
    transaction: Transaction
  ) => {
    let newStartDate = startDate;
    let newEndDate = endDate;
    let activeIndex = 1;
    for (let i = 0; i < Math.round(difference); i++) {
      if (
        ClientData.clientTimesheetStartDay.length > 1 &&
        activeIndex < ClientData.clientTimesheetStartDay.length &&
        moment(ClientData.clientTimesheetStartDay[activeIndex].date).isBetween(
          newStartDate,
          newEndDate,
          null,
          "[]"
        )
      ) {
        const diff =
          ClientData.clientTimesheetStartDay[activeIndex].timesheetStartDay -
          ClientData.clientTimesheetStartDay[activeIndex - 1].timesheetStartDay;
        newEndDate.add(Number(diff), "days");
        await this.addMultipleDataToTimesheet(
          allEmployees,
          ClientData.id,
          newStartDate,
          newEndDate,
          user,
          isSegmentAdd,
          transaction
        );
        newStartDate.add(Number(diff), "days");
        activeIndex++;
      } else {
        await this.addMultipleDataToTimesheet(
          allEmployees,
          ClientData.id,
          newStartDate,
          newEndDate,
          user,
          isSegmentAdd,
          transaction
        );
      }
      newStartDate = newStartDate.add(1, "month");
      newEndDate = moment(newStartDate).add(1, "month").subtract(1, "day");
    }
  };

  public generateTimesheetSchedule = async (
    allEmployees,
    ClientData,
    propStartDate,
    propEndDate,
    difference,
    employeeDate,
    user
  ) => {
    let startDate = propStartDate;
    let endDate = propEndDate;
    return Promise.all(
      allEmployees?.map(async (employeeData) => {
        let employeeMonthlyDetails = [];
        let empResp = [];
        startDate = moment(ClientData.startDate);
        startDate = moment([
          startDate.year(),
          startDate.month(),
          ClientData.timeSheetStartDay,
        ]);
        const rotationDetailsLength: number =
          employeeData.employeeRotation.length;
        let newStartDate = startDate;
        let k: string;
        if (employeeData.employeeRotation?.length > 0) {
          for (k in employeeData.employeeRotation) {
            if (Number(k) > 0) {
              newStartDate = moment(endDate);
            }
            if (k == String(rotationDetailsLength - 1)) {
              endDate = moment(startDate)
                .add(difference, "month")
                .subtract(1, "day");
            } else {
              endDate = moment(
                employeeData.employeeRotation[Number(k) + 1].date
              );
            }
            const rotationDetails = employeeData.employeeRotation[k]?.rotation;
            if (rotationDetails) {
              // if (!rotationDetails.isResident) {
              // 	this.empRotationDetail = {
              // 		...this.empRotationDetail,
              // 		totalWorkingDays: rotationDetails.weekOn * 7,
              // 		totalOffDays: rotationDetails.weekOff * 7,
              // 		activeSegment: 1,
              // 		activeCount: 1,
              // 	};
              // } else {
              this.empRotationDetail = {
                ...this.empRotationDetail,
                totalWorkingDays: rotationDetails.weekOn,
                totalOffDays: rotationDetails.weekOff * 0,
                activeSegment: 1,
                activeCount: 1,
              };
              // }
            }
            const endOfMonth = moment(endDate).diff(
              moment(newStartDate),
              "days"
            );
            employeeDate = moment(newStartDate);
            for (let j = 0; j < endOfMonth; j++) {
              empResp =
                this.setNewScheduleValue(
                  employeeDate,
                  employeeData,
                  user?.id || null,
                  rotationDetails,
                  ClientData
                ) ?? null;
              if (empResp) {
                employeeMonthlyDetails = [
                  ...employeeMonthlyDetails,
                  ...empResp,
                ];
              }
              employeeDate = employeeDate.add(1, "days");
            }
            this.lastEndDate = employeeDate;
          }
        } else {
          endDate = moment(startDate)
            .add(difference, "month")
            .subtract(1, "day");
          const endOfMonth = moment(endDate).diff(moment(newStartDate), "days");
          employeeDate = moment(newStartDate);
          for (let j = 0; j < endOfMonth; j++) {
            empResp =
              this.setNewScheduleValue(
                employeeDate,
                employeeData,
                user?.id || null,
                null,
                ClientData
              ) ?? null;
            if (empResp) {
              employeeMonthlyDetails = [...employeeMonthlyDetails, ...empResp];
            }
            employeeDate = employeeDate.add(1, "days");
          }
          this.lastEndDate = employeeDate;
        }
        empResp =
          this.setNewScheduleValue(
            this.lastEndDate,
            employeeData,
            user?.id || null,
            employeeData.employeeRotation[
              employeeData.employeeRotation.length - 1
            ]?.rotation,
            ClientData
          ) ?? null;
        if (empResp) {
          employeeMonthlyDetails = [...employeeMonthlyDetails, ...empResp];
        }
        return employeeMonthlyDetails;
      })
    );
  };

  async getClientForTimesheet(id: number, transaction) {
    const isFound = await Client.findOne({
      where: { id: id, deletedAt: null },
      include: [
        { model: LoginUser, required: true, attributes: ["email", "name"] },
        { model: ClientTimesheetStartDay },
      ],
      order: [["clientTimesheetStartDay", "date", "asc"]],
      transaction,
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    return data;
  }

  public createTimesheet = async (
    {
      clientId,
      user = null,
      employeeIds = [],
      disableFunction = [],
      type = null,
      isExtendDate = false,
      // isClientExtendTimesheet = false,
      isSegmentAdd = false,
    },
    transaction: Transaction = null
  ) => {
    try {
      const ClientData = await this.getClientForTimesheet(
        clientId,
        transaction
      );
      const constructedTimesheetDates = await this.constructTimesheetDate(
        ClientData,
        isExtendDate
      );
      const startDate = constructedTimesheetDates.startDate;
      const endDate = constructedTimesheetDates.endDate;
      const difference = +constructedTimesheetDates.difference;
      const allEmployees = await this.getTimesheetEmployeeDetails(
        clientId,
        employeeIds,
        transaction
      );

      if (startDate && endDate) {
        let employeeDate;

        if (!disableFunction.includes("timesheetSummary")) {
          await generateModalData({
            user: user,
            percentage: 20,
            message: "Generating Timesheet",
          });
          await this.generateTimesheetSummary(
            difference,
            allEmployees,
            ClientData,
            startDate,
            endDate,
            user,
            isSegmentAdd,
            transaction
          );
        }
        if (!disableFunction.includes("timesheetSchedule")) {
          await generateModalData({
            user: user,
            percentage: 40,
            message: "Generating Timesheet",
          });
          let resp = await this.generateTimesheetSchedule(
            allEmployees,
            ClientData,
            startDate,
            endDate,
            difference,
            employeeDate,
            user
          );
          this.allEmployeeTimesheetSchedule = [];
          resp = resp.filter((dat) => dat?.length > 0);
          this.getObjectFromNestedArray(resp);
          const lastTimesheetApproved = await Timesheet.findOne({
            where: {
              // status: 'APPROVED',
              employeeId: { [Op.in]: employeeIds },
            },
            attributes: ["id", "startDate", "endDate"],
            order: [["startDate", "desc"]],
            transaction,
          });
          await this.TimesheetScheduleService.deleteData({
            where: {
              employeeId: { [Op.in]: employeeIds },
              date: {
                [Op.and]: {
                  [Op.lte]: moment(startDate).format("YYYY-MM-DD"),
                  [Op.gt]: moment(lastTimesheetApproved?.endDate).format(
                    "YYYY-MM-DD"
                  ),
                },
              },
            },
            transaction,
          });
          await this.TimesheetScheduleService.addTimesheetScheduleService({
            allValues: this.allEmployeeTimesheetSchedule,
            transaction,
          });
          // if (isClientExtendTimesheet) {
          await this.TimesheetScheduleService.deleteData({
            where: {
              employeeId: { [Op.in]: employeeIds },
              date: {
                [Op.gt]: ClientData.endDate,
              },
            },
            force: true,
            transaction,
          });
          // }
        }
        if (!disableFunction.includes("reliquet")) {
          await generateModalData({
            user: user,
            percentage: 70,
            message: "Generating Reliquat Calculation",
          });
          const condition = employeeIds?.length > 0 ? employeeIds : null;
          await this.TimesheetService.generateReliquetResponse(
            user,
            condition,
            transaction,
            clientId
          );
        }

        const condition = employeeIds?.length > 0 ? employeeIds : null;
        console.log("test check for genereting account data on updating employee status from pending to active")
        await this.TimesheetService.generateAccountData(
          user,
          condition,
          type,
          clientId,
          transaction
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  public createTimesheetApi = catchAsync(
    async (req: Request, res: Response) => {
      const clientId = req.params.clientId
        ? [Number(req.params.clientId)]
        : await Client.findAll({
            attributes: ["id"],
          }).then(async (resp) => {
            return resp.map((dat) => parse(dat).id);
          });
      const promises = [];
      const user = req.user as User;
      // let allEmployeeData = await Employee.findAll({
      // 	attributes: ['id'],
      // 	where: {
      // 		deletedAt: null,
      // 		clientId: tempTimeSheetData.id,
      // 		[Op.or]: [{ terminationDate: null }, { terminationDate: { [Op.gt]: moment(moment().endOf('day')).toDate() } }],
      // 	},
      // });
      // allEmployeeData = parse(allEmployeeData);
      // let tempEmployeeIds = allEmployeeData.map((e) => e.id);
      const employeeIds =
        req.body.employeeIds?.length > 0 ? req.body.employeeIds : [];
      const disabledFunctionality = req.body.disabledFunction || [];
      for (const cid of clientId) {
        const transaction = await db.transaction();
        const promise = new Promise(async (resolve) => {
          try {
            await this.createTimesheet(
              {
                clientId: cid,
                user,
                employeeIds,
                disableFunction: disabledFunctionality,
              },
              transaction
            );
            resolve(cid);
            transaction.commit();
          } catch (error) {
            transaction.rollback();
            resolve(error);
          }
        });
        promises.push(promise);
        await promise;
      }
      await Promise.all(promises);

      // await createHistoryRecord({
      //   tableName: tableEnum.TIMESHEET,
      //   moduleName: moduleName.TIMESHEETS,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: `<b>${user?.loginUserData?.name}</b> has created a ${formatKeyString(tableEnum.TIMESHEET)}, Generated ${employeeIds.length > 0?'Bulk Timesheets':'Timesheet'}`,
      //   jsonData: parse(promises),
      //   activity: statusEnum.VIEW,
      // });
      return generalResponse(
        req,
        res,
        promises,
        this.msg.create,
        "success",
        false
      );
    }
  );

  /**
   * Add TimeSheet Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public getDropdownDetails = catchAsync(
    async (req: Request, res: Response) => {
      const clientId = req.params.clientId;
      const { activeDate, isActiveDate } = req.query;
      const resp = await this.TimesheetService.getTimesheetDropdownDetails(
        clientId,
        req.user as User,
        activeDate,
        isActiveDate ? true : false
      );
      return generalResponse(req, res, resp, this.msg.create, "success", false);
    }
  );

  public approveTimesheet = catchAsync(async (req: Request, res: Response) => {
    const transaction = await db.transaction();
    try {
      const timesheetIds = req.body.timesheetIds;
      const newStatus = req.body.status;
      const promises = [];
      let result;
      const timesheetApprovedList = [];
      const sendMailData: TimesheetPDFAttributes[] = [];
      for (const timesheetId of timesheetIds) {
        const promise = new Promise(async (resolve) => {
          const timesheetLogsData = await TimesheetLogs.create(
            {
              actionBy: req.user?.id || null,
              timesheetId: timesheetId || null,
              status:
                newStatus === "APPROVED"
                  ? timesheetLogsStatus.APPROVED
                  : timesheetLogsStatus.UNAPPROVED,
              actionDate: new Date(),
            },
            { transaction }
          ).then((parseData) => parse(parseData));
          const response = await this.TimesheetService.approveTimesheet(
            {
              timesheetId,
              newStatus,
              timesheetLogsData,
              user: req.user as User,
            },
            transaction
          );
          result = response?.timesheetData;
          if (response?.mailData) {
            sendMailData?.push(response?.mailData);
          }
          if (newStatus === "UNAPPROVED") {
            const timesheetScheduleData = await this.TimesheetService.findTimesheetSummaryById(
              result.id,
              transaction
            );
            timesheetScheduleData &&
              timesheetApprovedList.push(parse(timesheetScheduleData));
          }
          if (newStatus === "APPROVED") {
            await generateModalData({
              user: req.user as User,
              percentage: 75,
              message: "Updating Accounts",
            });
            await this.AccountService.generateAccountRelatedData(
              {
                employeeId: result?.employeeId,
                timesheetId: timesheetId,
                userId: req.user?.id,
                type: "approveTimesheetAccount",
              },
              transaction
            );
          }

          await generateModalData({
            user: req.user as User,
            percentage: 100,
            message: "Updating Reliquat Calculation",
          });
          if (newStatus == "APPROVED") {
            await this.TimesheetService.generateReliquetResponse(
              req.user,
              [result?.employeeId],
              transaction,
              null,
              []
            );
          }
          resolve(result);
        });
        promises.push(result);
        promises.push(promise);

        await promise;
      }

      const resp = await Promise.all(promises);
      const user = req.user as User;
      await createHistoryRecord(
        {
          tableName: tableEnum.TIMESHEET,
          moduleName: moduleName.TIMESHEETS,
          userId: user?.id,
          lastlogintime: user?.loginUserData?.logintimeutc,
          custom_message: `<b>${
            user?.loginUserData?.name
          }</b> has <b>updated</b> the ${formatKeyString(
            tableEnum.TIMESHEET
          )}, Bulk ${
            newStatus === "APPROVED" ? "Approved" : "Rejected"
          } Timesheet`,
          jsonData: parse(resp),
          activity: statusEnum.UPDATE,
        },
        transaction
      );

      if (newStatus === "APPROVED") {
        // this.sendIndividualTimesheetMail(sendMailData);
        // this.sendSegmentTimesheetMail(timesheetIds, newStatus, req);
      } else {
        // this.sendUnapprovalMail(timesheetApprovedList);
      }

      await transaction.commit();
      return generalResponse(
        req,
        res,
        resp,
        `Timesheet ${newStatus} !!`,
        "success",
        true
      );
    } catch (error) {
      console.log("error", error);
      await transaction.rollback();
      return generalResponse(
        req,
        res,
        error,
        `Something went Wrong !!} `,
        "failed",
        true,
        400
      );
    }
  });

  async sendIndividualTimesheetMail(sendMailData: TimesheetPDFAttributes[]) {
    if (sendMailData?.length > 0) {
      for (const mailData of sendMailData) {
        try {
          const pdfData = mailData?.pdfData;
          const data = pdfData?.data;
          const pdfName = pdfData?.pdfName;
          const title = pdfData?.title;
          const attribute = pdfData?.attribute;
          const resizeHeaderFooter = pdfData?.resizeHeaderFooter;
          const stampLogo = pdfData?.stampLogo;
          const footerContent = pdfData?.footerContent;
          const footer = pdfData?.footer;
          const isTimesheetPdf = pdfData?.isTimesheetPdf;
          const pdfPath = mailData?.pdfPath;

          await pdf(
            data,
            pdfName,
            title,
            attribute,
            resizeHeaderFooter,
            stampLogo,
            footerContent,
            footer,
            isTimesheetPdf,
            false
          );
          if (mailData?.emails?.length > 0) {
            const replacement = mailData?.replacement;
            // await sendMail(
            //   mailData?.emails,
            //   "Timesheet Approval Details",
            //   "generalMailTemplateTable",
            //   replacement,
            //   [{ path: pdfPath }]
            // );
          } else {
            fileDelete(pdfPath);
          }
        } catch (error) {
          console.log({ error });
        }
      }
    }
  }

  async sendUnapprovalMail(timesheetApprovedList) {
    if (timesheetApprovedList?.length > 0) {
      const employeeNamesArr = [];
      for (const iterator of timesheetApprovedList) {
        employeeNamesArr?.push(
          `${iterator?.employeeData?.loginUserData?.lastName} ${iterator?.employeeData?.loginUserData?.firstName}`
        );
      }
      const replacement = {
        mailHeader: "Timesheet Unapproved",
        client:
          timesheetApprovedList[0]?.employeeData?.client?.loginUserData?.name,
        timesheetPeriod:
          timesheetApprovedList[0].timesheetData.startDate +
          "-" +
          timesheetApprovedList[0].timesheetData.endDate,
        segment: `${timesheetApprovedList[0]?.timesheetData.segment.name}${
          timesheetApprovedList[0]?.timesheetData?.subSegment?.name
            ? " - " + timesheetApprovedList[0]?.timesheetData?.subSegment?.name
            : ""
        }`,
        employeeNamesArr,
        logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
        message: "The timesheet has been unapproved for the following :",
      };
      // await sendMail(
      //   ["admin@lred.com"],
      //   "Timesheet Unapproved",
      //   "unapproveTimesheet",
      //   replacement
      // );
    }
  }

  async sendSegmentTimesheetMail(
    timesheetIds: number[],
    newStatus: string,
    req: Request
  ) {
    try {
      const timesheetApprovedList = [];
      if (timesheetIds?.length > 0) {
        const timesheetData = await Timesheet.findAll({
          where: {
            id: {
              [Op.in]: timesheetIds,
            },
          },
          attributes: [
            "id",
            "startDate",
            "endDate",
            "segmentId",
            "subSegmentId",
          ],
          include: [
            {
              model: Segment,
              attributes: ["id", "name"],
            },
            {
              model: SubSegment,
              attributes: ["id", "name"],
            },
          ],
        });
        if (timesheetData?.length > 0) {
          const startDate = moment(timesheetData[0]?.startDate).toDate();
          const endDate = moment(timesheetData[0]?.endDate).toDate();
          const segmentIds = [];
          const subSegmentIds = [];
          for (const data of timesheetData) {
            if (data?.segmentId && !data?.subSegmentId) {
              if (!segmentIds?.includes(data?.segmentId)) {
                segmentIds?.push(data?.segmentId);
              }
            }
            if (data?.subSegmentId) {
              if (!subSegmentIds?.includes(!data?.subSegmentId)) {
                subSegmentIds?.push(data?.subSegmentId);
              }
            }
          }
          const timesheetSegmentData = await Timesheet.findAll({
            where: {
              startDate,
              endDate,
              [Op.or]: {
                [Op.and]: {
                  segmentId: {
                    [Op.in]: segmentIds,
                  },
                  subSegmentId: {
                    [Op.is]: null,
                  },
                },
                subSegmentId: {
                  [Op.in]: subSegmentIds,
                },
              },
              status: "APPROVED",
            },
            attributes: ["id"],
          });
          const timesheetIdsNew = timesheetSegmentData?.map((e) => e.id);
          for (const id of timesheetIdsNew) {
            const timesheetScheduleData = await this.TimesheetService.findTimesheetSummaryById(
              id
            );
            timesheetScheduleData &&
              timesheetApprovedList.push(parse(timesheetScheduleData));
          }
        }
      }
      if (timesheetApprovedList.length && newStatus === "APPROVED") {
        const segmentArr = new Map();
        const finalSegmentArr = [];
        for (const timesheetApprovedData of timesheetApprovedList) {
          const segmentName = `${
            timesheetApprovedData?.timesheetData?.segment?.name
          }${
            timesheetApprovedData?.timesheetData?.subSegment?.name
              ? " - " + timesheetApprovedData?.timesheetData?.subSegment?.name
              : ""
          }`;
          const isExist = await segmentArr.get(segmentName);
          if (!isExist) {
            segmentArr.set(segmentName, {
              segment: timesheetApprovedData?.timesheetData?.segment?.name,
              subSegment:
                timesheetApprovedData?.timesheetData?.subSegment?.name ?? null,
            });
          }
        }
        finalSegmentArr.push(...segmentArr.values());
        for (const segmentData of finalSegmentArr) {
          const filteredData = timesheetApprovedList?.filter(
            (e) =>
              (segmentData?.segment &&
                segmentData?.subSegment &&
                e?.timesheetData?.segment?.name === segmentData?.segment &&
                (segmentData.subSegment
                  ? e?.timesheetData?.subSegment?.name ===
                    segmentData?.subSegment
                  : "")) ||
              (segmentData?.segment &&
                e?.timesheetData?.segment?.name === segmentData?.segment)
          );
          const pdfName = `${moment().unix()}${generateFourDigitNumber()}-segment-timesheet.pdf`;
          const resizeHeaderFooter = true;
          const statusDataList = [];
          const bonusDataList = [];
          const weekendOvertimeColsArr: string[] = [];

          const weekendOvertimeData: { label: string; title: string }[] = [];
          let isReliquat = false;
          let isReliquatTotal = false;
          const chunkSize = 9;
          const chunkedTimesheetDetails = filteredData
            .map((_, i) => {
              return i % chunkSize === 0
                ? filteredData.slice(i, i + chunkSize)
                : null;
            })
            .filter((e) => e);
          let isCallOutRotation = true;
          if (filteredData?.length > 0) {
            if (
              filteredData?.some(
                (data) =>
                  data?.employeeData?.employeeRotation &&
                  data?.employeeData?.employeeRotation?.length > 0 &&
                  data?.employeeData?.employeeRotation[0]?.rotation?.name &&
                  data?.employeeData?.employeeRotation[0]?.rotation?.name !==
                    "Call Out"
              )
            ) {
              isCallOutRotation = false;
            } else {
              isCallOutRotation = true;
            }
          }
          const pdfEmployeeData = [];
          filteredData?.map((items) => {
            items.allMonthData.forEach((dataItem, index) => {
              const dayNumber = moment(dataItem?.rawDate).day();
              const isWeekend =
                ((items?.employeeData?.client.country === "Algeria" ||
                  items?.employeeData?.client.country === "Libya") &&
                  (dayNumber === 5 || dayNumber === 6)) ||
                items?.employeeData?.client?.weekendDays?.includes(dayNumber);

              items.allMonthData[index].weekendDays = isWeekend || false;
            });

            items.statusArr
              ?.filter((e) => e.key !== "HOB")
              ?.map((statusArrData) => {
                if (
                  !statusDataList.find(
                    (sData) => sData.key == statusArrData.key
                  )
                ) {
                  statusDataList.push(statusArrData);
                }
              });

            items.bonusCount?.map((bonus) => {
              if (
                !bonusDataList.find((sData) => sData.key == bonus.bonusType)
              ) {
                bonusDataList.push({
                  key: bonus.bonusType,
                  name: bonus.bonusName,
                  title: bonus.bonusType,
                  value: bonus.length,
                });
              }
            });

            items?.overtimeWeekendBonus?.map(
              (e: { label: string; title?: string; length: number }) => {
                if (
                  weekendOvertimeColsArr?.findIndex(
                    (isExist) => isExist === e?.label
                  ) < 0
                ) {
                  weekendOvertimeColsArr?.push(e?.label);
                  weekendOvertimeData?.push({
                    label: e.label,
                    title: e?.title ?? "",
                  });
                }
              }
            );

            if (
              items?.employeeData?.reliquatCalculation &&
              items?.employeeData?.reliquatCalculation?.length > 0
            )
              isReliquat = true;

            if (
              items?.employeeData?.rotation &&
              items?.employeeData?.rotation?.name != "Call Out"
            ) {
              isReliquatTotal = true;
            }
            pdfEmployeeData.push({
              employeeName:
                items?.employeeData?.loginUserData?.lastName +
                " " +
                items?.employeeData?.loginUserData?.firstName,
              employeeNumber: items?.employeeData?.employeeNumber,
              status: items?.status,
              statusCounts: items?.statusCounts,
            });
          });
          const isHourlyBonusNote = filteredData?.some(
            (e) => e?.isHourlyBonusNote
          );
          const pdfData = {
            timesheetList: filteredData,
            statusDataList: statusDataList,
            bonusDataList: bonusDataList,
            isCallOutRotation: isCallOutRotation,
            weekendOvertimeColsArr: weekendOvertimeColsArr,
            weekendOvertimeData: weekendOvertimeData,
            chunkedTimesheetDetails: chunkedTimesheetDetails,
            isReliquat: isReliquat,
            isReliquatTotal: isReliquatTotal,
            isHourlyBonusNote,
          };
          const stampLogo =
            filteredData &&
            filteredData.length > 0 &&
            filteredData[0]?.employeeData?.client?.stampLogo
              ? SERVER_URL + filteredData[0]?.employeeData?.client?.stampLogo
              : null;

          // const timesheetLogData = filteredData[0].timesheetData.timesheetLogsData.slice(-1)[0];

          const itemData = filteredData[0].timesheetData.timesheetLogsData?.map(
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
          const footerContent = itemData
            .join(",")
            .replaceAll("UNAPPROVED", "unapproved")
            .replaceAll("APPROVED", "approved");
          const footer = "";

          const isTimesheetPdf = true;
          await pdf(
            pdfData,
            pdfName,
            "segmentTimesheetPdf",
            true,
            resizeHeaderFooter,
            stampLogo,
            footerContent,
            footer,
            isTimesheetPdf,
            true
          );
          let emails = ["admin@lred.com"];
          const userData = req?.user as User;
          if (userData?.loginUserData?.email) {
            emails.push(userData?.loginUserData?.email);
          }
          if (
            filteredData[0].employeeData.client.approvalEmail &&
            filteredData[0].employeeData.client.approvalEmail !== ""
          ) {
            emails = emails.concat(
              filteredData[0].employeeData.client.approvalEmail.split(",")
            );
            emails = [...new Set(emails)];
          }

          const replacement = {
            mailHeader: "Timesheet approval details",
            employeeData: pdfEmployeeData,
            client: filteredData[0]?.employeeData?.client?.loginUserData?.name,
            timesheetPeriod:
              filteredData[0].timesheetData.startDate +
              "-" +
              filteredData[0].timesheetData.endDate,
            segment: `${filteredData[0]?.timesheetData.segment.name}${
              filteredData[0]?.timesheetData?.subSegment?.name
                ? " - " + filteredData[0]?.timesheetData?.subSegment?.name
                : ""
            }`,
            logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
            message:
              "Your timesheet has been successfully approved. We have attached the file containing the detailed timesheet information for your reference.",
          };
          const publicFolder = path.join(__dirname, "../../secure-file/");
          folderExistCheck(publicFolder);
          const filePath = path.join(
            publicFolder,
            `segmentTimesheetPdf/${pdfName}`
          );
          if (emails.length > 0) {
            // await sendMail(
            //   emails,
            //   "Segment Timesheet Approval Details",
            //   "approveTimesheet",
            //   replacement,
            //   [{ path: filePath }]
            // );
          } else {
            fileDelete(filePath);
          }
        }
      }
    } catch (error) {
      console.log({ error });
    }
  }

  public getReliquatAdjustmentDates = catchAsync(
    async (req: Request, res: Response) => {
      const clientId = req.params.clientId;
      const { type, employeeId } = req.query;
      const resp = await this.TimesheetService.getReliquatAdjustmentDate(
        Number(clientId),
        type as string,
        Number(employeeId)
      );
      return generalResponse(
        req,
        res,
        resp,
        "Reliquat Adjustment Date Fetched Successfully",
        "success",
        false
      );
    }
  );

  public findTimesheetSummaryById = catchAsync(
    async (req: Request, res: Response) => {
      const ids = req.query?.id ? req.query?.id.toString().split(",") : [];
      const responseDatas = [];
      if (ids.length) {
        for (const idData of ids) {
          const result = await this.TimesheetService.findTimesheetSummaryById(
            +idData
          );
          result && responseDatas.push(result);
        }
      }
      const user = req.user as User;
      await createHistoryRecord({
        tableName: tableEnum.TIMESHEET,
        moduleName: moduleName.TIMESHEETS,
        userId: user?.id,
        lastlogintime: user?.loginUserData?.logintimeutc,
        custom_message: `<b>${user?.loginUserData?.name}</b> has Export Timesheet Summary Data in PDF!`,
        jsonData: parse(responseDatas),
        activity: statusEnum.EXPORT,
      });
      return generalResponse(
        req,
        res,
        responseDatas,
        this.msg.fetch,
        "success",
        false
      );
    }
  );

  public approveTimesheetRequest = catchAsync(
    async (req: Request, res: Response) => {
      const resp = await this.TimesheetService.approveTimesheetRequest(
        req.user as User,
        req.body
      );
      return generalResponse(
        req,
        res,
        resp,
        "Request Sent Successfully.",
        "success",
        true
      );
    }
  );

  public getapprovalrequests = catchAsync(
    async (req: Request, res: Response) => {
      const resp = await this.TimesheetService.getapprovalrequests(req.query);
      return generalResponse(req, res, resp, this.msg.fetch, "success", false);
    }
  );
}

export default TimesheetController;