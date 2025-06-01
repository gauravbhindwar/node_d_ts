import { FRONTEND_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { createHistoryRecord } from "@/helpers/history.helper";
import { DefaultRoles } from "@/interfaces/functional/feature.interface";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { IEmployeeContractCreate } from "@/interfaces/model/employeeContract.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import db from "@/models";
import BonusType from "@/models/bonusType.model";
import Client from "@/models/client.model";
import ContractTemplate from "@/models/contractTemplete.model";
import ContractTemplateVersion from "@/models/contractTempleteVersion.model";
import Employee from "@/models/employee.model";
import EmployeeBonus from "@/models/employeeBonus.model";
import EmployeeContract from "@/models/employeeContract.model";
import EmployeeRotation from "@/models/employeeRotation.model";
import EmployeeSalary from "@/models/employeeSalary.model";
import Feature from "@/models/feature.model";
import LoginUser from "@/models/loginUser.model";
import Permission from "@/models/permission.model";
import Role from "@/models/role.model";
import Rotation from "@/models/rotation.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import User from "@/models/user.model";
import UserSegment from "@/models/userSegment.model";
import {
  getSegmentAccessForUser,
  getSubSegmentAccessForUser,
  parse,
} from "@/utils/common.util";
import moment from "moment";
import { Op, Sequelize } from "sequelize";
import BaseRepository from "./base.repository";
export default class EmployeeContractRepo extends BaseRepository<
  EmployeeContract
> {
  constructor() {
    super(EmployeeContract.name);
  }

  private msg = new MessageFormation("Employee Contract").message;

async getAllEmployeeContractService(query: IQueryParameters) {
  const { page, limit, clientId, employeeId, sort, sortBy } = query;

  let filter: any = {
    deletedAt: null,
  };

  if (employeeId) {
    filter.employeeId = employeeId;
  }

  const sortedColumn = sortBy || null;

  // Clean and normalize clientId
  const cleanClientId = clientId?.toString().trim();
  const clientFilter = cleanClientId ? { clientId: Number(cleanClientId) } : {};

  let data = await this.getAllData({
    where: { ...filter },
    include: [
      {
        model: Employee,
        attributes: ["clientId"],
        where: {
          ...clientFilter,
          terminationDate: null,
        },
        include: [
          {
            model: LoginUser,
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      },
      {
        model: ContractTemplateVersion,
        attributes: ["contractTemplateId", "versionName"],
        include: [
          {
            model: ContractTemplate,
            attributes: ["contractName"],
          },
        ],
      },
    ],
    offset: page && limit ? (page - 1) * limit : undefined,
    limit: limit ?? undefined,
    order: [[sortedColumn ?? "createdAt", sort ?? "asc"]],
  });

  data = parse(data);

  const responseObj = {
    data: data?.rows,
    count: data?.count,
    currentPage: page ?? undefined,
    limit: limit ?? undefined,
    lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
  };

  return responseObj;
}


  async getAllEmployeeContractEndService(query: IQueryParameters, user: User) {
    const {
      clientId,
      search,
      startDate,
      endDate,
      segmentId,
      limit,
      page,
    } = query;
    let dateWithTimezone = null
    const segmentIds = getSegmentAccessForUser(user);
    const subSegmentIds = getSubSegmentAccessForUser(user);
    let filterQuery:any = {};
    filterQuery = {
      ...(segmentId && { segmentId }),
    };
    let start = startDate || moment().startOf('year').format('YYYY/MM/DD')
    let end = endDate || moment().endOf('year').format('YYYY/MM/DD');

    // if(startDate && endDate){
    //   dateWithTimezone = new Date(
    //     new Date(endDate).getTime() -
    //       new Date(endDate).getTimezoneOffset() * 60000
    //   );
    //   dateWithTimezone.setHours(23, 59, 59, 999); // Add Remaining minites until the end of the day
     
    //   filterQuery.contractEndDate = {
    //     [Op.or]: {
    //       [Op.between]: [
    //         moment(startDate).toDate(),
    //         new Date(dateWithTimezone).toISOString(),
    //       ],
    //       [Op.eq]: moment(startDate).toDate(),
    //       // [Op.eq]: new Date(dateWithTimezone).toISOString(),
    //     },
    //   };
    // }

    if(start && end){
      dateWithTimezone = new Date(
        new Date(end).getTime() -
          new Date(end).getTimezoneOffset() * 60000
      );
      dateWithTimezone.setHours(23, 59, 59, 999); // Add Remaining minites until the end of the day
      filterQuery.contractEndDate = {
        [Op.or]: {
          [Op.between]: [
            moment(start).toDate(),
            new Date(dateWithTimezone).toISOString(),
          ],
          [Op.eq]: moment(start).toDate(),
          // [Op.eq]: new Date(dateWithTimezone).toISOString(),
        },
      };
    }
    
    const employeeData = await Employee.findAndCountAll({
      where: {
        deletedAt: null,
        clientId: clientId,
        terminationDate: null,
        isAdminApproved: { [Op.not]: null },
        segmentId: {
          [Op.ne]: null,
        },
        ...filterQuery,
        ...(user.roleData.name === DefaultRoles.Employee &&
          user.roleData.isViewAll && { loginUserId: user.loginUserId }),
        ...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
        ...(subSegmentIds?.length > 0 && {
          [Op.or]: [
            { subSegmentId: { [Op.in]: subSegmentIds } },
            { subSegmentId: null },
          ],
        }),
        
      },
      include: [
        {
          model: LoginUser,
          where: {
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
          attributes: [
            "firstName",
            "lastName",
            "gender",
            "birthDate",
            "placeOfBirth",
            "email",
            "phone",
            "profileImage",
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
          attributes: ["name", "id"],
        },

        {
          model: EmployeeContract,
          // attributes: ['endDate', 'startDate', 'id', 'description', 'newContractNumber'],
          separate: true,
          limit: 1,
          order: [["endDate", "desc"]],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      // order: [["createdAt", "desc"]],
    });
 
    const contractMap = new Map();
    for (const data of employeeData.rows) {
      const isExistcontract = await EmployeeContract.findOne({
        where: {
          employeeId: data?.id,
          endDate: {
            [Op.between]: [
              moment(start).toDate(),
              new Date(dateWithTimezone).toISOString(),
            ],
          },
          deletedAt: null,
        },
        attributes: ["endDate"],
        include: [
          {
            model: ContractTemplate,
            attributes: ["contractName", "id"],
          },
          {
            model: Employee,
            where: {
              clientId: clientId,
              terminationDate: null,
              ...(user.roleData.name === DefaultRoles.Employee &&
                user.roleData.isViewAll && { loginUserId: user.loginUserId }),
              isAdminApproved: { [Op.not]: null },
            },
            include: [
              {
                model: LoginUser,
                where: {
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
                attributes: [
                  "firstName",
                  "lastName",
                  "gender",
                  "birthDate",
                  "placeOfBirth",
                  "email",
                  "phone",
                  "profileImage",
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
                attributes: ["name", "id"],
              },

              {
                model: EmployeeContract,
                attributes: [
                  "endDate",
                  "id",
                  "description",
                  "newContractNumber",
                ],
                separate: true,
                limit: 1,
                order: [["endDate", "desc"]],
              },
            ],
          },
        ],
        limit: 1,
        order: [["endDate", "desc"]],
      });
      if (isExistcontract) {
        contractMap.set(`${data?.id}`, isExistcontract);
      } else if (
        moment(data?.contractEndDate).isBetween(
          moment(start).toDate(),
          new Date(dateWithTimezone).toISOString()
        ) &&
        data?.contractNumber
      ) {
        contractMap.set(`${data?.id}`, {
          endDate: data?.contractEndDate,
          employeeDetail: data,
          contractTemplate: [],
        });
      }
    }

    const totalContractData = [];
    totalContractData?.push(...contractMap.values());
    let totalContractEndData = totalContractData.sort((a, b) =>
      a.endDate < b.endDate ? -1 : 1
    );
    totalContractEndData = parse(totalContractEndData);
    let responseData = {
      data: totalContractEndData,
      count: employeeData.count,
      currentPage: page || undefined,
      limit: limit || undefined,
      lastPage:
        page && limit ? Math.ceil(Number(employeeData.count) / +limit) : undefined,
    };
    return responseData;
  }

  async getEmployeeContractNumber() {
    const maxContractNumber = await EmployeeContract.findOne({
      attributes: [
        [
          Sequelize.fn(
            "MAX",
            Sequelize.fn(
              "REGEXP_REPLACE",
              Sequelize.col("newContractNumber"),
              "[[:alpha:]]",
              "",
              "g"
            )
          ),
          "ContractNumber",
        ],
      ],
    });
    return maxContractNumber || { ContractNumber: 0 };
  }

  async getEmployeeContractByIdService(id: number, query?: IQueryParameters) {
    const { type, contractName } = query;

    let isFound = null;
    isFound = await EmployeeContract.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
    }).then((data) => parse(data));

    const momentStartDate = moment(
      moment(isFound?.startDate).format("DD/MM/YYYY"),
      "DD/MM/YYYY"
    ).toDate();
    const momentEndDate = moment(
      moment(isFound?.endDate).format("DD/MM/YYYY"),
      "DD/MM/YYYY"
    ).toDate();

    if (type === "default") {
      let condition = null;
      // if (contractName === "LRED_Avenant") {
        if (contractName === "LRED_Algerian_Avenant") {
        condition = {
          startDate: {
            [Op.gte]: momentStartDate,
            [Op.lte]: momentEndDate,
          },
          endDate: {
            [Op.or]: {
              [Op.eq]: null,
              [Op.lte]: momentEndDate,
            },
          },
        };
      } else {
        condition = {
          startDate: {
            [Op.lte]: momentEndDate,
          },
          endDate: {
            [Op.or]: {
              [Op.eq]: null,
              [Op.gte]: momentStartDate,
            },
          },
        };
      }
      isFound = await EmployeeContract.findOne({
        where: { id: id, deletedAt: null },
        include: [
          {
            model: Employee,
            include: [
              {
                model: LoginUser,
                attributes: [
                  "firstName",
                  "lastName",
                  "birthDate",
                  "placeOfBirth",
                ],
              },
              {
                model: Rotation,
                attributes: [
                  "weekOn",
                  "weekOff",
                  "name",
                  "isResident",
                  "isAllDays",
                  "isWeekendBonus",
                  "isOvertimeBonus",
                  "daysWorked",
                  "description",
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
                ],
                include: [
                  {
                    model: LoginUser,
                    attributes: ["name"],
                  },
                ],
              },
              {
                model: EmployeeRotation,
                required: false,
                where: {
                  date: {
                    [Op.and]: {
                      [Op.gte]: momentStartDate,
                      [Op.lte]: momentEndDate,
                    },
                  },
                },
                attributes: ["id"],
                include: [
                  {
                    model: Rotation,
                    attributes: ["id", "name"],
                  },
                ],
              },
              {
                model: EmployeeBonus,
                required: false,
                where: condition,
                include: [
                  {
                    model: BonusType,
                    attributes: ["id", "name", "code"],
                  },
                ],
              },
              {
                model: EmployeeSalary,
                required: false,
                separate: true,
                where: condition,
                order: [
                  ["startDate", "asc"],
                  ["id", "desc"],
                ],
                attributes: ["id", "monthlySalary", "endDate", "startDate"],
              },
            ],
          },
        ],
        order: [
          ["employeeDetail", "startDate", "asc"],
          ["employeeDetail", "employeeRotation", "date", "desc"],
          ["employeeDetail", "employeeBonus", "startDate", "desc"],
        ],
      });
    }
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    isFound = parse(isFound);

    // Employee Bonus Duplication Remove
    if (isFound?.employeeDetail?.employeeBonus?.length > 0) {
      const employeeBonusMap = new Map();
      for (const data of isFound?.employeeDetail?.employeeBonus) {
        const isExist = employeeBonusMap?.get(`${data?.bonus?.name ?? ""}`);
        if (!isExist) {
          employeeBonusMap?.set(`${data?.bonus?.name ?? ""}`, data);
        }
      }
      isFound.employeeDetail.employeeBonus = [...employeeBonusMap?.values()];
    }
    const data = parse(isFound);
    return data;
  }

  async addEmployeeContract({
    body,
    user,
  }: {
    body: IEmployeeContractCreate;
    user: User;
  }) {
    if (body?.startDate) {
      body.startDate = moment(
        moment(body.startDate).format("DD/MM/YYYY"),
        "DD/MM/YYYY"
      ).toDate();
    }
    if (body?.endDate) {
      body.endDate = moment(
        moment(body.endDate).format("DD/MM/YYYY"),
        "DD/MM/YYYY"
      ).toDate();
    }
    const expatData = await ContractTemplate.findOne({
      where: {
        contractName: "Expat_Contract",
      },
    });
    let uniqueWorkNumber: number | null = null;
    if (expatData && expatData.id === body.contractTemplateId) {
      const lastUniqueWorkNumber = await EmployeeContract.findOne({
        where: {
          uniqueWorkNumber: {
            [Op.ne]: null,
          },
        },
        attributes: ["id", "uniqueWorkNumber"],
        order: [["id", "desc"]],
      });
      if (lastUniqueWorkNumber) {
        uniqueWorkNumber = lastUniqueWorkNumber?.uniqueWorkNumber + 1;
      } else {
        uniqueWorkNumber = 1;
      }
    }
    // const currentDate = moment();
    // const isExist = await EmployeeContract.findOne({
    // 	where: {
    // 		employeeId: body.employeeId,
    // 		// contractVersionId: body.contractVersionId,
    // 		endDate: {
    // 			// [Op.gt]: currentDate,
    // 			[Op.gt]: body.endDate,
    // 		},
    // 	},
    // 	include: [
    // 		{
    // 			model: ContractTemplate,
    // 		},
    // 	],
    // }).then((dat) => parse(dat));

    let data = await EmployeeContract.create({
      ...body,
      ...(uniqueWorkNumber && { uniqueWorkNumber }),
      createdBy: user.id,
    });
    // const bonusdata = await EmployeeContract.findOne({
    // 	where: { id: data.id, deletedAt: null },
    // 	include: [
    // 		{
    // 			model: BonusType,
    // 			attributes: ['name', 'code', 'id'],
    // 		},
    // 	],
    // });
    data = parse(data);

    if (!body?.type && body?.type != "edit") {
      let employeeData = await Employee.findOne({
        where: {
          id: data.employeeId,
        },
      });
      employeeData = parse(employeeData);

      await Employee.update(
        {
          ...employeeData,
          contractNumber: data.newContractNumber.toString(),
          contractEndDate: moment(
            moment(body.endDate).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
          updatedBy: user.id,
        },
        { where: { id: employeeData.id }, individualHooks: true }
      );
    }

    // let contractSummaryData = await ContractTemplateVersion.findOne({
    // 	where: {
    // 		id: data.contractVersionId,
    // 	},
    // });
    // contractSummaryData = parse(contractSummaryData);
    // const sentence = contractSummaryData.description;
    // const stringsToReplace = [
    // 	{ '<%=firstName%>': data?.firstName },
    // 	{ '<%=lastName%>': data?.lastName },
    // 	{ '<%=middleName%>': data?.middleName },
    // 	{ '<%=email%>': data?.email },
    // 	{ '<%=address%>': data?.address },
    // 	{ '<%=birthdate%>': moment(data?.dateOfBirth).format('DD/MM/YYYY') },
    // 	{ '<%=bonus%>': bonusdata?.bonusType?.name },
    // 	{ '<%=monthlySalary%>': data?.monthlySalary },
    // 	{ '<%=newContractNumber%>': data?.newContractNumber },
    // 	{ '<%=contactNumber%>': data?.contactNumber },
    // 	{ '<%=startDate%>': moment(data?.startDate).format('DD/MM/YYYY') },
    // 	{ '<%=endDate%>': moment(data?.endDate).format('DD/MM/YYYY') },
    // ];

    //   const replacedSentence = await this.replaceStringsInSentence(sentence, stringsToReplace);

    //  const date = `${moment().unix()}-contract.pdf`;

    // await pdf(replacedSentence, `${moment().unix()}-contract.pdf`, 'contractPdf', false);
    // await EmployeeContract.update(
    // 	{
    // 		pdfPath: `/contractPdf/${date}`,
    // 	},
    // 	{
    // 		where: {
    // 			id: data.id,
    // 		},
    // 	},
    // );

    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE_CONTRACT,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>created Employee Contract</b> for employee id ${body.employeeId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateEmployeeContractEnd({
    body,
    user,
  }: {
    body: { employeeId: number[]; endDate: Date };
    user: User;
  }) {
    const transaction = await db.transaction();
    try {
      const employeeIds = body.employeeId;
      if (body?.endDate) {
        body.endDate = moment(
          moment(body.endDate).format("DD/MM/YYYY"),
          "DD/MM/YYYY"
        ).toDate();
      }
      const employeeData = await Employee.findAll({
        where: {
          id: {
            [Op.in]: employeeIds,
          },
        },
        transaction,
        include: [
          {
            model: LoginUser,
            attributes: ["id", "firstName", "lastName"],
          },
          {
            model: Client,
            attributes: ["id"],
            include: [
              {
                model: LoginUser,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: Segment,
            attributes: ["id", "name"],
          },
          {
            model: SubSegment,
            attributes: ["id", "name"],
          },
          {
            model: Rotation,
            attributes: ["id", "name"],
          },
          {
            model: EmployeeContract,
            attributes: ["id", "newContractNumber", "endDate"],
            separate: true,
            order: [
              ["endDate", "desc"],
              ["id", "desc"],
            ],
            limit: 1,
          },
        ],
      }).then((data) => parse(data));
      for (const employeeId of employeeIds) {
        const isExist = await EmployeeContract.findOne({
          where: { employeeId: employeeId, deletedAt: null },
          order: [["endDate", "desc"]],
          transaction,
        });
        // if (!isExist) {
        // 	throw new HttpException(200, this.msg.notFound, {}, true);
        // }
        if (isExist) {
          await EmployeeContract.update(
            { endDate: body.endDate, updatedBy: user.id },
            {
              where: { employeeId: employeeId, id: isExist?.id },
              transaction,
              individualHooks: true,
            }
          );
        }

        await Employee.update(
          {
            contractEndDate: moment(
              moment(body.endDate).format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
            updatedBy: user.id,
          },
          { where: { id: employeeId }, transaction, individualHooks: true }
        );
      }
      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE_CONTRACT,
          moduleName: moduleName.EMPLOYEES,
          userId: user?.id,
          custom_message: `<b>${user?.loginUserData?.name}</b> has <b>update Employee Contract</b> for employee id ${body.employeeId}`,
          lastlogintime: user?.loginUserData?.logintimeutc,
          jsonData: parse(employeeData),
          activity: statusEnum.UPDATE,
        },
        transaction
      );
      await transaction.commit();
      this.sendContractExtensionMail(employeeData, body?.endDate, user);
      return;
    } catch (error) {
      // console.log({ error });
      await transaction.rollback();
      throw new Error(error);
    }
  }

  async sendContractExtensionMail(employeeData, endDate, user: User) {
    try {
      const managerRoleData = await Role.findOne({
        where: {
          name: "manager",
        },
        attributes: ["id"],
      });
      const permissionIds = await Permission.findAll({
        where: {
          permissionName: {
            // [Op.eq]: 'approve',
            [Op.any]: ["update", "approve"],
          },
        },
        attributes: ["id"],
        include: [
          {
            model: Feature,
            required: true,
            where: {
              name: "Timesheet",
            },
            attributes: ["id"],
          },
        ],
      });
      const permissionIdsArr = permissionIds.map((e) => e.id);
      const permissionIdsString = permissionIdsArr.join(",");
      const userQuery = `SELECT u.id,u."loginUserId"
				FROM users u
				LEFT JOIN login_user lu ON lu.id = u."loginUserId"
				LEFT JOIN user_permission up ON up."loginUserId" = lu.id
				left join user_segment us on us."userId" = u.id
				LEFT JOIN "permission" p ON up."permissionId" = p.id
				WHERE u."roleId" = ${managerRoleData?.id} AND u."status" = 'ACTIVE' AND p.id IN (${permissionIdsString}) and up."deletedAt" is null
				GROUP BY u.id
				HAVING COUNT(DISTINCT p.id) = 2;`;
      const userIds = await db.query(userQuery);
      const userIdsData = userIds[0].map(
        (e: { id: number; loginUserId: number }) => e.id
      );
      const employeeMap = new Map();
      for (const employee of employeeData) {
        const isExist = employeeMap.get(
          `${employee?.segment?.id}-${employee?.subSegment?.id ?? 0}`
        );
        if (!isExist) {
          const employeesData = [];
          employeesData.push(employee);
          employeeMap.set(
            `${employee?.segment?.id}-${employee?.subSegment?.id ?? 0}`,
            employeesData
          );
        } else {
          const employeesData = [...isExist, employee];
          employeeMap.set(
            `${employee?.segment?.id}-${employee?.subSegment?.id ?? 0}`,
            employeesData
          );
        }
      }

      for (const employeeSegmentWiseData of employeeMap) {
        const employeeSegmentData = employeeSegmentWiseData[1];
        const segment = `${employeeSegmentData?.[0]?.segment?.name ?? "-"}${
          employeeSegmentData?.[0]?.subSegment?.name
            ? " - " + employeeSegmentData?.[0]?.subSegment?.name
            : ""
        }`;
        const userSegmentData = await User.findAll({
          include: [
            {
              model: LoginUser,
              required: true,
              attributes: ["email"],
            },
            {
              model: UserSegment,
              attributes: ["id"],
              required: true,
              where: {
                userId: {
                  [Op.in]: userIdsData,
                },
                ...(employeeSegmentData?.[0]?.segment?.id && {
                  segmentId: employeeSegmentData?.[0]?.segment?.id,
                }),
                ...(employeeSegmentData?.[0]?.subSegment?.id && {
                  subSegmentId: employeeSegmentData?.[0]?.subSegment?.id,
                }),
              },
            },
          ],
        });
        const managerEmails = userSegmentData?.map(
          (e) => e?.loginUserData?.email
        );
        const emails = [...managerEmails];
        if (!emails.includes("admin@lred.com")) {
          emails.push("admin@lred.com");
        }
        if (!emails.includes("hr.manager@lred.com")) {
          emails.push("hr.manager@lred.com");
        }
        const worksheetDataArray = [];
        employeeSegmentData?.map((e) => {
          const name = e?.loginUserData?.firstName
            ? e?.loginUserData?.firstName + " " + e?.loginUserData?.lastName
            : "-";
          const rowData = {
            Matricule: e?.employeeNumber ?? "-",
            Name: name,
            "Contract Number":
              e?.employeeContracts[0]?.newContractNumber ?? "-",
            Rotation: e?.rotation?.name ?? "-",
            "Contract End Date": moment(endDate).format("Do MMMM YYYY") ?? "-",
          };
          worksheetDataArray.push(rowData);
        });
        const extensionUser = user?.loginUserData?.name
          ? user?.loginUserData?.name
          : user?.loginUserData?.firstName
          ? user?.loginUserData?.firstName + " " + user?.loginUserData?.lastName
          : "-";
        const replacement = {
          logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          clientName:
            employeeSegmentData?.[0]?.client?.loginUserData?.name ?? "-",
          segment,
          worksheetDataArray,
          extensionUser,
        };
        if (emails?.length > 0) {
          // await sendMail(
          //   emails,
          //   "Contract Extension Notification",
          //   "contractExtensionMailTemplate",
          //   replacement
          // );
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ error });
    }
  }

  async updateEmployeeContract({
    body,
    user,
    id,
  }: {
    body: IEmployeeContractCreate;
    user: User;
    id: number;
  }) {
    if (body?.startDate) {
      body.startDate = moment(
        moment(body.startDate).format("DD/MM/YYYY"),
        "DD/MM/YYYY"
      ).toDate();
    }
    if (body?.endDate) {
      body.endDate = moment(
        moment(body.endDate).format("DD/MM/YYYY"),
        "DD/MM/YYYY"
      ).toDate();
    }
    const isExist = await EmployeeContract.findOne({
      where: { id: id, deletedAt: null },
    });
    if (!isExist) {
      throw new HttpException(200, this.msg.notFound, {}, true);
    }
    await EmployeeContract.update(
      { ...body, updatedBy: user.id },
      { where: { id: id }, individualHooks: true }
    );
    const data = await this.getEmployeeContractByIdService(id);

    // const bonusdata = await EmployeeContract.findOne({
    // 	where: { id: data.id, deletedAt: null },
    // 	include: [
    // 		{
    // 			model: BonusType,
    // 			attributes: ['name', 'code', 'id'],
    // 		},
    // 	],
    // });
    // let contractSummaryData = await ContractTemplateVersion.findOne({
    // 	where: {
    // 		id: data.contractVersionId,
    // 	},
    // });

    // contractSummaryData = parse(contractSummaryData);

    // const sentence = contractSummaryData.description;

    // const stringsToReplace = [
    // 	{ '<%=firstName%>': data?.firstName },
    // 	{ '<%=lastName%>': data?.lastName },
    // 	{ '<%=middleName%>': data?.middleName },
    // 	{ '<%=email%>': data?.email },
    // 	{ '<%=address%>': data?.address },
    // 	{ '<%=birthdate%>': moment(data?.dateOfBirth).format('DD/MM/YYYY') },
    // 	{ '<%=bonus%>': bonusdata?.bonusType?.name },
    // 	{ '<%=monthlySalary%>': data?.monthlySalary },
    // 	{ '<%=newContractNumber%>': data?.newContractNumber },
    // 	{ '<%=contactNumber%>': data?.contactNumber },
    // 	{ '<%=startDate%>': moment(data?.startDate).format('DD/MM/YYYY') },
    // 	{ '<%=endDate%>': moment(data?.endDate).format('DD/MM/YYYY') },
    // ];

    // const replacedSentence = await this.replaceStringsInSentence(sentence, stringsToReplace);
    // const date = `${moment().unix()}-contract.pdf`;

    // await pdf(replacedSentence, date, 'contractPdf', false);

    // await EmployeeContract.update(
    // 	{
    // 		pdfPath: `/contractPdf/${date}`,
    // 	},
    // 	{
    // 		where: {
    // 			id: id,
    // 		},
    // 	},
    // );
    // fileDelete(`public${isExist.pdfPath}`);

    await createHistoryRecord({
      tableName: tableEnum.EMPLOYEE_CONTRACT,
      moduleName: moduleName.EMPLOYEES,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>update Employee Contract</b> for employee id ${isExist.employeeId}`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });
  }

  async deleteEmployeeContractService({
    id,
    authUser,
  }: {
    id: number;
    authUser: User;
  }) {
    const isExistUser = await this.get({
      where: { id, deletedAt: null },
      // attributes: ['id', 'pdfPath'],
      attributes: ["id", "startDate", "endDate", "employeeId"],
    });
    if (isExistUser) {
      const employeeData = await Employee.findOne({
        where: {
          id: isExistUser?.employeeId,
        },
        attributes: ["id", "contractEndDate"],
      });
      const user = await this.update(
        { deletedAt: new Date() },
        { where: { id: +isExistUser.id }, individualHooks: true }
      );
      // fileDelete(`public${isExistUser.pdfPath}`);
      if (
        moment(employeeData?.contractEndDate).format("DD-MM-YYYY") ===
        moment(isExistUser?.endDate).format("DD-MM-YYYY")
      ) {
        const findLastContractData = await this.get({
          where: {
            id: {
              [Op.ne]: id,
            },
            employeeId: employeeData?.id,
          },
          attributes: ["id", "endDate"],
          order: [["endDate", "desc"]],
        });
        if (findLastContractData) {
          await Employee.update(
            { contractEndDate: moment(findLastContractData?.endDate).toDate() },
            { where: { id: employeeData?.id }, individualHooks: true }
          );
        } else {
          await Employee.update(
            { contractEndDate: null },
            { where: { id: employeeData?.id }, individualHooks: true }
          );
        }
      }
      await createHistoryRecord({
        tableName: tableEnum.EMPLOYEE_CONTRACT,
        moduleName: moduleName.EMPLOYEES,
        userId: authUser?.id,
        custom_message: `<b>${authUser?.loginUserData?.name}</b> has <b>delete Employee Contract</b> for employee id ${isExistUser.employeeId}`,
        lastlogintime: authUser?.loginUserData?.logintimeutc,
        jsonData: parse(user),
        activity: statusEnum.DELETE,
      });
      return user;
    }
  }

  async replaceStringsInSentence(sentence, replacementArray) {
    let result = sentence;

    for (const element of replacementArray) {
      const replacementObject = element;
      const searchString = Object.keys(replacementObject)[0];
      const replacementValue = replacementObject[searchString];

      result = result.split(searchString).join(replacementValue);
    }

    return result;
  }

  async dashboardcontracsDataNew(query: any, user: User) {
    try {
      const { page, limit, clientId: rawClientId, employeeId, sort, sortBy } = query;
  
      // Safely parse clientId to a number
      const clientId = rawClientId && rawClientId !== '' ? parseInt(rawClientId, 10) : null;
  
      // Build dynamic filters
      let filter: any = {};
      if (clientId) {
        filter.clientId = clientId;
      }
  
      // Fetch contract list (latest 5)
      let contractlist = await EmployeeContract.findAll({
        where: { deletedAt: null },
        include: [
          {
            model: Employee,
            attributes: ["clientId"],
            where: {
              ...filter,
              terminationDate: null,
            },
          },
          {
            model: ContractTemplateVersion,
            attributes: ["contractTemplateId", "versionName"],
            include: [
              {
                model: ContractTemplate,
                attributes: ["contractName"],
              },
            ],
          },
        ],
        limit: 5,
        order: [["createdAt", "desc"]],
      });
  
      // Prepare conditional where clause for counting
      const employeeWhereClause: any = {
        terminationDate: null,
      };
      if (clientId) {
        employeeWhereClause.clientId = clientId;
      }
  
      // Count total contracts with distinct employeeId
      const count = await EmployeeContract.count({
        distinct: true,
        col: 'employeeId',
        where: {
          deletedAt: null,
        },
        include: [
          {
            model: Employee,
            required: true,
            where: employeeWhereClause,
          },
        ],
      });
  
      // Find contracts ending soon
      let ending_soon_contract = await Employee.findAll({
        where: {
          deletedAt: null,
          terminationDate: null,
          isAdminApproved: { [Op.not]: null },
          segmentId: {
            [Op.ne]: null,
          },
          contractEndDate: {
            [Op.between]: [
              moment().toDate(),
              moment().add(30, "days").toDate(),
            ],
          },
          ...filter,
        },
      });
  
      console.log("ending_soon_contract", ending_soon_contract?.length);
  
      contractlist = parse(contractlist);
  
      return {
        contractlist,
        totalContract: count,
        contractEndSoon: ending_soon_contract.length,
      };
    } catch (error) {
      console.log("error", error);
      throw new HttpException(400, this.msg.notFound, null, true);
    }
  }
  
  
}
