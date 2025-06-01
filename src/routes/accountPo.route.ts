import AccountPOController from "@/controllers/accountPo.controller";
import TimesheetController from "@/controllers/timesheet.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import { Routes } from "@/interfaces/general/routes.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import { paramsIdSchema } from "@/validationSchema/common.validation";
import { Router } from "express";

class AccountPORoute implements Routes {
  public path = "/account/PO";
  public router = Router();
  public AccountPOController = new AccountPOController();
  public timesheetcontroller = new TimesheetController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/getAccountPOData`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.AccountPO, PermissionEnum.View),
      this.AccountPOController.getAllSegmentsData
    ); // Get All Segments-SubSegment Data

    // this.router.get(
    // 	`${this.path}/account-detail`,
    // 	authMiddleware,
    // 	rolePermissionMiddleware(FeaturesNameEnum.AccountPO, PermissionEnum.View),
    // 	this.AccountPOController.getAllAccountSummaryData,
    // ); // Get All Account Summary Data

    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.AccountPO, PermissionEnum.View),
      validationMiddleware(paramsIdSchema, "params"),
      this.AccountPOController.getAllAccountPOData
    ); // Get Account POs Data for PO Summary

    this.router.get(
      `${this.path}/recappo/summary/:id`,
      authMiddleware,
      validationMiddleware(paramsIdSchema, "params"),
      this.AccountPOController.recapPoSummaryMailer
    );

    this.router.get(
      `${this.path}/recappo/summary/:id/download`,
      authMiddleware,
      validationMiddleware(paramsIdSchema, "params"),
      this.AccountPOController.recapPoSummaryDownload
    );
    this.router.get(
      `${this.path}/employee/:id`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.AccountPO, PermissionEnum.View),
      validationMiddleware(paramsIdSchema, "params"),
      this.AccountPOController.getAllAccountPODataByEmployee
    ); // Get Account POs Details Data By Employee

    this.router.put(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.AccountPO, PermissionEnum.View),
      this.AccountPOController.updatePaymentStatus
    ); // Update Payment Status

    this.router.get(
      `${this.path}/details/:id`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.AccountPO, PermissionEnum.View),
      validationMiddleware(paramsIdSchema, "params"),
      this.AccountPOController.getPoDetailsByPoId
    ); // Get Account POs Details Data By Employee

    // this.router.put(
    // 	`${this.path}/approve_po/:id`,
    // 	authMiddleware,
    // 	rolePermissionMiddleware(FeaturesNameEnum.AccountPO, PermissionEnum.View),
    // 	this.AccountPOController.approvePoById,
    // 	this.timesheetcontroller.approveTimesheet
    //   );  // not required functionality

    // this.router.get(
    //   `${this.path}/recap_po_summary`,
    //   authMiddleware,
    //   this.AccountPOController.recapPoSummaryMailer
    // )
  }
}

export default AccountPORoute;
