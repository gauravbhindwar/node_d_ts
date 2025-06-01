import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { BonusTypeMasterAttributes } from "@/interfaces/model/bonusTypeMaster.interface";
import BonusTypeMaster from "@/models/bonusTypesMaster.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import slugify from "slugify";
import BaseRepository from "./base.repository";

export default class BonusTypeMasterRepo extends BaseRepository<
  BonusTypeMaster
> {
  private msg = new MessageFormation("Overt Time Bonus").message;
  constructor() {
    super(BonusTypeMaster.name);
  }

  // Function to add a new salary/bonus increment record
  async addBonusTypeMaster(body: BonusTypeMasterAttributes, user: User) {
    const slug = slugify(body.name, { lower: true, replacement: "-" });

    let exists = await BonusTypeMaster.findOne({
      where: {
        [Op.or]: [{ slug: slug }, { code: { [Op.iLike]: body.code } }],
        deletedAt: null,
      },
    });
    if (exists) {
      throw new HttpException(400, this.msg.exist, {}, true);
    }
    // Create a new record in the IncrementRequests table with the provided body and user details

    const result = await this.create({
      ...body,
      slug: slug,
    });

    return parse(result);
  }

  // Function to add a new salary/bonus increment record
  async getAllBonusTypes(query: IQueryParameters, user: User) {
    const { page, limit, clientId, sortBy, sort, search, isActive } = query;
    const sortedColumn = sortBy || null;
    // Create a new record in the IncrementRequests table with the provided body and user details
    let result = await BonusTypeMaster.findAll({
      where: { deletedAt: null },
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "createdAt", sort ?? "desc"]],
    });
    if (!result) {
      throw new HttpException(400, this.msg.exist, {}, true);
    }

    return parse(result);
  }

  // Function to get specific detail
  async getBonusType(param: any, query: any, user: User) {
    const { id } = param;

    // let result = await BonusTypeMaster.findOne({ where: param });
    const result = await BonusTypeMaster.findOne({
      where: {
        id, // Match the record by id
        deletedAt: null, // Ensure it's not already soft-deleted
      },
    });

    // if(!result){
    //   throw new HttpException(400, this.msg.exist, {}, true);
    // }

    // If the record is not found, throw a 404 error
    if (!result) {
      throw new HttpException(
        404,
        `Record with ID ${id} not found or already deleted`
      );
    }

    return parse(result);
  }

  async updateBonusType(param: any, body: any, user: User) {
    const { id } = param;
    const { name, code, bonus_type, description } = body;

    const result = await BonusTypeMaster.findOne({
      where: {
        id, // Match the record by id
        deletedAt: null, // Ensure it's not already soft-deleted
      },
    });
    if (!result) {
      throw new HttpException(404, `Record with ID ${id} not found`, {}, true);
    }

    const slug = slugify(name, { lower: true, replacement: "-" });
  
    // check Whether the input data belongs to the other data or not
    let exists = await BonusTypeMaster.findOne({
      where: {
        [Op.or]: [{ slug: slug }, { code: { [Op.iLike]: code } }],
        id: { [Op.ne]: id },
        deletedAt: null,
      },
    });
    if (exists) {
      throw new HttpException(
        404,
        `Can't Update the existing Leave Type`,
        {},
        true
      );
    }

    result.name = name;
    result.code = code;
    result.slug = slug;
    result.bonus_type = bonus_type;
    result.description = description;

    // Save the updated request
    await result.save();

    if (!result)
      throw new HttpException(400, "Something went wrong", {}, false);

    return parse(result);
  }

  async daleteBonusType(param: any, query: any, user: User) {
    const { id } = param;

    const result = await BonusTypeMaster.findOne({
      where: {
        id, // Match the record by id
        deletedAt: null, // Ensure it's not already soft-deleted
      },
    });

    // If the record is not found, throw a 404 error
    if (!result) {
      throw new HttpException(
        404,
        `Record with ID ${id} not found or already deleted`
      );
    }
    // Get the current timestamp
    const newdate = new Date().toISOString();

    // Update the deletedAt and deletedatutc fields
    await BonusTypeMaster.update(
      {
        deletedAt: newdate,
      }, // Fields to update
      { where: { id } } // Where condition to match the record
    );

    // Re-fetch or return the updated object
    const updatedResult = await BonusTypeMaster.findOne({
      where: { id },
      paranoid: false, // Include soft-deleted records
      // attributes: [
      //   "id",
      //   "name",
      //   "code",
      //   "bonus_type",
      //   "description",
      //   "createdAt",
      //   "createdBy",
      //   "updatedAt",
      //   "updatedBy",
      //   "deletedAt",
      //   "createdatutc",
      //   "updatedatutc",
      // ],
    });

    if (!updatedResult)
      throw new HttpException(400, "Something went wrong", {}, false);

    return parse(updatedResult);
  }
}
