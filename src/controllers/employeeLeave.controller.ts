import { MessageFormation } from "@/constants/messages.constants";
import db from "@/models";
import User from "@/models/user.model";
import EmployeeLeaveRepo from "@/repository/employeeLeave.repository";
import { catchAsync } from "@/utils/catchAsync";
import generalResponse from "@/utils/generalResponse";
import { Request, Response } from "express";

class EmployeeLeaveController {
  private EmployeeLeaveService = new EmployeeLeaveRepo();
  private msg = new MessageFormation("EmployeeLeave").message;

  public findAllEmployeeLeaveTypes = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeLeaveService.getAllEmployeeLeaveTypes(
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

  public findEmployeeLeavePdfData = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.EmployeeLeaveService.getEmployeeLeavePdfData(
        +id
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

  public findEmployeeLeaveById = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.EmployeeLeaveService.getEmployeeLeaveById(
        +id
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

  public addEmployeeLeave = catchAsync(async (req: Request, res: Response) => {
    const transaction = await db.transaction();
    try {
      const responseData = await this.EmployeeLeaveService.addEmployeeLeave(
        {
          body: req.body,
          user: req.user as User,
        },
        transaction
      );
      if (responseData) {
        console.log("responseData----", responseData);
        await this.EmployeeLeaveService.updateTimesheetAndAccounts(
          { body: responseData, user: req.user as User },
          transaction
        );
      }
      await transaction.commit();
      return generalResponse(
        req,
        res,
        responseData,
        this.msg.create,
        "success",
        true
      );
    } catch (error) {
      const parts = error.message.split("Error:");
      const errorPart = parts.find((part) => part.trim() !== "");
      const finalErrorMessage = errorPart
        ? errorPart.trim()
        : `Something went Wrong !!`;
      await transaction.rollback();
      return generalResponse(
        req,
        res,
        error,
        finalErrorMessage,
        "error",
        true,
        400
      );
    }
  });

  public updateEmployeeLeave = catchAsync(
    async (req: Request, res: Response) => {
      const transaction = await db.transaction();
      const id = req.params.id;
      const responseData = await this.EmployeeLeaveService.updateEmployeeLeave(
        {
          body: req.body,
          user: req.user as User,
          id: +id,
        },
        transaction
      );
      if (responseData) {
        await this.EmployeeLeaveService.updateTimesheetAndAccounts(
          { body: responseData, user: req.user as User },
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
    }
  );

  public updateEmployeeLeaveStatus = catchAsync(
    async (req: Request, res: Response) => {
      const transaction = await db.transaction();
      const id = req.params.id;
      const responseData = await this.EmployeeLeaveService.updateEmployeeLeaveStatus(
        {
          user: req.user as User,
          id: +id,
        },
        transaction
      );
      if (responseData) {
        await this.EmployeeLeaveService.updateTimesheetAndAccounts(
          {
            body: {
              employeeId: responseData.employeeId,
              startDate: responseData.startDate,
              leaveType: "P",
              endDate: responseData.endDate,
            },
            user: req.user as User,
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
    }
  );

  public findEmployeeLastLeaveByEmployeeId = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.employeeId;
      const responseData = await this.EmployeeLeaveService.getEmployeeLastLeaveByEmployeeId(
        +id
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
}
export default EmployeeLeaveController;
