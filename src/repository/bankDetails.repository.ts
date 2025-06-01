import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { addBankAccount } from "@/interfaces/model/bankDetails.interface";
import BankDetails from "@/models/bankDetails.model";
import { parse } from "@/utils/common.util";
import BaseRepository from "./base.repository";

export default class BankDetailsRepo extends BaseRepository<BankDetails> {
  private msg = new MessageFormation("Bank").message;
  constructor() {
    super(BankDetails.name);
  }

  async addBankAccount(body: addBankAccount) {
    const result = await this.create({ ...body, isActive: false });
    if (!result)
      throw new HttpException(400, "Something went wrong", {}, false);
    return parse(result);
  }

  async getbankdetailbyAccountNumber(body: { ribNumber: number }) {
    const { ribNumber } = body;
    const result = await BankDetails.findOne({
      where: {
        ribNumber: ribNumber,
      },
    });
    return parse(result);
  }

  async getaccountsbyloginuserId(params: any) {
    const { loginUserId } = params;
    const result = await BankDetails.findAll({
      where: {
        loginUserId: loginUserId,
      },
      order: [
        ["createdAt", "DESC"], // Order by createdAt in ascending order (replace with 'DESC' for descending)
      ],
    });
    return parse(result);
  }
}
