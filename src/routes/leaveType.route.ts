import LeaveTypeMaster from "@/controllers/leaveTypeMaster.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import { leaveTypeIdMasterSchema, leaveTypeMasterSchema } from "@/validationSchema/leaveTypeRequest.validation";

import { Router } from "express";
import { Routes } from "interfaces/general/routes.interface";

class LeaveTypeMasterRoute implements Routes {
  public LeaveTypeMaster = new LeaveTypeMaster();
  public path = "/leave-type";
  public router = Router();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.post(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.LeaveType,
        PermissionEnum.Create
      ),
      validationMiddleware(leaveTypeMasterSchema, "body"),
      this.LeaveTypeMaster.applyLeaveTypeMasterRequest
    );

    this.router.get(
      `${this.path}`,
      // authMiddleware,
      // rolePermissionMiddleware(
      //   FeaturesNameEnum.LeaveType,
      //   PermissionEnum.View
      // ),
      validationMiddleware(leaveTypeMasterSchema, "params"),
      this.LeaveTypeMaster.getAllLeaveTypes
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.LeaveType,
        PermissionEnum.View
      ),
      validationMiddleware(leaveTypeIdMasterSchema, "params"),
      this.LeaveTypeMaster.getLeaveType
    );

    this.router.put(
      `${this.path}/:id/update`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.LeaveType,
        PermissionEnum.Update
      ),
      validationMiddleware(leaveTypeIdMasterSchema, "params"),
      validationMiddleware(leaveTypeMasterSchema, "body"),
      this.LeaveTypeMaster.updateLeaveType
    );

    this.router.delete(
      `${this.path}/:id/delete`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.LeaveType,
        PermissionEnum.Delete
      ),
      validationMiddleware(leaveTypeIdMasterSchema, "params"),
      this.LeaveTypeMaster.deleteLeaveType
    );

  }
}

export default LeaveTypeMasterRoute;
