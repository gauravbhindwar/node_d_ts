import { MessageFormation } from "@/constants/messages.constants";
import db from "@/models";
import User from "@/models/user.model";
import EmployeeRepo from "@/repository/employee.repository";
import { parse } from "@/utils/common.util";
import generalResponse from "@/utils/generalResponse";
import { generateModalData } from "@/utils/generateModal";
import { Request, Response } from "express";
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync";
import AccountController from "./account.controller";
import TimesheetController from "./timesheet.controller";

class EmployeeController {
  private EmployeeService = new EmployeeRepo();
  public timesheetController = new TimesheetController();
  public accountController = new AccountController();
  private msg = new MessageFormation("Employee").message;

  public findAllEmployee = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.EmployeeService.getAllEmployeeService(
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
  });

  public getEmployeeContracts = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeService.getAllEmployeeContracts(
        req.params
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

  public getEmployeeDataSuggestiveDropdown = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeService.getEmployeeDataSuggestiveDropdown(
        req.query,
        null,
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

  public getEmployeeData = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.EmployeeService.getEmployeeDataService(
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
  });

  public getSegmentDropdownData = catchAsync(
    async (req: Request, res: Response) => {
      // const responseData = await this.EmployeeService.getSegmentDropdownData(
      //   req.query,
      //   req.user as User
      // );

      const responseData = await this.EmployeeService.getAllSegmentDropdownData(
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

  public getSubSegmentDropdownData = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeService.getSubSegmentDropdownData(
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

  public findEmployeeById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.EmployeeService.getEmployeeByIdService(
      Number(id)
    );
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public findEmployeeBySlug = catchAsync(
    async (req: Request, res: Response) => {
      const slug = req.params.slug;
      const responseData = await this.EmployeeService.getEmployeeBySlugService(
        String(slug)
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

  public findEmployeeByUserId = catchAsync(
    async (req: Request, res: Response) => {
      const clientId = req.params.clientId;
      const responseData = await this.EmployeeService.get({
        attributes: ["slug", "id"],
        where: {
          terminationDate: { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } },
          loginUserId: req.user.loginUserId,
          clientId,
        },
      }).then((dat) => parse(dat));
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

  /**
   * Add Employee Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public addEmployee = catchAsync(async (req: Request, res: Response) => {
    const transaction = await db.transaction();
    try {
      console.log("Starting addEmployee process...");
      console.log("Generating modal data...");
      await generateModalData({
        user: req.user as User,
        percentage: 0,
        message: "Generating Employee",
      });
  
      console.log("Calling addEmployeeService...");
      const responseData = await this.EmployeeService.addEmployeeService({
        body: req.body,
        user: req.user as User,
        image: req.file,
        transaction,
      });
  
      if (!responseData) {
        console.error("Failed to create employee.");
        throw new Error("Failed to create employee.");
      }
  
      console.log("Employee created successfully", responseData?.id);
      
      // Create timesheet if employee is admin-approved
      if (responseData.isAdminApproved) {
        // console.log("Creating timesheet for admin-approved employee...");
        // await this.timesheetController.createTimesheet(
        //   {
        //     clientId: req.body.clientId,
        //     user: req.user as User,
        //     employeeIds: [responseData.id],
        //     type: "createAccount",
        //   },
        //   transaction
        // );
        // console.log("Timesheet created successfully.");
      }
  
      await transaction.commit();
      console.log("Transaction committed successfully.");
  
      return generalResponse(req, res, responseData, this.msg.create, "success", true);
    } catch (error) {
      console.error("Error occurred in addEmployee:", error);
      await transaction.rollback();
      console.log("Transaction rolled back due to error.");
      return generalResponse(
        req,
        res,
        error.data || null,
        error.message || this.msg.wrong,
        "error",
        true,
        400
      );
    }
  });
  

  /**
   * Update Employee Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public updateEmployee = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const image = req.file;
    const transaction = await db.transaction();
    try {
      await generateModalData({
        user: req.user as User,
        percentage: 0,
        message: "Updating Employee",
      });
      const responseData = await this.EmployeeService.updateEmployeeService({
        body: req.body,
        user: req.user as User,
        id: Number(id),
        image: image,
        transaction,
      });
      await transaction.commit();
      return generalResponse(
        req,
        res,
        responseData,
        this.msg.update,
        "success",
        true
      );
    } catch (error) {
      await transaction.rollback();
      return generalResponse(
        req,
        res,
        error,
        error.message ? error.message : this.msg.wrong,
        "error",
        true,
        400
      );
    }
  });

  public updateEmployeeDraft = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const image = req.file;
      const transaction = await db.transaction();
      try {
        await generateModalData({
          user: req.user as User,
          percentage: 0,
          message: "Updating Employee",
        });
        const responseData = await this.EmployeeService.updateEmployeeDraft({
          body: req.body,
          user: req.user as User,
          id: Number(id),
          image: image,
          transaction,
        });
        await transaction.commit();
        return generalResponse(
          req,
          res,
          responseData,
          this.msg.update,
          "success",
          true
        );
      } catch (error) {
        await transaction.rollback();
        return generalResponse(
          req,
          res,
          error,
          error.message ? error.message : this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  public terminateEmployee = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const transaction = await db.transaction();
    try {
      const responseData = await this.EmployeeService.terminateEmployee({
        body: req.body,
        user: req.user as User,
        id: Number(id),
        transaction,
      });
      await transaction.commit();
      return generalResponse(
        req,
        res,
        responseData,
        "Employee Terminated Successfully",
        "success",
        true
      );
    } catch (error) {
      await transaction.rollback();
      return generalResponse(
        req,
        res,
        error,
        error.message ? error.message : this.msg.wrong,
        "error",
        true,
        400
      );
    }
  });

  public reActivateEmployee = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      // const image = req.file;
      const transaction = await db.transaction();
      try {
        await generateModalData({
          user: req.user as User,
          percentage: 0,
          message: "Re-Activating Employee",
        });
        const responseData = await this.EmployeeService.reActivateEmployee({
          body: req.body,
          user: req.user as User,
          id: Number(id),
          // image: image,
          transaction,
        });
        if (responseData?.isAdminApproved === true) {
          await this.timesheetController.createTimesheet(
            {
              clientId: req.body.clientId,
              user: req.user as User,
              employeeIds: [responseData.id],
              type: "createAccount",
            },
            transaction
          );
        }
        await transaction.commit();
        return generalResponse(
          req,
          res,
          responseData,
          this.msg.update,
          "success",
          true
        );
      } catch (error) {
        // console.log({ error });
        await transaction.rollback();
        return generalResponse(
          req,
          res,
          error,
          this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  public updatebankDetails = catchAsync(async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const employeeData = await this.EmployeeService.getEmployeeByIdService(
        Number(id)
      );
      if (!employeeData) {
        return generalResponse(req, res, {}, this.msg.notFound, "error", true);
      }
      await this.EmployeeService.updatebankDetails(
        { ...req.body, loginUserId: employeeData.loginUserId },
        req.params
      );
      return generalResponse(req, res, {}, this.msg.update, "success", true);
    } catch (error) {
      return generalResponse(
        req,
        res,
        error,
        this.msg.wrong,
        "error",
        true,
        400
      );
    }
  });

  public updateEmployeeStatus = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const transaction = await db.transaction();
      try {
        const responseData = await this.EmployeeService.updateEmployeeStatus({
          id: +id,
          body: req.body,
          user: req.user as User,
          transaction,
        });
        if (responseData?.isAdminApproved === true) {
          console.log("-----------------------------creating timesheet",)
          await this.timesheetController.createTimesheet(
            {
              clientId: responseData?.clientId,
              user: req.user as User,
              employeeIds: [responseData.id],
              type: "createAccount",
            },
            transaction
          );
        }
        let response = null;
        if (responseData) {
          response = await this.EmployeeService.getAllEmployeeService(
            { clientId: responseData?.clientId, activeStatus: "pending" },
            req.user as User,
            transaction
          );
        }
        await transaction.commit();
        return generalResponse(
          req,
          res,
          response,
          responseData?.isAdminApproved === true
            ? "Employee Approved Successfully"
            : "Employee Rejected Successfully",
          "success",
          true
        );
      } catch (error) {
        await transaction.rollback();
        return generalResponse(
          req,
          res,
          error,
          this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  /**
   * Delete Employee Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public deleteEmployee = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.EmployeeService.deleteEmployeeService({
      id: Number(id),
      user: req.user as User,
    });
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.delete,
      "success",
      true
    );
  });

  public deleteRejectedEmployee = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.EmployeeService.deleteRejectedEmployee({
        id: Number(id),
        user: req.user as User
      });
      return generalResponse(
        req,
        res,
        responseData,
        this.msg.delete,
        "success",
        true
      );
    }
  );

  public getEmployeeCustomBonus = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeService.getEmployeeCustomBonus(
        req.body
      );
      return generalResponse(
        req,
        res,
        responseData,
        "Fetch Employee Custom Bonus Successfully",
        "success",
        false
      );
    }
  );


  public getEmployeeStatusRequest = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeService.getEmployeeStatusRequest(
        req.params,
        req.query
      );
      return generalResponse(
        req,
        res,
        responseData,
        "Employee status request data fatch successfully!",
        "success",
        false
      );
    }
  );


  public reactivationEmployeeStatusRequest = catchAsync(
    async (req: Request, res: Response) => {
      const transaction = await db.transaction();
      try {
        const responseData = await this.EmployeeService.reactivationEmployeeStatusRequest(
          req.params,
          req.body,
          req.user as User,
          transaction
        );
        await transaction.commit();
        return generalResponse(
          req,
          res,
          responseData,
          "Employee Terminated Successfully",
          "success",
          true
        );
      } catch (error) {
        await transaction.rollback();
        return generalResponse(
          req,
          res,
          error,
          error.message ? error.message : this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  public employeeRequestByData = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const responseData = await this.EmployeeService.employeeRequestByData(
          req.params
        );
        return generalResponse(
          req,
          res,
          responseData,
          "Employee Request by Data Fatch Successfully",
          "success",
          false
        );
      } catch (error) {
        return generalResponse(
          req,
          res,
          error,
          error.message ? error.message : this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  public employeeUniqueDataForEmployeeStatus = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const responseData = await this.EmployeeService.employeeUniqueDataForEmployeeStatus(
          req.params
        );
        return generalResponse(
          req,
          res,
          responseData,
          "Employee Data Fatch Successfully",
          "success",
          true
        );
      } catch (error) {
        return generalResponse(
          req,
          res,
          error,
          error.message ? error.message : this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  public updateEmployeeStatusRequestReason = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const responseData = await this.EmployeeService.updateEmployeeStatusRequestReason(
          req.params,
          req.body,
          req.user as User
        );
        return generalResponse(
          req,
          res,
          responseData,
          "Employee Status Request Reason Update Successfully",
          "success",
          true
        );
      } catch (error) {
        return generalResponse(
          req,
          res,
          error,
          error.message ? error.message : this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  // Employee Request by Mohit
  public employeeTerminationRequest = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const transaction = await db.transaction();
        const responseData = await this.EmployeeService.employeeTerminationRequest(
          req.params,
          req.body,
          req.user as User,
          transaction
        );
        await transaction.commit();

        return generalResponse(
          req,
          res,
          responseData,
          `Employee Request for ${req.body.requestType} added successfully.`,
          "success",
          true
        );
      } catch (error) {
        return generalResponse(
          req,
          res,
          error,
          error.message ? error.message : this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

  public employeeTerminationrequestReject = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const transaction = await db.transaction();
        const responseData = await this.EmployeeService.employeeTerminationrequestReject(
          req.params,
          req.user as User,
          transaction
        );
        await transaction.commit();

        return generalResponse(
          req,
          res,
          responseData,
          `Request Rejected successfully.`,
          "success",
          true
        );
      } catch (error) {
        return generalResponse(
          req,
          res,
          error,
          error.message ? error.message : this.msg.wrong,
          "error",
          true,
          400
        );
      }
    }
  );

}

export default EmployeeController;
