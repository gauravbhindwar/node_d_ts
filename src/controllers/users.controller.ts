import { FRONTEND_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryUpdateMesage,
} from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import { status } from "@/interfaces/model/user.interface";
import db from "@/models";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import EmployeeSalary from "@/models/employeeSalary.model";
import Feature from "@/models/feature.model";
import LoginUser from "@/models/loginUser.model";
import Permission from "@/models/permission.model";
import Role from "@/models/role.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import UserClient from "@/models/userClient.model";
import UserPermission from "@/models/userPermission.model";
import UserSegment from "@/models/userSegment.model";
import UserSegmentApproval from "@/models/userSegmentApproval.model";
import AuthRepo from "@/repository/auth.repository";
import LoginUserRepo from "@/repository/loginUser.repository";
import UserClientRepo from "@/repository/userClient.repository";
import UserSegmentRepo from "@/repository/userSegment.repository";
import { generateUniquePassword, parse } from "@/utils/common.util";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import _ from "lodash";
import User from "models/user.model";
import { Op } from "sequelize";
import UserRepo from "../repository/user.repository";
import { catchAsync } from "../utils/catchAsync";
import generalResponse from "../utils/generalResponse";
class UserController {
  private userRepository = new UserRepo();
  private authRepository = new AuthRepo();
  private loginUserRepo = new LoginUserRepo();
  private userClientRepo = new UserClientRepo();
  private userSegmentRepo = new UserSegmentRepo();
  private msg = new MessageFormation("User").message;

  /**
   * Add user Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */

  public addUser = catchAsync(async (req: Request, res: Response) => {
    const { file: files } = req;
    let body = req.body;
    const user: any = req.user;
    if (files) body = { ...body, profileImage: `/profile/${files.filename}` };
    _.omit(body, "profile");
    body.randomPassword = generateUniquePassword();
    console.log("body.randomPassword", body.randomPassword);
    const isExistEmail = await LoginUser.findOne({
      where: { email: body.email, deletedAt: null },
    });

    if (isExistEmail) {
      throw new HttpException(
        200,
        "Email Already Exist in this platform",
        {},
        true
      );
    }

    const loginUserData = await this.loginUserRepo.create({
      email: body.email,
      name: body.name,
      timezone: body.timezone,
      isMailNotification: body.isMailNotification,
      randomPassword: body.randomPassword,
      profileImage: body.profileImage ? body.profileImage : null,
    });
    // }

    let responseData = {};
    if (loginUserData) {
      const userData = await this.userRepository.create({
        loginUserId: loginUserData.id,
        roleId: body.roleId,
        status: status.ACTIVE,
      });
      responseData = parse(userData);
      if (body.clientId)
        await UserClient.create({
          clientId: body.clientId,
          segmentId: body?.segmentId,
          roleId: body.roleId,
          userId: userData.id,
          status: status.ACTIVE,
          createdBy: req.user.id,
        });

      responseData["loginUserData"] = loginUserData;
    }
    body?.permissions?.map(async (permission: number) => {
      await UserPermission.create({
        permissionId: permission,
        loginUserId: loginUserData.id,
        roleId: body.roleId,
        createdBy: req.user.id,
      });
      if (body.clientId)
        await UserPermission.create({
          clientId: body.clientId,
          permissionId: permission,
          loginUserId: loginUserData.id,
          roleId: body.roleId,
          createdBy: req.user.id,
        });
    });

    // *********************************************Temporary Closed****************************************
    const replacement = {
      username: body.name,
      useremail: body.email,
      password: body.randomPassword,
      logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
      url: FRONTEND_URL,
    };
    if (body.email) {
      await sendMail(
        [body.email, "admin@lred.com"],
        "Credentials",
        "userCredentials",
        replacement
      );
    }

    await createHistoryRecord({
      tableName: tableEnum.USER,
      moduleName: moduleName.ADMIN,
      custom_message: await customHistoryCreateMessage(
        user,
        tableEnum.USER,
        loginUserData
      ),
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(responseData),
      activity: statusEnum.CREATE,
    });
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.create,
      "success",
      true
    );
  });

  /**
   * get user Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */
  public getUsers = catchAsync(async (req: Request, res: Response) => {
    const {
      page,
      limit,
      isActive,
      clientId,
      search,
      roleId,
      segmentId,
      subSegmentId,
      listView,
    }: IQueryParameters = req.query;
    let responseObj;
    const isEmployeeRole = await Role.findOne({
      where: {
        name: "Employee",
      },
      attributes: ["id", "name"],
    }).then((roleData) => parse(roleData));

    if (_.isUndefined(listView)) {
      const fromClause = `FROM "users" AS "User"
            INNER JOIN "login_user" AS "loginUserData" ON "User"."loginUserId" = "loginUserData"."id"
                AND "loginUserData"."deletedAt" IS NULL
                AND "loginUserData"."email" NOT IN ('admin-e@lred.com','admin@gmail.com')
                ${
                  search
                    ? `AND ("loginUserData"."name" ILIKE '%${search}%' OR "loginUserData"."email" ILIKE '%${search}%')`
                    : ""
                }
            INNER JOIN "role" AS "roleData" ON "User"."roleId" = "roleData"."id"
                AND "roleData"."deletedAt" IS NULL

				${
          segmentId || subSegmentId
            ? `INNER JOIN "user_segment" AS "userSegment" ON "User"."id" = "userSegment"."userId"`
            : ""
        }

            ${
              clientId
                ? `LEFT OUTER JOIN "employee" AS "loginUserData->employee" ON "loginUserData"."id" = "loginUserData->employee"."loginUserId"
                        AND ("loginUserData->employee"."deletedAt" IS NULL
                        AND "loginUserData->employee"."clientId" = ${clientId}
                        AND "loginUserData->employee"."terminationDate" IS null
                        AND "loginUserData->employee"."segmentId" IS NOT null)
                    LEFT OUTER JOIN "user_client" AS "userClientList" ON "User"."id" = "userClientList"."userId"
                        AND "userClientList"."clientId" = ${clientId}
                        AND "userClientList"."deletedAt" IS NULL`
                : ""
            }
            WHERE ("User"."deletedAt" IS NULL
                AND "roleData"."name" != 'Client'
                ${
                  clientId
                    ? `AND ("userClientList"."clientId" = ${clientId} OR "loginUserData->employee"."clientId" = ${clientId})`
                    : ""
                }
                ${roleId ? `AND "User"."roleId" = ${roleId}` : ""}
                ${
                  segmentId && subSegmentId
                    ? `AND ("userSegment"."segmentId" IN (${segmentId}) OR "userSegment"."subSegmentId" IN (${subSegmentId}))`
                    : segmentId
                    ? `AND "userSegment"."segmentId" IN (${segmentId}) AND "userSegment"."subSegmentId" IS NULL `
                    : subSegmentId
                    ? `AND "userSegment"."subSegmentId" IN (${subSegmentId})`
                    : ""
                }
                ${
                  isActive !== undefined
                    ? `AND "User"."status" = '${
                        isActive.toString() === "true"
                          ? status.ACTIVE
                          : status.INACTIVE
                      }'`
                    : ""
                }
            )`;

      const userQuery = `SELECT DISTINCT ON ("User"."id","loginUserData"."name") "User"."id", "User"."roleId", "User"."status", "User"."loginUserId", "User"."createdAt",
            "loginUserData"."id" AS "loginUserData.id", "loginUserData"."name" AS "loginUserData.name", "loginUserData"."email" AS "loginUserData.email",
			${
        segmentId || subSegmentId
          ? `"userSegment"."userId" AS "userSegment.userId",
					"userSegment"."segmentId" AS "userSegment.segmentId",
					"userSegment"."subSegmentId" AS "userSegment.subSegmentId", `
          : ""
      }
            ${
              clientId
                ? `"loginUserData->employee"."id" AS "loginUserData.employee.id", "loginUserData->employee"."clientId" AS "loginUserData.employee.clientId", `
                : ""
            }
            "roleData"."id" AS "roleData.id", "roleData"."name" AS "roleData.name"
            ${fromClause}
						ORDER BY "loginUserData"."name" ASC
						${limit ? `LIMIT '${limit}'` : ""} ${
        page && limit ? `OFFSET ${(page - 1) * limit}` : ""
      }`;
      const result = await db.query(userQuery);
      const resultCount = await db.query(
        `SELECT COUNT(DISTINCT "User"."id") as usercount ${fromClause}`
      );

      let userCount = 0;
      if (resultCount?.[0]?.length)
        userCount = resultCount?.[0]?.[0]["usercount"] ?? 0;

      // console.log('userCount',userCount);

      if (result[0].length) {
        for (const userList of result[0] as any[]) {
          if (userList?.employee?.id == null) {
            userList["loginUserData.employee"] = undefined;
          }

          if (clientId) {
            const userClientQuery = `SELECT "userClientList"."clientId" AS "clientId"
						FROM "user_client" AS "userClientList"
						WHERE "userClientList"."userId" = ${userList.id} AND "userClientList"."clientId" = ${clientId} AND ("userClientList"."deletedAt" IS NULL)`;
            const resultUserClient = await db.query(userClientQuery);
            if (resultUserClient?.[0].length)
              userList["userClientList"] = resultUserClient[0];
          } else {
            userList["userClientList"] = [];
          }
          let userSegmentQuery: string;
          if (userList?.roleId !== isEmployeeRole?.id) {
            userSegmentQuery = `SELECT "userSegmentList"."id" AS "id",
						"userSegmentList->segmentData"."id" AS "segmentData.id",
						"userSegmentList->segmentData"."name" AS "segmentData.name",
						"userSegmentList->segmentData"."isActive" AS "segmentData.isActive",
						"userSegmentList->subSegmentData"."id" AS "subSegmentData.id",
						"userSegmentList->subSegmentData"."name" AS "subSegmentData.name",
						"userSegmentList->subSegmentData"."isActive" AS "subSegmentData.isActive"
						FROM "user_segment" AS "userSegmentList"
						INNER JOIN "segment" AS "userSegmentList->segmentData" ON "userSegmentList"."segmentId" = "userSegmentList->segmentData"."id"
						AND ("userSegmentList->segmentData"."deletedAt" IS NULL)
						LEFT OUTER JOIN "sub_segment" AS "userSegmentList->subSegmentData" ON "userSegmentList"."subSegmentId" = "userSegmentList->subSegmentData"."id"
						AND ("userSegmentList->subSegmentData"."deletedAt" IS NULL) WHERE "userSegmentList"."userId" = ${userList.id} AND ("userSegmentList"."deletedAt" IS NULL) ORDER BY "segmentData.name" ASC`;
          } else {
            userSegmentQuery = `select "employeeData"."id" as "id",
						"segmentData"."id" as "segmentData.id",
						"segmentData"."name" as "segmentData.name",
						"segmentData"."isActive" as "segmentData.isActive",
						"subSegmentData"."id" as "subSegmentData.id",
						"subSegmentData"."name" as "subSegmentData.name",
						"subSegmentData"."isActive" as "subSegmentData.isActive"
						from users as "userData"
						left join login_user as "loginUserData" on "loginUserData"."id" = "userData"."loginUserId"
						left join employee as "employeeData" on "employeeData"."loginUserId" = "loginUserData"."id"
						left join employee_segment as "employeeSegmentData" on "employeeSegmentData"."employeeId" = "employeeData"."id"
						inner join segment as "segmentData" on "employeeSegmentData"."segmentId" = "segmentData"."id"
							and "segmentData"."deletedAt" is null
						left outer join sub_segment as "subSegmentData" on "subSegmentData"."id" = "employeeSegmentData"."subSegmentId"
							and "subSegmentData"."deletedAt" is null
						where "userData"."id"= ${userList.id} and "employeeSegmentData"."deletedAt" is null
						order by "segmentData.name" asc`;
          }
          const resultUserSegment = await db.query(userSegmentQuery);
          if (resultUserSegment?.[0]?.length) {
            userList["userSegmentList"] = resultUserSegment[0];
          }
          const userSegmentApprovalQuery = `SELECT "userSegmentApprovalList"."id" AS "id", "userSegmentApprovalList->segmentData"."name" AS "segmentData.name",
					"userSegmentApprovalList->subSegmentData"."name" AS "subSegmentData.name"
					FROM "user_segment_approval" AS "userSegmentApprovalList"
					INNER JOIN "segment" AS "userSegmentApprovalList->segmentData" ON "userSegmentApprovalList"."segmentId" = "userSegmentApprovalList->segmentData"."id"
					AND ("userSegmentApprovalList->segmentData"."deletedAt" IS NULL)
					LEFT OUTER JOIN "sub_segment" AS "userSegmentApprovalList->subSegmentData" ON "userSegmentApprovalList"."subSegmentId" = "userSegmentApprovalList->subSegmentData"."id"
					AND ("userSegmentApprovalList->subSegmentData"."deletedAt" IS NULL)
					WHERE "userSegmentApprovalList"."userId" = ${userList.id}
					AND ("userSegmentApprovalList"."deletedAt" IS NULL)`;
          const resultUserSegmentApproval = await db.query(
            userSegmentApprovalQuery
          );
          if (resultUserSegmentApproval?.[0]?.length)
            userList["userSegmentApprovalList"] = resultUserSegmentApproval[0];

          const userPermissionQuery = `SELECT "UserPermission"."permissionId","permission"."permissionName" AS "permission.permissionName",
					"permission"."featureId" AS "permission.featureId","permission->feature"."name" AS "permission.feature.name"
					FROM "user_permission" AS "UserPermission"
					INNER JOIN "permission" AS "permission" ON "UserPermission"."permissionId" = "permission"."id"
					AND ("permission"."deletedAt" IS NULL AND ("permission"."deletedAt" IS NULL))
					LEFT OUTER JOIN "features" AS "permission->feature" ON "permission"."featureId" = "permission->feature"."id" AND ("permission->feature"."deletedAt" IS NULL
					AND ("permission->feature"."deletedAt" IS NULL))

					WHERE "UserPermission"."loginUserId" = ${userList.loginUserId} AND "UserPermission"."roleId" = ${userList.roleId}
					AND "UserPermission"."deletedAt" IS null AND "UserPermission"."clientId" IS null ORDER BY "permission.feature.name" ASC`;
          const resultPermission = await db.query(userPermissionQuery);
          if (resultPermission?.[0]?.length)
            userList["loginUserData.assignedUserPermission"] =
              resultPermission[0];
        }
      }

      // const uniqueIds = new Set();
      // const filteredData = result[0].filter((item: { id: number }) => {
      // 	if (!uniqueIds.has(item.id)) {
      // 		uniqueIds.add(item.id);
      // 		return true;
      // 	}
      // 	return false;
      // });
      responseObj = {
        data: result[0] ?? [],
        count: Number(userCount),
        currentPage: page || undefined,
        limit: limit || undefined,
        lastPage:
          page && limit ? Math.ceil(Number(userCount) / +limit) : undefined,
      };
    } else {
      const fromClause = `FROM "users" AS "User"
            INNER JOIN "login_user" AS "loginUserData" ON "User"."loginUserId" = "loginUserData"."id"
                AND "loginUserData"."deletedAt" IS NULL
                AND "loginUserData"."email" NOT IN ('admin-e@lred.com','admin@gmail.com')
                ${
                  search
                    ? `AND ("loginUserData"."name" ILIKE '%${search}%' OR "loginUserData"."email" ILIKE '%${search}%')`
                    : ""
                }
            INNER JOIN "role" AS "roleData" ON "User"."roleId" = "roleData"."id"
                AND "roleData"."deletedAt" IS NULL

				${
          segmentId || subSegmentId
            ? `INNER JOIN "user_segment" AS "userSegment" ON "User"."id" = "userSegment"."userId"`
            : ""
        }

            ${
              clientId
                ? `LEFT OUTER JOIN "employee" AS "loginUserData->employee" ON "loginUserData"."id" = "loginUserData->employee"."loginUserId"
                        AND ("loginUserData->employee"."deletedAt" IS NULL
                        AND "loginUserData->employee"."clientId" = ${clientId}
                        AND "loginUserData->employee"."terminationDate" IS null
                        AND "loginUserData->employee"."segmentId" IS NOT null)
                    LEFT OUTER JOIN "user_client" AS "userClientList" ON "User"."id" = "userClientList"."userId"
                        AND "userClientList"."clientId" = ${clientId}
                        AND "userClientList"."deletedAt" IS NULL`
                : ""
            }
            WHERE ("User"."deletedAt" IS NULL
                AND "roleData"."name" != 'Client'
                ${
                  clientId
                    ? `AND ("userClientList"."clientId" = ${clientId} OR "loginUserData->employee"."clientId" = ${clientId})`
                    : ""
                }
                ${roleId ? `AND "User"."roleId" = ${roleId}` : ""}
                ${
                  segmentId && subSegmentId
                    ? `AND ("userSegment"."segmentId" IN (${segmentId}) OR "userSegment"."subSegmentId" IN (${subSegmentId}))`
                    : segmentId
                    ? `AND "userSegment"."segmentId" IN (${segmentId})`
                    : subSegmentId
                    ? `AND "userSegment"."subSegmentId" IN (${subSegmentId})`
                    : ""
                }
                ${
                  isActive !== undefined
                    ? `AND "User"."status" = '${
                        isActive.toString() === "true"
                          ? status.ACTIVE
                          : status.INACTIVE
                      }'`
                    : ""
                }
            )`;

      const userQuery = `SELECT DISTINCT ON ("User"."id","loginUserData"."name") "User"."id", "User"."roleId", "User"."status", "User"."loginUserId", "User"."createdAt",
            "loginUserData"."id" AS "loginUserData.id", "loginUserData"."name" AS "loginUserData.name", "loginUserData"."email" AS "loginUserData.email",

			${
        segmentId || subSegmentId
          ? `"userSegment"."userId" AS "userSegment.userId",
				"userSegment"."segmentId" AS "userSegment.segmentId",
				"userSegment"."subSegmentId" AS "userSegment.subSegmentId", `
          : ""
      }

            ${
              clientId
                ? `"loginUserData->employee"."id" AS "loginUserData.employee.id", "loginUserData->employee"."clientId" AS "loginUserData.employee.clientId", `
                : ""
            }
            "roleData"."id" AS "roleData.id", "roleData"."name" AS "roleData.name"
            ${fromClause} ORDER BY "loginUserData"."name" ASC`;

      const result = await db.query(userQuery);
      if (result[0].length) {
        for (const userList of result[0] as any[]) {
          if (userList?.employee?.id == null) {
            userList["loginUserData.employee"] = undefined;
          }

          if (clientId) {
            const userClientQuery = `SELECT "userClientList"."clientId" AS "clientId"
						FROM "user_client" AS "userClientList"
						WHERE "userClientList"."userId" = ${userList.id} AND "userClientList"."clientId" = ${clientId} AND ("userClientList"."deletedAt" IS NULL)`;
            const resultUserClient = await db.query(userClientQuery);
            if (resultUserClient?.[0].length)
              userList["userClientList"] = resultUserClient[0];
          } else {
            userList["userClientList"] = [];
          }

          let userSegmentQuery: string;
          if (userList?.roleId !== isEmployeeRole?.id) {
            userSegmentQuery = `SELECT "userSegmentList"."id" AS "id",
						"userSegmentList->segmentData"."id" AS "segmentData.id",
						"userSegmentList->segmentData"."name" AS "segmentData.name",
						"userSegmentList->segmentData"."isActive" AS "segmentData.isActive",
						"userSegmentList->subSegmentData"."id" AS "subSegmentData.id",
						"userSegmentList->subSegmentData"."name" AS "subSegmentData.name",
						"userSegmentList->subSegmentData"."isActive" AS "subSegmentData.isActive"
						FROM "user_segment" AS "userSegmentList"
						INNER JOIN "segment" AS "userSegmentList->segmentData" ON "userSegmentList"."segmentId" = "userSegmentList->segmentData"."id"
						AND ("userSegmentList->segmentData"."deletedAt" IS NULL)
						LEFT OUTER JOIN "sub_segment" AS "userSegmentList->subSegmentData" ON "userSegmentList"."subSegmentId" = "userSegmentList->subSegmentData"."id"
						AND ("userSegmentList->subSegmentData"."deletedAt" IS NULL) WHERE "userSegmentList"."userId" = ${userList.id} AND ("userSegmentList"."deletedAt" IS NULL) ORDER BY "segmentData.name" ASC`;
          } else {
            userSegmentQuery = `select "employeeData"."id" as "id",
						"segmentData"."id" as "segmentData.id",
						"segmentData"."name" as "segmentData.name",
						"segmentData"."isActive" as "segmentData.isActive",
						"subSegmentData"."id" as "subSegmentData.id",
						"subSegmentData"."name" as "subSegmentData.name",
						"subSegmentData"."isActive" as "subSegmentData.isActive"
						from users as "userData"
						left join login_user as "loginUserData" on "loginUserData"."id" = "userData"."loginUserId"
						left join employee as "employeeData" on "employeeData"."loginUserId" = "loginUserData"."id"
						left join employee_segment as "employeeSegmentData" on "employeeSegmentData"."employeeId" = "employeeData"."id"
						inner join segment as "segmentData" on "employeeSegmentData"."segmentId" = "segmentData"."id"
							and "segmentData"."deletedAt" is null
						left outer join sub_segment as "subSegmentData" on "subSegmentData"."id" = "employeeSegmentData"."subSegmentId"
							and "subSegmentData"."deletedAt" is null
						where "userData"."id"= ${userList.id} and "employeeSegmentData"."deletedAt" is null
						order by "segmentData.name" asc`;
          }
          const resultUserSegment = await db.query(userSegmentQuery);
          if (resultUserSegment?.[0]?.length) {
            userList["userSegmentList"] = resultUserSegment[0];
          }

          const userSegmentApprovalQuery = `SELECT "userSegmentApprovalList"."id" AS "id", "userSegmentApprovalList->segmentData"."name" AS "segmentData.name",
					"userSegmentApprovalList->subSegmentData"."name" AS "subSegmentData.name"
					FROM "user_segment_approval" AS "userSegmentApprovalList"
					INNER JOIN "segment" AS "userSegmentApprovalList->segmentData" ON "userSegmentApprovalList"."segmentId" = "userSegmentApprovalList->segmentData"."id"
					AND ("userSegmentApprovalList->segmentData"."deletedAt" IS NULL)
					LEFT OUTER JOIN "sub_segment" AS "userSegmentApprovalList->subSegmentData" ON "userSegmentApprovalList"."subSegmentId" = "userSegmentApprovalList->subSegmentData"."id"
					AND ("userSegmentApprovalList->subSegmentData"."deletedAt" IS NULL)
					WHERE "userSegmentApprovalList"."userId" = ${userList.id}
					AND ("userSegmentApprovalList"."deletedAt" IS NULL)`;
          const resultUserSegmentApproval = await db.query(
            userSegmentApprovalQuery
          );
          if (resultUserSegmentApproval?.[0]?.length)
            userList["userSegmentApprovalList"] = resultUserSegmentApproval[0];

          const userPermissionQuery = `SELECT "UserPermission"."permissionId","permission"."permissionName" AS "permission.permissionName",
					"permission"."featureId" AS "permission.featureId","permission->feature"."name" AS "permission.feature.name"
					FROM "user_permission" AS "UserPermission"
					INNER JOIN "permission" AS "permission" ON "UserPermission"."permissionId" = "permission"."id"
					AND ("permission"."deletedAt" IS NULL AND ("permission"."deletedAt" IS NULL))
					LEFT OUTER JOIN "features" AS "permission->feature" ON "permission"."featureId" = "permission->feature"."id" AND ("permission->feature"."deletedAt" IS NULL
					AND ("permission->feature"."deletedAt" IS NULL))

					WHERE "UserPermission"."loginUserId" = ${userList.loginUserId} AND "UserPermission"."roleId" = ${userList.roleId}
					AND "UserPermission"."deletedAt" IS null AND "UserPermission"."clientId" IS null ORDER BY "permission.feature.name" ASC`;
          const resultPermission = await db.query(userPermissionQuery);
          if (resultPermission?.[0]?.length)
            userList["loginUserData.assignedUserPermission"] =
              resultPermission[0];
        }
      }
      responseObj = {
        data: result[0] ?? [],
      };
    }
    // const user = req.user as User;
    // await createHistoryRecord({
    //   tableName: tableEnum.USER,
    //   moduleName: moduleName.ADMIN,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.USER, `All Users!`),
    //   jsonData: parse(responseObj),
    //   activity: statusEnum.VIEW,
    // });
    return generalResponse(
      req,
      res,
      responseObj,
      this.msg.fetch,
      "success",
      false
    );
  });

  // previous get user function
  // public getUsers = catchAsync(async (req: Request, res: Response) => {
  //     const {
  //         page,
  //         limit,
  //         isActive,
  //         clientId,
  //         search,
  //         segmentId,
  //         subSegmentId,
  // 		listView
  //     }: IQueryParameters = req.query;
  //     let responseObj;

  //     // Find the Employee role ID
  //     const isEmployeeRole = await Role.findOne({
  //         where: {
  //             name: 'Employee',
  //         },
  //         attributes: ['id', 'name'],
  //     }).then((roleData) => parse(roleData));

  //     // If no listView is specified, execute the main query
  //     if (_.isUndefined(listView)) {
  //         const fromClause = `FROM "users" AS "User"
  //             INNER JOIN "login_user" AS "loginUserData" ON "User"."loginUserId" = "loginUserData"."id"
  //                 AND "loginUserData"."deletedAt" IS NULL
  //                 AND "loginUserData"."email" NOT IN ('admin-e@lred.com','admin@gmail.com')
  //                 ${
  //                     search
  //                         ? `AND ("loginUserData"."name" ILIKE '%${search}%' OR "loginUserData"."email" ILIKE '%${search}%')`
  //                         : ''
  //                 }
  //             INNER JOIN "role" AS "roleData" ON "User"."roleId" = "roleData"."id"
  //                 AND "roleData"."deletedAt" IS NULL
  //                 AND "roleData"."name" = 'Employee'  -- Ensure we only select Employees
  //             ${
  //                 segmentId || subSegmentId ? `INNER JOIN "user_segment" AS "userSegment" ON "User"."id" = "userSegment"."userId"` : ''
  //             }
  //             ${
  //                 clientId
  //                     ? `LEFT OUTER JOIN "employee" AS "loginUserData->employee" ON "loginUserData"."id" = "loginUserData->employee"."loginUserId"
  //                         AND ("loginUserData->employee"."deletedAt" IS NULL
  //                         AND "loginUserData->employee"."clientId" = ${clientId}
  //                         AND "loginUserData->employee"."terminationDate" IS null
  //                         AND "loginUserData->employee"."segmentId" IS NOT null)
  //                     LEFT OUTER JOIN "user_client" AS "userClientList" ON "User"."id" = "userClientList"."userId"
  //                         AND "userClientList"."clientId" = ${clientId}
  //                         AND "userClientList"."deletedAt" IS NULL`
  //                     : ''
  //             }
  //             WHERE ("User"."deletedAt" IS NULL
  //                 AND "roleData"."name" != 'Client'
  //                 ${
  //                     clientId
  //                         ? `AND ("userClientList"."clientId" = ${clientId} OR "loginUserData->employee"."clientId" = ${clientId})`
  //                         : ''
  //                 }
  //                 ${segmentId ? `AND "userSegment"."segmentId" IN (${segmentId})` : ''}
  //                 ${subSegmentId ? `AND "userSegment"."subSegmentId" IN (${subSegmentId})` : ''}
  //                 ${
  //                     isActive !== undefined
  //                         ? `AND "User"."status" = '${isActive.toString() === 'true' ? status.ACTIVE : status.INACTIVE}'`
  //                         : ''
  //                 }
  //             )`;

  //         const userQuery = `SELECT DISTINCT ON ("User"."id","loginUserData"."name") "User"."id", "User"."roleId", "User"."status", "User"."loginUserId", "User"."createdAt",
  //             "loginUserData"."id" AS "loginUserData.id", "loginUserData"."name" AS "loginUserData.name", "loginUserData"."email" AS "loginUserData.email",
  //             ${
  //                 segmentId || subSegmentId
  //                     ? `"userSegment"."userId" AS "userSegment.userId",
  //                     "userSegment"."segmentId" AS "userSegment.segmentId",
  //                     "userSegment"."subSegmentId" AS "userSegment.subSegmentId", `
  //                     : ''
  //             }
  //             ${
  //                 clientId
  //                     ? `"loginUserData->employee"."id" AS "loginUserData.employee.id", "loginUserData->employee"."clientId" AS "loginUserData.employee.clientId", `
  //                     : ''
  //             }
  //             "roleData"."id" AS "roleData.id", "roleData"."name" AS "roleData.name"
  //             ${fromClause}
  //             ORDER BY "loginUserData"."name" ASC
  //             ${limit ? `LIMIT '${limit}'` : ''} ${page && limit ? `OFFSET ${(page - 1) * limit}` : ''}`;
  //         const result = await db.query(userQuery);
  //         const resultCount = await db.query(`SELECT COUNT(DISTINCT "User"."id") as usercount ${fromClause}`);

  //         let userCount = 0;
  //         if (resultCount?.[0]?.length) userCount = resultCount?.[0]?.[0]['usercount'] ?? 0;

  //         if (result[0].length) {
  //             for (const userList of result[0] as any[]) {
  //                 if (userList?.employee?.id == null) {
  //                     userList['loginUserData.employee'] = undefined;
  //                 }

  //                 if (clientId) {
  //                     const userClientQuery = `SELECT "userClientList"."clientId" AS "clientId"
  //                     FROM "user_client" AS "userClientList"
  //                     WHERE "userClientList"."userId" = ${userList.id} AND "userClientList"."clientId" = ${clientId} AND ("userClientList"."deletedAt" IS NULL)`;
  //                     const resultUserClient = await db.query(userClientQuery);
  //                     if (resultUserClient?.[0].length) userList['userClientList'] = resultUserClient[0];
  //                 } else {
  //                     userList['userClientList'] = [];
  //                 }
  //                 let userSegmentQuery: string;
  //                 if (userList?.roleId !== isEmployeeRole?.id) {
  //                     userSegmentQuery = `SELECT "userSegmentList"."id" AS "id",
  //                     "userSegmentList->segmentData"."id" AS "segmentData.id",
  //                     "userSegmentList->segmentData"."name" AS "segmentData.name",
  //                     "userSegmentList->segmentData"."isActive" AS "segmentData.isActive",
  //                     "userSegmentList->subSegmentData"."id" AS "subSegmentData.id",
  //                     "userSegmentList->subSegmentData"."name" AS "subSegmentData.name",
  //                     "userSegmentList->subSegmentData"."isActive" AS "subSegmentData.isActive"
  //                     FROM "user_segment" AS "userSegmentList"
  //                     INNER JOIN "segment" AS "userSegmentList->segmentData" ON "userSegmentList"."segmentId" = "userSegmentList->segmentData"."id"
  //                     AND ("userSegmentList->segmentData"."deletedAt" IS NULL)
  //                     LEFT OUTER JOIN "sub_segment" AS "userSegmentList->subSegmentData" ON "userSegmentList"."subSegmentId" = "userSegmentList->subSegmentData"."id"
  //                     AND ("userSegmentList->subSegmentData"."deletedAt" IS NULL) WHERE "userSegmentList"."userId" = ${userList.id} AND ("userSegmentList"."deletedAt" IS NULL) ORDER BY "segmentData.name" ASC`;
  //                 } else {
  //                     userSegmentQuery = `select "employeeData"."id" as "id",
  //                     "segmentData"."id" as "segmentData.id",
  //                     "segmentData"."name" as "segmentData.name",
  //                     "segmentData"."isActive" as "segmentData.isActive",
  //                     "subSegmentData"."id" as "subSegmentData.id",
  //                     "subSegmentData"."name" as "subSegmentData.name",
  //                     "subSegmentData"."isActive" as "subSegmentData.isActive"
  //                     from users as "userData"
  //                     left join login_user as "loginUserData" on "loginUserData"."id" = "userData"."loginUserId"
  //                     left join employee as "employeeData" on "employeeData"."loginUserId" = "loginUserData"."id"
  //                     left join employee_segment as "employeeSegmentData" on "employeeSegmentData"."employeeId" = "employeeData"."id"
  //                     inner join segment as "segmentData" on "employeeSegmentData"."segmentId" = "segmentData"."id"
  //                         and "segmentData"."deletedAt" is null
  //                     left outer join sub_segment as "subSegmentData" on "subSegmentData"."id" = "employeeSegmentData"."subSegmentId"
  //                         and "subSegmentData"."deletedAt" is null
  //                     where "userData"."id"= ${userList.id} and "employeeSegmentData"."deletedAt" is null
  //                     order by "segmentData.name" asc`;
  //                 }
  //                 const resultUserSegment = await db.query(userSegmentQuery);
  //                 if (resultUserSegment?.[0]?.length) {
  //                     userList['userSegmentList'] = resultUserSegment[0];
  //                 }
  //                 const userSegmentApprovalQuery = `SELECT "userSegmentApprovalList"."id" AS "id", "userSegmentApprovalList->segmentData"."name" AS "segmentData.name"
  //                     FROM "user_segment_approval" AS "userSegmentApprovalList" INNER JOIN "segment" AS "userSegmentApprovalList->segmentData"
  //                     ON "userSegmentApprovalList"."segmentId" = "userSegmentApprovalList->segmentData"."id"
  //                     AND ("userSegmentApprovalList->segmentData"."deletedAt" IS NULL) WHERE "userSegmentApprovalList"."userId" = ${userList.id}
  //                     AND ("userSegmentApprovalList"."deletedAt" IS NULL) ORDER BY "segmentData.name" ASC`;
  //                 const resultUserSegmentApproval = await db.query(userSegmentApprovalQuery);
  //                 if (resultUserSegmentApproval?.[0]?.length) {
  //                     userList['userSegmentApprovalList'] = resultUserSegmentApproval[0];
  //                 }
  //             }
  //         }
  //         responseObj = {
  //             userList: result[0],
  //             userCount,
  //             isEmployeeRole,
  //         };
  //     }
  //     res.json(responseObj);
  // });

  public getUsersForSearchDropdown = catchAsync(
    async (req: Request, res: Response) => {
      const {
        roleId,
        isActive,
        clientId,
        segmentId,
        subSegmentId,
      }: IQueryParameters = req.query;
      let segmentValue;
      let subSegmentValue;
      if (segmentId && !Array.isArray(segmentId)) {
        segmentValue = Array.isArray(segmentId)
          ? segmentId
          : segmentId.toString().split(",").map(Number);
      }
      if (subSegmentId && !Array.isArray(subSegmentId)) {
        subSegmentValue = Array.isArray(subSegmentId)
          ? subSegmentId
          : subSegmentId.toString().split(",").map(Number);
      }
      const responseData = await this.userRepository.getAll({
        where: {
          ...(roleId && { roleId: roleId }),
          ...(isActive != undefined && {
            status:
              isActive.toString() === "true" ? status.ACTIVE : status.INACTIVE,
          }),
          ...(clientId && {
            [Op.or]: {
              "$userClientList.clientId$": clientId,
              "$loginUserData.employee.clientId$": clientId,
              "$loginUserData.client.id$": clientId,
            },
          }),
        },
        attributes: ["id", "roleId", "status", "loginUserId", "createdAt"],
        include: [
          {
            model: LoginUser,
            required: true,
            attributes: ["id", "name", "email"],
            where: {
              email: {
                [Op.ne]: null,
              },
            },
            include: [
              {
                model: Employee,
                required: false,
                where: {
                  ...(clientId && {
                    clientId: clientId,
                    segmentId: { [Op.not]: null },
                    terminationDate: null,
                  }),
                },
                attributes: ["id", "clientId"],
              },
              {
                model: Client,
                required: false,
                where: { ...(clientId && { id: clientId }) },
                attributes: ["id"],
              },
            ],
          },
          {
            model: UserClient,
            as: "userClientList",
            required: false,
            where: { ...(clientId && { clientId: clientId }) },
            attributes: ["id", "clientId"],
          },
          {
            model: UserSegment,
            required: segmentValue || subSegmentValue ? true : false,
            attributes: ["id", "segmentId"],
            where: {
              [Op.or]: [
                {
                  ...(segmentValue && {
                    [Op.and]: [
                      { segmentId: { [Op.in]: segmentValue } },
                      { subSegmentId: null },
                    ],
                  }),
                },
                {
                  ...(subSegmentValue && {
                    subSegmentId: { [Op.in]: subSegmentValue },
                  }),
                },
              ],
            },
            include: [
              {
                model: Segment,
                required: true,
                attributes: ["id", "clientId"],
                where: {
                  ...(clientId && { clientId: clientId }),
                },
              },
            ],
          },
          {
            model: Role,
            // where: { name: { [Op.ne]: 'super admin' } },
            where: { name: { [Op.ne]: "Client" } },
            attributes: ["name"],
          },
        ],
      });

      const dropdownData = responseData?.map((finalData) => {
        return {
          label: `${finalData?.loginUserData?.name}`,
          value: `${finalData?.loginUserData?.name}`,
        };
      });

      return generalResponse(
        req,
        res,
        dropdownData,
        this.msg.fetch,
        "success",
        false
      );
    }
  );

  public getUserByRole = catchAsync(async (req: Request, res: Response) => {
    const { clientId }: IQueryParameters = req.query;
    let responseData = await this.userRepository.getAll({
      attributes: ["id", "roleId", "status", "loginUserId", "createdAt"],
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: ["id", "name", "email", "createdAt"],
        },
        {
          model: Role,
          where: { name: { [Op.eq]: "manager" } },
          attributes: ["name"],
        },
        {
          model: UserSegment,
          required: false,
          where: {
            ...(Number(clientId) ? { clientId: clientId } : { clientId: null }),
          },
          attributes: ["id"],
          include: [
            {
              model: Segment,
              attributes: ["id", "name", "code"],
            },
            {
              model: SubSegment,
              attributes: ["id", "name", "code"],
            },
          ],
        },
      ],
    });
    // const user = req.user as User;
    // await createHistoryRecord({
    //   tableName: tableEnum.USER,
    //   moduleName: moduleName.ADMIN,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.USER, `All Users According Role!`),
    //   jsonData: parse(responseData),
    //   activity: statusEnum.VIEW,
    // });
    responseData = parse(responseData);
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public getUserRolePermission = catchAsync(
    async (req: Request, res: Response) => {
      const { userId, clientId } = req.query;
      let userDetails = null;
      if (userId) {
        userDetails = await User.findOne({
          where: { deletedAt: null, id: Number(userId) },
        }).then((dat) => parse(dat));
      }
      const responseData = await this.userRepository.getUserRolePermissionData(
        Number(userId ? userId : req.user.loginUserId),
        userDetails?.roleId ? userDetails.roleId : req.user.roleId,
        +clientId
      );
      //   const user = req.user as User;
      // await createHistoryRecord({
      //   tableName: tableEnum.USER,
      //   moduleName: moduleName.ADMIN,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(user, tableEnum.USER, `All Users Role Permission!`),
      //   jsonData: parse(responseData),
      //   activity: statusEnum.VIEW,
      // });
      return generalResponse(
        req,
        res,
        responseData,
        this.msg.fetch,
        "success",
        false
      );
    }
  );

  /**
   * get user by id Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */

  public getUserById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const { clientId } = req.query;
    const userRoleId = await this.userRepository.get({ where: { id: id } });
    let responseData = await this.userRepository.get({
      where: { id: id },
      attributes: ["id", "roleId", "status"],
      include: [
        {
          model: LoginUser,
          required: false,
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "timezone",
            "isMailNotification",
          ],
          include: [
            {
              model: UserPermission,
              separate: true,
              required: false,
              where: {
                clientId: Number(clientId) ? Number(clientId) : null,
                roleId: userRoleId.roleId,
              },
              attributes: ["permissionId"],
              include: [
                {
                  model: Permission,
                  attributes: ["permissionName"],
                  include: [{ model: Feature, attributes: ["name"] }],
                },
              ],
              order: [["permission", "feature", "name", "ASC"]],
            },
            {
              model: Employee,
              required: false,
            },
          ],
        },
        {
          model: Role,
          attributes: ["name"],
        },
        {
          model: UserClient,
          required: false,
          attributes: ["id", "clientId"],
          where: {
            userId: id,
            ...(Number(clientId) ? { clientId: clientId } : {}),
          },
          include: [
            {
              model: Client,
              attributes: ["id"],
              include: [{ model: LoginUser, attributes: ["name"] }],
            },
          ],
        },
        {
          model: UserSegment,
          required: false,
          where: {
            userId: id,
            clientId: Number(clientId) ? clientId : null,
            deletedAt: null,
          },
          attributes: ["id"],
          include: [
            {
              model: Segment,
              attributes: ["id", "name", "isActive"],
            },
            {
              model: SubSegment,
              attributes: ["id", "name", "isActive"],
            },
          ],
        },
        {
          model: UserSegmentApproval,
          required: false,
          where: {
            userId: id,
            clientId: Number(clientId) ? clientId : null,
            deletedAt: null,
          },
          attributes: ["id"],
          include: [
            {
              model: Segment,
              attributes: ["id", "name"],
            },
            {
              model: SubSegment,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [
        ["userSegmentList", "segmentData", "name", "asc"],
        ["userClientList", "clientData", "loginUserData", "name", "asc"],
      ],
    });
    // const user = req.user as User;
    // await createHistoryRecord({
    //   tableName: tableEnum.USER,
    //   moduleName: moduleName.ADMIN,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.USER, `Specific Users!`),
    //   jsonData: parse(responseData),
    //   activity: statusEnum.VIEW,
    // });
    responseData = parse(responseData);
    return generalResponse(
      req,
      res,
      responseData,
      this.msg.fetch,
      "success",
      false
    );
  });

  public getMessageUserById = catchAsync(
    async (req: Request, res: Response) => {
      // const { clientId } = req.query;

      let responseData;
      responseData = await Employee.findAll({
        where: {
          id: {
            [Op.in]: req.body.id,
          },
        },
        include: [
          {
            model: EmployeeSalary,
            as: "employeeSalary",
            attributes: ["startDate"],
            separate: true,
            limit: 1,
            order: [["startDate", "desc"]],
          },
          {
            model: LoginUser,
          },
        ],
      });

      // responseData = await this.userRepository.getAll({
      // 	where: { id: { [Op.in]: req.body.id } },
      // 	attributes: ['id', 'roleId', 'status'],
      // 	include: [
      // 		{
      // 			model: LoginUser,
      // 			required: false,
      // 			attributes: ['id', 'name', 'email', 'phone', 'timezone', 'isMailNotification'],
      // 		},
      // 		{
      // 			model: Role,
      // 			attributes: ['name', 'id'],
      // 		},
      // 		{
      // 			model: UserClient,
      // 			required: false,
      // 			attributes: ['id', 'clientId'],
      // 			where: { userId: { [Op.in]: req.body.id }, ...(Number(clientId) ? { clientId: clientId } : {}) },
      // 			include: [
      // 				{
      // 					model: Client,
      // 					attributes: ['id'],
      // 				},
      // 			],
      // 		},
      // 	],
      // });

      // responseData = parse(responseData);

      // let empdata = await Employee.findAll({
      // where: {
      // 	loginUserId: { [Op.in]: loginUserIds },
      // },
      // 	order:[['id','asc']],
      // 	limit: 1,
      // include: [
      // 	{
      // 		model: EmployeeSalary,
      // 		as: 'employeeSalary',
      // 		attributes: ['startDate'],
      // 		separate: true,
      // 		limit: 1,
      // 		order: [['startDate', 'desc']],
      // 	},
      // ],
      // });

      // empdata = parse(empdata);

      // const employeeMap: Record<string, any> = {};
      // empdata.forEach((employee: any) => {
      // 	employeeMap[employee.loginUserId] = employee;
      // });

      // responseData.forEach((user: any) => {
      // 	const loginUserId = user?.loginUserData?.id;
      // 	if (loginUserId && employeeMap[loginUserId]) {
      // 		user.employee = employeeMap[loginUserId];
      // 	}
      // });
      // const user = req.user as User;
      // await createHistoryRecord({
      //   tableName: tableEnum.USER,
      //   moduleName: moduleName.ADMIN,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryViewMessage(user, tableEnum.USER, `Specific User Message Service!`),
      //   jsonData: parse(responseData),
      //   activity: statusEnum.VIEW,
      // });
      responseData = parse(responseData);
      return generalResponse(
        req,
        res,
        responseData,
        this.msg.fetch,
        "success",
        false
      );
    }
  );

  /**
   * Add user Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */

  public deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { clientId } = req.query;
    const user = req.user as User;
    if (Number(clientId)) {
      const existUserClient = await this.userClientRepo.get({
        where: { userId: Number(req.params.id), clientId: Number(clientId) },
      });
      existUserClient.update({
        updatedBy: req.user.id,
        deletedAt: new Date(),
      });
      // await createHistoryRecord({
      //   tableName: tableEnum.USER,
      //   moduleName: moduleName.ADMIN,
      //   userId: user?.id,
      //   lastlogintime: user?.loginUserData?.logintimeutc,
      //   custom_message: await customHistoryDeleteMessage(user, tableEnum.MESSAGE, existUserClient),
      //   jsonData: parse(existUserClient),
      //   activity: statusEnum.VIEW,
      // });
    } else {
      await this.userRepository.deleteUser({
        data: req.body,
        action: "update",
        id: Number(req.params.id),
        authUser: user,
      });
    }
    return generalResponse(req, res, {}, this.msg.delete, "success", true);
  });

  /**
   * update user Api
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   */

  public updateUserById = catchAsync(async (req: Request, res: Response) => {
    const { file: files } = req;
    const { clientId } = req.query;
    let body = req.body;
    const user = req.user as User;
    if (files) body = { ...body, profileImage: `/profile/${files.filename}` };
    _.omit(body, "profile");
    let responseData: User = null;
    if (Number(clientId)) {
      const existUserClient = await this.userClientRepo.get({
        where: {
          userId: Number(req.params.id),
          clientId: Number(clientId),
          deletedAt: null,
        },
      });

      if (existUserClient) {
        existUserClient.update({ roleId: body.roleId });
        const getUserData = await this.userRepository.get({
          where: { id: existUserClient.userId },
        });
        responseData = getUserData;
      }
    } else {
      responseData = await this.userRepository.updateUser({
        data: {
          roleId: body.roleId,
        },
        action: "update",
        id: Number(req.params.id),
      });
    }

    responseData = parse(responseData);
    if (responseData) {
      const password = body.password && (await bcrypt.hash(body.password, 10));
      let updateObj = {
        name: body.name,
        timezone: body.timezone,
        isMailNotification: body.isMailNotification,
        ...(files && { profileImage: body.profileImage }),
        ...(body.password ? { password: password, randomPassword: null } : {}),
        updatedatutc: new Date().toISOString(),
      };

      await this.loginUserRepo.update(updateObj, {
        where: { id: responseData.loginUserId },
      });

      let existUserPermissionList = [];
      const clientIds = Number(clientId) || null;
      body.permissions &&
        (await Promise.all(
          body.permissions?.map(async (permission: number) => {
            const permissionData = {
              permissionId: permission,
              roleId: body.roleId,
              loginUserId: responseData.loginUserId,
              clientId: clientIds,
            };
            const isExistUserPermission = await UserPermission.findOne({
              where: {
                ...permissionData,
                deletedAt: null,
              },
            });
            existUserPermissionList = [
              ...existUserPermissionList,
              Number(permission),
            ];
            if (!isExistUserPermission) {
              await UserPermission.create({
                ...permissionData,
                roleId: body.roleId,
                createdBy: req.user.id,
              });
            }
          })
        ));
      await UserPermission.destroy({
        where: {
          loginUserId: responseData.loginUserId,
          // ...(isEmployeeUserExist.length && { roleId: { [Op.notIn]: isEmployeeUserExist.map((role) => role.roleId) } }),
          [Op.or]: {
            roleId: { [Op.ne]: body.roleId },
            [Op.and]: {
              roleId: body.roleId,
              permissionId: { [Op.notIn]: existUserPermissionList },
            },
          },
          clientId: clientIds,
        },
      });
    }

    await createHistoryRecord({
      tableName: tableEnum.USER,
      userId: user?.id,
      moduleName: moduleName.ADMIN,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: `<b>${user?.loginUserData?.name}</b> has <b>updated</b> the ${tableEnum.USER} table for user ${body.name}`,
      jsonData: parse(responseData),
      activity: statusEnum.UPDATE,
    });
    return generalResponse(
      req,
      res,
      {},
      "User updated successfully",
      "success",
      true
    );
  });

  public updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { clientId } = req.query;
    if (Number(clientId)) {
      const existUserClient = await this.userClientRepo.get({
        where: {
          userId: Number(req.params.id),
          clientId: Number(clientId),
          deletedAt: null,
        },
      });
      const oldExistUserClient = { ...existUserClient };
      if (existUserClient) {
        existUserClient.update({
          status:
            existUserClient.status === status.ACTIVE
              ? status.INACTIVE
              : status.ACTIVE,
        });
        const user = req.user as User;
        await createHistoryRecord({
          tableName: tableEnum.USER,
          moduleName: moduleName.ADMIN,
          userId: user?.id,
          custom_message: await customHistoryUpdateMesage(
            req.body,
            oldExistUserClient,
            user,
            existUserClient,
            tableEnum.USER,
            `Update User Status`
          ),
          lastlogintime: user?.loginUserData?.logintimeutc,
          jsonData: parse(existUserClient),
          activity: statusEnum.UPDATE,
        });
      }
    } else {
      const isExistUser = await User.findOne({
        where: {
          id: Number(req.params.id),
          deletedAt: null,
        },
      });
      const nowUser = await this.userRepository.updateUser({
        data: {
          status:
            isExistUser.status === status.ACTIVE
              ? status.INACTIVE
              : status.ACTIVE,
        },
        action: "update",
        id: Number(req.params.id),
      });
      const user = req.user as User;
      await createHistoryRecord({
        tableName: tableEnum.USER,
        moduleName: moduleName.ADMIN,
        userId: user?.id,
        custom_message: await customHistoryUpdateMesage(
          req.body,
          isExistUser,
          user,
          nowUser,
          tableEnum.USER,
          `Update User Status`
        ),
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(nowUser),
        activity: statusEnum.UPDATE,
      });
    }
    return generalResponse(
      req,
      res,
      {},
      "User status changed successfully",
      "success",
      true
    );
  });

  public updateUser = catchAsync(async (req: Request, res: Response) => {
    const { file: files } = req;
    if (files)
      req.body = { ...req.body, profileImage: `/profile/${files.filename}` };
    _.omit(req.body, "profile");
    const userData = req.user as User;
    const responseData = await this.userRepository.updateUser({
      data: req.body,
      action: "update",
      id: userData.id,
      authUser: userData,
    });

    return generalResponse(
      req,
      res,
      responseData,
      "User updated successfully",
      "success",
      true
    );
  });

  public updateUserLoginUserDataById = catchAsync(
    async (req: Request, res: Response) => {
      const { clientId }: IQueryParameters = req.query;
      const responseData = await this.userClientRepo.updateUserClientData({
        body: req.body,
        user: req.user as User,
        id: Number(req.params.id),
        clientId,
      });
      return generalResponse(
        req,
        res,
        responseData,
        "User updated successfully",
        "success",
        true
      );
    }
  );

  public updateUserSegmentDataById = catchAsync(
    async (req: Request, res: Response) => {
      const { clientId }: IQueryParameters = req.query;
      const responseData = await this.userSegmentRepo.updateUserSegmentData({
        body: req.body,
        user: req.user as User,
        id: Number(req.params.id),
        clientId,
      });
      return generalResponse(
        req,
        res,
        responseData,
        "User updated successfully",
        "success",
        true
      );
    }
  );

  public removeUserClient = catchAsync(async (req: Request, res: Response) => {
    const { clientId }: IQueryParameters = req.query;
    await this.userClientRepo.deleteUserClient(
      Number(req.params.id),
      clientId,
      req.user as User
    );
    return generalResponse(
      req,
      res,
      {},
      "User Client Deleted Successfully",
      "success",
      false
    );
  });

  public removeUserSegment = catchAsync(async (req: Request, res: Response) => {
    const { type } = req.query;
    await this.userSegmentRepo.deleteUserSegment(
      Number(req.params.id),
      type as string,
      req.user as User
    );
    return generalResponse(
      req,
      res,
      {},
      "User Segment Deleted Successfully",
      "success",
      false
    );
  });

  public loginAsUser = catchAsync(async (req: Request, res: Response) => {
    const { clientId } = req.query;
    const { userId } = req.body;
    let user = await this.userRepository.get({
      where: { id: userId },
      include: [
        {
          model: LoginUser,
          required: true,
          attributes: [
            "id",
            "email",
            "firstName",
            "lastName",
            "name",
            "password",
            "randomPassword",
            "profileImage",
            "timezone",
            "isMailNotification",
          ],
        },
        { model: Role, attributes: ["name", "isViewAll"] },
        {
          model: UserClient,
          ...(!Number(clientId) ? { required: true } : {}),
          required: false,
          attributes: ["id", "clientId"],
          where: { ...(Number(clientId) ? { clientId: clientId } : {}) },
          include: [
            {
              model: Client,
              attributes: ["id", "loginUserId", "code"],
              include: [{ model: LoginUser, attributes: ["name"] }],
            },
          ],
        },
        {
          model: UserSegment,
          required: false,
          attributes: ["id", "segmentId", "subSegmentId"],
          include: [
            {
              model: Segment,
              attributes: ["id", "slug", "name"],
            },
            {
              model: SubSegment,
              attributes: ["id", "slug", "name"],
            },
          ],
        },
      ],
      attributes: ["id", "loginUserId", "roleId", "status"],
      rejectOnEmpty: false,
    });
    user = parse(user);
    if (!user) throw new HttpException(200, "User not found.", {}, true);
    if (user?.status === status.INACTIVE) {
      throw new HttpException(200, "User is locked.", {}, true);
    }
    await createHistoryRecord({
      tableName: tableEnum.USER,
      moduleName: moduleName.ADMIN,
      userId: user?.id,
      custom_message: `<b>${user?.loginUserData?.name}<b/> has Login`,
      lastlogintime: user?.loginUserData?.logintimeutc,
      jsonData: parse(user),
      activity: statusEnum.LOGIN,
    });
    return generalResponse(
      req,
      res,
      {
        user: { ...user, clientId: clientId ? Number(clientId) : null },
        access_token: this.authRepository.createToken(user),
      },
      "User Logged In Successfully",
      "success",
      false
    );
  });

  // Send Password Update Link API
  public sendLink = catchAsync(async (req: Request, res: Response) => {
    const data = await this.userRepository.sendLink(req.body);
    return generalResponse(
      req,
      res,
      data,
      "Email sent successfully",
      "success",
      true
    );
  });
}

export default UserController;
