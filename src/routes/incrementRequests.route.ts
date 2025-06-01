import IncrementRequest from "@/controllers/incrementRequest.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import {
  currentAmountParamsSchema,
  incrementAmountaddSchema,
  incrementAmountDataBodySchema,
  incrementAmountParamsSchema,
  incrementAmountStatusBodySchema,
  incrementAmountStatusParamsSchema,
} from "@/validationSchema/incrementRequest.validation";

import { Router } from "express";
import { Routes } from "interfaces/general/routes.interface";

class IncrementRequestRoute implements Routes {
  public incrementRequest = new IncrementRequest();
  public path = "/increment_request";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.IncrementSalary,
        PermissionEnum.Create
      ),
      validationMiddleware(incrementAmountaddSchema, "body"),
      this.incrementRequest.applySalaryBonusReq
    );

    this.router.get(
      `${this.path}/:clientId`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.IncrementSalary,
        PermissionEnum.View
      ),
      validationMiddleware(incrementAmountParamsSchema, "params"),
      this.incrementRequest.getAllSalaryBonusReq
    );

    this.router.get(
      `${this.path}/current_salary_bonus/:employeeId`,
      authMiddleware,
      validationMiddleware(currentAmountParamsSchema, "params"),
      this.incrementRequest.getCurrentSalaryBonusData
    );

    this.router.put(
      `${this.path}/:id/status`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.IncrementSalary,
        PermissionEnum.Approve
      ),
      validationMiddleware(incrementAmountStatusParamsSchema, "params"),
      validationMiddleware(incrementAmountStatusBodySchema, "body"),
      this.incrementRequest.updateSalaryBonusReqStatus
    );

    this.router.put(
      `${this.path}/:id/update`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.IncrementSalary,
        PermissionEnum.Update
      ),
      validationMiddleware(incrementAmountStatusParamsSchema, "params"),
      validationMiddleware(incrementAmountDataBodySchema, "body"),
      this.incrementRequest.updateSalaryBonusReqData
    );

    this.router.delete(
      `${this.path}/:id/delete`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.IncrementSalary,
        PermissionEnum.Delete
      ),
      validationMiddleware(incrementAmountStatusParamsSchema, "params"),
      this.incrementRequest.deleteSalaryBonusReqData
    );
  }
}

export default IncrementRequestRoute;
