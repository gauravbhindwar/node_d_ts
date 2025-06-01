import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import db from "@/models";
import User from "@/models/user.model";
import AccountPORepo from "@/repository/accountPo.repository";
import { catchAsync } from "@/utils/catchAsync";
import generalResponse from "@/utils/generalResponse";
import { Request, Response } from "express";

class AccountPOController {
  private AccountPOService = new AccountPORepo();
  private msg = new MessageFormation("AccountPO").message;

  public getAllSegmentsData = catchAsync(
    async (req: Request, res: Response) => {
      const responseData = await this.AccountPOService.getAllSegmentsData(
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

  // public getAllAccountSummaryData = catchAsync(async (req: Request, res: Response) => {
  // 	const responseData = await this.AccountPOService.getAllAccountSummaryData(req.query);
  // 	return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
  // });

  public getAllAccountPOData = catchAsync(
    async (req: Request, res: Response) => {
      const clientId = req.params.id;
      const responseData = await this.AccountPOService.getAllAccountPOData(
        +clientId,
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

  public getAllAccountPODataByEmployee = catchAsync(
    async (req: Request, res: Response) => {
      const clientId = req.params.id;
      const responseData = await this.AccountPOService.getAllAccountPODataByEmployee(
        +clientId,
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

  public updatePaymentStatus = catchAsync(
    async (req: Request, res: Response) => {
      const transaction = await db.transaction();
      try {
        const ids = req?.body?.ids;
        const responseData = [];
        for (const id of ids) {
          const data = await this.AccountPOService.updatePaymentStatus(
            { id: +id, user: req.user as User },
            transaction
          );
          responseData.push(data);
        }
        transaction.commit();
        return generalResponse(
          req,
          res,
          responseData,
          "Invoice generated Successfully",
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

  public getPoDetailsByPoId = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const PoId = req.params.id;
        const responseData = await this.AccountPOService.getAccountPODataByID(
          +PoId,
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
      } catch (error) {
		return generalResponse(
			req, res, {}, this.msg.notFound,
			"success",
			false
		)
	  }
    }
  );

  public approvePoById = catchAsync(
    async (req: Request, res: Response, next) => {
      const PoId = req.params.id;
      const responseData = await this.AccountPOService.getAccountPODataByID(
        +PoId,
        req.user as User
      );
      req.body.timesheetIds = [responseData.timesheetId];
      next();
    }
  );

  public recapPoSummaryMailer = catchAsync(
    async (req: Request, res: Response) => {
      try {
      const clientId = req.params.id;
        const responseData = await this.AccountPOService.recapPoSummaryMailer(
          +clientId,
          req.query,
          req.user as User
        );
        const toastStatus = req.query.download === 'true' ? false : true;
        const msg = responseData?.warnings?.length === 0 ? "Email Sent Successfully" : responseData?.warnings.join("\n");
        const resType = responseData?.warnings?.length === 0 ? "Success" :"warning";
        return generalResponse(
          req,
          res,
          responseData,
          msg,
          resType,
          toastStatus
        );
      } catch (error) {
        const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
    }
});

  public recapPoSummaryDownload = catchAsync(
    async (req: Request, res: Response) => {
      try {
      const clientId = req.params.id;
        const responseData = await this.AccountPOService.recapPoSummaryDownload(
          +clientId,
          req.query,
          req.user as User
        );
        const toastStatus = req.query.download === 'true' ? false : true;
        return generalResponse(
          req,
          res,
          responseData,
          "Download Able Data Sent Successfully",
          "Success",
          toastStatus
        );
      } catch (error) {
        const statusCode = error instanceof HttpException ? error.status : 500;
			const message = error instanceof HttpException ? error.message : this.msg.wrong;
			const responseData = error instanceof HttpException ? error.data : {};
			return generalResponse(req, res, responseData, message, 'error', true, statusCode);
    }
});
}
export default AccountPOController;
