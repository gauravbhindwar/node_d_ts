import { MessageFormation } from "@/constants/messages.constants";
import { getAllHistory } from "@/helpers/history.helper";
import generalResponse from "@/utils/generalResponse";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

class AuditLogsController {
  private msg = new MessageFormation("Audit Logs").message;

  public findAllAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const responseData = await getAllHistory(req.query);
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });
}

export default AuditLogsController;
