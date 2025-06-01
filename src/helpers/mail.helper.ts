// =================== import packages ====================
import ejs from "ejs";
import * as path from "path";
// ======================================================
import { fileDelete } from "@/utils/common.util";
import { MAIL_FROM } from "config";
import { HttpException } from "exceptions/HttpException";
import NodeMailerService from "./mail/nodemailer.mail";
export const sendMail = async (
  to: string[],
  subject: string,
  templateName: string,
  replacement?: object,
  attachments?: any,
  cc?: string[],
  bcc?: string[],
  notDelete?: boolean
) => {
  try {
    const notDeletedata = notDelete === false ? false : true;
    const newReplacement = { ...replacement };
    let filePath = "";
    if (templateName) {
      filePath = path.join(__dirname, `../templates/${templateName}.ejs`);
    } else {
      filePath = path.join(__dirname, "../templates/userCredentials.ejs");
    }
    const result = await ejs.renderFile(filePath, newReplacement);

    const mailOptions = {
      from: MAIL_FROM,
      to,
      subject,
      cc,
      bcc,
      html: result,
      attachments,
    };

    try {
      const smtpOptions = {};
      const mailService = await new NodeMailerService().createConnection({
        ...smtpOptions,
      });

      const validSMTPTransport = await mailService.verifyConnection();
      if (!validSMTPTransport) {
        throw new HttpException(400, "Error");
      }

      await mailService.sendMail(mailOptions);
      if (notDeletedata && attachments) {
        fileDelete(attachments[0]?.path);
      }
    } catch (err) {
      throw new Error(err);
    }
    return "Mail Sent";
  } catch (error) {
    throw new Error(error);
  }
};
