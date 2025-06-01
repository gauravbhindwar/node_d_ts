import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

import { MessageFormation } from "@/constants/messages.constants";
import { requestStatus } from "@/interfaces/model/request.document.interface";
import RequestDocument from "@/models/request.document.model";
import RequestType from "@/models/requestType.model";
import User from "@/models/user.model";
import EmployeeContractRepo from "@/repository/employeeContract.repository";
import RequestRepo from "@/repository/request.repository";
import generalResponse from "@/utils/generalResponse";

class EmployeeContractController {
  private EmployeeContractService = new EmployeeContractRepo();
  private msg = new MessageFormation("Employee Contract").message;
 private RequestService = new RequestRepo();

  /**
   * Get Employee Contract Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public findAllEmployeeContract = catchAsync(
    async (req: Request, res: Response) => {
      const { page, limit, clientId, employeeId, sort, sortBy } = req.query;

      const responseData = await this.EmployeeContractService.getAllEmployeeContractService(
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

  /**
   * Get Employee Contract End Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public findAllEmployeeContractEnd = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeContractService.getAllEmployeeContractEndService(
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

  public getEmployeeContractNumber = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeContractService.getEmployeeContractNumber();
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
   * Get By Id Employee Contract Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public findEmployeeContractServiceById = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.EmployeeContractService.getEmployeeContractByIdService(
        +id,
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

  /**
   * Add Employee Contract Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public addEmployeeContract = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeContractService.addEmployeeContract(
        {
          body: req.body,
          user: req.user as User,
        }
      );
      return generalResponse(
        req,
        res,
        responseData,
        this.msg.create,
        "success",
        true
      );
    }
  );

  public updateEmployeeContractEnd = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.EmployeeContractService.updateEmployeeContractEnd(
        {
          body: req.body,
          user: req.user as User,
        }
      );
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

  /**
   * Update Employee Contract Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */

  public updateEmployeeContract = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.EmployeeContractService.updateEmployeeContract(
        {
          body: req.body,
          user: req.user as User,
          id: Number(id),
        }
      );
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

  /**
   * Delete Employee Contract Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public deleteEmployeeContract = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.EmployeeContractService.deleteEmployeeContractService(
        {
          id: Number(id),
          authUser: req.user as User,
        }
      );
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
public uploadSignedContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractId = parseInt(req.params.id);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const signedContractType = await RequestType.findOne({ where: { name: 'SIGNED_CONTRACT' } });
    // Use RequestRepo to find the request by contractId
    const request = await this.RequestService.findOne({ where: { contractId } });

    if (!request) {
      return res.status(404).json({ message: 'No matching request found for this contract.' });
    }

    // Save the uploaded file metadata using RequestDocument model or create a method in repo
    await RequestDocument.create({
      requestId: request.id,
      filePath: file.path,
      fileName: file.originalname,
      documentType: signedContractType.id, // Update to your actual enum/type if needed
      status: requestStatus?.PENDING,
      uploadedBy: req.user.id, // ensure authMiddleware attaches user
    });

    // Optionally: Add history record here or inside repo method

    return res.status(200).json({ message: 'Signed contract uploaded and pending approval.' });
  } catch (error) {
    next(error);
  }
};

}

export default EmployeeContractController;
