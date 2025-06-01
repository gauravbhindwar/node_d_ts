import { FRONTEND_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import TimesheetController from "@/controllers/timesheet.controller";
import { HttpException } from "@/exceptions/HttpException";
import { numDate } from "@/helpers/common.helper";
import { createHistoryRecord, customHistoryCreateMessage } from "@/helpers/history.helper";
import { sendMail } from "@/helpers/mail.helper";
import { secureFileToken } from "@/helpers/secureFolder.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import { statusEnum, tableEnum } from "@/interfaces/model/history.interface";
import { IImportLogCreate } from "@/interfaces/model/importLog.interface";
import { importLogStatus } from "@/interfaces/model/importLogItem.interface";
import { RolePermissionAttributes } from "@/interfaces/model/rolePermission.interface";
import { status } from "@/interfaces/model/user.interface";
import db from "@/models";
import BonusType from "@/models/bonusType.model";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import EmployeeRotation from "@/models/employeeRotation.model";
import EmployeeSalary from "@/models/employeeSalary.model";
import EmployeeSegment from "@/models/employeeSegment.model";
import ImportLog from "@/models/importLog.model";
import ImportLogItems from "@/models/importLogItem.model";
import LoginUser from "@/models/loginUser.model";
import Role from "@/models/role.model";
import RolePermission from "@/models/rolePermission.model";
import Rotation from "@/models/rotation.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import Timesheet from "@/models/timesheet.model";
import TimesheetSchedule from "@/models/timesheetSchedule.model";
import User from "@/models/user.model";
import UserPermission from "@/models/userPermission.model";
import {
  createRandomHash,
  generateUniquePassword,
  parse,
} from "@/utils/common.util";
import moment from "moment";
import path from "path";
import { Op, Transaction } from "sequelize";
import XLSX from "xlsx";
import socketIo from "../socket";
import BaseRepository from "./base.repository";
import EmployeeRepo from "./employee.repository";
import TimesheetRepo from "./timesheet.repository";
export default class ImportLogRepo extends BaseRepository<ImportLog> {
  constructor() {
    super(ImportLog.name);
  }

  public timesheetController = new TimesheetController();
  private timesheetRepo = new TimesheetRepo();
  private employeeRepo = new EmployeeRepo();
  private msg = new MessageFormation("Import Log").message;

  async findAllImportLogData(query: IQueryParameters) {
    const { page, limit, clientId, sortBy, sort } = query;
    const sortedColumn = sortBy || null;
    let data = await this.getAllData({
      where: {
        ...(clientId != undefined && { clientId: clientId }),
      },
      include: [
        {
          model: Client,
          attributes: ["loginUserId"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "fileName", sort ?? "asc"]],
    });
    data = parse(data);
    const dataFile = await Promise.all(
      data?.rows.map(async (row) => {
        const temp = { ...row };
        temp.fileName = await secureFileToken(row.fileName);
        return temp;
      })
    );
    const responseObj = {
      data: dataFile,
      count: data?.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    return responseObj;
  }

  async getImportLogItemsByIdService(id: number) {
    const isFound = await this.get({
      where: { id: id },
      include: [
        {
          model: ImportLogItems,
          attributes: ["status", "description", "id"],
        },
      ],
    });
    if (!isFound) {
      throw new HttpException(404, this.msg.notFound);
    }
    const data = parse(isFound);
    data.fileName = await secureFileToken(data.fileName);
    return data;
  }

  async addImportEmployee({
    body,
    user,
    image,
  }: {
    body: IImportLogCreate;
    user: User;
    image: Express.Multer.File;
  }) {
    try {
      if (image?.filename) body.fileName = `/employeeData/${image?.filename}`;

      const workbook = XLSX.readFile(
        path.join(__dirname, `../../secure-file/employeeFile/${image.filename}`)
      );
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const dataJson = XLSX.utils.sheet_to_json(worksheet, {
        blankrows: false,
        defval: "",
      });

      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const totalRows = range.e.r - range.s.r;

      let dataValue = parse(dataJson);

      dataValue = dataValue.map((element: object) => {
        const newObj = {};
        for (const key in element) {
          newObj[key.replace(/\*/g, "")] = element[key];
        }

        return newObj;
      });

      const findData = dataValue.find(
        (item) =>
          item["Contract Number"] !== "" &&
          item.Forename !== "" &&
          item.Segment !== "" &&
          item.Surname !== "" &&
          item.Rotation !== "" &&
          item["Mobile Number"] !== "" &&
          item["Start Date"] !== "" &&
          item.Fonction !== ""
      );

      if (!findData) {
        throw new HttpException(
          400,
          "An error occurred while importing the sheet First Name,Last Name,Rotation,Segment,Contract Number,Phone Number,Start Date,Fonction are required fields Please make sure to enter the correct data",
          true
        );
      }

      const value = await this.importLogs(body, user, totalRows);

      await createHistoryRecord({
        tableName: tableEnum.IMPORT_LOGS,
        userId: user?.id,
        custom_message: await customHistoryCreateMessage(user, tableEnum.IMPORT_LOGS, {name: "Import Employee"}),
        lastlogintime: user?.loginUserData?.logintimeutc,
        jsonData: parse(value),
        activity: statusEnum.CREATE,
      });

      const promises = [];
      const i = 0;
      for (const dataItem of dataValue) {
        const transaction = await db.transaction();
        const io = socketIo.getServer();
        try {
          const resp = await this.checkData(
            dataItem,
            body,
            user,
            value.id,
            transaction
          );

          if (resp) {
            await this.importLogItems({
              employeeNumber: dataItem?.Matricule,
              logId: value?.id,
              user: user,
            });
          }
          const dataCount = Math.ceil(100 / dataValue.length) * Number(i + 1);

          let isExist = await Employee.findOne({
            where: {
              employeeNumber: dataItem?.Matricule,
              clientId: body.clientId,
              deletedAt: null,
            },
            include: [
              {
                model: SubSegment,
                attributes: ["id"],
              },
              {
                model: Rotation,
                attributes: ["id"],
              },
            ],
          });

          isExist = parse(isExist);
          const isCheckEmployeeNumber =
            isExist?.employeeNumber != dataItem?.Matricule;
          const data = {
            count: Number(dataCount),
            type: "success",
            message: `Employee ${dataItem?.Matricule} employee ${
              isCheckEmployeeNumber ? "created" : "updated"
            } successfully.`,
          };

          await transaction.commit();
          // XeroHelperObject.generateMigration();
          io.to(`connect-${user?.id}`).emit("import-data-count", data);
          promises.push({
            data: resp,
            status: "success",
            index: dataItem?.Matricule,
          });
        } catch (error) {
          const errorString = error?.message.toString();
          const parts = errorString?.split("Error:");
          const errorPart = parts?.find((part) => part?.trim() !== "");
          const finalErrorMessage = errorPart
            ? errorPart.trim()
            : "Unknown Error";

          await this.importLogItems({
            employeeNumber: dataItem?.Matricule,
            logId: value?.id,
            user: user,
            errorItem: "error",
            errorMessage: finalErrorMessage,
          });
          const dataCount = Math.ceil(100 / dataValue.length) * Number(i + 1);
          const data = {
            count: Number(dataCount),
            type: "error",
            message: `Employee ${dataItem?.Matricule} ${finalErrorMessage}.`,
          };
          await transaction.rollback();

          io.to(`connect-${user?.id}`).emit("import-data-count", data);
          promises.push({
            data: error,
            status: "error",
            index: dataItem?.Matricule,
          });
        }
      }
      await Promise.all(promises);

      return {};
    } catch (error) {
      throw new Error(error);
    }
  }

  async checkData(
    data: any,
    body: IImportLogCreate,
    user: User,
    logId: number,
    transaction: Transaction = null
  ) {
    try {
      let finalData: any = [];

      const result = await this.checkSegmentSubSegment(
        data,
        body,
        user,
        transaction
      );

      const resultRotationValue = await Rotation.findOne({
        where: { name: data.Rotation },
        transaction,
      });
      const resultRotation = parse(resultRotationValue);

      if (!resultRotationValue) {
        throw new HttpException(
          400,
          "An error occurred while importing the sheet Rotation fields Please make sure to enter the correct Rotation data",
          true
        );
      }

      let isExist = await Employee.findOne({
        where: {
          employeeNumber: data?.Matricule,
          clientId: body.clientId,
          deletedAt: null,
        },
        include: [
          {
            model: SubSegment,
            attributes: ["id"],
          },
          {
            model: Rotation,
            attributes: ["id"],
          },
        ],
        transaction,
      });

      isExist = parse(isExist);

      const dataItem = await this.generateDataItem(
        data,
        result,
        resultRotation
      );
      const loginData = await this.generateLoginData(dataItem);

      const bonusData = await this.generateBonusData(dataItem);
      const bonusArray = await this.bonusArray(bonusData);

      if (bonusArray && bonusArray.length > 0) {
        finalData = await this.finalData(bonusArray, transaction);
      }

      finalData = finalData.flat();
      finalData = JSON.stringify({ data: finalData });
      const parsedFinalData = JSON.parse(finalData);

      const valueOfData = await this.generateValueOfData(
        body,
        data,
        dataItem,
        parsedFinalData,
        finalData
      );
      const employeeResult = await this.handleEmployee(
        isExist,
        dataItem,
        valueOfData,
        loginData,
        user,
        logId,
        transaction
      );
      return employeeResult;
    } catch (error) {
      throw new Error(error);
    }
  }

  // For Segment Data Function

  async checkSegmentSubSegment(
    data: any,
    body: IImportLogCreate,
    user: User,
    transaction: Transaction
  ) {
    let resultSegment, resultSubSegment;

    if (data.Segment !== "" && data["Sub-Segment"] === "") {
      const [result] = await Segment.findOrCreate({
        where: { code: data.Segment.toLowerCase(), deletedAt: null },
        defaults: {
          code: data.Segment.toLowerCase(),
          name: data.Segment.toLowerCase(),
          clientId: body.clientId,
          createdBy: user.id,
        },
        transaction,
      });

      resultSegment = parse(result);
    }

    if (data.Segment !== "" && data["Sub-Segment"] !== "") {
      const [result] = await Segment.findOrCreate({
        where: { code: data.Segment.toLowerCase(), deletedAt: null },
        defaults: {
          code: data.Segment.toLowerCase(),
          name: data.Segment.toLowerCase(),
          clientId: body.clientId,
          createdBy: user.id,
        },
        transaction,
      });

      resultSegment = parse(result);

      const [resultSubValue] = await SubSegment.findOrCreate({
        where: {
          code: data["Sub-Segment"].toLowerCase(),
          segmentId: resultSegment.id,
        },
        defaults: {
          code: data["Sub-Segment"].toLowerCase(),
          name: data["Sub-Segment"].toLowerCase(),
          segmentId: resultSegment?.id,
          createdBy: user.id,
        },
        transaction,
      });
      resultSubSegment = parse(resultSubValue);
    }
    return { resultSegment, resultSubSegment };
  }

  // generate Data Item
  async generateDataItem(data: any, result, resultRotation) {
    const dataItem = {
      ...data,
      segmentId: result?.resultSegment?.id ?? null,
      subSegmentId: result?.resultSubSegment?.id ?? null,
      rotationId: resultRotation?.id || null,
    };
    return dataItem;
  }

  // generate Login Data
  async generateLoginData(dataItem) {
    const loginData = {
      email: dataItem.Email ?? null,
      firstName: dataItem.Forename ?? null,
      lastName: dataItem.Surname ?? null,
      birthDate: dataItem["Date de naissance"]
        ? numDate(dataItem["Date de naissance"])
        : null,
      placeOfBirth: dataItem["Lieu de naissance"] ?? null,
      gender: dataItem["M / F"] === "M" ? "male" : "female",
      profileImage: dataItem["Profile Picture"] ?? null,
      phone: dataItem["Mobile Number"] ?? null,
    };
    return loginData;
  }

  // genarate Bonus Data
  async generateBonusData(dataItem) {
    const bonusData = {
      bonus1: dataItem["Type de Bonus 1"] ?? "",
      bonusPrice1: dataItem["Bonus 1"] ?? "",
      bonusCoutJournalier1: dataItem["Bonus Cout Journalier 1"] ?? "",
      bonusEffectiveDate1: dataItem["Bonus Effective Date 1"] ?? "",
      bonus2: dataItem["Type de Bonus 2"] ?? "",
      bonusPrice2: dataItem["Bonus 2"] ?? "",
      bonusCoutJournalier2: dataItem["Bonus Cout Journalier 2"] ?? "",
      bonusEffectiveDate2: dataItem["Bonus Effective Date 2"] ?? "",
      bonus3: dataItem["Type de Bonus 3"] ?? "",
      bonusPrice3: dataItem["Bonus 3"] ?? "",
      bonusCoutJournalier3: dataItem["Bonus Cout Journalier 3"] ?? "",
      bonusEffectiveDate3: dataItem["Bonus Effective Date 3"] ?? "",
      bonus4: dataItem["Type de Bonus 4"] ?? "",
      bonusPrice4: dataItem["Bonus 4"] ?? "",
      bonusCoutJournalier4: dataItem["Bonus Cout Journalier 4"] ?? "",
      bonusEffectiveDate4: dataItem["Bonus Effective Date 4"] ?? "",
    };

    return bonusData;
  }

  // set Bonus Array Data
  async bonusArray(bonusData: {}) {
    const bonusArray = [];
    for (let i = 1; i <= 4; i++) {
      const bonus = bonusData[`bonus${i}`];
      const bonusPrice = bonusData[`bonusPrice${i}`];
      const bonusCoutJournalier = bonusData[`bonusCoutJournalier${i}`];
      const bonusEffectiveDate = bonusData[`bonusEffectiveDate${i}`];

      if (
        bonus !== "" ||
        bonusPrice !== "" ||
        bonusCoutJournalier !== "" ||
        bonusEffectiveDate !== ""
      ) {
        bonusArray.push({
          bonus,
          bonusPrice,
          bonusCoutJournalier,
          bonusEffectiveDate,
        });
      }
    }
    return bonusArray;
  }

  // set Final Bonus Array Data
  async finalData(bonusArray, transaction: Transaction) {
    const finalData: any = [];
    for (const dataImportItem of bonusArray) {
      const bonusItem = await BonusType.findAll({
        attributes: ["id", "code"],
        where: {
          code: dataImportItem.bonus,
        },
        transaction,
      });
      const parsedBonusItem = parse(bonusItem);
      parsedBonusItem.forEach((itemBonus) => {
        itemBonus.label = itemBonus.code;
        itemBonus.price = dataImportItem.bonusPrice;
        itemBonus.coutJournalier = dataImportItem.bonusCoutJournalier;
        itemBonus.bonusEffectiveDate = dataImportItem.bonusEffectiveDate;
        delete itemBonus.code;
      });
      finalData.push(parsedBonusItem);
    }
    return finalData;
  }

  // set Value Of Data
  async generateValueOfData(
    body: IImportLogCreate,
    data: any,
    dataItem,
    parsedFinalData,
    finalData
  ) {
    const valueOfData = {
      employeeNumber: this.extractValue(dataItem, "Matricule", ""),
      TempNumber: this.extractValue(dataItem, "Temp No", null),
      contractNumber: this.extractValue(dataItem, "Contract Number", null),
      startDate: this.parseDate(dataItem, "Start Date"),
      fonction: dataItem.Fonction ?? null,
      nSS: this.extractValue(dataItem, "N° S.S.", null),
      terminationDate: this.parseDate(dataItem, "Termination Date"),
      baseSalary: this.extractNumber(dataItem, "Salaire de Base"),
      travelAllowance: this.extractNumber(dataItem, "Travel Allowance"),
      Housing: this.extractNumber(dataItem, "Housing"),
      monthlySalary: this.extractNumber(dataItem, "Monthly Salary"),
      overtime01Bonus: this.extractNumber(dataItem, "Overtime Bonus 1"),
      overtime02Bonus: this.extractNumber(dataItem, "Overtime Bonus 2"),
      customBonus: this.extractCustomBonus(parsedFinalData, finalData),
      contractSignedDate: this.parseDate(dataItem, "CNAS Declaration Date"),
      weekendOvertimeBonus: this.extractNumber(
        dataItem,
        "Weekend Overtime Bonus"
      ),
      address: this.extractValue(dataItem, "Address", null),
      medicalCheckDate: this.parseDate(dataItem, "Medical Check Date"),
      medicalCheckExpiry: this.parseDate(dataItem, "Medical Check Expiry"),
      medicalInsurance: this.extractBoolean(dataItem, "Carte Chifa"),
      contractEndDate: this.parseDate(dataItem, "Contract End Date"),
      LREDContractEndDate: this.parseDate(dataItem, "LRED Contract End Date"),
      dailyCost: this.extractNumber(dataItem, "Cout Journalier"),
      nextOfKinMobile: this.extractValue(dataItem, "Next Of Kin Mobile", null),
      catalogueNumber: this.extractValue(dataItem, "Catalogue Nº", null),
      nextOfKin: this.extractValue(dataItem, "Next Of Kin", null),
      initialBalance: this.extractValue(dataItem, "Initial Balance", null),
      photoVersionNumber: dataItem["Photo Version Number"] ?? null,
      clientId: body.clientId,
      segmentId: dataItem.segmentId,
      subSegmentId: dataItem.subSegmentId,
      rotationId: dataItem?.rotationId,
      email: dataItem.Email ?? null,
      slug: this.generateSlug(dataItem),
    };

    return valueOfData;
  }

  extractValue(dataItem: any, key: string, defaultValue: any) {
    return dataItem[key] !== "" ? dataItem[key] : defaultValue;
  }

  parseDate(dataItem: any, key: string) {
    return dataItem[key] ? numDate(dataItem[key]) : null;
  }

  extractNumber(dataItem: any, key: string) {
    return dataItem[key] !== "" ? dataItem[key] : Number(0.0);
  }

  extractBoolean(dataItem: any, key: string) {
    return dataItem[key] !== "" ? dataItem[key] === "Y" : null;
  }

  extractCustomBonus(parsedFinalData: any, finalData: any) {
    return parsedFinalData && parsedFinalData.data.length > 0
      ? finalData
      : null;
  }

  generateSlug(dataItem: any) {
    return dataItem.Matricule + createRandomHash(5);
  }

  // handle Employee Data
  async handleEmployee(
    isExist: any,
    dataItem,
    valueOfData,
    loginData,
    user,
    logId,
    transaction: Transaction
  ) {
    const rollOver = dataItem.Rollover;
    const segmentDate =
      dataItem["Segment Date"] !== null
        ? numDate(dataItem["Segment Date"])
        : new Date();
    const salaryDate =
      dataItem["Salary Date"] !== null
        ? numDate(dataItem["Salary Date"])
        : new Date();
    const rotationDate =
      dataItem["Rotation Date"] !== null
        ? numDate(dataItem["Rotation Date"])
        : new Date();

    if (!isExist) {
      return await this.createEmployeeData(
        valueOfData,
        rollOver,
        loginData,
        user,
        transaction
      );
    } else {
      const combineData = { salaryDate, rotationDate, segmentDate };
      return await this.updateEmployeeData(
        isExist,
        { combineData: combineData, data: valueOfData, loginData: loginData },
        rollOver,
        user,
        logId,
        transaction
      );
    }
  }

  async createEmployeeData(
    item: any,
    rollOver: string,
    loginData: any,
    user: User,
    transaction: Transaction = null
  ) {
    try {
      const isExistMobileNumber = await LoginUser.findOne({
        where: { phone: loginData.phone, deletedAt: null },
        transaction,
      });
      if (isExistMobileNumber) {
        throw new HttpException(
          400,
          "Phone Number Already Exist in this platform",
          {},
          true
        );
      }
      const randomPassword = generateUniquePassword();
      let loginUserData =
        (await LoginUser.findOne({
          where: {
            uniqueLoginId: `${loginData.firstName}${loginData.LastName}${
              loginData.birthDate
                ? moment(loginData.birthDate).format("YYYYMMDD")
                : ""
            }`
              .replace(" ", "")
              .toLowerCase(),
            deletedAt: null,
          },
          transaction,
        })) || null;
      if (!loginUserData) {
        loginUserData = await LoginUser.create(
          {
            ...loginData,
            name: loginData.firstName + " " + loginData.lastName,
            randomPassword: randomPassword,
            isMailNotification: false,
            uniqueLoginId: `${loginData.firstName}${loginData.lastName}${
              loginData.birthDate
                ? moment(loginData.birthDate).format("YYYYMMDD")
                : ""
            }`
              .replace(" ", "")
              .toLowerCase(),
          },
          { transaction }
        );
      }
      let response = await Employee.create(
        {
          ...item,
          startDate: moment(
            moment(item.startDate ?? new Date()).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
          loginUserId: loginUserData.id,
          createdBy: user.id,
        },
        { transaction }
      );
      response = parse(response);

      const roleData = await Role.findOne({
        where: { name: "Employee", deletedAt: null },
        include: [{ model: RolePermission, attributes: ["permissionId"] }],
        transaction,
      });
      if (roleData && loginUserData) {
        await User.create(
          {
            loginUserId: loginUserData.id,
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
                loginUserId: loginUserData.id,
                roleId: roleData.id,
                createdBy: user.id,
              },
              { transaction }
            );
          }
        );

        const replacement = {
          username: loginData.firstName + " " + loginData.lastName,
          useremail: loginData.email,
          password: randomPassword,
          logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          url: FRONTEND_URL,
        };
        if (loginData.email) {
          // await sendMail(
          //   [loginData.email, "admin@lred.com"],
          //   "Credentials",
          //   "userCredentials",
          //   replacement
          // );
        }
      }

      let clientData = await Client.findOne({
        where: {
          id: item.clientId,
        },
        transaction,
      });
      clientData = parse(clientData);

      await Client.update(
        {
          ...clientData,
          isResetBalance: rollOver === "Y",
          updatedBy: user.id,
        },
        { where: { id: item.clientId }, transaction }
      );
      if (item?.segmentId) {
        await EmployeeSegment.create(
          {
            employeeId: response.id,
            segmentId: item.segmentId,
            subSegmentId: item.subSegmentId ?? null,
            date: moment(
              moment(item.startDate ?? new Date()).format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
            createdBy: user.id,
          },
          { transaction }
        );
      }

      await EmployeeRotation.create(
        {
          employeeId: response.id,
          rotationId: response.rotationId || null,
          date: moment(
            moment(item.startDate ?? new Date()).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
          createdBy: user.id,
        },
        { transaction }
      );

      await this.timesheetController.createTimesheet(
        {
          clientId: item?.clientId,
          user: user,
          employeeIds: [+response.id],
          type: "createAccount",
        },
        transaction
      );
      await EmployeeSalary.create(
        {
          employeeId: response?.id,
          baseSalary: Number(item?.baseSalary.toFixed(2) ?? 0.0),
          monthlySalary: Number(item?.monthlySalary.toFixed(2) ?? 0.0),
          dailyCost: Number(item?.dailyCost.toFixed(2) ?? 0.0),
          startDate: item?.startDate ?? new Date(),
          endDate: null,
          createdBy: user?.id,
        },
        { transaction }
      );

      await createHistoryRecord(
        {
          tableName: tableEnum.EMPLOYEE_SALARY,
          userId: user?.id,
          custom_message: await customHistoryCreateMessage(user, tableEnum.EMPLOYEE_SALARY, {name: "Employee Salary Data!"}),
          lastlogintime: user?.loginUserData?.logintimeutc,
          jsonData: parse(response),
          activity: statusEnum.CREATE,
        },
        transaction
      );
      return response?.id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateEmployeeData(
    isExistUser: any,
    employeeData: { combineData; data: any; loginData: any },
    rollOver: string,
    user: User,
    logId: number,
    transaction: Transaction
  ) {
    const { data, combineData, loginData } = employeeData;
    const isExistPhoneNumber = await LoginUser.findOne({
      where: {
        phone: loginData.phone,
        id: { [Op.ne]: isExistUser.loginUserId },
        deletedAt: null,
      },
      transaction,
    });

    if (isExistPhoneNumber) {
      throw new HttpException(
        400,
        "Phone Number Already Exist in this platform",
        {},
        true
      );
    }
    let clientData = await Client.findOne({
      where: {
        id: data.clientId,
      },
      transaction,
    });
    clientData = parse(clientData);
    await Client.update(
      {
        ...clientData,
        isResetBalance: rollOver === "Y",
        updatedBy: user.id,
      },
      { where: { id: data.clientId }, transaction }
    );

    const lastExistSalary = await EmployeeSalary.findOne({
      where: { employeeId: isExistUser.id, deletedAt: null },
      order: [["id", "desc"]],
      transaction,
    });

    let updateEmployeeData = {};
    if (
      lastExistSalary?.baseSalary != data?.baseSalary ||
      lastExistSalary?.monthlySalary != data?.monthlySalary ||
      lastExistSalary?.dailyCost != data?.dailyCost ||
      moment(lastExistSalary?.startDate).valueOf() !=
        moment(combineData?.salaryDate ?? new Date()).valueOf()
    ) {
      updateEmployeeData = await this.handleEmployeeSalary(
        data,
        combineData,
        lastExistSalary,
        user,
        isExistUser,
        transaction
      );
    }

    await Employee.update(
      {
        ...data,
        startDate: moment(
          moment(data.startDate ?? new Date()).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate(),
        ...updateEmployeeData,
        updatedBy: user.id,
      },
      {
        where: {
          employeeNumber: isExistUser.employeeNumber,
          id: isExistUser.id,
        },
        transaction,
      }
    );
    if (isExistUser?.rotationId != data.rotationId) {
      await this.handleEmployeeRotation(
        isExistUser,
        combineData,
        data,
        user,
        transaction
      );
      await TimesheetSchedule.destroy({
        where: {
          date: {
            [Op.gte]: moment(
              moment(combineData.rotationDate ?? new Date()).format(
                "DD-MM-YYYY"
              ),
              "DD-MM-YYYY"
            ).toDate(),
          },
          employeeId: isExistUser.id,
        },
        transaction,
      });
      this.timesheetController.createTimesheet(
        {
          clientId: isExistUser.clientId,
          user: user,
          type: "createAccount",
          employeeIds: [isExistUser.id],
          disableFunction: ["timesheetSummary"],
        },
        transaction
      );
    }
    // Segment And Sub-Segment Update
    if (
      isExistUser?.segmentId != data.segmentId ||
      isExistUser?.subSegmentId !== data.subSegmentId
    ) {
      await this.handleEmployeeSegment(
        isExistUser,
        combineData,
        data,
        user,
        transaction
      );
    }
    await LoginUser.update(
      {
        ...loginData,
      },
      { where: { id: isExistUser.loginUserId }, transaction }
    );
    const valueOfReturn = await this.getObjectDifference(isExistUser, data);
    let empData = await this.employeeRepo.getEmployeeByIdService(
      isExistUser.id
    );
    empData = parse(empData);

    await this.handleTimesheetOperations(
      isExistUser,
      empData,
      combineData,
      data,
      user,
      transaction
    );
    await this.importLogItems({
      employeeNumber: data.employeeNumber,
      logId: logId,
      user: user,
      userId: isExistUser.id,
      valueOfReturn: valueOfReturn,
    });
  }

  // set salary data
  async handleEmployeeSalary(
    data: any,
    combineData,
    lastExistSalary,
    user: User,
    isExistUser: any,
    transaction: Transaction
  ) {
    let updateEmployeeData = {};

    await EmployeeSalary.update(
      {
        endDate: moment(combineData?.salaryDate).add(-1, "days"),
        updatedBy: user?.id,
      },

      { where: { id: lastExistSalary?.id }, transaction }
    );

    await EmployeeSalary.create(
      {
        baseSalary: Number(data?.baseSalary.toFixed(2) ?? 0.0),
        monthlySalary: Number(data?.monthlySalary.toFixed(2) ?? 0.0),
        dailyCost: Number(data?.dailyCost.toFixed(2) ?? 0.0),
        startDate: moment(combineData?.salaryDate ?? new Date()).toDate(),
        endDate: null,
        employeeId: isExistUser?.id,
        createdBy: user.id,
      },
      { transaction }
    );

    updateEmployeeData = {
      baseSalary: Number(data?.baseSalary.toFixed(2) ?? 0.0),
      monthlySalary: Number(data?.monthlySalary.toFixed(2) ?? 0.0),
      dailyCost: Number(data?.dailyCost.toFixed(2) ?? 0.0),
    };

    return updateEmployeeData;
  }

  // set rotation data
  async handleEmployeeRotation(
    isExistUser: any,
    combineData,
    data: any,
    user: User,
    transaction: Transaction
  ) {
    let existingRotation = await EmployeeRotation.findOne({
      where: {
        employeeId: isExistUser.id,

        date: moment(
          moment(combineData?.rotationDate ?? new Date()).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate(),
      },
      transaction,
    });
    existingRotation = parse(existingRotation);

    if (!existingRotation) {
      await EmployeeRotation.create(
        {
          employeeId: +isExistUser.id,
          rotationId: data.rotationId || null,
          date: moment(
            moment(combineData?.rotationDate ?? new Date()).format(
              "DD-MM-YYYY"
            ),
            "DD-MM-YYYY"
          ).toDate(),
          createdBy: user.id,
        },
        { transaction }
      );
    } else {
      await EmployeeRotation.update(
        {
          employeeId: isExistUser.id,
          rotationId: data.rotationId || null,
          date: moment(
            moment(combineData?.rotationDate ?? new Date()).format(
              "DD-MM-YYYY"
            ),
            "DD-MM-YYYY"
          ).toDate(),
          createdBy: user.id,
        },
        {
          where: {
            employeeId: isExistUser.id,
            date: moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate(),
          },
          transaction,
        }
      );
    }
    return;
  }

  // set segment data
  async handleEmployeeSegment(
    isExistUser: any,
    combineData,
    data: any,
    user: User,
    transaction: Transaction
  ) {
    let existingSegment = await EmployeeSegment.findOne({
      where: {
        employeeId: isExistUser.id,
        date: moment(
          moment(combineData?.segmentDate ?? new Date()).format("DD-MM-YYYY"),
          "DD-MM-YYYY"
        ).toDate(),
      },
      transaction,
    });

    existingSegment = parse(existingSegment);
    if (!existingSegment) {
      await EmployeeSegment.create(
        {
          employeeId: isExistUser.id,
          segmentId: data.segmentId || null,
          subSegmentId: data.subSegmentId || null,
          date: moment(
            moment(combineData?.segmentDate ?? new Date()).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
          createdBy: user.id,
        },
        { transaction }
      );
    } else {
      await EmployeeSegment.update(
        {
          employeeId: isExistUser.id,
          segmentId: data.segmentId || null,
          subSegmentId: data.subSegmentId || null,
          date: moment(
            moment(combineData?.segmentDate ?? new Date()).format("DD-MM-YYYY"),
            "DD-MM-YYYY"
          ).toDate(),
          createdBy: user.id,
        },
        {
          where: {
            employeeId: isExistUser.id,
            date: moment(
              moment(combineData?.segmentDate ?? new Date()).format(
                "DD-MM-YYYY"
              ),
              "DD-MM-YYYY"
            ).toDate(),
          },
          transaction,
        }
      );
    }
    return;
  }

  // set timesheet data
  async handleTimesheetOperations(
    isExistUser: any,
    empData,
    combineData,
    data: any,
    user: User,
    transaction: Transaction
  ) {
    if (
      String(moment(isExistUser?.startDate).format("DD-MM-YYYY")) !=
        String(moment(empData?.startDate).format("DD-MM-YYYY")) ||
      (empData.terminationDate &&
        String(moment(isExistUser?.terminationDate).format("DD-MM-YYYY")) !=
          String(moment(empData.terminationDate).format("DD-MM-YYYY")))
    ) {
      if (
        String(moment(isExistUser?.startDate).format("DD-MM-YYYY")) !=
        String(moment(empData?.startDate).format("DD-MM-YYYY"))
      ) {
        await this.timesheetRepo.clearEmployeeTimesheetByEmployeeId(empData.id);
      }

      this.timesheetController.createTimesheet(
        {
          clientId: data.clientId,
          user: user.id,
          employeeIds: [empData.id],
          type: "createAccount",
        },
        transaction
      );
    }

    if (
      isExistUser?.segmentId != empData?.segmentId ||
      isExistUser?.subSegmentId != empData?.subSegmentId
    ) {
      const currentDate = moment(
        moment(combineData?.segmentDate ?? new Date()).format("DD-MM-YYYY"),
        "DD-MM-YYYY"
      ).toDate();

      await Timesheet.update(
        { segmentId: empData?.segmentId, subSegmentId: empData?.subSegmentId },
        {
          where: {
            deletedAt: null,
            startDate: { [Op.gte]: currentDate },
            employeeId: empData.id,
          },
          transaction,
        }
      );
    }

    if (isExistUser?.rotationId != empData.rotationId) {
      this.timesheetController.createTimesheet(
        {
          clientId: data.clientId,
          user: user.id,
          employeeIds: [empData.id],
          type: "createAccount",
          disableFunction: ["timesheetSummary"],
        },
        transaction
      );
    }

    return;
  }

  async getObjectDifference(isExistUser: any, data: any) {
    const diff = {};
    for (const key in data) {
      if (data[key] != isExistUser[key]) {
        diff[key] = data[key];
      }
    }

    const dataValue = Object.keys(diff).join(",");
    return dataValue;
  }

  async importLogs(body: IImportLogCreate, user: User, totalRows: number) {
    let resultData = await ImportLog.create({
      fileName: body.fileName,
      clientId: body.clientId,
      rowNo: totalRows || 0,
      startDate: new Date(),
      endDate: new Date(),
      createdBy: user.id,
    });
    resultData = parse(resultData);
    return resultData;
  }

  async importLogItems({
    employeeNumber,
    logId,
    user,
    errorItem,
    userId,
    valueOfReturn,
    errorMessage,
  }: {
    employeeNumber: string;
    logId: number;
    user: User;
    errorItem?: string;
    userId?: number;
    valueOfReturn?: any;
    errorMessage?: string;
  }) {
    let description;
    let importStatus;

    if (errorItem !== "error" && userId) {
      description = `Employee ${
        valueOfReturn ?? "all"
      } updated using ${employeeNumber} employee number.`;
      importStatus = importLogStatus.OK;
    } else if (errorItem !== "error") {
      description = `Employee ${employeeNumber} created using employee number.`;
      importStatus = importLogStatus.INFO;
    } else {
      description = `Employee ${employeeNumber} ${errorMessage}.`;
      importStatus = importLogStatus.ERROR;
    }

    let responseData = await ImportLogItems.create({
      importLogId: logId,
      description: description,
      status: importStatus,
      createdBy: user.id,
    });
    responseData = parse(responseData);
    return responseData;
  }
}
