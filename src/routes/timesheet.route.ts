import TimesheetController from "@/controllers/timesheet.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import { Routes } from "@/interfaces/general/routes.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import {
  ReliquatDateSchema,
  TimesheetBodyTimesheetIdSchema,
  TimesheetCreteBody,
  TimesheetFetchAllSchema,
  TimesheetParamsIdSchema,
} from "@/validationSchema/timesheet.validation";
import { Router } from "express";

class TimesheetRoutes implements Routes {
  public path = "/timesheet";
  public router = Router();
  public timesheetController = new TimesheetController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Timesheet, PermissionEnum.View),
      validationMiddleware(TimesheetFetchAllSchema, "query"),
      this.timesheetController.getAllTimesheetData
    ); // Get All Timesheet. (Private)

    this.router.get(
      `${this.path}/getDropdownDetails/:clientId`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Timesheet, PermissionEnum.View),
      this.timesheetController.getDropdownDetails
    ); // Get the timesheet schedule dropdown details. (Public)

    this.router.get(
      `${this.path}/getapprovalrequests`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.TimeSheetRequest, PermissionEnum.View),
      this.timesheetController.getapprovalrequests
    ); 
    this.router.post(
      `${this.path}/approve_timesheet_request`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Timesheet,
        PermissionEnum.Approve
      ),
      validationMiddleware(TimesheetBodyTimesheetIdSchema, "body"),
      this.timesheetController.approveTimesheetRequest
    ); // Request for Approve Timesheet by users. (Private)

    this.router.post(
      `${this.path}/:clientId`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Timesheet, PermissionEnum.View),
      validationMiddleware(TimesheetParamsIdSchema, "params"),
      validationMiddleware(TimesheetCreteBody, "body"),
      this.timesheetController.createTimesheetApi
    ); //Add Time sheet summary.

    this.router.put(
      `${this.path}/approve`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Timesheet,
        PermissionEnum.Approve
      ),
      validationMiddleware(TimesheetBodyTimesheetIdSchema, "body"),
      this.timesheetController.approveTimesheet
    ); // Approve Timesheet. (Private)

    this.router.get(
      `${this.path}/get-reliquat-adjustment-date/:clientId`,
      authMiddleware,
      validationMiddleware(TimesheetParamsIdSchema, "params"),
      validationMiddleware(ReliquatDateSchema, "query"),
      this.timesheetController.getReliquatAdjustmentDates
    ); // (Public)

    this.router.get(
      `${this.path}/pdf-datas`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Timesheet, PermissionEnum.View),
      this.timesheetController.findTimesheetSummaryById
    ); // Get Timesheet Summary for PDF By TImesheet ID (Private)
  }
}

export default TimesheetRoutes;
