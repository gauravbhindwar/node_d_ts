import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

import { MessageFormation } from "@/constants/messages.constants";
import User from "@/models/user.model";
import BonusTypeRepo from "@/repository/bonusType.repository";
import generalResponse from "@/utils/generalResponse";

class BonusTypeController {
  private BonusTypeService = new BonusTypeRepo();
  private msg = new MessageFormation("BonusType").message;

  public findAllBonusType = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.BonusTypeService.getAllBonusTypeService(
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
  });

  public getBonusTypeDropdownData = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.BonusTypeService.getBonusDropdownDataService();
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

  public findBonusTypeById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.BonusTypeService.getBonusTypeByIdService(
      Number(id),
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

  /**
   * Add Bonus Type Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */

  public addBonusType = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.BonusTypeService.addBonusTypeService({
      body: req.body,
      user: req.user as User,
    });
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.create,
      "success",
      true
    );
  });

  /**
   * Update Bonus Type Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public updateBonusTypeStatus = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.BonusTypeService.updateBonusTypeStatus({
        body: req.body,
        id: +id,
        user: req.user as User
      });

      return generalResponse(
        req,
        res,
        responseData,
        responseData.isActive === true
          ? "Bonus Type Activated Successfully"
          : "Bonus Type Archived Successfully",
        "success",
        true
      );
    }
  );

  public updateBonusType = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.BonusTypeService.updateBonusTypeService({
      body: req.body,
      user: req.user as User,
      id: Number(id),
    });
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.update,
      "success",
      true
    );
  });

  /**
   * Delete Bonus Type Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public deleteBonusType = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    // const responseData = await this.BonusTypeService.deleteBonusTypeService({
    // 	id: Number(id),
    // 	user: req.user as User,
    // });
    const responseData = await this.BonusTypeService.deleteBonusTypeService({
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
}

export default BonusTypeController;
