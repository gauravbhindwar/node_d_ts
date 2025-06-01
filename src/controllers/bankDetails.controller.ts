import { MessageFormation } from "@/constants/messages.constants";
import BankDetailsRepo from "@/repository/bankDetails.repository";
import { catchAsync } from "@/utils/catchAsync";
import generalResponse from "@/utils/generalResponse";
import { Request, Response } from "express";

class BankDetailsController {
  private BankService = new BankDetailsRepo();
  private msg = new MessageFormation("Bank").message;

  /**
   * Add Bank Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public addBankAccount = catchAsync(async (req: Request, res: Response) => {
    try {
      const isExists = await this.BankService.getbankdetailbyAccountNumber(
        req.body
      );

      if (isExists) {
        return generalResponse(req, res, {}, this.msg.exist, "success", true);
      }
      const responseData = await this.BankService.addBankAccount(
        req.body
      );

      return generalResponse(
        req,
        res,
        responseData,
        this.msg.create,
        "success",
        true
      );
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

  /**
   * Get Bank Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public getaccountsbyloginuserId = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const responseData = await this.BankService.getaccountsbyloginuserId(
          req.params
        );

        return generalResponse(
          req,
          res,
          responseData,
          this.msg.fetch,
          "success",
          true
        );
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
    }
  );
}

export default BankDetailsController;
