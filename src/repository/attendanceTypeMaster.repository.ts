import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { LeaveTypeMasterAttributes } from "@/interfaces/model/leaveTypeMaster.interface";
import AttendanceTypeModel from "@/models/attendanceType.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import { Op } from "sequelize";
import slugify from "slugify";
import BaseRepository from "./base.repository";

export default class AttendanceTypeMasterRepo extends BaseRepository<
AttendanceTypeModel
> {
  private msg = new MessageFormation("Attendance Type").message;
  constructor() {
    super(AttendanceTypeModel.name);
  }

  // Function to add a new salary/bonus increment record
  async addAttendanceType(body: LeaveTypeMasterAttributes, user: User) {
    const slug = slugify(body.name, { lower: true, replacement: "-" });
    // Create a new record in the IncrementRequests table with the provided body and user details

    let exists = await AttendanceTypeModel.findOne({
      where: {
        [Op.or]: [{ slug: slug }, { code: { [Op.iLike]: body.code } }],
        deletedAt: null,
      },
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
  async getAllAttendanceTypes(query: IQueryParameters, user: User) {
    const { page, limit, clientId, sortBy, sort, search, isActive } = query;
    const sortedColumn = sortBy || null;
    // Create a new record in the IncrementRequests table with the provided body and user details
    let result = await AttendanceTypeModel.findAll({
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
  async getAttendanceType(param: any, query: any, user: User) {
    const { id } = param;

    const result = await AttendanceTypeModel.findOne({
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

  async updateAttendanceType(param: any, body: any, user: User) {
    const { id } = param;
    const { name, code, payment_type, description } = body;

    const result = await AttendanceTypeModel.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!result) {
      throw new HttpException(404, `Record with ID ${id} not found`, {}, true);
    }

    const slug = slugify(name, { lower: true, replacement: "-" });
    // check Whether the input data belongs to the other data or not
    let exists = await AttendanceTypeModel.findOne({
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
    result.description = description;

    // Save the updated request
    await result.save();

    if (!result)
      throw new HttpException(400, "Something went wrong", {}, false);

    return parse(result);
  }

  async deleteAttendanceType(param: any, user: User) {
    const { id } = param;

    const result = await AttendanceTypeModel.findOne({
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
    await AttendanceTypeModel.update(
      {
        deletedAt: newdate,
      }, // Fields to update
      { where: { id } } // Where condition to match the record
    );

    // Re-fetch or return the updated object
    const updatedResult = await AttendanceTypeModel.findOne({
      where: { id },
      paranoid: false, // Include soft-deleted records
      // attributes: [
      //   "id",
      //   "name",
      //   "code",
      //   "payment_type",
      //   "description",
      //   "createdAt",
      //   "createdBy",
      //   "updatedAt",
      //   "updatedBy",
      //   "deletedAt",
      //   "createdatutc",
      //   "updatedatutc",
      //   "deletedatutc",
      // ],
    });

    if (!updatedResult)
      throw new HttpException(400, "Something went wrong", {}, false);

    return parse(updatedResult);
  }
}
