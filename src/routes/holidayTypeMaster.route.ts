import HolidayTypeMaster from "@/controllers/holidayTypeMaster.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import { holidayTypeIdMasterSchema, holidayTypeMasterSchema } from "@/validationSchema/holidayTypeRequest.validation";

import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import { Router } from "express";
import { Routes } from "interfaces/general/routes.interface";

class HolidayTypeMasterRoute implements Routes {
  public BonusTypeMaster = new HolidayTypeMaster();
  public path = "/holidays";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.post(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Holidays,
        PermissionEnum.Create
      ),
      validationMiddleware(holidayTypeMasterSchema, "body"),
      this.BonusTypeMaster.applyHolidayTypeMasterRequest
    );

    this.router.get(
      `${this.path}`,
      // authMiddleware,
      // rolePermissionMiddleware(
      //   FeaturesNameEnum.Holidays,
      //   // PermissionEnum.List,
      //   PermissionEnum.View
      // ),
      validationMiddleware(holidayTypeMasterSchema, "params"),
      this.BonusTypeMaster.getAllHolidayTypes
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Holidays,
        PermissionEnum.View
      ),
      validationMiddleware(holidayTypeIdMasterSchema, "params"),
      this.BonusTypeMaster.getHolidayType
    );

    this.router.put(
      `${this.path}/:id/update`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Holidays,
        PermissionEnum.View
      ),
      validationMiddleware(holidayTypeIdMasterSchema, "params"),
      validationMiddleware(holidayTypeMasterSchema, "body"),
      this.BonusTypeMaster.updateHolidayType
    );

    this.router.delete(
      `${this.path}/:id/delete`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Holidays,
        PermissionEnum.Delete
      ),
      validationMiddleware(holidayTypeIdMasterSchema, "params"),
      this.BonusTypeMaster.deleteHolidayType
    );

  }
}

export default HolidayTypeMasterRoute;
