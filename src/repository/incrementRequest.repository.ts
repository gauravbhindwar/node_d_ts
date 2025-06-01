import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import {
  addSalaryBonusIncrement,
  status as salaryStatus,
} from "@/interfaces/model/salaryIncreaseRequest.interface";
import Employee from "@/models/employee.model";
import EmployeeBonus from "@/models/employeeBonus.model";
import EmployeeSalary from "@/models/employeeSalary.model";
import LoginUser from "@/models/loginUser.model";
import IncrementRequests from "@/models/salaryIncreaseRequest.model";
import SegmentManager from "@/models/segmentManagers.model";
import User from "@/models/user.model";
import { parse } from "@/utils/common.util";
import moment from "moment";
import { Op, literal } from "sequelize";
import BaseRepository from "./base.repository";

export default class IncreaseRequest extends BaseRepository<IncrementRequests> {
  private msg = new MessageFormation("SalaryBonusIncrement").message;
  constructor() {
    super(IncrementRequests.name);
  }

  // Function to add a new salary/bonus increment record
  async addSalaryBonusIncrement(body: addSalaryBonusIncrement, user: User) {
    // Create a new record in the IncrementRequests table with the provided body and user details
    let exists = await IncrementRequests.findOne({
      where: {
        employeeId: body.employeeId,
        clientId: body.clientId,
        status: salaryStatus.PENDING
      }
    })
    if(exists){
      throw new HttpException(400, this.msg.exist, {}, true);
    }
    const result = await this.create({
      ...body,
      employeeName: user.loginUserData.name,
      roleId: user.roleId,
      createdBy: user.id,
    });

    // // If result is not successful (null or undefined), throw an error
    if (!result)
      throw new HttpException(400, "Something went wrong", {}, false);
    await createHistoryRecord({
      tableName: tableEnum.INCREMENT_REQUESTS,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created</b> Salary and Bonus Increment Rquest for employee id ${body.employeeId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(result),
      activity: statusEnum.CREATE,
    });
    // Parse and return the created record (converts Sequelize result into plain JavaScript object)
    return parse(result);
  }

  async getsementEmployees(user: any) {
    let segmentManagerData = await SegmentManager.findAll({
      where: { loginUserId: { [Op.eq]: user?.loginUserId } },
      attributes: ["id", "clientId", "segmentId"],
    });
    segmentManagerData = parse(segmentManagerData);
    const segmentArray = segmentManagerData.map((el) => el.segmentId);
    const clientArray = segmentManagerData.map((el) => el.clientId);

    //  get all employee data related to segments in which users is a manager
    let employees = await Employee.findAll({
      where: {
        clientId: { [Op.in]: clientArray },
        segmentId: { [Op.in]: segmentArray },
      },
    });
    employees = parse(employees).map((el) => el.id);
    return employees;
  }

  async getSalaryBonusIncrement(query: any, user: User) {
    // Destructure the employeeId, date, limit, and offset from the query, and clientId from the parameters
    const {
      clientId,
      employeeId,
      status,
      sort,
      date,
      limit = 10,
      page = 1,
    } = query; // Default limit is 10, offset is 0
    const offset: number = (parseInt(page) - 1) * parseInt(limit);

    // Initialize the whereClause object for filtering data, with initial conditions for non-deleted records and matching clientId
    const whereClause: any = {
      deletedAt: null,
    };
    if (clientId) {
      whereClause.clientId = clientId;
    }

    // If a date is provided, format it and set a condition to filter records created on that specific day
    if (date && date !== "all") {
      const formattedDate = moment(date, "MM-DD-YYYY").format("YYYY-MM-DD");
      whereClause["createdAt"] = {
        [Op.between]: [
          moment(formattedDate).startOf("day").toDate(), // Start of the specified day
          moment(formattedDate).endOf("day").toDate(), // End of the specified day
        ],
      };
    }

    // If an employeeId is provided or if it is equal to 'all', add the employeeId to the whereClause
    const employees = await this.getsementEmployees(user);
    if (employees.length > 0 && employeeId == "all") {
      whereClause["employeeId"] = { [Op.in]: employees };
    }
    if (employeeId && employeeId !== "all") {
      whereClause["employeeId"] = employeeId;
    }
    if (status && status !== "all") {
      whereClause["status"] = status;
    }

    if (user?.roleId == 1) {
      whereClause.managerStatus = salaryStatus.APPROVED;
    }

    // Query the IncrementRequests table with pagination (limit and offset) based on the built whereClause
    const result = await IncrementRequests.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          attributes: ["id", "baseSalary", "monthlySalary"],
        },
        {
          model: User,
          as: "manager",
          attributes: ["id", "roleId"],
          include: [
            {
              model: LoginUser,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      limit: parseInt(limit), // Limit the number of records per page
      offset: offset, // Skip records for pagination
      attributes: [
        "id",
        "employeeId",
        "employeeName",
        "clientId",
        "status",
        "roleId",
        "salaryIncrement",
        "bonusIncrement",
        "salaryIncrementPercent",
        "bonusIncrementPercent",
        "salaryDescription",
        "bonusDescription",
        "currentBonus",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "updatedatutc",
        "createdatutc",
        "deletedatutc",
        "managerId",
        "managerStatus",
        "currentSalary",
        "managerRequestedDate",

        // Nested SQL query to fetch the employee's salary details
        [
          literal(`(
            SELECT json_agg(
              json_build_object(
                'BaseSalary', "baseSalary",
                'MonthlySalary', "monthlySalary",
                'StartDate', TO_CHAR("startDate", 'MM-DD-YYYY'),
                'EndDate', TO_CHAR("endDate", 'MM-DD-YYYY')
              )
            )
            FROM "employee_salary"
            WHERE "employeeId" = "IncrementRequests"."employeeId"
            AND "deletedAt" IS NULL
          )`),
          "employeeSalaryHistory",
        ],
      ],
      order: [["createdAt", sort ?? "desc"]],
    });

    // If no result is found, throw an error
    if (!result)
      throw new HttpException(400, "Something went wrong", {}, false);

    // Return the result including count for total records and the data
    return {
      total: result.count, // Total number of records
      data: parse(result.rows), // Paginated data
      currentPage: Math.floor(offset / limit) + 1, // Current page number
      totalPages: Math.ceil(result.count / limit), // Total number of pages
    };
  }

  async getCurrentSalaryBonusData(param: any) {
    const { employeeId } = param;

    // Query the IncrementRequests table with pagination (limit and offset) based on the built whereClause
    const salary = await EmployeeSalary.findOne({
      where: { employeeId },
      order: [["createdAt", "DESC"]],
    });

    const bonus = await EmployeeBonus.findOne({
      where: { employeeId },
      order: [["createdAt", "DESC"]],
    });

    // Return the result including count for total records and the data
    return {
      monthlySalary: salary?.monthlySalary ?? "",
      bonus: bonus?.price ?? "",
    };
  }

  async updateIncrementRequestStatus(param: any, body: any, user: User) {
    const { id } = param;
    const { status } = body;
    // Find the request by ID
    let result = await IncrementRequests.findOne({
      where: { id: { [Op.eq]: id }, status: { [Op.eq]: salaryStatus.PENDING } },
    });
    result = parse(result);

    // If no record is found, throw an error
    if (!result) {
      throw new HttpException(
        404,
        `Increment request with ID ${id} not found`,
        {},
        true
      );
    }
    const updatedObject: any = {};
    if (user?.roleId != 1) {
      updatedObject.managerId = user.id;
      updatedObject.managerStatus = status;
      updatedObject.status =
        status == salaryStatus?.REJECTED
          ? salaryStatus.REJECTED
          : salaryStatus.PENDING;
      updatedObject.managerRequestedDate = new Date().toISOString();
    } else {
      updatedObject.status = status;
      updatedObject.updatedBy = user.id;
      // updating montly salary of employee if the request is approved
      if (status == salaryStatus?.APPROVED) {
        await this.employeeSalaryUpdate(result);
      }
    }
    await IncrementRequests.update(updatedObject, {
      where: { id: { [Op.eq]: id } },
    });

    await createHistoryRecord({
      tableName: tableEnum.INCREMENT_REQUESTS,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Salary and Bonus Increment Request status for request id ${id}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(result),
      activity: statusEnum.UPDATE,
    });
    return parse(result);
  }

  async employeeSalaryUpdate(result: any) {
    let employee = await Employee.findOne({
      where: { id: { [Op.eq]: result?.employeeId } },
    });
    employee = parse(employee);
    if (!employee) {
      throw new HttpException(404, `Employee Not found`);
    }
    await Employee.update(
      {
        monthlySalary:
          employee.monthlySalary + parseFloat(result.salaryIncrement),
      },
      { where: { id: { [Op.eq]: result?.employeeId } } }
    );
  }

  async updateIncrementRequestData(param: any, body: any, user: User) {
    const { id } = param;
    const {
      salaryIncrement,
      bonusIncrement,
      salaryIncrementPercent,
      bonusIncrementPercent,
      salaryDescription,
      bonusDescription,
      currentBonus,
      currentSalary,
    } = body;

    // Find the request by ID
    const result = await IncrementRequests.findByPk(id);

    // If no record is found, throw an error
    if (!result) {
      throw new HttpException(404, `Increment request with ID ${id} not found`);
    }
    if (result.status !== salaryStatus.PENDING) {
      throw new HttpException(
        403,
        `Increment request with ID ${id} cannot be updated because its status is not PENDING`
      );
    }
    result.salaryIncrement = salaryIncrement;
    result.bonusIncrement = bonusIncrement;
    result.salaryIncrementPercent = salaryIncrementPercent;
    result.bonusIncrementPercent = bonusIncrementPercent;
    result.salaryDescription = salaryDescription;
    result.bonusDescription = bonusDescription;
    result.currentBonus = currentBonus;
    result.currentSalary = currentSalary;
    (result.updatedBy = user.id),
      // Save the updated request
      await result.save();

    if (!result)
      throw new HttpException(400, "Something went wrong", {}, false);
    await createHistoryRecord({
      tableName: tableEnum.INCREMENT_REQUESTS,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> Salary and Bonus Increment Rquest for request id ${id}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(result),
      activity: statusEnum.UPDATE,
    });
    return parse(result);
  }

  async daleteIncrementRequestData(param: any, user: User) {
    const { id } = param;
    const result = await IncrementRequests.findOne({
      where: {
        id, // Match the record by id
        deletedAt: null, // Ensure it's not already soft-deleted
      },
    });

    // If the record is not found, throw a 404 error
    if (!result) {
      throw new HttpException(
        404,
        `Increment request with ID ${id} not found or already deleted`
      );
    }
    // Get the current timestamp
    const newdate = new Date().toISOString();
    // Update the deletedAt and deletedatutc fields
    await IncrementRequests.update(
      {
        deletedAt: newdate,
        deletedatutc: newdate,
        updatedBy: user.loginUserId,
      }, // Fields to update
      { where: { id } } // Where condition to match the record
    );

    // Re-fetch or return the updated object
    const updatedResult = await IncrementRequests.findOne({
      where: { id },
      paranoid: false, // Include soft-deleted records
      attributes: [
        "id",
        "employeeId",
        "employeeName",
        "clientId",
        "status",
        "roleId",
        "salaryIncrement",
        "bonusIncrement",
        "salaryIncrementPercent",
        "bonusIncrementPercent",
        "salaryDescription",
        "bonusDescription",
        "currentBonus",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
        "deletedAt",
        "createdatutc",
        "updatedatutc",
        "deletedatutc",
      ],
    });

    if (!updatedResult)
      throw new HttpException(400, "Something went wrong", {}, false);
    await createHistoryRecord({
      tableName: tableEnum.INCREMENT_REQUESTS,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> Salary and Bonus Increment Rquest for employee id ${result.employeeId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(result),
      activity: statusEnum.DELETE,
    });
    return parse(updatedResult);
  }
}
