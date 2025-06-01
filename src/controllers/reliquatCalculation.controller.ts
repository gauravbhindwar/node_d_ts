import { MessageFormation } from "@/constants/messages.constants";
import db from "@/models";
import EmployeeRepo from "@/repository/employee.repository";
import ReliquatCalculationRepo from "@/repository/reliquatCalculation.repository";
import TimesheetRepo from "@/repository/timesheet.repository";
import generalResponse from "@/utils/generalResponse";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

class ReliquatCalculationController {
  private ReliquatCalculationService = new ReliquatCalculationRepo();
  private EmployeeService = new EmployeeRepo();
  private msg = new MessageFormation("Reliquat Calculation").message;
  private empMsg = new MessageFormation("Employee").message;
  private TimesheetService = new TimesheetRepo();

  /**
   * Get Reliquat Calculation Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public findAllReliquatCalculation = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.ReliquatCalculationService.getAllReliquatCalculationService(
        req,
        req.query
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

  public employeContractList = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.ReliquatCalculationService.employeContractList(
        req.query
      );
      return generalResponse(
        req,
        res,
        responseData,
        this.empMsg.fetch,
        "success",
        false
      );
    }
  );

  public generateReliquat = catchAsync(async (req: Request, res: Response) => {
    const transaction = await db.transaction();
    const employeeId = req.body.employeeIds || [];
    const timesheetScheduleIds = req.body.timesheetScheduleIds || [];
    let responseData = null;
    if (employeeId.length > 0) {
      responseData = await this.TimesheetService.generateReliquetResponse(
        req.user,
        employeeId,
        transaction,
        null,
        timesheetScheduleIds
      );
    }
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public createmonthlyReliquat = catchAsync(
    async (req: Request, res: Response) => {
      const reliquats = await this.ReliquatCalculationService.getAllReliquatCalculationService(
        req,
        req.query
      );
      if (reliquats.data.length > 0) {
        for (const element of reliquats.data) {
          await this.ReliquatCalculationService.createmonthly(element);
        }
      }
      return generalResponse(req, res, {}, this.msg.fetch, "success", false);
    }
  );
}

export default ReliquatCalculationController;
