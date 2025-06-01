import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

import { MessageFormation } from "@/constants/messages.constants";
import User from "@/models/user.model";
import SegmentRepo from "@/repository/segment.repository";
import generalResponse from "@/utils/generalResponse";

class SegmentController {
  private SegmentService = new SegmentRepo();
  private msg = new MessageFormation("Segment").message;

  public findAllSegment = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.SegmentService.getAllSegmentService(
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

  public getSegmentsForSearchDropdown = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.SegmentService.getSegmentsForSearchDropdown(
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

  public getSegmentData = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.SegmentService.getSegmentDataService(
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

  public getSegmentEmployeeData = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.SegmentService.getSegmentEmployeeDataService(
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

  public getSegmentsForClientTimesheet = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.SegmentService.getSegmentDataForClientTimesheetService(
        Number(id),
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

  public findSegmentById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.SegmentService.getSegmentByIdService(
      Number(id),
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

  public findSegmentBySlug = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const responseData = await this.SegmentService.getSegmentBySlugService(
      slug,
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
   * Add Segment Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public addSegment = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.SegmentService.addSegmentService({
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
   * Update Segment Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public updateSegment = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.SegmentService.updateSegmentService({
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

  public updateSegmentStatus = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.SegmentService.updateSegmentStatus({
        body: req.body,
        id: +id,
        user: req.user as User
      });

      return generalResponse(
        req,
        res,
        responseData,
        responseData.isActive
          ? "Segment Activated Successfully"
          : "Segment Archived Successfully",
        "success",
        true
      );
    }
  );

  /**
   * Delete Segment Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public deleteSegment = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.SegmentService.deleteSegmentService({
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

  public findAllSegmentsByClientIds = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.SegmentService.getAllSegmentsByClientIdsService(
        req.query,
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

export default SegmentController;
