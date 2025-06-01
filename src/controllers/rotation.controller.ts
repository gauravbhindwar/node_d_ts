import { MessageFormation } from "@/constants/messages.constants";
import User from "@/models/user.model";
import RotationRepo from "@/repository/rotation.repository";
import { catchAsync } from "@/utils/catchAsync";
import generalResponse from "@/utils/generalResponse";
import { Request, Response } from "express";

class RotationController {
  private RotationService = new RotationRepo();
  private msg = new MessageFormation("Rotation").message;

  public getAllRotation = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.RotationService.getAllRotation({
      ...req.query,
      isResident: false,
    });
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public getAllResident = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.RotationService.getAllRotation({
      ...req.query,
      isResident: true,
  });
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public getRotationData = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.RotationService.getRotationData();
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public getRotationById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.RotationService.getRotationById(+id);
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public addRotation = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.RotationService.addRotation({
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

  public addResident = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.RotationService.addRotation({
      body: { ...req.body, isResident: true },
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

  public updateRotation = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const responseData = await this.RotationService.updateRotation({
      body: req.body,
      user: req.user as User,
      id: +id,
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

  public deleteRotation = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const responseData = await this.RotationService.deleteRotation(+id, req.user as User);
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

export default RotationController;
