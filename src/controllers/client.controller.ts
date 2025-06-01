import { MessageFormation } from "@/constants/messages.constants";
import db from "@/models";
import User from "@/models/user.model";
import ClientRepo from "@/repository/client.repository";
import { getFiles } from "@/utils/common.util";
import generalResponse from "@/utils/generalResponse";
import { NextFunction, Request, Response } from "express";
import _ from "lodash";
import { catchAsync } from "../utils/catchAsync";

class ClientController {
  private ClientService = new ClientRepo();
  private msg = new MessageFormation("Client").message;

  public findAllClient = catchAsync(async (req: Request, res: Response) => {
    console.log("get all clinets,", req.query)
    const responseData = await this.ClientService.getAllClientService(
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

  public findAllClientForSearchDropdown = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.ClientService.findAllClientForSearchDropdown(
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

  public getClientData = catchAsync(async (req: Request, res: Response) => {
    const responseData = await this.ClientService.getAllClientData(
      req.user as User
    );

    // get only client data
    // const responseData = await this.ClientService.getClientDataNew(
    //   req.user as User
    // );
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public getSubClientData = catchAsync(async (req: Request, res: Response) => {
    let { id } = req.params;
    const responseData = await this.ClientService.getSubClientDataByClientId(
      id,
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

  public findClientById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.ClientService.getClientByIdService(
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

  public findClientBySlug = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const responseData = await this.ClientService.getClientBySlugService(slug);
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
   * Add Client Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public addClient = catchAsync(async (req: Request, res: Response) => {
    const logo = getFiles(req);
    req.body = {
      ...req.body,
      logo: logo?.logo ?? null,
      stampLogo: logo?.stampLogo ?? null,
    };
    console.log("req.body", req.body)
    _.omit(req.body, "logo");
    _.omit(req.body, "stampLogo");

    const responseData = await this.ClientService.addClientService({
      body: req.body,
      user: req.user as User,
    });

    await this.ClientService.addDefaultAttendancetoClient(responseData?.id);

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
   * Update Client Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public updateClientStatus = catchAsync(
    async (req: Request, res: Response) => {
      const id = req.params.id;
      const responseData = await this.ClientService.updateClientStatus({
        body: req.body,
        id: +id,
        user: req.user as User,
      });
      return generalResponse(
        req,
        res,
        responseData,
        responseData.isActive === true
          ? "Client Activated Successfully"
          : "Client Archived Successfully",
        "success",
        true
      );
    }
  );

  public updateClient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const logo = getFiles(req);
      
      req.body = {
        ...req.body,
        logo: req?.body?.logo ? req?.body?.logo : logo?.logo ?? null,
        stampLogo: req?.body?.stampLogo ? req?.body?.stampLogo : logo?.stampLogo ?? null,
      };
  
      _.omit(req.body, "logo");
      _.omit(req.body, "stampLogo");
  
      const responseData = await this.ClientService.updateClientService({
        body: req.body,
        user: req.user as User,
        id: Number(id),
      });
  
      // Checking for the default attendance type for the client while updating the client
      // await this.ClientService.addDefaultAttendancetoClient(responseData?.id);
  
      return generalResponse(req, res, responseData, this.msg.update, "success", true);
    } catch (error) {
      next(error); // Pass error to Express error handler
    }
  });
  

  /**
   * Delete Client Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public deleteClient = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const responseData = await this.ClientService.deleteClientService({
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

  public findClientFonction = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const id = req?.query?.clientId;
        const responseData = await this.ClientService.findClientFonction(
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
      } catch (error) {
        console.log("error------------", error);
      }
    }
  );


  public getClientLeavesData = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        const responseData = await this.ClientService.getClientLeavesData(
          Number(id),
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
      } catch (error) {
        return generalResponse(
          req,
          res,
          error,
          "Error Occured",
          "error",
          true,
          400
        );
      }
    }
  );

  public updateClientLeaves = catchAsync(
    async (req: Request, res: Response) => {
      const transaction = await db.transaction();
      try {
        const id = req.params.id;
        const responseData = await this.ClientService.updateClientLeaves(
          Number(id),
          req.body,
          transaction
        );
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
          "Error Occured",
          "error",
          true,
          400
        );
      }
    }
  );
}

export default ClientController;
