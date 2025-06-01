import { MessageFormation } from "@/constants/messages.constants";
import { createHistoryRecord, formatKeyString } from "@/helpers/history.helper";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import db from "@/models";
import User from "@/models/user.model";
import TimesheetRepo from "@/repository/timesheet.repository";
import TimesheetScheduleRepo from "@/repository/timesheetSchedule.repository";
import { parse } from "@/utils/common.util";
import generalResponse from "@/utils/generalResponse";
import { generateModalData } from "@/utils/generateModal";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

class TimesheetScheduleController {
  private TimesheetScheduleService = new TimesheetScheduleRepo();
  private TimesheetService = new TimesheetRepo();
  private msg = new MessageFormation("Timesheet").message;

  public findAllTimesheetSchedule = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.TimesheetScheduleService.getAllTimesheetScheduleDetails(
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

public updateTimesheetSchedule = catchAsync(
  async (req: Request, res: Response) => {
    let responseData;
    const transaction = await db.transaction();

    try {
      console.log("🔍 Incoming request body:", req.body);
      const user = req.user as User;

      await generateModalData({
        user,
        percentage: 0,
        message: "Updating Timesheet Status",
      });

      const scheduleIds = req.body?.scheduleIds;

      console.log("🧩 scheduleIds:", scheduleIds, "Type:", typeof scheduleIds, "Is Array:", Array.isArray(scheduleIds), "Length:", scheduleIds?.length);

      if (Array.isArray(scheduleIds) && scheduleIds.length > 0) {
        console.log("✅ Entered updateTimesheetScheduleById block");

        responseData = await this.TimesheetScheduleService.updateTimesheetScheduleById(
          scheduleIds,
          req.body.updateStatus,
          user,
          false,
          req.body.isBonus,
          true,
          transaction,
          req.body?.overtimeHours ||
            (req.body.updateStatus === "CLEARFIELD" ||
            req.body.updateStatus === "CLEARFIELDTOP"
              ? null
              : req.body?.overtimeHours)
        );

        let empids = responseData.map((dat) => dat.employeeId);
        empids = empids.filter((item, index) => empids.indexOf(item) === index);
        const date = responseData[0]?.date;

        await generateModalData({
          user,
          percentage: 50,
          message: "Updating Reliquat Calculation",
        });

        await this.TimesheetService.generateReliquetResponse(
          user,
          empids,
          transaction,
          null,
          [...scheduleIds]
        );

        await generateModalData({
          user,
          percentage: 100,
          message: "Updating Accounts",
        });

        await this.TimesheetService.getTimesheetDataForAccount(
          user,
          empids,
          date,
          transaction
        );
      } else {
        console.log("📌 Entered updateTimesheetScheduleByEmployeeId block");

        responseData = await this.TimesheetScheduleService.updateTimesheetScheduleByEmployeeId({
          ...req.body,
          user,
          isTimesheetApplied: true,
          transaction,
        });

        const date = responseData[0]?.date;

        await generateModalData({
          user,
          percentage: 50,
          message: "Updating Reliquat Calculation",
        });

        await this.TimesheetService.generateReliquetResponse(
          user,
          [req.body.employeeId],
          transaction,
          null,
          [responseData[0]?.id]
        );

        await generateModalData({
          user,
          percentage: 100,
          message: "Updating Accounts",
        });

        await this.TimesheetService.getTimesheetDataForAccount(
          user,
          [req.body.employeeId],
          date,
          transaction
        );
      }

      await createHistoryRecord({
        tableName: tableEnum.TIMESHEET_SCHEDULE,
        moduleName: moduleName.TIMESHEETS,
        userId: user?.id,
        lastlogintime: user?.loginUserData?.logintimeutc,
        custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${formatKeyString(tableEnum.TIMESHEET_SCHEDULE)}, Timesheet Schedule.`,
        jsonData: parse(responseData[0]),
        activity: statusEnum.UPDATE,
      }, transaction);

      await transaction.commit();

      console.log("✅ Timesheet update complete.");
      return generalResponse(
        req,
        res,
        true,
        this.msg.update,
        "success",
        true
      );
    } catch (error) {
      console.log("❌ Error caught in updateTimesheetSchedule:", error);

      await transaction.rollback();
      return generalResponse(
        req,
        res,
        error,
        error.message ? error.message : this.msg.somethingWentWrong,
        "error",
        true,
        400
      );
    }
  }
);

}

export default TimesheetScheduleController;