import BonusTypeMaster from "@/controllers/bonusTypeMaster.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import {
  bonusTypeIdMasterSchema,
  bonusTypeMasterSchema,
} from "@/validationSchema/bonusTypeRequest.validation";

import { Router } from "express";
import { Routes } from "interfaces/general/routes.interface";

class OvertimeBonusTypeMasterRoute implements Routes {
  public BonusTypeMaster = new BonusTypeMaster();
  public path = "/overtime-bonus";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      // authMiddleware,
      // rolePermissionMiddleware(
      //   FeaturesNameEnum.OvertimeBonus,
      //   PermissionEnum.Create
      // ),
      validationMiddleware(bonusTypeMasterSchema, "body"),
      this.BonusTypeMaster.applyBonusTypeMasterRequest
    );

    this.router.get(
      `${this.path}`,
      // authMiddleware,
      // rolePermissionMiddleware(
      //   FeaturesNameEnum.OvertimeBonus,
      //   // PermissionEnum.List,
      //   PermissionEnum.View
      // ),
      validationMiddleware(bonusTypeMasterSchema, "params"),
      this.BonusTypeMaster.getAllBonusTypes
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.OvertimeBonus,
        PermissionEnum.View
      ),
      validationMiddleware(bonusTypeIdMasterSchema, "params"),
      this.BonusTypeMaster.getBonusType
    );

    this.router.put(
      `${this.path}/:id/update`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.OvertimeBonus,
        PermissionEnum.Update
      ),
      validationMiddleware(bonusTypeIdMasterSchema, "params"),
      validationMiddleware(bonusTypeMasterSchema, "body"),
      this.BonusTypeMaster.updateBonusType
    );

    this.router.delete(
      `${this.path}/:id/delete`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.OvertimeBonus,
        PermissionEnum.Delete
      ),
      validationMiddleware(bonusTypeIdMasterSchema, "params"),
      this.BonusTypeMaster.deleteBonusType
    );
  }
}

export default OvertimeBonusTypeMasterRoute;
