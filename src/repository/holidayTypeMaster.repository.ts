import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { HolidayTypeMasterAttributes } from "@/interfaces/model/holidayTypeMaster.interface";
import HolidayTypeMaster from "@/models/holidayTypes.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import slugify from "slugify";
import BaseRepository from "./base.repository";

export default class HolidayTypeMasterRepo extends BaseRepository<
  HolidayTypeMaster
> {
  private msg = new MessageFormation("Holiday Type").message;
  constructor() {
    super(HolidayTypeMaster.name);
  }

  // Function to add a new salary/bonus increment record
  async addHolidayTypeMaster(body: HolidayTypeMasterAttributes, user: User) {
    // Create a new record in the IncrementRequests table with the provided body and user details
    const slug = slugify(body.name, { lower: true, replacement: "-" });
    // Create a new record in the IncrementRequests table with the provided body and user details

    let exists = await HolidayTypeMaster.findOne({
      where: { [Op.or]: [{ slug: slug }], deletedAt: null },
    });
    if (exists) {
      throw new HttpException(400, this.msg.exist, {}, true);
    }

    const result = await this.create({
      ...body,
      slug: slug,
    });

    return parse(result);
  }

  // Function to add a new salary/bonus increment record
  async getAllHolidayTypes(query: IQueryParameters, user: User) {
    const { page, limit, clientId, sortBy, sort, search, isActive } = query;
    const sortedColumn = sortBy || null;

    // Create a new record in the IncrementRequests table with the provided body and user details
    let result = await HolidayTypeMaster.findAll({
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
  async getHolidayType(param: any, query: any, user: User) {
    const { id } = param;

    // let result = await HolidayTypeMaster.findOne({ where: param });
    const result = await HolidayTypeMaster.findOne({
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

  async updateHolidayType(param: any, body: any, user: User) {
    const { id } = param;
    const {
      name,
      code,
      // employee_type,
      label,
      payment_type,
      description,
    } = body;

    // Find the record by ID
    // const result = await HolidayTypeMaster.findByPk(id);
    const result = await HolidayTypeMaster.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });

    // If no record is found, throw an error
    if (!result) {
      throw new HttpException(404, `Record with ID ${id} not found`);
    }

    const slug = slugify(name, { lower: true, replacement: "-" });
    // check Whether the input data belongs to the other data or not
    let exists = await HolidayTypeMaster.findOne({
      where: {
        [Op.or]: [{ slug: slug }],
        id: { [Op.ne]: id },
        deletedAt: null,
      },
    });
    console.log("exists", parse(exists));

    if (exists) {
      throw new HttpException(
        400,
        `Can't Update the existing Leave Type`,
        {},
        true
      );
    }

    result.name = name;
    result.code = code;
    result.label = label;
    result.slug = slug;
    result.description = description;

    // Save the updated request
    await result.save();

    if (!result)
      throw new HttpException(400, "Something went wrong", {}, false);

    return parse(result);
  }

  async deleteHolidayType(param: any, query: any, user: User) {
    const { id } = param;

    const result = await HolidayTypeMaster.findOne({
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
    await HolidayTypeMaster.update(
      {
        deletedAt: newdate,
      }, // Fields to update
      { where: { id } } // Where condition to match the record
    );

    // Re-fetch or return the updated object
    const updatedResult = await HolidayTypeMaster.findOne({
      where: { id },
      paranoid: false, // Include soft-deleted records
      // attributes: [
      //   "id",
      //   "name",
      //   "code",
      //   "holiday_type",
      //   "payment_type",
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
