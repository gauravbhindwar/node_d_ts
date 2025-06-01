import EmployeeController from "@/controllers/employee.controller";
import {
  FeaturesNameEnum,
  PermissionEnum,
} from "@/interfaces/functional/feature.interface";
import { Routes } from "@/interfaces/general/routes.interface";
import authMiddleware from "@/middleware/auth.middleware";
import validationMiddleware from "@/middleware/middleware";
import rolePermissionMiddleware from "@/middleware/rolePermission.middleware";
import { multerInterceptorConfig } from "@/utils/multerConfig";
import {
  paramsIdSchema,
  paramsSlugSchema,
} from "@/validationSchema/common.validation";
import {
  EmployeeBankUpdateSchema,
  EmployeeCreateSchema,
  EmployeeFetchAllSchema,
  EmployeeReactivateSchema,
  EmployeeStatusUpdateSchema,
  EmployeeStutasRequestCreate,
  EmployeeStutasRequestGet,
  // EmployeeStutasRequestReactivation,
  EmployeeStutasRequestReasonUpdate,
  // EmployeeStutasRequestTermination,
  EmployeeTerminateSchema,
  EmployeeUByUserId,
  EmployeeUpdateSchema,
} from "@/validationSchema/employee.validation";
import { Router } from "express";
import multer from "multer";

class EmployeeRoutes implements Routes {
  public path = '/employee';
  public router = Router();
  public employeeController = new EmployeeController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Employee, PermissionEnum.View),
      validationMiddleware(EmployeeFetchAllSchema, "query"),
      this.employeeController.findAllEmployee
    ); // Get All Employee (Private)

    this.router.get(
      `${this.path}/get_contracts/:loginuserid`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Employee, PermissionEnum.View),
      this.employeeController.getEmployeeContracts
    );

    this.router.get(
      `${this.path}/get-employee-option`,
      authMiddleware,
      validationMiddleware(EmployeeFetchAllSchema, "query"),
      this.employeeController.getEmployeeDataSuggestiveDropdown
    ); // Get All Employee Data For Search Dropdown (Private)

    this.router.get(
      `${this.path}/get-employee-data`,
      authMiddleware,
      validationMiddleware(EmployeeFetchAllSchema, "query"),
      this.employeeController.getEmployeeData
    ); // Get Employee Dat (Public)

    this.router.get(
      `${this.path}/get-segment-dropdown`,
      authMiddleware,
      this.employeeController.getSegmentDropdownData
    ); // Get Employee Segment Dropdown (Public)

    this.router.get(
      `${this.path}/get-sub-segment-dropdown`,
      authMiddleware,
      this.employeeController.getSubSegmentDropdownData
    );

    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Employee, PermissionEnum.View),
      validationMiddleware(paramsIdSchema, "params"),
      this.employeeController.findEmployeeById
    ); // Get Employee By ID

    this.router.get(
      `${this.path}/get-employee-detail/:id`,
      authMiddleware,
      validationMiddleware(paramsIdSchema, "params"),
      this.employeeController.findEmployeeById
    ); // Get Employee By ID (Public)

    this.router.get(
      `${this.path}/get-slug-data/:slug`,
      authMiddleware,
      rolePermissionMiddleware(FeaturesNameEnum.Employee, PermissionEnum.View),
      validationMiddleware(paramsSlugSchema, "params"),
      this.employeeController.findEmployeeBySlug
    ); // Get Employee By Slug (Private)

    this.router.post(
      `${this.path}`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Create
      ),
      multerInterceptorConfig(
        "profilePicture",
        [],
        50 * 1024,
        EmployeeCreateSchema,
        "body"
      ).single("profilePicture"),
      validationMiddleware(EmployeeCreateSchema, "body"),
      this.employeeController.addEmployee
    ); //Add Employee (Private)

    this.router.put(
      `${this.path}/employee-terminate/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Update
      ),
      validationMiddleware(paramsIdSchema, "params"),
      validationMiddleware(EmployeeTerminateSchema, "body"),
      this.employeeController.terminateEmployee
    ); // Employee Terminate By Employee Id (Private)

    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Update
      ),
      validationMiddleware(paramsIdSchema, "params"),
      multerInterceptorConfig(
        "profilePicture",
        [],
        50 * 1024,
        EmployeeUpdateSchema,
        "body"
      ).single("profilePicture"),
      validationMiddleware(EmployeeUpdateSchema, "body"),
      this.employeeController.updateEmployee
    ); // Update Employee By Employee Id (Private)

    this.router.put(
      `${this.path}/updateDraft/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Create
      ),
      validationMiddleware(paramsIdSchema, "params"),
      multerInterceptorConfig(
        "profilePicture",
        [],
        50 * 1024,
        EmployeeUpdateSchema,
        "body"
      ).single("profilePicture"),
      validationMiddleware(EmployeeUpdateSchema, "body"),
      this.employeeController.updateEmployeeDraft
    ); // Update Employee Draft Data By Employee Id (Private)

    this.router.put(
      `${this.path}/re-Activate-employee/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Update
      ),
      validationMiddleware(paramsIdSchema, "params"),
      multer().none(),
      validationMiddleware(EmployeeReactivateSchema, "body"),
      this.employeeController.reActivateEmployee
    ); // Reactivate Employee By Employee Id (Private)

    this.router.put(
      `${this.path}/update_bankdetails/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Update
      ),
      validationMiddleware(EmployeeBankUpdateSchema, "body"),
      this.employeeController.updatebankDetails
    ); // Reactivate Employee By Employee Id (Private)

    this.router.put(
      `${this.path}/status/:id`,
      authMiddleware,
      // rolePermissionMiddleware(FeaturesNameEnum.EmployeeApproval, PermissionEnum.Approve),
      validationMiddleware(paramsIdSchema, "params"),
      validationMiddleware(EmployeeStatusUpdateSchema, "body"),
      this.employeeController.updateEmployeeStatus
    ); // Update Employee Status By Employee Id

    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Delete
      ),
      validationMiddleware(paramsIdSchema, "params"),
      this.employeeController.deleteEmployee
    ); // Delete Employee (Private)

    this.router.delete(
      `${this.path}/employee/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Delete
      ),
      validationMiddleware(paramsIdSchema, "params"),
      this.employeeController.deleteRejectedEmployee
    ); // Delete Rejected Employee (Private)

    this.router.post(
      `${this.path}/get-custom-bonus`,
      authMiddleware,
      this.employeeController.getEmployeeCustomBonus
    ); // Get Employee Custom Bonus

    this.router.get(
      `${this.path}/get-slug-by-userId/:clientId`,
      authMiddleware,
      // rolePermissionMiddleware(FeaturesNameEnum.Employee, PermissionEnum.View),
      validationMiddleware(EmployeeUByUserId, "params"),
      this.employeeController.findEmployeeByUserId
    );


    // Request API BY Kahilendra
    this.router.get(
      `${this.path}/employee-status-request/:clientId`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.EmployeeRequest,
        PermissionEnum.View
      ),
      validationMiddleware(EmployeeStutasRequestGet, "params"),
      this.employeeController.getEmployeeStatusRequest
    );

    // this.router.put(
    //   `${this.path}/employee-status-request/:id/re-activate`,
    //   authMiddleware,
    //   rolePermissionMiddleware(
    //     FeaturesNameEnum.Employee,
    //     PermissionEnum.Approve
    //   ),
    //   validationMiddleware(paramsIdSchema, "params"),
    //   validationMiddleware(EmployeeStutasRequestReactivation, "body"),
    //   this.employeeController.reactivationEmployeeStatusRequest
    // );

    this.router.get(
      `${this.path}/requesting_managers/:clientId`,
      authMiddleware,
      validationMiddleware(EmployeeStutasRequestGet, "params"),
      this.employeeController.employeeRequestByData
    );

    // this.router.get(
    //   `${this.path}/employee-status-request/employee-data/:clientId`,
    //   authMiddleware,
    //   validationMiddleware(EmployeeStutasRequestGet, "params"),
    //   this.employeeController.employeeUniqueDataForEmployeeStatus
    // );

    this.router.put(
      `${this.path}/employee-status-request/:id`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.Employee,
        PermissionEnum.Update
      ),
      validationMiddleware(paramsIdSchema, "params"),
      validationMiddleware(EmployeeStutasRequestReasonUpdate, "body"),
      this.employeeController.updateEmployeeStatusRequestReason
    );


    // Request API by Mohit

    this.router.post(
      `${this.path}/employee-status-request/:empId`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.EmployeeRequest,
        PermissionEnum.Create
      ),
      validationMiddleware(EmployeeStutasRequestCreate, "body"),
      this.employeeController.employeeTerminationRequest
    );

    this.router.put(
      `${this.path}/employee-status-request-reject/:requestId`,
      authMiddleware,
      rolePermissionMiddleware(
        FeaturesNameEnum.EmployeeRequest,
        PermissionEnum.Create
      ),
      this.employeeController.employeeTerminationrequestReject
    )
  }
}

export default EmployeeRoutes;
