import { IQueryParameters } from "@/interfaces/general/general.interface";
import { IHistoryCreate } from "@/interfaces/model/history.interface";
import History from "@/models/history.model";
import LoginUser from "@/models/loginUser.model";
import Role from "@/models/role.model";
import User from "@/models/user.model";
import moment from "moment-timezone";
import { Op, Transaction } from "sequelize";
import { DEFAULT_REGION } from "../config/index";
import { parse } from "./../utils/common.util";
export const createHistoryRecord = async (
  historyData: Omit<IHistoryCreate, "id" | "createdAt">,
  transaction: Transaction = null
) => {
  try {
    await History.create(
      {
        ...historyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction }
    );
  } catch (error) {
    throw new Error(error);
  }
};

export const formatKeyString = (input: any): string | null => {
  // Convert input to string if it's not already a string
  let strInput: string;

  // Handle Date objects
  if (input instanceof Date) {
    strInput = input.toISOString(); // or input.toString()
  } else if (typeof input === 'string') {
    strInput = input;
  } else if (input !== undefined && input !== null) {
    strInput = String(input);
  } else {
    // Return null or fallback like ''
    return null;
  }

  // Replace underscores with spaces
  let result = strInput.replace(/_/g, ' ');

  // Insert space before each uppercase letter (except the first one)
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Capitalize the first letter of each word
  result = result.replace(/\b\w/g, (char) => char.toUpperCase());

  return result;
};

export const getAllHistory = async (query: IQueryParameters) => {
  try {
    const {
      page,
      limit,
      // search,
      // startDate,
      // endDate,
      // clientId,
      from,
      to,
      roleId,
      module,
    } = query;
    const filter: any = {},
      userFilter: any = {};
    if (roleId) {
      userFilter.roleId = { [Op.eq]: roleId };
    }

    if (module) {
      filter.moduleName = { [Op.eq]: module };
    }

    if (from) {
      filter.createdAt = {
        [Op.gte]: moment
          .tz(from, "YYYY-MM-DD HH:mm", DEFAULT_REGION)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      };
    }

    if (to) {
      filter.createdAt = {
        [Op.lte]: moment
          .tz(to, "YYYY-MM-DD HH:mm", DEFAULT_REGION)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      };
    }

    if (from && to) {
      filter.createdAt = {
        [Op.between]: [
          moment
            .tz(from, "YYYY-MM-DD HH:mm", DEFAULT_REGION)
            .utc()
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
          moment
            .tz(to, "YYYY-MM-DD HH:mm", DEFAULT_REGION)
            .utc()
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        ],
      };
    }
    let data = await History.findAndCountAll({
      where: {
        userId: {
          [Op.ne]: null,
        },
        activity: {
          [Op.ne]: null,
        },
        ...filter,
      },
      attributes: { exclude: ["jsonData"] }, // Exclude these columns
      include: [
        {
          model: User,
          where: { ...userFilter },
          attributes: ["id", "loginUserId", "roleId"],
          include: [
            {
              model: LoginUser,
              required: false,
              attributes: ["id", "name", "logouttimeutc"],
            },
            {
              model: Role,
              required: false,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [["createdAt", "desc"]],
    });
    data = parse(data);
    data?.rows.forEach(function (doc) {
      doc.status = !doc.userData.loginUserData.logouttimeutc ? true : false; // Add a new property to each user
    });

    const responseObj = {
      data: data?.rows,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    return responseObj;
  } catch (error) {
    throw new Error(error);
  }
};

export const customHistoryUpdateMesage = async (
  body: any,
  previousData: any,
  user: any,
  updatedData: any,
  table: string,
  custom_msg?: string
) => {
  let message = "";
  if (body) {
    const customArray = [];
    for (const [key] of Object.entries(body)) {
      if (previousData[key] && previousData[key] !== updatedData[key]) {
        customArray.push(
          `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${formatKeyString(table)} ${formatKeyString(key)} from <b>${formatKeyString(previousData[key])}</b> to <b>${formatKeyString(updatedData[key])}</b>`
        );
      }
    }
    message =
      customArray.length > 0
        ? customArray.join(", ")
        : `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${formatKeyString(table)}, but no changes were made`;
  } else {
    message = custom_msg
      ? `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${formatKeyString(table)}, ${formatKeyString(custom_msg)}`
      : `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${formatKeyString(table)}.`;
  }

  return message;
};

export const customHistoryCreateMessage = async (
  user: any,
  table: string,
  data: any
) => {
  return `<b>${user?.loginUserData?.name}</b> has <b>created</b> a ${formatKeyString(table)} <b>${data.name}</b>`;
};

export const customHistoryDeleteMessage = async (
  user: any,
  table: string,
  data: any
) => {
  return `<b>${user?.loginUserData?.name}</b> has <b>deleted</b> the ${formatKeyString(table)} <b>${data.name}</b>`;
};

export const customHistoryViewMessage = async (
  user: any,
  table: string,
  data: any
) => {
  return `<b>${user?.loginUserData?.name}</b> has viewed the ${formatKeyString(table)} <b>${data}</b>`;
};

export const customHistoryExportMessage = async (
  user: any,
  table: string,
  data: any
) => {
  return `<b>${user?.loginUserData?.name}</b> has exported data from ${formatKeyString(table)}. <b>${data}</b>`;
};