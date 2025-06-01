import BankDetailsController from "@/controllers/bankDetails.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import { Routes } from "@/interfaces/general/routes.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import { bankDetailsaddSchema } from "@/validationSchema/bankDetails.validation";
import { Router } from "express";

class BankRouts implements Routes {
  public path = "/bank";
  public router = Router();
  public BankController = new BankDetailsController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/add`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Account, PermissionEnum.View),
      validationMiddleware(bankDetailsaddSchema, "body"),
      this.BankController.addBankAccount
    ); // Create Bank Account

    this.router.get(
        `${this.path}/getby_loginuser/:loginUserId`,
        authMiddleware,
        rolePermissionMiddleware(FeaturesNameEnum.Account, PermissionEnum.View),
        this.BankController.getaccountsbyloginuserId
      );
  }
}

export default BankRouts;
