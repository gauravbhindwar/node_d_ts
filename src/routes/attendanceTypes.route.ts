import AttendanceTypeMaster from "@/controllers/attendanceTypeMaster.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import { attendanceTypeIdMasterSchema, attendanceTypeMasterSchema } from "@/validationSchema/attendanceTypeRequest.validation";

import { Router } from "express";
import { Routes } from "interfaces/general/routes.interface";

class AttendanceTypeMasterRoute implements Routes {
  public AttendanceTypeMaster = new AttendanceTypeMaster();
  public path = "/attendance-type";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
        rolePermissionMiddleware(
          FeaturesNameEnum.AttendanceType,
          PermissionEnum.Create
        ),
      validationMiddleware(attendanceTypeMasterSchema, "body"),
      this.AttendanceTypeMaster.applyAttendanceTypeMasterRequest
    );

    this.router.get(
      `${this.path}`,
      // authMiddleware,
      // rolePermissionMiddleware(
      //   FeaturesNameEnum.AttendanceType,
      //   PermissionEnum.View
      // ),
      this.AttendanceTypeMaster.getAllAttendanceTypes
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.AttendanceType, PermissionEnum.View),
      validationMiddleware(attendanceTypeIdMasterSchema, "params"),
      this.AttendanceTypeMaster.getAttendanceType
    );

    this.router.put(
      `${this.path}/:id/update`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.AttendanceType,
        PermissionEnum.Update
      ),
      validationMiddleware(attendanceTypeIdMasterSchema, "params"),
      validationMiddleware(attendanceTypeMasterSchema, "body"),
      this.AttendanceTypeMaster.updateAttendanceType
    );

    this.router.delete(
      `${this.path}/:id/delete`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.AttendanceType,
        PermissionEnum.Delete
      ),
      validationMiddleware(attendanceTypeIdMasterSchema, "params"),
      this.AttendanceTypeMaster.deleteAttendanceType
    );
  }
}

export default AttendanceTypeMasterRoute;
