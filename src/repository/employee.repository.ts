import { FRONTEND_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import TimesheetController from "@/controllers/timesheet.controller";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryUpdateMesage,
} from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";

import { applyCustomPagination, applyCustomlimitsearchsorting } from "@/helpers/common.helper";
import { DefaultRoles } from "@/interfaces/functional/feature.interface";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  IEmployeeCreate,
  employeeStatus,
} from "@/interfaces/model/employee.interface";
import {
  actionType,
  status as reqStatus,
} from "@/interfaces/model/employeeStatusRequests.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { RolePermissionAttributes } from "@/interfaces/model/rolePermission.interface";
import { status } from "@/interfaces/model/user.interface";
import Account from "@/models/account.model";
import Bank from "@/models/bankDetails.model";
import BonusType from "@/models/bonusType.model";
import Client from "@/models/client.model";
import EmployeeBonus from "@/models/employeeBonus.model";
import EmployeeCatalogueNumber from "@/models/employeeCatalogueNumber.model";
import EmployeeContract from "@/models/employeeContract.model";
import EmployeeFile from "@/models/employeeFile.model";
import EmployeeLeave from "@/models/employeeLeave.model";
import EmployeeRotation from "@/models/employeeRotation.model";
import EmployeeSalary from "@/models/employeeSalary.model";
import EmployeeSegment from "@/models/employeeSegment.model";
import EmployeeStatusRequest from "@/models/employeeStatusRequests.model";
import Folder from "@/models/folder.model";
import LoginUser from "@/models/loginUser.model";
import MedicalRequest from "@/models/medicalRequest.model";
import ReliquatCalculation from "@/models/reliquatCalculation.model";
import ReliquatCalculationV2 from "@/models/reliquatCalculationV2.model";
import Role from "@/models/role.model";
import RolePermission from "@/models/rolePermission.model";
import Rotation from "@/models/rotation.model";
import Segment from "@/models/segment.model";
import SegmentManager from "@/models/segmentManagers.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import TimesheetSchedule from "@/models/timesheetSchedule.model";
import User from "@/models/user.model";
import UserPermission from "@/models/userPermission.model";
import {
  createRandomHash,
  generateUniquePassword,
  getSegmentAccessForUser,
  getSubSegmentAccessForUser,
  parse,
} from "@/utils/common.util";
import { generateModalData } from "@/utils/generateModal";
import * as bcrypt from "bcrypt";
import { unflatten } from "flat";
import _ from "lodash";
import moment from "moment";
import { Op, Order, Sequelize, Transaction, col, fn } from "sequelize";
import slugify from "slugify";
import { default as Employee } from "../models/employee.model";
import BaseRepository from "./base.repository";
import ReliquatCalculationRepo from "./reliquatCalculation.repository";
import TimesheetRepo from "./timesheet.repository";

export default class EmployeeRepo extends BaseRepository<Employee> {
  constructor() {
    super(Employee.name);
  }

  private reliquatCalculationRepo = new ReliquatCalculationRepo();
  private msg = new MessageFormation("Employee").message;
  private Reqmsg = new MessageFormation("Request").message;

  private timesheetController = new TimesheetController();
  private timesheetRepo = new TimesheetRepo();
  private attributes: [
    "firstName",
    "lastName",
    "gender",
    "birthDate",
    "placeOfBirth",
    "email",
    "phone",
    "profileImage",
    "timezone"
  ];

  // async getAllEmployeeService(query: IQueryParameters, user: User, transaction: Transaction = null) {
  // 	const {
  // 		page,
  // 		limit,
  // 		clientId,
  // 		sortBy,
  // 		sort,
  // 		activeStatus,
  // 		search,
  // 		segmentId,
  // 		subSegmentId,
  // 		startDate,
  // 		endDate,
  // 		isExportPage,
  // 	} = query;
  // 	const subSegmentIds = getSubSegmentAccessForUser(user);
  // 	const segmentIds = getSegmentAccessForUser(user);

  // 	const sortedColumn = sortBy || null;
  // 	const dateWithTimezone = new Date(new Date(endDate).getTime() - new Date(endDate).getTimezoneOffset() * 60000);
  // 	dateWithTimezone.setHours(23, 59, 59, 999);
  // 	// let employeeContractCount = await EmployeeContract.count({
  // 	// 	where: { ...condition }, // Counting all contracts for all employees
  // 	// 	transaction,
  // 	// });
  // 	// employeeContractCount = parse(employeeContractCount);

  // 	let getAllEmployeeData = await Employee.findAll({
  // 		where: {
  // 			clientId: clientId,
  // 		},
  // 		attributes: ['id', 'loginUserId', 'terminationDate', 'startDate'],
  // 		order: [
  // 			['loginUserId', 'asc'],
  // 			['terminationDate', 'desc'],
  // 			['startDate', 'desc'],
  // 		],
  // 	});
  // 	getAllEmployeeData = parse(getAllEmployeeData);
  // 	const mapData = new Map();
  // 	for (const employeeData of getAllEmployeeData) {
  // 		const isExist = mapData.get(`${employeeData?.loginUserId}`);
  // 		if (!isExist) {
  // 			const currentDate = moment().toDate();
  // 			if (employeeData.terminationDate !== null && moment(employeeData.terminationDate).isSameOrBefore(currentDate)) {
  // 				mapData.set(`${employeeData?.loginUserId}`, { id: employeeData?.id, type: false });
  // 			} else {
  // 				mapData.set(`${employeeData?.loginUserId}`, { id: employeeData?.id, type: true });
  // 			}
  // 		}
  // 	}
  // 	const activeIds = [];
  // 	const terminatedIds = [];
  // 	for (const data of mapData) {
  // 		if (data[1]?.type === false) {
  // 			terminatedIds.push(data[1]?.id);
  // 		} else {
  // 			activeIds.push(data[1]?.id);
  // 		}
  // 	}

  // 	const condition = {
  // 		deletedAt: null,
  // 		clientId: clientId,
  // 		...(activeStatus &&
  // 			activeStatus != 'all' && {
  // 				id:
  // 					activeStatus == 'active' ||
  // 					activeStatus == 'pending' ||
  // 					activeStatus == 'rejected' ||
  // 					activeStatus == 'draft'
  // 						? { [Op.in]: activeIds }
  // 						: { [Op.in]: terminatedIds },
  // 			}),
  // 		...(activeStatus &&
  // 			activeStatus == 'pending' && {
  // 				isAdminApproved: null,
  // 				employeeStatus: employeeStatus.SAVED,
  // 			}),
  // 		...(activeStatus &&
  // 			activeStatus == 'rejected' && {
  // 				isAdminApproved: false,
  // 			}),
  // 		...(activeStatus &&
  // 			activeStatus == 'draft' && {
  // 				isAdminApproved: null,
  // 				employeeStatus: employeeStatus.DRAFT,
  // 			}),
  // 		...(activeStatus &&
  // 			activeStatus == 'active' && {
  // 				isAdminApproved: true,
  // 			}),
  // 	};
  // 	const orderBy: Order = [
  // 		['loginUserData', 'lastName', 'asc'],
  // 		['employeeContracts', 'endDate', 'desc'],
  // 	];
  // 	if (!isExportPage) {
  // 		orderBy.unshift(['segment', 'name', 'asc']);
  // 	}
  // 	let data = await Employee.findAndCountAll({
  // 		include: [
  // 			{
  // 				model: LoginUser,
  // 				required: true,
  // 				where: {
  // 					...(user.roleData.isViewAll && user.roleData.name === DefaultRoles.Employee && { id: user.loginUserId }),
  // 					...(search && {
  // 						[Op.or]: [
  // 							Sequelize.where(Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), {
  // 								[Op.iLike]: `%${search}%`,
  // 							}),
  // 							Sequelize.where(Sequelize.fn('concat', Sequelize.col('lastName'), ' ', Sequelize.col('firstName')), {
  // 								[Op.iLike]: `%${search}%`,
  // 							}),
  // 						],
  // 					}),
  // 				},
  // 				attributes: this.attributes,
  // 			},
  // 			{
  // 				model: Segment,
  // 				...(segmentIds?.length == 0 && { required: false }),
  // 				where: { ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }) },
  // 				attributes: ['name', 'id'],
  // 			},
  // 			{
  // 				model: SubSegment,
  // 				required: false,
  // 				where: { ...(subSegmentIds?.length > 0 && { id: { [Op.in]: subSegmentIds } }) },
  // 				attributes: ['name', 'id'],
  // 			},
  // 			{
  // 				model: Rotation,
  // 				attributes: ['name', 'id'],
  // 			},
  // 			{
  // 				model: EmployeeContract,
  // 				attributes: ['newContractNumber', 'endDate'],
  // 			},
  // 			{
  // 				model: EmployeeFile,
  // 				required: false,
  // 				separate: true,
  // 				include: [
  // 					{
  // 						model: Folder,
  // 						where: {
  // 							name: 'Contract',
  // 						},
  // 					},
  // 				],
  // 			},
  // 			{
  // 				model: EmployeeSegment,
  // 				as: 'employeeSegment',
  // 				attributes: ['date', 'rollover', 'id'],
  // 				separate: true,
  // 				limit: 1,
  // 				order: [['date', 'desc']],
  // 			},
  // 			{
  // 				model: EmployeeSalary,
  // 				separate: true,
  // 				limit: 1,
  // 				order: [['startDate', 'desc']],
  // 				attributes: ['startDate'],
  // 			},
  // 			{
  // 				model: Client,
  // 				attributes: ['isResetBalance'],
  // 			},
  // 			{
  // 				model: EmployeeRotation,
  // 				attributes: ['date', 'id'],
  // 				separate: true,
  // 				limit: 1,
  // 				order: [['date', 'desc']],
  // 			},
  // 		],
  // 		where: {
  // 			...(startDate && endDate && dateWithTimezone
  // 				? {
  // 						startDate: {
  // 							[Op.or]: {
  // 								[Op.between]: [moment(startDate).toDate(), new Date(dateWithTimezone).toISOString()],
  // 								[Op.eq]: moment(startDate).toDate(),
  // 								[Op.eq]: new Date(dateWithTimezone).toISOString(),
  // 							},
  // 						},
  // 				  }
  // 				: {}),
  // 			...condition,
  // 			segmentId: { [Op.not]: null },
  // 			[Op.and]: [
  // 				{ ...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }) },
  // 				{ ...(segmentId && { segmentId: segmentId }) },
  // 				{
  // 					...(subSegmentIds?.length > 0 && {
  // 						[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
  // 					}),
  // 				},
  // 				{ ...(subSegmentId && { subSegmentId: subSegmentId }) },
  // 			],
  // 		},
  // 		offset: page && limit ? (page - 1) * limit : undefined,
  // 		limit: limit ?? undefined,
  // 		order: orderBy,
  // 		transaction,
  // 	});
  // 	data = parse(data);
  // 	const responseObj = {
  // 		data: data?.rows,
  // 		count: data?.count,
  // 		currentPage: page ?? undefined,
  // 		limit: limit ?? undefined,
  // 		lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
  // 	};
  // 	return responseObj;
  // }

  async getAllEmployeeService(
    query: IQueryParameters,
    user: User,
    transaction: Transaction = null
  ) {
    const {
      page,
      limit,
      clientId,
      // sortBy,
      // sort,
      activeStatus,
      search,
      segmentId,
      subSegmentId,
      startDate,
      endDate,
      isExportPage,
    } = query;

    const subSegmentIds = getSubSegmentAccessForUser(user);
    const segmentIds = getSegmentAccessForUser(user);
    const filter: any = {};
    if (clientId) {
      filter.clientId = clientId;
    }
    // const sortedColumn = sortBy || null;
    const dateWithTimezone = new Date(
      new Date(endDate).getTime() -
        new Date(endDate).getTimezoneOffset() * 60000
    );
    dateWithTimezone.setHours(23, 59, 59, 999);
    let getAllEmployeeData = await Employee.findAll({
      where: { ...filter },
      attributes: ["id", "loginUserId", "terminationDate", "startDate"],
      order: [
        ["loginUserId", "asc"],
        ["terminationDate", "desc"],
        ["startDate", "desc"],
      ],
    });
    getAllEmployeeData = parse(getAllEmployeeData);
    const mapData = new Map();
    for (const employeeData of getAllEmployeeData) {
      const isExist = mapData.get(`${employeeData?.loginUserId}`);
      if (!isExist) {
        const currentDate = moment().toDate();
        if (
          employeeData.terminationDate !== null &&
          moment(employeeData.terminationDate).isSameOrBefore(currentDate)
        ) {
          mapData.set(`${employeeData?.loginUserId}`, {
            id: employeeData?.id,
            type: false,
          });
        } else {
          mapData.set(`${employeeData?.loginUserId}`, {
            id: employeeData?.id,
            type: true,
          });
        }
      }
    }
    const activeIds = [];
    const terminatedIds = [];
    for (const data of mapData) {
      if (data[1]?.type === false) {
        terminatedIds.push(data[1]?.id);
      } else {
        activeIds.push(data[1]?.id);
      }
    }
    const condition: any = {
      deletedAt: null,
      ...(activeStatus &&
        activeStatus != "all" && {
          id:
            activeStatus == "active" ||
            activeStatus == "pending" ||
            activeStatus == "rejected" ||
            activeStatus == "draft"
              ? { [Op.in]: activeIds }
              : { [Op.in]: terminatedIds },
        }),
      ...(activeStatus &&
        activeStatus == "pending" && {
          isAdminApproved: null,
          employeeStatus: employeeStatus.SAVED,
        }),
      ...(activeStatus &&
        activeStatus == "rejected" && {
          isAdminApproved: false,
        }),
      ...(activeStatus &&
        activeStatus == "draft" && {
          isAdminApproved: null,
          employeeStatus: employeeStatus.DRAFT,
        }),
      ...(activeStatus &&
        activeStatus == "active" && {
          isAdminApproved: true,
        }),
    };

    if (clientId) {
      condition.clientId = clientId;
    }
    const orderBy: Order = [
      ["loginUserData", "lastName", "asc"],
      ["employeeContracts", "endDate", "desc"],
    ];
    if (!isExportPage) {
      orderBy.unshift(["segment", "name", "asc"]);
    }

    const responseObj = {
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
    };

    let includes: any = [
      {
        model: LoginUser,
        required: true,
        where: {
          ...(user.roleData.isViewAll &&
            user.roleData.name === DefaultRoles.Employee && {
              id: user.loginUserId,
            }),
          ...(search && {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn(
                  "concat",
                  Sequelize.col("firstName"),
                  " ",
                  Sequelize.col("lastName")
                ),
                {
                  [Op.iLike]: `%${search}%`,
                }
              ),
              Sequelize.where(
                Sequelize.fn(
                  "concat",
                  Sequelize.col("lastName"),
                  " ",
                  Sequelize.col("firstName")
                ),
                {
                  [Op.iLike]: `%${search}%`,
                }
              ),
            ],
          }),
        },
        attributes: {
          exclude: ["password", "randomPassword", "code", "uniqueLoginId"],
        },
      },
      {
        model: Segment,
        ...(segmentIds?.length == 0 && { required: false }),
        where: {
          ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
        },
        attributes: ["name", "id"],
      },
      {
        model: SubSegment,
        required: false,
        where: {
          ...(subSegmentIds?.length > 0 && {
            id: { [Op.in]: subSegmentIds },
          }),
        },
        attributes: ["name", "id"],
      },
      {
        model: Rotation,
        attributes: ["name", "id", "isResident", "weekOn", "weekOff"],
      },
      {
        model: EmployeeContract,
        attributes: ["newContractNumber", "endDate"],
      },
      {
        model: EmployeeFile,
        required: false,
        separate: true,
        include: [
          {
            model: Folder,
            where: {
              name: "Contract",
            },
          },
        ],
      },
      {
        model: EmployeeSegment,
        as: "employeeSegment",
        attributes: ["date", "rollover", "id"],
        separate: true,
        limit: 1,
        order: [["date", "desc"]],
      },
      {
        model: EmployeeSalary,
        separate: true,
        limit: 1,
        order: [["startDate", "desc"]],
        attributes: ["startDate"],
      },
      {
        model: Client,
        attributes: ["isResetBalance", "loginUserId"],
        include: [
          {
            model: LoginUser,
            attributes: ["id", "name", "email"],
          },
        ],
        where: { isActive: true },
      },
      {
        model: EmployeeRotation,
        attributes: ["date", "id"],
        separate: true,
        limit: 1,
        order: [["date", "desc"]],
      },
      {
        model: EmployeeLeave,
        attributes: ["id", "startDate"],
        separate: true,
        limit: 1,
        order: [["startDate", "ASC"]],
      },
    ];

    if (activeStatus == "all") {
      const recentRecords = await Employee.findAll({
        where: { ...condition, loginUserId: 404 },
        attributes: [
          "loginUserId",
          [fn("COUNT", col("*")), "totalRecords"],
          [fn("MAX", col("createdAt")), "mostRecentRecordDate"],
        ],
        group: ["loginUserId"],
        raw: true,
      });

      console.log("recentRecords------", recentRecords);

      // Step 2: Get the details of the latest records by joining with the recentRecords
      let latestRecords = await Promise.all(
        recentRecords.map(async (record) => {
          const latestRecord = await Employee.findOne({
            include: includes,
            where: {
              loginUserId: record.loginUserId,
              createdAt: record["mostRecentRecordDate"],
              ...(startDate && endDate && dateWithTimezone
                ? {
                    startDate: {
                      [Op.or]: {
                        [Op.between]: [
                          moment(startDate).toDate(),
                          new Date(dateWithTimezone).toISOString(),
                        ],
                        [Op.eq]: moment(startDate).toDate(),
                        // [Op.eq]: new Date(dateWithTimezone).toISOString(),
                      },
                    },
                  }
                : {}),
            },
            transaction,
            raw: true,
          });
          return {
            loginUserId: record.loginUserId,
            totalRecords: record["totalRecords"],
            ...unflatten(latestRecord),
          };
        })
      );
      latestRecords = latestRecords.filter((el) => el?.id);
      const newData = await applyCustomlimitsearchsorting(latestRecords, query);
      responseObj["data"] = newData;
      responseObj["count"] = latestRecords.length;
      responseObj["lastPage"] =
        page && limit ? Math.ceil(latestRecords.length / +limit) : undefined;
    } else {
      let data = await Employee.findAll({
        include: includes,
        where: {
          ...(startDate && endDate && dateWithTimezone
            ? {
                startDate: {
                  [Op.or]: {
                    [Op.between]: [
                      moment(startDate).toDate(),
                      new Date(dateWithTimezone).toISOString(),
                    ],
                    [Op.eq]: moment(startDate).toDate(),
                    // [Op.eq]: new Date(dateWithTimezone).toISOString(),
                  },
                },
              }
            : {}),
          ...condition,
          segmentId: { [Op.not]: null },
          [Op.and]: [
            {
              ...(segmentIds?.length > 0 && {
                segmentId: { [Op.in]: segmentIds },
              }),
            },
            { ...(segmentId && { segmentId: segmentId }) },
            {
              ...(subSegmentIds?.length > 0 && {
                [Op.or]: [
                  { subSegmentId: { [Op.in]: subSegmentIds } },
                  { subSegmentId: null },
                ],
              }),
            },
            { ...(subSegmentId && { subSegmentId: subSegmentId }) },
          ],
        },
        order: orderBy,
        transaction,
      });
      data = parse(data).filter((el) => el?.id);
      const newData = await applyCustomPagination(data, query);
      responseObj["data"] = newData;
      responseObj["count"] = data?.length;
      responseObj["lastPage"] =
        page && limit ? Math.ceil(data?.length / +limit) : undefined;
    }
    return responseObj;
  }

  async getEmployeeDataSuggestiveDropdown(
    query: IQueryParameters,
    transaction: Transaction = null,
    user: User
  ) {
    const { clientId, activeStatus, isActive } = query;
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const segmentIds = getSegmentAccessForUser(user);
    const condition: any = {
      deletedAt: null,
      ...(activeStatus &&
        activeStatus != "all" && {
          terminationDate:
            activeStatus == "active" ||
            activeStatus == "pending" ||
            activeStatus == "rejected"
              ? { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } }
              : { [Op.not]: null, [Op.lte]: new Date() },
        }),
      ...(activeStatus &&
        activeStatus == "pending" && {
          isAdminApproved: null,
        }),
      ...(activeStatus &&
        activeStatus == "rejected" && {
          isAdminApproved: false,
        }),
      ...(activeStatus &&
        activeStatus == "active" && {
          isAdminApproved: true,
        }),
    };
    if (clientId) {
      condition.clientId = clientId;
    }
    const data = await this.getAll({
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: ["firstName", "lastName"],
        },
        {
          model: Segment,
          attributes: ["id"],
          ...(segmentIds?.length == 0 && { required: false }),
          ...(isActive && { required: true }),
          where: {
            ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
            ...(isActive && { isActive }),
          },
        },
        {
          model: SubSegment,
          attributes: ["id"],
          // ...(subSegmentIds?.length == 0 && { required: false }),
          required: false,
          where: {
            ...(subSegmentIds?.length > 0 && {
              id: { [Op.in]: subSegmentIds },
            }),
          },
        },
      ],
      attributes: [],
      where: {
        ...condition,
        segmentId: { [Op.not]: null },
        [Op.and]: [
          {
            ...(segmentIds?.length > 0 && {
              segmentId: { [Op.in]: segmentIds },
            }),
          },
          {
            ...(subSegmentIds?.length > 0 && {
              [Op.or]: [
                { subSegmentId: { [Op.in]: subSegmentIds } },
                { subSegmentId: null },
              ],
            }),
          },
        ],
      },
      transaction,
    });
    const dropdownData = data?.map((finalData) => {
      return {
        label: `${finalData?.loginUserData?.lastName} ${finalData?.loginUserData?.firstName}`,
        value: `${finalData?.loginUserData?.firstName} ${finalData?.loginUserData?.lastName}`,
        // value: `${finalData?.loginUserData?.lastName} ${finalData?.loginUserData?.firstName}`,
      };
    });

    // Remove duplicate entries from dropdowndata
    const uniqueArray = dropdownData.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.value === value.value)
    );

    return uniqueArray;
  }

  async getAllEmployeeContracts(params: any) {
    try {
      const { loginuserid } = params;
      const employeeData = await this.getAll({
        where: {
          loginUserId: loginuserid,
        },
        include: [
          {
            model: Client,
            attributes: ["id", "loginUserId"],
            where: { isActive: true },
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return parse(employeeData);
    } catch (error) {
      console.log("error in getAllEmployeeContracts", error);
      throw new Error(error);
    }
  }

  async getEmployeeDataService(query: IQueryParameters, user: User) {
    const { clientId, isTerminatatedEmployee, isActive } = query;
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const segmentIds = getSegmentAccessForUser(user);
    let data = await this.getAllData({
      include: [
        {
          model: LoginUser,
          attributes: ["firstName", "lastName"],
          where: {
            ...(user.roleData.isViewAll &&
            user.roleData.name === DefaultRoles.Employee
              ? { id: user.loginUserId }
              : {}),
          },
        },
        {
          model: Segment,
          ...(segmentIds?.length == 0 && { required: false }),
          ...(isActive && { required: true }),
          attributes: ["name", "id"],
          where: {
            ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
            ...(isActive === true && { isActive: true }),
          },
          include: [
            {
              model: SegmentManager,
              attributes: ["segmentId", "id", "loginUserId", "clientId"],
              include: [
                {
                  model: LoginUser,
                  attributes: ["firstName", "lastName", "name", "id"],
                },
              ],
            },
          ],
        },
        {
          model: SubSegment,
          // ...(subSegmentIds?.length == 0 && { required: false }),
          required: false,
          attributes: ["name", "id"],
          where: {
            ...(subSegmentIds?.length > 0 && {
              id: { [Op.in]: subSegmentIds },
            }),
            ...(isActive === true && { isActive: true }),
          },
        },
      ],
      attributes: ["id", "employeeNumber"],
      where: {
        deletedAt: null,
        ...(clientId ? { clientId: clientId } : {}),
        ...(isTerminatatedEmployee.toString() === "false" && {
          terminationDate: { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } },
        }),
        // terminationDate: { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } },
        isAdminApproved: true,
        [Op.and]: [
          {
            ...(segmentIds?.length > 0 && {
              segmentId: { [Op.in]: segmentIds },
            }),
          },
          {
            ...(subSegmentIds?.length > 0 && {
              [Op.or]: [
                { subSegmentId: { [Op.in]: subSegmentIds } },
                { subSegmentId: null },
              ],
            }),
          },
        ],
      },
      order: [["employeeNumber", "asc"]],
    });
    data = parse(data);

    const responseObj = {
      data: data?.rows,
      count: data?.count,
    };
    return responseObj;
  }
  // old segement list API

  // async getSegmentDropdownData(query: IQueryParameters, user: User) {
  //   const { clientId, isActive } = query;
  //   const segmentIds = getSegmentAccessForUser(user);
  //   const subSegmentIds = getSubSegmentAccessForUser(user);
  //   const employeeSegment = await this.getAll({
  //     attributes: ["id"],
  //     include: [
  //       { model: LoginUser, required: true, attributes: ["id"] },
  //       { model: Segment, attributes: ["id", "name", "isActive"] },
  //       { model: SubSegment, attributes: ["id", "name", "isActive"] },
  //     ],
  //     where: {
  //       clientId: clientId,
  //       segmentId: { [Op.not]: null },
  //       [Op.and]: [
  //         {
  //           ...(segmentIds?.length > 0 && {
  //             segmentId: { [Op.in]: segmentIds },
  //           }),
  //         },
  //         {
  //           ...(subSegmentIds?.length > 0 && {
  //             [Op.or]: [
  //               { subSegmentId: { [Op.in]: subSegmentIds } },
  //               { subSegmentId: null },
  //             ],
  //           }),
  //         },
  //       ],
  //     },
  //   });
  //   const segmentOptionList = [];
  //   for (const empData of employeeSegment) {
  //     if (
  //       (isActive &&
  //         empData?.segment?.id &&
  //         empData?.segment?.isActive &&
  //         (empData?.subSegment?.id ? empData?.subSegment?.isActive : "")) ||
  //       empData?.segment?.id
  //     ) {
  //       const sData = {
  //         value:
  //           `${empData?.segment?.id}` +
  //           (empData?.subSegment?.id ? `-${empData?.subSegment?.id}` : ""),
  //         label:
  //           `${empData.segment.name}` +
  //           (empData?.subSegment?.name ? `-${empData?.subSegment?.name}` : ""),
  //       };
  //       const findIndex = segmentOptionList.findIndex(
  //         (slist) => slist.value == sData.value
  //       );
  //       if (findIndex == -1) segmentOptionList.push(sData);
  //     }
  //   }
  //   console.log("segmentOptionList", segmentOptionList);
  //   return segmentOptionList;
  // }

  async getSegmentDropdownData(query: IQueryParameters, user: User) {
    const {
      clientId,
      // isActive
    } = query;
    const segmentIds = getSegmentAccessForUser(user);
    const subSegmentIds = getSubSegmentAccessForUser(user);
    let filter: any = {};
    if (clientId) {
      filter["clientId"] = clientId;
    }
    const employeeSegment = await this.getAll({
      attributes: ["id"],
      include: [
        { model: LoginUser, required: true, attributes: ["id"] },
        { model: Segment, attributes: ["id", "name", "isActive"] },
        // { model: SubSegment, attributes: ["id", "name", "isActive"] },
      ],
      where: {
        ...filter,
        segmentId: { [Op.not]: null },
        [Op.and]: [
          {
            ...(segmentIds?.length > 0 && {
              segmentId: { [Op.in]: segmentIds },
            }),
          },
        ],
      },
    });
    const segmentOptionList = [];

    for (const element of employeeSegment) {
      const sData = {
        value: element.segment.id || "",
        label: element.segment.name || "",
      };
      const findIndex = segmentOptionList.findIndex(
        (slist) => slist.value == sData.value
      );
      if (findIndex == -1) segmentOptionList.push(sData);
    }
    return segmentOptionList;
  }

  async getAllSegmentDropdownData(query: IQueryParameters, user: User) {
    const {
      clientId,
      // isActive
    } = query;

    let allclients = await Client.findAll({
      where: { deletedAt: null, isActive: true },
      attributes: ["id"],
    });
    allclients = parse(allclients).map((el) => el?.id);
    let filter: any = {
      clientId: { [Op.in]: clientId ? [clientId] : allclients },
    };

    let data = await Segment.findAll({
      where: {
        deletedAt: null,
        ...filter,
      },
      attributes: [
        "code",
        "clientId",
        [Sequelize.literal("id"), "value"],
        [Sequelize.literal("name"), "label"],
      ],
      order: [["name", "asc"]],
    });
    data = parse(data);
    return data;
  }

  async getSubSegmentDropdownData(query: IQueryParameters, user: User) {
    const { clientId, segmentId, isActive } = query;
    const segmentIds = getSegmentAccessForUser(user);
    const subSegmentIds = getSubSegmentAccessForUser(user);
    let filter: any = {
      segmentId: segmentId,
    };
    if (clientId) {
      filter.clientId = clientId;
    }
    const employeeSegment = await this.getAll({
      attributes: ["id"],
      include: [
        { model: LoginUser, required: true, attributes: ["id"] },
        { model: Segment, attributes: ["id", "name", "isActive"] },
        { model: SubSegment, attributes: ["id", "name", "isActive"] },
      ],
      where: {
        ...filter,
        subSegmentId: { [Op.not]: null },
        [Op.and]: [
          {
            ...(subSegmentIds?.length > 0 && {
              [Op.or]: [
                { subSegmentId: { [Op.in]: subSegmentIds } },
                { subSegmentId: null },
              ],
            }),
          },
        ],
      },
    });

    const segmentOptionList = [];
    for (const element of employeeSegment) {
      const sData = {
        segmentId: element?.segment?.id,
        value: element?.subSegment?.id,
        label: element?.subSegment?.name,
      };
      const findIndex = segmentOptionList.findIndex(
        (slist) => slist.value == sData.value
      );
      if (findIndex == -1) segmentOptionList.push(sData);
    }
    return segmentOptionList;
  }

  async getEmployeeByIdService(id: number, transaction: Transaction = null) {
    try {
      const isFound = await Employee.findOne({
        include: [
          {
            model: LoginUser,
            attributes: [
              "firstName",
              "lastName",
              "gender",
              "birthDate",
              "placeOfBirth",
              "email",
              "phone",
              "timezone",
              "profileImage",
              "timezone_utc",
              "dateformat",
              "timeformat",
              "language",
              "currency",
            ],
          },
          {
            model: Client,
            attributes: [
              "id",
              "country",
              "contractTagline",
              "contractN",
              "code",
              "currency",
              "address",
              "startMonthBack",
            ],
            include: [
              {
                model: LoginUser,
                attributes: ["name"],
              },
            ],
          },
          {
            model: Segment,
            attributes: ["name", "id"],
          },
          {
            model: SubSegment,
            attributes: ["name", "id"],
          },

          {
            model: Rotation,
            attributes: ["name", "id", "isResident", "weekOn", "weekOff"],
          },
          {
            model: Bank,
            attributes: ["id", "bankName", "ribNumber", "loginUserId"],
          },
          {
            model: EmployeeSalary,
            as: "employeeSalary",
            attributes: ["startDate"],
            separate: true,
            limit: 1,
            order: [["startDate", "desc"]],
          },
          {
            model: EmployeeContract,
            // attributes: ['newContractNumber','id','contract'],
          },
          {
            model: EmployeeSegment,
            as: "employeeSegment",
            attributes: ["date", "id", "rollover"],
          },
          {
            model: MedicalRequest,
            attributes: ["medicalDate"],
          },
          {
            model: Timesheet,
            attributes: ["id"],
            where: { status: "APPROVED" },
            required: false,
          },
          {
            model: ReliquatCalculation,
            where: {
              [Op.and]: [
                {
                  startDate: { [Op.lte]: moment().toDate() },
                },
                {
                  endDate: { [Op.gte]: moment().toDate() },
                },
              ],
            },
            attributes: ["id", "reliquat"],
            order: [["id", "desc"]],
            limit: 1,
          },
          {
            model: EmployeeCatalogueNumber,
            required: false,
          },
          {
            model: EmployeeBonus,
            required: false,
            where: {
              endDate: {
                [Op.eq]: null,
              },
            },
            include: [
              {
                model: BonusType,
                attributes: ["id", "name", "code"],
              },
            ],
          },
        ],
        where: { id: id, deletedAt: null },
        order: [["employeeCatalogueNumber", "startDate", "desc"]],
        transaction,
      });
      if (!isFound) {
        throw new HttpException(404, this.msg.notFound);
      }

      let dataEmpRole = await UserPermission.findOne({
        where: {
          loginUserId: isFound.loginUserId,
        },
        include: [
          {
            model: Role,
          },
        ],
      });
      dataEmpRole = parse(dataEmpRole);

      let reliquatCalculation = null;
      const data = parse(isFound);
      reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService(
        {
          employeeId: String(isFound?.id),
          date: moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate(),
        }
      );

      data.roleId = dataEmpRole?.roleId;
      data.empReliquatCalculation = reliquatCalculation ?? null;
      if (data?.employeeCatalogueNumber?.length > 1) {
        data["employeeCatalogueNumber"] = {
          catalogueNumber:
            data["employeeCatalogueNumber"]?.[1]?.catalogueNumber ?? null,
        };
      } else {
        data["employeeCatalogueNumber"] = {
          catalogueNumber:
            data["employeeCatalogueNumber"]?.[0]?.catalogueNumber ?? null,
        };
      }
      let employeeTimesheetData = await Employee.findOne({
        where: { id: id, deletedAt: null },
        include: [
          { model: LoginUser, attributes: ["email"] },
          { model: Timesheet, attributes: ["id", "status", "endDate"] },
        ],
        order: [["timeSheet", "startDate", "desc"]],
        transaction,
      });
      employeeTimesheetData = parse(employeeTimesheetData);
      const findApprovedTimesheetIndex = employeeTimesheetData?.timeSheet?.findIndex(
        (e) => e?.status === "APPROVED"
      );
      const timesheetApprovedDate = moment(
        employeeTimesheetData?.timeSheet?.[findApprovedTimesheetIndex]
          ?.endDate ?? employeeTimesheetData?.startDate
      )
        .add(1, "day")
        .toDate();
      data["timesheetApprovedDate"] = timesheetApprovedDate;
      return data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getEmployeeBySlugService(slug: string) {
    try {
      const getLoginId = await Employee.findOne({
        where: {
          slug: slug,
        },
        attributes: [
          "id",
          "loginUserId",
          "terminationDate",
          "clientId",
          "startDate",
        ],
      });

      let isFound = await Employee.findAll({
        include: [
          {
            model: LoginUser,
            attributes: [
              "firstName",
              "lastName",
              "gender",
              "birthDate",
              "placeOfBirth",
              "email",
              "phone",
              "profileImage",
              "timezone",
              "timezone_utc",
              "dateformat",
              "timeformat",
              "language",
              "currency",
            ],
            include: [
              {
                model: User,
                required: false,
                attributes: ["id", "status"],
                where: {
                  status: "ACTIVE",
                },
              },
            ],
          },
          {
            model: Client,
            attributes: [
              "id",
              "startMonthBack",
              "country",
              "currency",
              "endDate",
              // "loginUserId"
            ],
            include: [
              {
                model: LoginUser,
                required: true,
                attributes: [
                  "name",
                  "email",
                  "timezone",
                  "dateformat",
                  "timeformat",
                  "currency",
                ],
              },
            ],
          },
          {
            model: Segment,
            attributes: ["name", "slug", "id", "isActive"],
          },
          {
            model: SubSegment,
            attributes: ["name", "slug", "id", "isActive"],
          },
          {
            model: Bank,
            attributes: ["id", "bankName", "ribNumber", "loginUserId"],
          },
          {
            model: Rotation,
            attributes: ["name", "id"],
          },
          {
            model: EmployeeSegment,
            as: "employeeSegment",
            attributes: ["date", "id", "rollover"],
            include: [
              {
                model: Segment,
                as: "segment",
                attributes: ["slug", "name", "id"],
              },
              {
                model: SubSegment,
                as: "subSegment",
                attributes: ["slug", "name", "id"],
              },
            ],
          },
          // {
          // 	model: ReliquatCalculation,
          // 	where: {
          // 		[Op.and]: [
          // 			{
          // 				startDate: { [Op.lte]: moment().toDate() },
          // 			},
          // 			{
          // 				endDate: { [Op.gte]: moment().toDate() },
          // 			},
          // 		],
          // 	},
          // 	attributes: ['id', 'reliquat'],
          // 	order: [['id', 'desc']],
          // 	limit: 1,
          // },
          {
            model: EmployeeSalary,
            attributes: [
              "baseSalary",
              "monthlySalary",
              "dailyCost",
              "startDate",
              "endDate",
            ],
          },
          {
            model: EmployeeBonus,
            required: false,
            include: [
              {
                model: BonusType,
                attributes: ["id", "name", "code"],
              },
            ],
          },
          {
            model: EmployeeCatalogueNumber,
            required: false,
          },
          {
            model: EmployeeRotation,
            attributes: ["date", "id"],
            include: [
              {
                model: Rotation,
                as: "rotation",
                attributes: ["name", "id"],
              },
            ],
          },
          {
            model: EmployeeContract,
            attributes: ["newContractNumber", "endDate"],
          },
          {
            model: MedicalRequest,
            attributes: ["medicalDate"],
          },
        ],
        order: [
          [{ model: EmployeeSegment, as: "employeeSegment" }, "date", "desc"],
          [
            { model: EmployeeSalary, as: "employeeSalary" },
            "startDate",
            "desc",
          ],
          [{ model: EmployeeRotation, as: "employeeRotation" }, "date", "desc"],
          [
            { model: EmployeeContract, as: "employeeContracts" },
            "endDate",
            "desc",
          ],
          [{ model: EmployeeBonus, as: "employeeBonus" }, "bonusId", "asc"],
          [{ model: EmployeeBonus, as: "employeeBonus" }, "endDate", "desc"],
          [
            { model: EmployeeCatalogueNumber, as: "employeeCatalogueNumber" },
            "startDate",
            "asc",
          ],
        ],
        where: {
          // loginUserId: getLoginId.loginUserId,
          // clientId: getLoginId.clientId,
          id: getLoginId?.id,
          deletedAt: null,
        },
      });
      isFound = parse(isFound);

      const findEmployeeIdIndex = isFound?.findIndex(
        (e) =>
          moment().isSameOrBefore(e.startDate) ||
          moment().isSameOrAfter(e.startDate)
      );

      const latestStartDate =
        isFound[findEmployeeIdIndex >= 0 ? findEmployeeIdIndex : 0]?.startDate;
      let reliquatCalculation = null;
      if (findEmployeeIdIndex >= 0) {
        let date;
        if (getLoginId?.terminationDate !== null) {
          date = moment(
            moment(getLoginId.terminationDate).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate();
          reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService(
            {
              employeeId: String(getLoginId?.id),
              date,
            }
          );
        } else {
          date = moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate();
          reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService(
            {
              employeeId: String(getLoginId?.id),
              date,
            }
          );
        }
        if (reliquatCalculation === undefined) {
          const reliquatCalculationData = await this.reliquatCalculationRepo.get(
            {
              where: {
                employeeId: String(getLoginId?.id),
                startDate: {
                  [Op.lte]: date,
                },
              },
              order: [["startDate", "desc"]],
            }
          );
          reliquatCalculation = reliquatCalculationData?.reliquat;
        }
      }

      if (!isFound) {
        throw new HttpException(404, this.msg.notFound);
      }

      let employeeSegment = [];
      let employeeSalary = [];
      let employeeRotation = [];
      let employeeContracts = [];
      let employeeBonus = [];
      let employeeTimesheetStatus = true;

      const isTimesheetApproved = await Timesheet.findOne({
        where: {
          status: "APPROVED",
          employeeId: getLoginId?.id,
        },
        include: [
          {
            model: Employee,
            attributes: ["id"],
          },
        ],
      });
      if (isTimesheetApproved) {
        employeeTimesheetStatus = false;
      }

      for (const data of isFound) {
        if (data?.terminationDate !== null) {
          // if (data?.employeeSalary?.length > 0) {
          // 	data?.employeeSalary.forEach((e: any, index) => {
          // 		if (index === 0) {
          // 			e.endDate = moment(data.terminationDate).toDate();
          // 		} else {
          // 			e.endDate = moment(data?.employeeSalary[index - 1].startDate).toDate();
          // 		}
          // 	});
          // }
          if (data?.employeeRotation?.length > 0) {
            data?.employeeRotation.forEach((e: any, index) => {
              if (index === 0) {
                e.endDate = moment(data.terminationDate).toDate();
              } else {
                e.endDate = moment(
                  data?.employeeRotation[index - 1].date
                ).toDate();
              }
            });
          }
          if (data?.employeeSegment?.length > 0) {
            data?.employeeSegment.forEach((d: any, index) => {
              if (index === 0) {
                d.endDate = moment(data.terminationDate).toDate();
              } else {
                d.endDate = moment(
                  data?.employeeSegment[index - 1].date
                ).toDate();
              }
            });
          }
        } else {
          // if (data?.employeeSalary?.length > 0) {
          // 	data?.employeeSalary.forEach((e: any, index) => {
          // 		if (index === 0) {
          // 			e.endDate = null;
          // 		} else {
          // 			e.endDate = moment(data?.employeeSalary[index - 1].startDate).toDate();
          // 		}
          // 	});
          // }
          if (data?.employeeRotation?.length > 0) {
            data?.employeeRotation.forEach((e: any, index) => {
              if (index === 0) {
                e.endDate = null;
              } else {
                e.endDate = moment(
                  data?.employeeRotation[index - 1].date
                ).toDate();
              }
            });
          }
          if (data?.employeeSegment?.length > 0) {
            data?.employeeSegment.forEach((d: any, index) => {
              if (index === 0) {
                d.endDate = null;
              } else {
                d.endDate = moment(
                  data?.employeeSegment[index - 1].date
                ).toDate();
              }
            });
          }
        }

        employeeSegment = [...employeeSegment, ...data.employeeSegment];

        employeeSalary = [...employeeSalary, ...data.employeeSalary];
        employeeRotation = [...employeeRotation, ...data.employeeRotation];
        employeeContracts = [...employeeContracts, ...data.employeeContracts];
        employeeBonus = [...employeeBonus, ...data.employeeBonus];
      }

      // employee has been requested for termination or not
      const terminationRequest = await EmployeeStatusRequest.findOne({
        where: {
          employeeId: getLoginId.id,
          clientId: getLoginId.clientId,
          status: reqStatus.PENDING,
        },
      });

      const data = {
        ...isFound[findEmployeeIdIndex >= 0 ? findEmployeeIdIndex : 0],
        employeeTimesheetStatus: employeeTimesheetStatus,
        startDate: getLoginId.startDate,
        reliquatCalculationValue: reliquatCalculation ?? null,
        employeeSegment,
        employeeSalary,
        employeeRotation,
        employeeBonus,
        employeeContracts,
        latestStartDate,
        isStatusRequested: terminationRequest ? true : false,
        requestType: terminationRequest?.requestType,
      };
      return data;
    } catch (error) {
      console.log({ error });
    }
  }

  async addEmployeeService({
    body,
    user,
    image,
    transaction = null,
  }: {
    body: IEmployeeCreate;
    user: User;
    image: Express.Multer.File;
    transaction: Transaction;
  }) {
    const newBody = {
      ...body,
      rotationId:
        body.employeeType == "Resident" ? body.residentId : body.rotationId,
    };
    newBody.startDate = moment(
      moment(newBody.startDate).format("DD-MM-YYYY"),
      "DD-MM-YYYY"
    ).toDate();
    if (newBody.contractEndDate) {
      newBody.contractEndDate = moment(
        moment(newBody.contractEndDate).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate();
    }
    if (newBody?.customBonus && typeof newBody.customBonus === "string") {
      newBody.customBonus = JSON.parse(newBody.customBonus);
    }
    if (
      newBody?.employeeStatus &&
      newBody?.employeeStatus?.length > 0 &&
      typeof newBody?.employeeStatus === "object"
    ) {
      const employeeStatusArr: string[] = newBody?.employeeStatus;
      newBody.employeeStatus =
        newBody.employeeStatus &&
        employeeStatusArr[employeeStatusArr?.length - 1];
    }
    newBody.customBonus = JSON.stringify(newBody.customBonus);
    if (image?.filename) newBody.profilePicture = `${image?.filename}`;
    else if (newBody.profilePicture === null || newBody.profilePicture === "")
      newBody.profilePicture = null;

    if (newBody.email) {
      const isExistEmail = await LoginUser.findOne({
        where: { email: { [Op.iLike]: newBody.email }, deletedAt: null },
        transaction,
      });
      if (isExistEmail) {
        throw new HttpException(
          200,
          "Email Already Exist in this platform",
          {},
          true
        );
      }
    }

    const isAdmin = await Role.findOne({
      where: {
        name: "super admin",
        deletedAt: null,
      },
      attributes: ["id", "name"],
      transaction,
    });
    let data = null;
    if (isAdmin?.id == user?.roleId) {
      const isAdminEmployee = true;
      data = await this.createEmployeeRelatedData(
        newBody,
        user,
        isAdminEmployee,
        transaction
      );
    } else {
      const randomPassword = generateUniquePassword();
      const slugifyEmployee = body.employeeNumber + createRandomHash(5);
      const slug = slugify(slugifyEmployee, { lower: true, replacement: "-" });
      let loginUserData =
        (await LoginUser.findOne({
          where: {
            uniqueLoginId: `${newBody.firstName}${newBody.lastName}${
              newBody.dOB ? moment(newBody.dOB).format("YYYYMMDD") : ""
            }`
              ?.replace(" ", "")
              .toLowerCase(),
            deletedAt: null,
          },
          transaction,
        })) || null;
      loginUserData = parse(loginUserData);
      if (!loginUserData) {
        loginUserData = await LoginUser.create(
          {
            email: newBody.email,
            name: newBody.firstName + " " + newBody.lastName,
            timezone: newBody.timezone,
            firstName: newBody.firstName,
            lastName: newBody.lastName,
            birthDate: newBody.dOB,
            placeOfBirth: newBody.placeOfBirth,
            gender: newBody.gender,
            phone: newBody.mobileNumber,
            randomPassword: randomPassword,
            profileImage: newBody.profilePicture,
            isMailNotification: false,
            // timezone_utc: newBody.timezone,
            dateformat: newBody.dateformat,
            timeformat: newBody.timeformat,
            // currency: newBody.currency,
            uniqueLoginId: `${newBody.firstName}${newBody.lastName}${
              newBody.dOB ? moment(newBody.dOB).format("YYYYMMDD") : ""
            }`
              ?.replace(" ", "")
              .toLowerCase(),
          },
          { transaction }
        );
      }
      data = await Employee.create(
        {
          ...newBody,
          slug,
          loginUserId: loginUserData.id,
          createdBy: user.id,
          isAdminApproved: null,
          fonctionDate: newBody.startDate,
        },
        { transaction }
      );
      const rollover = newBody?.rollover;
      if (data?.customBonus && JSON.parse(data?.customBonus)) {
        let newBonusJson =
          JSON.parse(data.customBonus)?.data?.length > 0
            ? JSON.parse(data.customBonus)?.data
            : [];
        newBonusJson = newBonusJson.sort((a, b) => {
          a.bonusId > b.bonusId;
        });
        for (const insertData of newBonusJson) {
          await EmployeeBonus.create(
            {
              employeeId: data.id,
              bonusId: insertData.id,
              price: insertData.price,
              coutJournalier: insertData.coutJournalier,
              startDate: moment(insertData.startDate, "DD/MM/YYYY").toDate(),
              catalogueNumber: insertData?.catalogueNumber ?? null,
            },
            { transaction }
          );
        }
        newBonusJson = newBonusJson.map((delDate) => {
          delete delDate.startDate;
          return delDate;
        });
        data.customBonus = JSON.stringify({ data: newBonusJson });
        await Employee.update(
          { customBonus: data.customBonus },
          { where: { id: data.id }, transaction, individualHooks: true }
        );
      }
      await EmployeeRotation.create(
        {
          employeeId: data?.id,
          rotationId: data?.rotationId,
          date: moment(
            moment(data?.startDate || null).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
          createdBy: user?.id,
        },
        { transaction }
      );

      await EmployeeSalary.create(
        {
          employeeId: data.id,
          baseSalary: Number(data?.baseSalary ?? 0.0),
          monthlySalary: Number(data?.monthlySalary ?? 0.0),
          dailyCost: Number(data?.dailyCost ?? 0.0),
          startDate: data?.startDate ?? new Date(),
          endDate: null,
          createdBy: user?.id,
        },
        { transaction }
      );

      if (data?.segmentId) {
        await EmployeeSegment.create(
          {
            employeeId: data?.id,
            segmentId: data?.segmentId || null,
            subSegmentId: data?.subSegmentId || null,
            date: moment(
              moment(data?.startDate || null).format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
            rollover: rollover,
            createdBy: user?.id,
          },
          { transaction }
        );
      }

      const clientData = await Client.findOne({
        where: { id: newBody.clientId },
        attributes: ["id"],
        include: [
          { model: LoginUser, attributes: ["firstName", "lastName", "name"] },
        ],
        transaction,
      });
      const replacement = {
        employeeName: body.firstName + " " + body.lastName,
        employeeNumber: newBody?.employeeNumber,
        clientName:
          clientData?.loginUserData?.firstName &&
          clientData?.loginUserData?.lastName
            ? clientData?.loginUserData?.firstName +
              " " +
              clientData?.loginUserData?.lastName
            : clientData?.loginUserData?.name,
        userName: user?.loginUserData?.name,
        logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
      };

      // await sendMail(
      //   ["nihad@3spf.com", "admin@lred.com"],
      //   "Employee Creation Notification",
      //   "employeeCreation",
      //   replacement
      // );

      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE,
          moduleName: moduleName.EMPLOYEES,
          userId: user?.id,
          lastlogintime: user?.loginUserData?.logintimeutc,
          custom_message: await customHistoryCreateMessage(
            user,
            tableEnum.EMPLOYEE,
            data
          ),
          jsonData: parse(data),
          activity: statusEnum.CREATE,
        },
        transaction
      );
    }
    data = parse(data);
    if (data) {
      await EmployeeCatalogueNumber.create(
        {
          employeeId: data?.id,
          startDate: null,
          catalogueNumber: body?.catalogueNumber ?? null,
        },
        { transaction }
      );
    }
    return data;
  }

  async updateEmployeeService({
    body,
    user,
    id,
    image,
    transaction,
  }: {
    body: IEmployeeCreate;
    user: User;
    id: number;
    image: Express.Multer.File;
    transaction: Transaction;
  }) {
    try {
      const isExist = await Employee.findOne({
        where: { id: id, deletedAt: null },
        include: [
          { model: LoginUser, attributes: ["email"] },
          { model: EmployeeBonus },
        ],
        transaction,
        order: [["employeeBonus", "bonusId", "asc"]],
      });
      if (!isExist) {
        throw new HttpException(403, this.msg.notFound);
      }
      const newBody = {
        ...body,
        rotationId:
          body.employeeType == "Resident" ? body.residentId : body.rotationId,
      };
      if (newBody?.customBonus && typeof newBody.customBonus === "string") {
        newBody.customBonus = JSON.parse(newBody.customBonus);
      }

      if (
        newBody?.employeeStatus &&
        newBody?.employeeStatus?.length > 0 &&
        typeof newBody?.employeeStatus === "object"
      ) {
        const employeeStatusArr: string[] = newBody?.employeeStatus;
        newBody.employeeStatus =
          newBody.employeeStatus &&
          employeeStatusArr[employeeStatusArr?.length - 1];
      }

      if (newBody?.email !== isExist?.loginUserData?.email) {
        const isExistEmail = await LoginUser.findOne({
          where: {
            email: { [Op.iLike]: newBody?.email },
            id: { [Op.ne]: isExist.loginUserId },
            deletedAt: null,
          },
          transaction,
        });
        if (isExistEmail) {
          throw new HttpException(
            200,
            "Email Already Exist in this platform",
            {},
            true
          );
        }
      }
      
      if (newBody.startDate) {
        newBody.startDate = moment(
          moment(newBody.startDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();
      }
      
      if (newBody.contractEndDate) {
        newBody.contractEndDate = moment(
          moment(newBody.contractEndDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();
      }
      if (newBody.salaryDate) {

        newBody.salaryDate = moment(
          moment(newBody.salaryDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();
      }
      if (
        newBody?.startDate !== undefined &&
        newBody?.startDate &&
        !moment(newBody?.startDate).isSame(
          moment(
            moment(isExist?.startDate).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate()
        )
      ) {

        await EmployeeBonus.update(
          {
            startDate: newBody.startDate,
          },
          {
            where: {
              employeeId: isExist?.id,
              endDate: null,
            },
            transaction,
            individualHooks: true,
          }
        );
      }
      if (
        newBody?.customBonus &&
        JSON.parse(JSON.stringify(newBody?.customBonus))
      ) {
        let newBonusJson =
          JSON.parse(JSON.stringify(newBody.customBonus))?.data?.length > 0
            ? newBody.customBonus?.data
            : [];
        newBonusJson = newBody.customBonus.data.sort((a, b) => {
          a.bonusId > b.bonusId;
        });
        const existingBonusData = parse(isExist?.employeeBonus ?? []);
        for (const insertData of newBonusJson) {
          const foundIndex = existingBonusData.findIndex(
            (data) => data.bonusId === insertData.id && data.endDate === null
          );
          if (foundIndex < 0) {
            await EmployeeBonus.create(
              {
                employeeId: id,
                bonusId: insertData.id,
                price: insertData.price,
                coutJournalier: insertData.coutJournalier,
                startDate: moment(insertData.startDate, "DD/MM/YYYY").toDate(),
                catalogueNumber: insertData?.catalogueNumber ?? null,
              },
              { transaction }
            );
          } else {
            const updateData = existingBonusData.find(
              (data) => data.bonusId === insertData.id && data.endDate === null
            );
            if (
              moment(updateData.startDate).format("DD/MM/YYYY") !==
              insertData.startDate
            ) {
              await EmployeeBonus.update(
                {
                  endDate: moment(insertData.startDate, "DD/MM/YYYY").toDate(),
                },
                {
                  where: {
                    id: updateData.id,
                  },
                  transaction,
                  individualHooks: true,
                }
              );
              await EmployeeBonus.create(
                {
                  employeeId: id,
                  bonusId: insertData.id,
                  price: insertData.price,
                  coutJournalier: insertData.coutJournalier,
                  startDate: moment(
                    insertData.startDate,
                    "DD/MM/YYYY"
                  ).toDate(),
                  catalogueNumber: insertData?.catalogueNumber ?? null,
                },
                { transaction }
              );
            } else {
              await EmployeeBonus.update(
                {
                  employeeId: id,
                  bonusId: insertData.id,
                  price: insertData.price,
                  coutJournalier: insertData.coutJournalier,
                  startDate: moment(
                    insertData.startDate,
                    "DD/MM/YYYY"
                  ).toDate(),
                  catalogueNumber: insertData?.catalogueNumber ?? null,
                },
                {
                  where: {
                    id: updateData.id,
                  },
                  transaction,
                  individualHooks: true,
                }
              );
            }
          }
        }
        for (const deleteData of existingBonusData) {
          if (deleteData.endDate === null) {
            const foundIndex = newBonusJson.findIndex(
              (data) => data.id === deleteData.bonusId
            );
            if (foundIndex === -1) {
              await EmployeeBonus.update(
                {
                  endDate: moment(
                    moment().format("DD-MM-YYYY"),
                    "DD-MM-YYYY"
                  ).toDate(),
                },
                {
                  where: { id: deleteData.id },
                  transaction,
                  individualHooks: true,
                }
              );
            }
          }
        }
        newBody.customBonus.data = newBody.customBonus.data.map((data) => {
          delete data.startDate;
          return data;
        });
        newBody.customBonus = JSON.stringify(newBody.customBonus);
      }
      // if (image?.filename) newBody.profilePicture = `/profilePicture/${image?.filename}`;
      if (image && image?.filename)
        newBody.profilePicture = `${image?.filename}`;

      const slugifyEmployee = body.employeeNumber + createRandomHash(5);
      let slug = slugify(slugifyEmployee, { lower: true, replacement: "-" });

      let randomPassword: string;
      if (
        isExist?.loginUserData?.email !== newBody?.email &&
        !isExist?.loginUserData?.password
      ) {
        randomPassword = generateUniquePassword();
      }
      slug = newBody?.profileType ? isExist.slug : slug;
      await Employee.update(
        { ...newBody, slug, updatedBy: user.id },
        { where: { id: id }, transaction, individualHooks: true }
      );

      if (newBody?.fonction && isExist?.fonction !== newBody?.fonction) {
        await Employee.update(
          {
            fonctionDate: moment(
              moment().format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
          },
          { where: { id: id }, transaction, individualHooks: true }
        );
      }

      if (!newBody.terminationDate) {
        const systemtimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await LoginUser.update(
          {
            email: newBody.email,
            firstName: newBody.firstName,
            lastName: newBody.lastName,
            timezone: newBody.timezone,
            birthDate: newBody.dOB,
            placeOfBirth: newBody.placeOfBirth,
            gender: newBody.gender,
            phone: newBody.mobileNumber,
            // timezone_utc: newBody.timezone,
            dateformat: newBody.dateformat,
            timeformat: newBody.timeformat,
            // currency: newBody.currency,
            language: newBody.language,
            profileImage: typeof newBody.profilePicture === 'string' && newBody.profilePicture.includes("profilePicture")
            ? newBody.profilePicture?.replace("profilePicture", "")
            : newBody.profilePicture,
            ...(randomPassword && {
              randomPassword: await bcrypt.hash(randomPassword, 10),
            }),
          },
          {
            where: { id: isExist.loginUserId },
            transaction,
            individualHooks: true,
          }
        );

        const isExistCatalogue = await EmployeeCatalogueNumber.findOne({
          where: {
            employeeId: isExist?.id,
          },
          transaction,
          order: [["id", "desc"]],
        });
        if (
          body?.catalogueNumber !== undefined &&
          isExistCatalogue?.catalogueNumber !== body?.catalogueNumber
        ) {

          await EmployeeCatalogueNumber?.create(
            {
              employeeId: id,
              startDate: new Date(),
              catalogueNumber: body?.catalogueNumber ?? null,
            },
            { transaction }
          );
        }

        const isExistUser = await User.count({
          where: {
            loginUserId: isExist.loginUserId,
          },
        });

        if (isExistUser === 0) {
          const roleData = await Role.findOne({
            where: { name: "Employee", deletedAt: null },
            include: [{ model: RolePermission, attributes: ["permissionId"] }],
            transaction,
          });
          if (roleData) {
            await User.create(
              {
                loginUserId: isExist.loginUserId,
                roleId: roleData.id,
                status: status.ACTIVE,
              },
              { transaction }
            );
            roleData?.assignedPermissions?.map(
              async (permission: RolePermissionAttributes) => {
                await UserPermission.create(
                  {
                    permissionId: permission.permissionId,
                    loginUserId: isExist?.loginUserId,
                    roleId: roleData.id,
                    createdBy: user.id,
                  },
                  { transaction }
                );
              }
            );
          }
        }

        let rotationData = await EmployeeRotation.findOne({
          where: { employeeId: id },
          order: [["date", "desc"]],
          transaction,
        });

        rotationData = parse(rotationData);
        let employeeTimesheetData = await Employee.findOne({
          where: { id: id, deletedAt: null },
          include: [
            { model: LoginUser, attributes: ["email"] },
            { model: Timesheet, attributes: ["id", "status", "endDate"] },
          ],
          order: [["timeSheet", "startDate", "desc"]],
          transaction,
        });

        employeeTimesheetData = parse(employeeTimesheetData);
        const findApprovedTimesheetIndex = employeeTimesheetData.timeSheet.findIndex(
          (e) => e.status === "APPROVED"
        );
        const timesheetApprovedDate = moment(
          employeeTimesheetData?.timeSheet[findApprovedTimesheetIndex]?.endDate
        ).toDate();
        if (newBody?.rotationDate && newBody?.rotationId) {
          const employeeRotationData = await EmployeeRotation.findAll({
            where: {
              employeeId: id,
            },
            order: [["date", "desc"]],
            transaction,
            limit: 1,
          });
          if (employeeRotationData?.[0]?.date) {
            const newRotationDate = moment(newBody.rotationDate).format(
              "DD/MM/YYYY"
            );
            const oldRotationDate = moment(employeeRotationData[0].date).format(
              "DD/MM/YYYY"
            );
            if (
              !moment(moment(newRotationDate, "DD/MM/YYYY")).isSame(
                moment(oldRotationDate, "DD/MM/YYYY")
              ) ||
              rotationData?.rotationId !== newBody?.rotationId
            ) {
              const rotationDate = moment(
                newRotationDate,
                "DD/MM/YYYY"
              ).toDate();
              if (
                findApprovedTimesheetIndex >= 0 &&
                moment(rotationDate).isSameOrBefore(timesheetApprovedDate)
              ) {
                throw new HttpException(
                  200,
                  `Please enter the date after the last timesheet is approved ie. ${moment(
                    timesheetApprovedDate
                  )
                    .add(1, "day")
                    .format("DD/MM/YYYY")}`,
                  {},
                  true
                );
              }
            }
          }
        }
        if (rotationData?.rotationId != newBody.rotationId) {
          await TimesheetSchedule.destroy({
            where: {
              date: {
                [Op.gte]: moment(
                  moment(body.rotationDate ?? new Date()).format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
              },
              employeeId: id,
            },
            transaction,
          });
          let existingRotation = await EmployeeRotation.findOne({
            where: {
              employeeId: id,
              date: moment(
                moment(body.rotationDate ?? new Date()).format("DD-MM-YYYY"),
                "DD-MM-YYYY"
              ).toDate(),
            },
            transaction,
          });
          existingRotation = parse(existingRotation);
          if (!existingRotation) {
            await EmployeeRotation.create(
              {
                employeeId: id,
                rotationId: newBody.rotationId || null,
                date: moment(
                  moment(body.rotationDate ?? new Date()).format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
                createdBy: user.id,
              },
              { transaction }
            );
          } else {
            await EmployeeRotation.update(
              {
                employeeId: id,
                rotationId: newBody.rotationId || null,
                date: moment(
                  moment(body.rotationDate ?? new Date()).format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
                createdBy: user.id,
              },
              {
                where: {
                  employeeId: id,
                  date: moment(
                    moment(body.rotationDate ?? new Date()).format(
                      "DD-MM-YYYY"
                    ),
                    "DD-MM-YYYY"
                  ).toDate(),
                },
                transaction,
                individualHooks: true,
              }
            );
          }
          await ReliquatCalculation.destroy({
            where: {
              employeeId: id,
            },
            transaction,
          });
        }

        // Salary Data Update For Employee

        let existingSalary = await EmployeeSalary.findOne({
          where: {
            deletedAt: null,
            employeeId: id,
            endDate: null,
          },
          // order: [['startDate', 'desc']],
          transaction,
        });
        existingSalary = parse(existingSalary);

        if (
          (newBody?.baseSalary !== undefined &&
            existingSalary?.baseSalary != newBody?.baseSalary) ||
          (newBody?.monthlySalary !== undefined &&
            existingSalary?.monthlySalary != newBody?.monthlySalary) ||
          (newBody?.dailyCost !== undefined &&
            existingSalary?.dailyCost != newBody?.dailyCost)
          // ||
          // (newBody.salaryDate &&
          // 	newBody.salaryDate !== undefined &&
          // 	moment(existingSalary?.startDate).valueOf() != moment(newBody.salaryDate ?? new Date()).valueOf())
        ) {
          if (
            moment(existingSalary?.startDate).valueOf() ===
            moment(newBody.salaryDate ?? new Date()).valueOf()
          ) {
            await EmployeeSalary.update(
              {
                baseSalary: newBody?.baseSalary,
                monthlySalary: newBody?.monthlySalary,
                dailyCost: newBody?.dailyCost,
                updatedBy: user?.id,
              },
              {
                where: { employeeId: id, endDate: null },
                transaction,
                individualHooks: true,
              }
            );
          } else {
            await EmployeeSalary.update(
              {
                endDate: moment(newBody.salaryDate)
                  .subtract(1, "days")
                  .toDate(),
                updatedBy: user?.id,
              },
              {
                where: { employeeId: id, endDate: null },
                transaction,
                individualHooks: true,
              }
            );

            await EmployeeSalary.create(
              {
                baseSalary: Number(newBody?.baseSalary ?? 0.0),
                monthlySalary: Number(newBody?.monthlySalary ?? 0.0),
                dailyCost: Number(newBody?.dailyCost ?? 0.0),
                startDate: moment(newBody.salaryDate ?? new Date()).toDate(),
                endDate: null,
                employeeId: isExist?.id,
                createdBy: user.id,
              },
              { transaction }
            );
          }
        }
        // Segment Data Update For Employeee
        let segmentData = await EmployeeSegment.findOne({
          where: { employeeId: id },
          order: [["date", "desc"]],
          transaction,
        });

        segmentData = parse(segmentData);
        if (newBody?.segmentDate && newBody?.segmentId) {
          const employeeSegmentData = await EmployeeSegment.findAll({
            where: {
              employeeId: id,
            },
            order: [["date", "desc"]],
            transaction,
            limit: 1,
          });
          if (employeeSegmentData?.[0]?.date) {
            const newSegmentDate = moment(newBody.segmentDate).format(
              "DD/MM/YYYY"
            );
            const oldSegmentDate = moment(employeeSegmentData[0].date).format(
              "DD/MM/YYYY"
            );
            if (
              !moment(moment(newSegmentDate, "DD/MM/YYYY")).isSame(
                moment(oldSegmentDate, "DD/MM/YYYY")
              ) ||
              segmentData?.segmentId !== newBody?.segmentId ||
              segmentData?.subSegmentId !== newBody.subSegmentId
            ) {
              const segmentDate = moment(newSegmentDate, "DD/MM/YYYY").toDate();
              if (
                findApprovedTimesheetIndex >= 0 &&
                moment(segmentDate).isSameOrBefore(timesheetApprovedDate)
              ) {
                throw new HttpException(
                  200,
                  `Please enter the date after the last timesheet is approved ie. ${moment(
                    timesheetApprovedDate
                  )
                    .add(1, "day")
                    .format("DD/MM/YYYY")}`,
                  {},
                  true
                );
              }
            }
          }
        }

        if (
          segmentData?.segmentId != newBody.segmentId ||
          segmentData?.subSegmentId !== newBody.subSegmentId
        ) {
          let existingSegment = await EmployeeSegment.findOne({
            where: {
              employeeId: id,
              date: moment(
                moment(body.segmentDate ?? new Date()).format("DD-MM-YYYY"),
                "DD-MM-YYYY"
              ).toDate(),
            },
            transaction,
          });

          existingSegment = parse(existingSegment);
          if (!existingSegment) {
            await EmployeeSegment.create(
              {
                employeeId: id,
                segmentId: newBody?.segmentId || null,
                subSegmentId: newBody?.subSegmentId || null,
                date: moment(
                  moment(body?.segmentDate ?? new Date()).format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
                createdBy: user.id,
                rollover: newBody?.rollover,
              },
              { transaction }
            );
          } else {
            await EmployeeSegment.update(
              {
                employeeId: id,
                segmentId: newBody?.segmentId || null,
                subSegmentId: newBody?.subSegmentId || null,
                date: moment(
                  moment(body?.segmentDate ?? new Date()).format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
                createdBy: user.id,
                rollover: newBody?.rollover,
              },
              {
                where: {
                  employeeId: id,
                  date: moment(
                    moment(body?.segmentDate ?? new Date()).format(
                      "DD-MM-YYYY"
                    ),
                    "DD-MM-YYYY"
                  ).toDate(),
                },
                transaction,
                individualHooks: true,
              }
            );
          }
        }
      }

      let data = await this.getEmployeeByIdService(id, transaction);
      data = parse(data);

      if (randomPassword) {
        if (newBody?.email) {
          const replacement = {
            username: newBody?.firstName + " " + newBody?.lastName,
            useremail: newBody?.email,
            password: randomPassword,
            logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
            url: FRONTEND_URL,
          };
          sendMail(
            [newBody?.email, "admin@lred.com"],
            "Credentials",
            "userCredentials",
            replacement
          );
        }
      }

      if (!newBody.terminationDate) {
        if (
          String(moment(isExist?.startDate).format("DD-MM-YYYY")) !==
          String(moment(data?.startDate).format("DD-MM-YYYY")) ||
          (data.terminationDate &&
            data.terminationDate !== undefined &&
            String(moment(isExist?.terminationDate).format("DD-MM-YYYY")) !=
            String(moment(data.terminationDate).format("DD-MM-YYYY")))
          ) {
          console.log("without termination ---> -------> ---------> --------->(employee timesheetRepo)");
            await this.timesheetRepo.clearEmployeeTimesheetByEmployeeId(
              id,
              transaction
            );
          await EmployeeSegment.update(
            {
              employeeId: id,
              segmentId: newBody?.segmentId || null,
              subSegmentId: newBody?.subSegmentId || null,
              date: moment(
                moment(body?.startDate ?? new Date()).format("DD-MM-YYYY"),
                "DD-MM-YYYY"
              ).toDate(),
              createdBy: user.id,
              rollover: newBody?.rollover,
            },
            {
              where: {
                employeeId: id,
                date: moment(
                  moment(body?.segmentDate ?? new Date()).format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
              },
              transaction,
              individualHooks: true,
            }
          );

          //for rotation update

          await EmployeeRotation.update(
            {
              employeeId: id,
              rotationId: newBody.rotationId || null,
              date: moment(
                moment(body.startDate ?? new Date()).format("DD-MM-YYYY"),
                "DD-MM-YYYY"
              ).toDate(),
              createdBy: user.id,
            },
            {
              where: {
                employeeId: id,
                date: moment(
                  moment(body.rotationDate ?? new Date()).format("DD-MM-YYYY"),
                  "DD-MM-YYYY"
                ).toDate(),
              },
              transaction,
              individualHooks: true,
            }
          );

          //for salary update

          await EmployeeSalary.update(
            {
              baseSalary: Number(newBody?.baseSalary ?? 0.0),
              monthlySalary: Number(newBody?.monthlySalary ?? 0.0),
              dailyCost: Number(newBody?.dailyCost ?? 0.0),
              startDate: moment(newBody.startDate ?? new Date()).toDate(),
              endDate: null,
              employeeId: isExist?.id,
              createdBy: user.id,
            },
            {
              where: { employeeId: id, endDate: null },
              transaction,
              individualHooks: true,
            }
          );

          await this.timesheetController.createTimesheet(
            {
              clientId: newBody.clientId,
              user: user,
              employeeIds: [id],
              type: "createAccount",
            },
            transaction
          );
        }
        if (
          isExist?.segmentId != data?.segmentId ||
          isExist?.subSegmentId != data?.subSegmentId
        ) {
          // const currentDate = moment(
          // 	moment(body.segmentDate ?? new Date()).format('DD-MM-YYYY'),
          // 	'DD-MM-YYYY',
          // ).toDate();
          // await Timesheet.update(
          // 	{
          // 		segmentId: data?.segmentId,
          // 		subSegmentId: data?.subSegmentId,
          // 	},
          // 	{ where: { deletedAt: null, startDate: { [Op.gte]: currentDate }, employeeId: id }, transaction },
          // );
          await this.timesheetController.createTimesheet(
            {
              clientId: newBody.clientId,
              user: user,
              employeeIds: [id],
              disableFunction: ["timesheetSchedule"],
              isSegmentAdd: true,
            },
            transaction
          );
        }
        if (isExist?.rotationId != data.rotationId) {
          await this.timesheetController.createTimesheet(
            {
              clientId: newBody.clientId,
              user: user,
              employeeIds: [id],
              disableFunction: ["timesheetSummary"],
            },
            transaction
          );
        }

        if (
          (data?.dailyCost &&
            data?.dailyCost !== undefined &&
            isExist?.dailyCost !== data?.dailyCost) ||
          (data?.monthlySalary &&
            data?.monthlySalary !== undefined &&
            isExist?.monthlySalary !== data?.monthlySalary)
        ) {
          await this.timesheetController.createTimesheet(
            {
              clientId: newBody.clientId,
              user: user,
              employeeIds: [id],
              disableFunction: [
                "timesheetSummary",
                "timesheetSchedule",
                "reliquet",
              ],
            },
            transaction
          );
        }
      }
      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE,
          moduleName: moduleName.EMPLOYEES,
          userId: user?.id,
          lastlogintime: user?.loginUserData?.logintimeutc,
          custom_message: await customHistoryUpdateMesage(
            body,
            isExist,
            user,
            data,
            tableEnum.EMPLOYEE,
            `Employee Data Update`
          ),
          jsonData: parse(data),
          activity: statusEnum.UPDATE,
        },
        transaction
      );

      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateEmployeeDraft({
    body,
    user,
    id,
    image,
    transaction,
  }: {
    body: IEmployeeCreate;
    user: User;
    id: number;
    image: Express.Multer.File;
    transaction: Transaction;
  }) {
    try {
      const isExist = await Employee.findOne({
        where: {
          id: id,
          deletedAt: null,
        },
        transaction,
      });
      if (!isExist) {
        throw new HttpException(403, this.msg.notFound);
      }
      if (body?.email) {
        const isExistEmail = await LoginUser.findOne({
          where: {
            email: { [Op.iLike]: body?.email },
            id: { [Op.ne]: isExist.loginUserId },
            deletedAt: null,
          },
          transaction,
        });
        if (isExistEmail) {
          throw new HttpException(
            200,
            "Email Already Exist in this platform",
            {},
            true
          );
        }
      }
      if (body?.startDate) {
        body.startDate = moment(
          moment(body.startDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();
      }
      if (body?.salaryDate) {
        body.salaryDate = moment(
          moment(body.salaryDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate();
      }
      if (body.customBonus && typeof body.customBonus === "string") {
        body.customBonus = JSON.parse(body.customBonus);
      }
      if (
        body?.employeeStatus &&
        body?.employeeStatus?.length > 0 &&
        typeof body?.employeeStatus === "object"
      ) {
        const employeeStatusArr: string[] = body?.employeeStatus;
        body.employeeStatus =
          body.employeeStatus &&
          employeeStatusArr[employeeStatusArr?.length - 1];
      }
      body.customBonus = JSON.stringify(body.customBonus);
      if (image && image?.filename) body.profilePicture = `${image?.filename}`;

      const slugifyEmployee = body.employeeNumber + createRandomHash(5);
      const slug = slugify(slugifyEmployee, { lower: true, replacement: "-" });
      await Employee.update(
        { ...body, slug, updatedBy: user.id, fonctionDate: body.startDate },
        { where: { id: id }, transaction, individualHooks: true }
      );
      const loginUserData = await LoginUser.findOne({
        where: {
          id: isExist?.loginUserId,
          deletedAt: null,
        },
        transaction,
      });
      if (loginUserData) {
        await LoginUser.update(
          {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            timezone: body.timezone,
            birthDate: body.dOB,
            placeOfBirth: body.placeOfBirth,
            gender: body.gender,
            phone: body.mobileNumber,
            profileImage: body.profilePicture?.includes("profilePicture")
              ? body.profilePicture?.replace("profilePicture", "")
              : body.profilePicture,
          },
          {
            where: { id: isExist.loginUserId },
            transaction,
            individualHooks: true,
          }
        );
      }
      const rollover = body?.rollover;
      const isExistEmployeeRotation = await EmployeeRotation.findOne({
        where: {
          employeeId: id,
          deletedAt: null,
        },
        transaction,
      });
      if (isExistEmployeeRotation) {
        await EmployeeRotation.update(
          {
            rotationId: body?.rotationId,
            date: moment(
              moment(body?.startDate || null).format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
            updatedBy: user?.id,
          },
          {
            where: { id: isExistEmployeeRotation.id },
            transaction,
            individualHooks: true,
          }
        );
      }
      const isExistEmployeeSalary = await EmployeeSalary.findOne({
        where: {
          employeeId: id,
          deletedAt: null,
        },
        transaction,
      });
      if (isExistEmployeeSalary) {
        await EmployeeSalary.update(
          {
            baseSalary: Number(body?.baseSalary ?? 0.0),
            monthlySalary: Number(body?.monthlySalary ?? 0.0),
            dailyCost: Number(body?.dailyCost ?? 0.0),
            startDate: body?.startDate ?? new Date(),
            endDate: null,
            updatedBy: user?.id,
          },
          {
            where: { id: isExistEmployeeSalary.id },
            transaction,
            individualHooks: true,
          }
        );
      }
      if (body?.segmentId) {
        const isExistEmployeeSegment = await EmployeeSegment.findOne({
          where: {
            employeeId: id,
            deletedAt: null,
          },
          transaction,
        });
        if (isExistEmployeeSegment) {
          await EmployeeSegment.update(
            {
              segmentId: body?.segmentId || null,
              subSegmentId: body?.subSegmentId || null,
              date: moment(
                moment(body?.startDate || null).format("DD-MM-YYYY"),
                "DD-MM-YYYY"
              ).toDate(),
              rollover: rollover,
              createdBy: user?.id,
            },
            {
              where: { id: isExistEmployeeSegment.id },
              transaction,
              individualHooks: true,
            }
          );
        }
      }
      if (body?.catalogueNumber) {
        const isExistCatalogue = await EmployeeCatalogueNumber.findOne({
          where: {
            employeeId: id,
          },
          transaction,
        });
        if (isExistCatalogue) {
          await EmployeeCatalogueNumber.update(
            {
              startDate: null,
              catalogueNumber: body?.catalogueNumber ?? null,
            },
            {
              where: { id: isExistCatalogue.id },
              transaction,
              individualHooks: true,
            }
          );
        }
      }
      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE,
          moduleName: moduleName.EMPLOYEES,
          userId: user?.id,
          custom_message: `<b>${user?.loginUserData?.name}</b> has <b>Update</b> Employee Draft of Employee ${loginUserData.name}`,
          lastlogintime: user?.loginUserData?.logintimeutc,
          jsonData: parse(isExist),
          activity: statusEnum.UPDATE,
        },
        transaction
      );
      return;
    } catch (error) {
      throw new Error(error);
    }
  }

  async terminateEmployee({
    body,
    user,
    id,
    transaction,
  }: {
    body: IEmployeeCreate;
    user: User;
    id: number;
    transaction: Transaction;
  }) {
    const isExist = await Employee.findOne({
      where: { id: id, deletedAt: null },
      include: [
        { model: LoginUser, attributes: ["email", "name"] },
        {
          model: EmployeeLeave,
          attributes: ["startDate", "endDate", "leaveType"],
          where: { status: "ACTIVE" },
          required: false,
        },
      ],
      transaction,
    });

    if (!isExist) {
      throw new HttpException(403, this.msg.notFound);
    }

    if (
      isExist?.employeeLeave &&
      isExist.employeeLeave.length > 0 &&
      isExist.employeeLeave.some((empLeaveData) => {
        const startDate = moment(empLeaveData.startDate);
        const endDate = moment(empLeaveData.endDate);
        const terminationDate = moment(
          moment(body.terminationDate).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).add(1, "day");
        return (
          terminationDate.isBetween(startDate, endDate, null, "[]") ||
          terminationDate.isSame(startDate) ||
          terminationDate.isSame(endDate)
        );
      })
    ) {
      throw new HttpException(
        200,
        "Please cancel the Titre de Congé before terminating employee"
      );
    }
    body.terminationDate = moment(
      moment(body.terminationDate).format("DD-MM-YYYY"),
      "DD-MM-YYYY"
    ).toDate();
    await Employee.update(
      { terminationDate: body.terminationDate, updatedBy: user.id },
      { where: { id: id }, transaction, individualHooks: true }
    );

    await EmployeeBonus.update(
      {
        endDate: body.terminationDate,
      },
      {
        where: { employeeId: id, endDate: null },
        transaction,
        individualHooks: true,
      }
    );

    await EmployeeSalary.update(
      {
        endDate: body.terminationDate,
      },
      {
        where: { employeeId: id, endDate: null },
        transaction,
        individualHooks: true,
      }
    );

    const terminateDate = body.terminationDate;
    const timesheet = await Timesheet.findAll({
      where: {
        employeeId: id,
        endDate: { [Op.gte]: terminateDate },
        startDate: { [Op.gte]: terminateDate },
      },
      attributes: ["id"],
    });
    let timesheetIds = [];
    if (timesheet.length) {
      timesheetIds = timesheet?.map((value) => value.id);
    }
    const whereClause = {
      employeeId: id,
      endDate: { [Op.gte]: terminateDate },
      startDate: { [Op.gte]: terminateDate },
    };
    timesheet.length &&
      (await Timesheet.update(
        { dbKey: null },
        { where: { id: { [Op.in]: timesheetIds } }, individualHooks: true }
      ));
    await Timesheet.destroy({
      where: whereClause,
    });
    await TimesheetSchedule.destroy({
      where: {
        employeeId: id,
        date: { [Op.gt]: terminateDate },
      },
    });
    await ReliquatCalculation.destroy({
      where: whereClause,
    });
    await ReliquatCalculationV2.destroy({
      where: whereClause,
    });
    if (timesheet.length) {
      await Account.destroy({
        where: {
          employeeId: id,
          timesheetId: { [Op.in]: timesheetIds },
        },
      });
    }
    if (moment(body.terminationDate).isSameOrBefore(moment(), "day")) {
      await User.destroy({ where: { loginUserId: isExist.loginUserId } });
      await UserPermission.destroy({
        where: { loginUserId: isExist.loginUserId },
      });
    }

    await EmployeeStatusRequest.update(
      { status: reqStatus.APPROVED, updatedBy: user?.id },
      {
        where: {
          employeeId: { [Op.eq]: isExist?.id },
          clientId: { [Op.eq]: isExist?.clientId },
          requestType: actionType.TERMINATION,
          status: reqStatus.PENDING,
        },
        transaction,
        individualHooks: true,
      }
    );

    await createHistoryRecord(
      {
        tableName: tableEnum.EMPLOYEE,
        moduleName: moduleName.EMPLOYEES,
        userId: user?.id,
        custom_message: `<b>${user?.loginUserData?.name}</b> has <b>Terminate</b> Employee ${isExist.loginUserData.name},`,
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(isExist),
        activity: statusEnum.UPDATE,
      },
      transaction
    );
    return true;
  }

  async reActivateEmployee({
    body,
    user,
    id,
    transaction,
  }: {
    body: IEmployeeCreate;
    user: User;
    id: number;
    transaction: Transaction;
  }) {
    try {
      let fetchAllEmployeeData = await Employee.findOne({
        where: {
          id: id,
        },
        transaction,
      });
      fetchAllEmployeeData = parse(fetchAllEmployeeData);
      const employeeData = _.omit(fetchAllEmployeeData, [
        "id",
        "terminationDate",
        "oldEmployeeId",
      ]);
      const slugifyEmployee = employeeData.employeeNumber + createRandomHash(5);
      const slug = slugify(slugifyEmployee, { lower: true, replacement: "-" });
      body.startDate = moment(
        moment(body.startDate).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate();

      const newOjb = {
        ...employeeData,
        ...body,
        slug,
        createdBy: user.id,
        createdAt: moment(employeeData.createdAt)
          .add(1, "minutes")
          .toISOString(),
        isAdminApproved: true,
      };
      console.log("employeeData", newOjb);

      const data = await Employee.create(newOjb, { transaction });

      const employeeSegmentData = await EmployeeSegment.findOne({
        where: {
          employeeId: id,
        },
        attributes: ["rollover"],
      });
      const rollover = employeeSegmentData?.rollover;
      await this.createEmployeeRelatedTableData(
        { data, rollover, user },
        transaction
      );

      await EmployeeStatusRequest.update(
        { status: reqStatus.APPROVED, updatedBy: user?.id },
        {
          where: {
            employeeId: { [Op.eq]: fetchAllEmployeeData?.id },
            clientId: { [Op.eq]: fetchAllEmployeeData?.clientId },
            requestType: actionType.REACTIVATION,
            status: reqStatus.PENDING,
          },
          transaction,
          individualHooks: true,
        }
      );

      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE,
          userId: user?.id,
          lastlogintime: user?.loginUserData?.logintimeutc,
          moduleName: moduleName.EMPLOYEES,
          custom_message: `<b>${user?.loginUserData?.name}</b> has Re-activated an employee with Employee number<b>${data.employeeNumber}</b>`,
          jsonData: parse(data),
          activity: statusEnum.UPDATE,
        },
        transaction
      );
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createEmployeeRelatedTableData(
    {
      data,
      rollover,
      user,
      isUpdateStatus = true,
    }: {
      data;
      rollover?: boolean;
      user: User;
      isUpdateStatus?: boolean;
    },
    transaction: Transaction = null
  ) {
    try {
      if (isUpdateStatus) {
        if (data?.customBonus && JSON.parse(data?.customBonus)) {
          let newBonusJson =
            JSON.parse(data.customBonus)?.data?.length > 0
              ? JSON.parse(data.customBonus)?.data
              : [];
          newBonusJson = newBonusJson.sort((a, b) => {
            a.bonusId > b.bonusId;
          });
          for (const insertData of newBonusJson) {
            const startDate = insertData?.startDate
              ? insertData.startDate
              : moment(data?.startDate).format("DD/MM/YYYY");
            await EmployeeBonus.create(
              {
                employeeId: data.id,
                bonusId: insertData.id,
                price: insertData.price,
                coutJournalier: insertData.coutJournalier,
                startDate: moment(startDate, "DD/MM/YYYY").toDate(),
                catalogueNumber: insertData?.catalogueNumber ?? null,
              },
              { transaction }
            );
          }
          newBonusJson = newBonusJson.map((delDate) => {
            delete delDate.startDate;
            return delDate;
          });
          data.customBonus = JSON.stringify({ data: newBonusJson });
          await Employee.update(
            { customBonus: data.customBonus },
            { where: { id: data.id }, transaction, individualHooks: true }
          );
        }
        await EmployeeRotation.create(
          {
            employeeId: data?.id,
            rotationId: data?.rotationId,
            date: moment(
              moment(data?.startDate || null).format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
            createdBy: user?.id,
          },
          { transaction }
        );

        await EmployeeSalary.create(
          {
            employeeId: data.id,
            baseSalary: Number(data?.baseSalary ?? 0.0),
            monthlySalary: Number(data?.monthlySalary ?? 0.0),
            dailyCost: Number(data?.dailyCost ?? 0.0),
            startDate: data?.startDate ?? new Date(),
            endDate: null,
            createdBy: user?.id,
          },
          { transaction }
        );

        if (data?.segmentId) {
          await EmployeeSegment.create(
            {
              employeeId: data?.id,
              segmentId: data?.segmentId || null,
              subSegmentId: data?.subSegmentId || null,
              date: moment(
                moment(data?.startDate || null).format("DD-MM-YYYY"),
                "DD-MM-YYYY"
              ).toDate(),
              rollover: rollover,
              createdBy: user?.id,
            },
            { transaction }
          );
        }
      }

      const roleData = await Role.findOne({
        where: { name: "Employee", deletedAt: null },
        include: [{ model: RolePermission, attributes: ["permissionId"] }],
        transaction,
      });
      if (roleData) {
        await User.create(
          {
            loginUserId: data?.loginUserId,
            roleId: roleData.id,
            status: status.ACTIVE,
          },
          { transaction }
        );
        roleData?.assignedPermissions?.map(
          async (permission: RolePermissionAttributes) => {
            await UserPermission.create(
              {
                permissionId: permission.permissionId,
                loginUserId: data?.loginUserId,
                roleId: roleData.id,
                createdBy: user.id,
              },
              { transaction }
            );
          }
        );
      }
      return roleData;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAllEmployee(offset) {
    const result = await Employee.findAll({
      attributes: [
        "id",
        "employeeNumber",
        "loginUserId",
        "terminationDate",
        "startDate",
        "deletedAt",
        "clientId",
      ],
      include: [
        {
          model: LoginUser,
          attributes: ["firstName", "lastName"],
          required: false,
        },
        {
          model: Client,
          attributes: ["code"],
          required: false,
        },
      ],
      limit: 3,
      offset: offset,
    }).then((data) => parse(data));
    return result;
  }

  async updateEmployeeStatus({
    id,
    body,
    user,
    transaction,
  }: {
    id: number;
    body: { status: boolean };
    user: User;
    transaction: Transaction;
  }) {
    await generateModalData({
      user: user,
      percentage: 0,
      message: "Approving Employee",
    });
    const isExistEmployee = await Employee.findOne({
      where: {
        id: id,
        isAdminApproved: null,
        deletedAt: null,
      },
      include: [
        {
          model: LoginUser,
        },
      ],
      transaction,
    });
    if (!isExistEmployee) {
      throw new HttpException(404, this.msg.notFound);
    }
    let data = null;
    if (body.status === true) {
      const isAdminEmployee = false;
      const bodyData = { ...body, id };
      data = await this.createEmployeeRelatedData(
        bodyData,
        user,
        isAdminEmployee,
        transaction
      );
    } else {
      await Employee.update(
        { isAdminApproved: false },
        { where: { id: id }, transaction, individualHooks: true }
      );
      data = await this.getEmployeeByIdService(id, transaction);
      await createHistoryRecord({
        tableName: tableEnum.EMPLOYEE,
        moduleName: moduleName.EMPLOYEES,
        userId: user?.id,
        custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> employee ${isExistEmployee.loginUserData.name} status`,
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(data),
        activity: statusEnum.UPDATE,
      });
    }
    return data;
  }

  async deleteEmployeeService({ id, user }: { id: number; user: User }) {
    const isFound = await Employee.findOne({
      where: { id: id, deletedAt: null },
      include: [
        {
          model: LoginUser,
          attributes: ["name"],
          paranoid: false,
        },
      ],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    await LoginUser.destroy({ where: { id: isFound.loginUserId } });
    // const data = await Employee.destroy({ where: { id: id } });
    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>delete</b> the employee ${isFound.loginUserData.name}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isFound),
      activity: statusEnum.DELETE,
    });
    await isFound.destroy();
    await Timesheet.destroy({
      where: { employeeId: isFound.id, status: "UNAPPROVED" },
    });
    return "";
  }

  async deleteRejectedEmployee({ id, user }: { id: number; user?: User }) {
    const isFound = await Employee.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    await LoginUser.destroy({ where: { id: isFound.loginUserId } });
    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>delete</b> the employee ${isFound.loginUserData.name}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(isFound),
      activity: statusEnum.DELETE,
    });
    const data = await Employee.destroy({ where: { id: id } });
    return data;
  }

  async checkEmployeeByEmployeeNumber(
    employeeNumber: string,
    clientId: number
  ) {
    const isFound = await Employee.count({
      where: {
        employeeNumber: { [Op.like]: employeeNumber.toString() },
        clientId,
        deletedAt: null,
      },
    });
    if (isFound) {
      throw new HttpException(405, "Employee Number Already Taken", {}, true);
    } else {
      return true;
    }
  }

  async createEmployeeRelatedData(
    body,
    user: User,
    isAdmin: boolean,
    transaction: Transaction = null
  ) {
    const randomPassword = generateUniquePassword();
    console.log("randomPassword", randomPassword)
    const slugifyEmployee = body.employeeNumber + createRandomHash(5);
    const slug = slugify(slugifyEmployee, { lower: true, replacement: "-" });
    let loginUserData = null;
    let data = null;
    let email = null;
    let firstName = null;
    let lastName = null;
    if (isAdmin === true) {
      loginUserData =
        (await LoginUser.findOne({
          where: {
            uniqueLoginId: `${body.firstName}${body.lastName}${
              body.dOB ? moment(body.dOB).format("YYYYMMDD") : ""
            }`
              ?.replace(" ", "")
              .toLowerCase(),
            deletedAt: null,
          },
          transaction,
        })) || null;
      if (!loginUserData) {
        loginUserData = await LoginUser.create(
          {
            email: body.email,
            name: body.firstName + " " + body.lastName,
            timezone: body.timezone,
            firstName: body.firstName,
            lastName: body.lastName,
            birthDate: body.dOB,
            placeOfBirth: body.placeOfBirth,
            gender: body.gender,
            phone: body.mobileNumber,
            randomPassword: randomPassword,
            profileImage: body.profilePicture,
            isMailNotification: false,
            timeformat: body.timeformat,
            dateformat: body.dateformat,
            uniqueLoginId: `${body.firstName}${body.lastName}${
              body.dOB ? moment(body.dOB).format("YYYYMMDD") : ""
            }`
              ?.replace(" ", "")
              .toLowerCase(),
          },
          { transaction }
        );
      }
      data = await Employee.create(
        {
          ...body,
          slug,
          loginUserId: loginUserData.id,
          createdBy: user.id,
          isAdminApproved: true,
          fonctionDate: body.startDate,
        },
        { transaction }
      );
      email = body?.email;
      firstName = body?.firstName;
      lastName = body?.lastName;
    } else {
      await Employee.update(
        { isAdminApproved: true },
        { where: { id: body.id }, transaction, individualHooks: true }
      );
      data = await this.getEmployeeByIdService(body.id, transaction);
      email = data?.loginUserData?.email;
      firstName = data?.loginUserData?.firstName;
      lastName = data?.loginUserData?.lastName;
    }
    const rollover = body?.rollover;
    const resultData = await this.createEmployeeRelatedTableData(
      { data, rollover, user, isUpdateStatus: isAdmin },
      transaction
    );
    if (resultData) {
      const replacement = {
        username: firstName + " " + lastName,
        useremail: email,
        password: randomPassword,
        logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
        url: FRONTEND_URL,
      };
      if (email) {
        sendMail(
          [email, "admin@lred.com"],
          "Credentials",
          "userCredentials",
          replacement
        );
      }
    }

    await createHistoryRecord(
      {
        tableName: tableEnum.EMPLOYEE,
        moduleName: moduleName.EMPLOYEES,
        userId: user?.id,
        custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created</b> the employee related data`,
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(data),
        activity: statusEnum.CREATE,
      },
      transaction
    );

    return data;
  }

  async getEmployeeCustomBonus(body) {
    const result = [];
    if (body.employeeId?.length > 0) {
      const timesheetStartDate = moment(body.startDate, "DD-MM-YYYY").toDate();
      const timesheetEndDate = moment(body.endDate, "DD-MM-YYYY").toDate();
      let employeeBonus = await Employee.findAll({
        where: { id: { [Op.in]: body.employeeId } },
        attributes: ["id", "customBonus"],
        include: [
          {
            model: EmployeeBonus,
            required: false,
            where: {
              startDate: {
                [Op.lte]: timesheetEndDate,
              },
              endDate: {
                [Op.or]: {
                  [Op.eq]: null,
                  [Op.gte]: timesheetStartDate,
                },
              },
            },
            include: [
              {
                model: BonusType,
                attributes: ["id", "name", "code"],
              },
            ],
          },
        ],
      });
      employeeBonus = parse(employeeBonus);
      let bonusData = await BonusType.findAll({
        where: {
          deletedAt: null,
          // isActive: true,
        },
        include: [
          {
            model: User,
            attributes: ["id", "loginUserId"],
            include: [{ model: LoginUser, attributes: ["name"] }],
          },
        ],
        attributes: ["id", "code", "name", "timesheetName", "basePrice"],
      });
      bonusData = parse(bonusData);
      for (const emp of employeeBonus) {
        const customBonus = emp?.employeeBonus;
        if (customBonus && customBonus.length > 0) {
          customBonus.map((bonuses) => {
            const isExistingBonus = bonusData?.find(
              (bdata) => bdata.code === bonuses.bonus.code
            );
            if (
              isExistingBonus &&
              !result.find((res) => res.code === bonuses.bonus.code)
            ) {
              result.push(isExistingBonus);
            }
          });
        }
      }
    }
    return result;
  }

  async updatebankDetails(body: any, params: any, user?: User) {
    const { bankId, loginUserId } = body;
    const { id } = params;

    await Bank.update(
      {
        isActive: Sequelize.literal(`CASE
          WHEN id = ${bankId} THEN true
          ELSE false
        END`),
      },
      {
        where: {
          loginUserId: loginUserId,
        },
        individualHooks: true,
      }
    );

    const result = await Employee.update(
      { bankId: bankId },
      { where: { id: id }, individualHooks: true }
    );

    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>Update</b> Bank Detail of ${loginUserId},`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(result),
      activity: statusEnum.UPDATE,
    });

    return parse(result);
  }

  async getEmployeeStatusRequest(
    query: IQueryParameters,
    transaction: Transaction = null
  ) {
    // Destructure the employeeId, date, limit, and offset from the query, and clientId from the parameters
    const {
      employeeId,
      createdBy,
      requestType,
      page,
      limit,
      status,
      startDate,
      endDate,
      clientId,
    } = query;

    const offset: number = ((page || 1) - 1) * (limit || 10);

    // Initialize the whereClause object for filtering data, with initial conditions for non-deleted records and matching clientId
    const whereClause: any = {
      deletedAt: null,
    };
    if (clientId) {
      whereClause["clientId"] = clientId;
    }
    if (employeeId) {
      whereClause["employeeId"] = employeeId;
    }
    if (status) {
      whereClause["status"] = status;
    }
    if (requestType) {
      whereClause["requestType"] = requestType;
    }
    if (createdBy) {
      whereClause["createdBy"] = createdBy;
    }

    if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(
          moment(startDate, "DD-MM-YYYY").format("YYYY-MM-DD")
        ),
      };
    }
    if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(
          moment(endDate, "DD-MM-YYYY").add(1, "days").format("YYYY-MM-DD")
        ),
      };
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [
          new Date(moment(startDate, "DD-MM-YYYY").format("YYYY-MM-DD")),
          new Date(
            moment(endDate, "DD-MM-YYYY").add(1, "days").format("YYYY-MM-DD")
          ),
        ],
      };
    }
    console.log("whereClause", whereClause);

    const result = await EmployeeStatusRequest.findAndCountAll({
      where: whereClause,
      limit: limit || 10,
      offset: offset,
      order: [["createdAt", "desc"]],
      include: [
        {
          model: Employee,
          include: [
            {
              model: LoginUser,
              attributes: [
                "firstName",
                "lastName",
                "gender",
                "birthDate",
                "placeOfBirth",
                "email",
                "phone",
                "timezone",
                "profileImage",
                "timezone_utc",
                "dateformat",
                "timeformat",
                "language",
                "currency",
              ],
            },
            {
              model: Client,
              attributes: [
                "id",
                "country",
                "contractTagline",
                "contractN",
                "code",
                "currency",
                "address",
                "startMonthBack",
              ],
              include: [
                {
                  model: LoginUser,
                  attributes: ["name"],
                },
              ],
            },
            {
              model: Segment,
              attributes: ["name", "id"],
            },
            {
              model: SubSegment,
              attributes: ["name", "id"],
            },
            {
              model: Rotation,
              attributes: ["name", "id", "isResident", "weekOn", "weekOff"],
            },
          ],
        },
        {
          model: Role,
          attributes: ["id", "name"],
        },
      ],
      transaction,
    });

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

  async reactivationEmployeeStatusRequest(
    param: any,
    bodyData: any,
    user: User,
    transaction: Transaction = null
  ) {
    const { id: paramId } = param;

    const body: any = { ...bodyData };
    delete body.actionStatus;
    delete body.employeStatus;

    const data = await EmployeeStatusRequest.findByPk(paramId, { transaction });

    if (!data) {
      throw new HttpException(
        400,
        "EmployeeStatusRequest not found",
        {},
        false
      );
    }

    const id = data.employeeId;
    const requestType: actionType = data.requestType;

    if (requestType === actionType.REACTIVATION) {
      if (
        bodyData.actionStatus === "appoved" &&
        bodyData.employeStatus === "unactive"
      ) {
        const isSuccess = this.reActivateEmployee({
          body,
          user,
          id,
          transaction,
        });
        if (isSuccess) {
          data.status = reqStatus.APPROVED;
          await data.save({ transaction });
        }
      }
    }

    if (requestType === actionType.TERMINATION) {
      if (
        bodyData.actionStatus === "reject" &&
        bodyData.employeStatus === "unactive"
      ) {
        const isSuccess = this.reActivateEmployee({
          body,
          user,
          id,
          transaction,
        });
        if (isSuccess) {
          data.status = reqStatus.REJECTED;
          await data.save({ transaction });
        }
      }
    }

    return parse(data);
  }

  async employeeRequestByData(param: any) {
    const { clientId } = param;

    const result = await EmployeeStatusRequest.findAll({
      attributes: [
        [
          Sequelize.fn(
            "DISTINCT",
            Sequelize.col("EmployeeStatusRequest.createdBy")
          ),
          "createdBy",
        ],
      ],
      where: {
        deletedAt: {
          [Op.is]: null,
        },
        clientId,
      },
      include: [
        {
          model: User,
          as: "createdByUser",
          include: [
            {
              model: LoginUser,
              as: "loginUserData",
              attributes: ["id", "name"], // Fetch id and name from LoginUser table
              where: {
                deletedAt: {
                  [Op.is]: null, // Ensure LoginUser is not deleted
                },
              },
            },
          ],
          attributes: ["id"], // Skip attributes from User model as we only need LoginUser details
        },
      ],
      raw: true,
    });

    if (!result)
      throw new HttpException(
        400,
        "Employee Status Change Request not found",
        {},
        false
      );

    return result.map((row) => ({
      id: row["createdByUser.id"],
      name: row["createdByUser.loginUserData.name"],
    }));
  }

  async employeeUniqueDataForEmployeeStatus(param: any) {
    const { clientId } = param;

    const result = await EmployeeStatusRequest.findAll({
      attributes: [
        [
          Sequelize.literal('DISTINCT "EmployeeStatusRequest"."employeeId"'),
          "employeeId",
        ],
      ],
      where: {
        deletedAt: {
          [Op.is]: null,
        },
        clientId,
      },
      include: [
        {
          model: Employee,
          attributes: ["id"],
          include: [
            {
              model: LoginUser,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      raw: true,
    });

    if (!result)
      throw new HttpException(
        400,
        "Employee Status Change Request not found",
        {},
        false
      );

    return result.map((row) => ({
      employeeLoginUserId: row["employee.id"],
      employeeLoginUserName: row["employee.loginUserData.name"], // LoginUser Name
    }));
  }

  async updateEmployeeStatusRequestReason(param: any, body: any, user?: User) {
    const { id } = param;
    const result = await EmployeeStatusRequest.findByPk(id);

    if (!result)
      throw new HttpException(
        400,
        "Employee Status Request not found",
        {},
        false
      );

    result.reason = body.reason;
    await result.save();
    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>update</b> Termination or Activation request employee status request id ${id} change reason`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(result),
      activity: statusEnum.UPDATE,
    });
    return parse(result);
  }

  // Employee request By Mohit
  async employeeTerminationRequest(
    params: any,
    body: any,
    user: User,
    transaction: Transaction = null
  ) {
    try {
      const { empId } = params,
        { requestType } = body;

      let employeeData = await Employee.findOne({
        where: { id: { [Op.eq]: empId } },
        transaction,
      });
      employeeData = parse(employeeData);

      if (!employeeData) {
        throw new HttpException(404, this.msg.notFound);
      }

      const requestObj = {
        ...body,
        employeeId: employeeData?.id,
        requestType:
          requestType.toLowerCase() == "terminate"
            ? actionType.TERMINATION
            : actionType.REACTIVATION,
        clientId: employeeData?.clientId,
        status: reqStatus.PENDING,
        requestBy: user.loginUserData.name,
        roleId: user.roleId,
        createdBy: user.id,
      };

      const isFound = await EmployeeStatusRequest.findOne({
        where: {
          employeeId: { [Op.eq]: requestObj.employeeId },
          clientId: { [Op.eq]: requestObj.clientId },
          status: { [Op.eq]: requestObj.status },
        },
      });
      if (parse(isFound)) {
        throw new HttpException(
          404,
          "This request has been submitted already!"
        );
      }

      const result = await EmployeeStatusRequest.create(requestObj, {
        transaction,
      });

      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE_TERMINATE,
          moduleName: moduleName.EMPLOYEES,
          userId: user?.id,
          custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created</b> Termination or Activation request for employee id ${requestObj.employeeId}`,
          lastlogintime: user?.loginUserData?.logintimeutc,
          jsonData: parse(result),
          activity: statusEnum.CREATE,
        },
        transaction
      );

      return parse(result);
    } catch (error) {
      await transaction.rollback();
      console.log("error in getAllEmployeeContracts", error);
      throw new Error(error);
    }
  }

  async employeeTerminationrequestReject(
    params: any,
    user: User,
    transaction: Transaction = null
  ) {
    try {
      const { requestId } = params;
      let requestData = await EmployeeStatusRequest.findOne({
        where: {
          id: { [Op.eq]: requestId },
          status: reqStatus.PENDING,
        },
        transaction,
      });
      requestData = parse(requestData);
      if (!requestData) {
        throw new HttpException(404, this.Reqmsg.notFound);
      }

      await EmployeeStatusRequest.update(
        { status: reqStatus.REJECTED, updatedBy: user?.id },
        {
          where: {
            id: { [Op.eq]: requestId },
            status: reqStatus.PENDING,
          },
          transaction,
          individualHooks: true,
        }
      );

      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE_TERMINATE,
          moduleName: moduleName.EMPLOYEES,
          userId: user?.id,
          lastlogintime: user?.loginUserData?.logintimeutc,
          custom_message: `<b>${user?.loginUserData?.name}</b> has <b>Reject</b> Termination or Activation request for request id ${requestId}`,
          jsonData: parse(requestData),
          activity: statusEnum.UPDATE,
        },
        transaction
      );
      return;
    } catch (error) {
      await transaction.rollback();
      console.log("error in employeeTerminationrequestReject", error);
      throw new Error(error);
    }
  }
}