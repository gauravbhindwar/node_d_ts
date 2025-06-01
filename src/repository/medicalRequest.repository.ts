import { FRONTEND_URL, SERVER_URL } from "@/config";
import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import {
  createHistoryRecord,
  customHistoryCreateMessage,
  customHistoryUpdateMesage,
} from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import {
  moduleName,
  statusEnum,
  tableEnum,
} from "@/interfaces/model/history.interface";
import {
  IMedicalRequestCreate,
  medicalRequestStatus,
} from "@/interfaces/model/medicalRequest.interface";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import LoginUser from "@/models/loginUser.model";
import MedicalRequest from "@/models/medicalRequest.model";
import MedicalType from "@/models/medicalType.model";
import User from "@/models/user.model";
import {
  folderExistCheck,
  formatOptionData,
  getSegmentAccessForUser,
  getSubSegmentAccessForUser,
  parse,
} from "@/utils/common.util";
import { pdf } from "@/utils/puppeteer.pdf";
import moment from "moment";
import path from "path";
import { Op } from "sequelize";
import BaseRepository from "./base.repository";
import MedicalTypeRepo from "./medicalType.repository";

export default class MedicalRequestRepo extends BaseRepository<MedicalRequest> {
  constructor() {
    super(MedicalRequest.name);
  }

  private msg = new MessageFormation("MedicalRequest").message;
  private MedicalTypeService = new MedicalTypeRepo();

  async getAllMedicalRequests(query: IQueryParameters) {
    const {
      page,
      limit,
      sortBy,
      sort,
      clientId,
      employeeId,
      startDate,
      endDate,
    } = query;
    const sortedColumn = sortBy || null;
    // End Date Convert with timestamp with timezone
    let dateWithTimezone = null;
    if (startDate && endDate) {
      dateWithTimezone = new Date(
        new Date(endDate).getTime() -
          new Date(endDate).getTimezoneOffset() * 60000
      );
      dateWithTimezone.setHours(23, 59, 59, 999); // Add Remaining minutes until the end of the day
    }

    let data = await this.getAllData({
      where: {
        ...(employeeId ? { employeeId: employeeId } : ""),
        ...(startDate && endDate && dateWithTimezone
          ? {
              createdAt: {
                [Op.between]: [
                  startDate,
                  new Date(dateWithTimezone).toISOString(),
                ],
              },
            }
          : {}),
        deletedAt: null,
      },
      include: [
        {
          model: Employee,
          required: true,
          where: clientId ? { clientId: clientId } : {},
          attributes: ["id", "loginUserId"],
          include: [
            {
              model: LoginUser,
              attributes: ["firstName", "lastName", "email", "phone"],
            },
          ],
        },
        {
          model: MedicalType,
          required: true,
          attributes: ["name", "daysExpiry"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "createdAt", sort ?? "desc"]],
    });
    // await createHistoryRecord({
    //   tableName: tableEnum.MEDICAL_REQUEST,
    //   moduleName: moduleName.MEDICAL,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MEDICAL_REQUEST, `All Medical Requests!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
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

  async getAllMedicalExpiryRequests(query: IQueryParameters, user: User) {
    const { page, limit, sortBy, sort, clientId } = query;
    const sortedColumn = sortBy || null;
    const segmentIds = getSegmentAccessForUser(user);
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const currentDate = moment().toDate();
    const expiryDate = moment().add(30, "days").toDate();

    let data = await Employee.findAndCountAll({
      where: {
        clientId: clientId,
        medicalCheckExpiry: {
          [Op.between]: [currentDate, expiryDate],
        },
        terminationDate: null,
        deletedAt: null,
        ...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
        ...(subSegmentIds?.length > 0 && {
          [Op.or]: [
            { subSegmentId: { [Op.in]: subSegmentIds } },
            { subSegmentId: null },
          ],
        }),
      },
      attributes: ["id", "medicalCheckExpiry", "medicalCheckDate"],
      include: [
        {
          model: LoginUser,
          attributes: ["firstName", "lastName", "email"],
        },
      ],
      offset: page && limit ? (page - 1) * limit : undefined,
      limit: limit ?? undefined,
      order: [[sortedColumn ?? "medicalCheckExpiry", sort ?? "asc"]],
    });
    // await createHistoryRecord({
    //   tableName: tableEnum.MEDICAL_REQUEST,
    //   moduleName: moduleName.MEDICAL,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MEDICAL_REQUEST, `All Medical Expiry Requests!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    data = parse(data);
    const responseObj = {
      data: data.rows,
      count: data.count,
      currentPage: page ?? undefined,
      limit: limit ?? undefined,
      lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
    };
    return responseObj;
  }

  async getMedicalRequestById(id: number) {
    let data = await MedicalRequest.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: MedicalType,
          required: true,
          attributes: ["name"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["id", "loginUserId"],
          include: [{ model: LoginUser, attributes: ["name", "email"] }],
        },
        {
          model: Employee,
          attributes: ["id"],
          include: [
            {
              model: LoginUser,
              attributes: ["firstName", "lastName", "email"],
            },
            { model: Client, attributes: ["stampLogo"] },
          ],
        },
      ],
    });
    if (!data) {
      throw new HttpException(404, this.msg.notFound);
    }
    // await createHistoryRecord({
    //   tableName: tableEnum.MEDICAL_REQUEST,
    //   moduleName: moduleName.MEDICAL,
    //   userId: user?.id,
    //   lastlogintime: user?.loginUserData?.logintimeutc,
    //   custom_message: await customHistoryViewMessage(user, tableEnum.MEDICAL_REQUEST, `Specific Medical Requests!`),
    //   jsonData: parse(data),
    //   activity: statusEnum.VIEW,
    // });
    data = parse(data);
    return data;
  }

  async addMedicalRequest({
    body,
    user,
  }: {
    body: IMedicalRequestCreate;
    user: User;
  }) {
    const lastData = await MedicalRequest.findOne({
      order: [["createdAt", "DESC"]],
    });
    const reference = `LRED/MC/${moment().format("DDMMMYY")}/${String(
      lastData ? lastData.id + 1 : 1
    ).padStart(4, "0")}`.toUpperCase();
    const medicalDate = moment(
      moment(body.medicalDate).format("DD/MM/YYYY"),
      "DD/MM/YYYY"
    ).toDate();

    let medicalTypeData = await MedicalType.findOne({
      where: {
        id: body.medicalTypeId,
      },
      attributes: [
        "daysExpiry",
        "format",
        "name",
        "daysBeforeExpiry",
        "amount",
      ],
    });
    medicalTypeData = parse(medicalTypeData);
    const medicalExpiry = moment(
      moment(body.medicalDate).format("DD/MM/YYYY"),
      "DD/MM/YYYY"
    )
      .add(medicalTypeData.daysExpiry, "days")
      .toDate();

    const formatType = formatOptionData?.find(
      (format) => format.title === medicalTypeData.format
    );

    const employeeData = await Employee.findOne({
      where: { id: body.employeeId, deletedAt: null },
      include: [
        {
          model: LoginUser,
          attributes: ["id", "email", "firstName", "lastName"],
        },
        {
          model: Client,
          attributes: ["id", "medicalEmailSubmission"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      attributes: [
        "clientId",
        "startDate",
        "medicalCheckDate",
        "medicalCheckExpiry",
        "employeeNumber",
        "segmentId",
        "subSegmentId",
      ],
    });

    const medicalRequestDate = moment(body.medicalDate);
    if (formatType?.value === 1) {
      const medicalRequest = await this.get({
        where: {
          employeeId: body.employeeId,
          medicalTypeId: body.medicalTypeId,
          deletedAt: null,
          status: "ACTIVE",
        },
        include: { model: MedicalType, where: { format: formatType.title } },
      });
      if (medicalRequest) {
        throw new HttpException(
          400,
          `${medicalTypeData.name} medical type request already exist`,
          null,
          true
        );
      } else if (
        !medicalRequestDate.isBetween(
          moment(employeeData.startDate),
          moment(employeeData.startDate).add("7", "days")
        )
      )
        throw new HttpException(
          400,
          `${medicalTypeData.name} medical type request has been expired`,
          null,
          true
        );
    } else if (formatType?.value === 2 && employeeData.medicalCheckExpiry) {
      if (
        !medicalRequestDate.isBefore(
          moment(employeeData.medicalCheckExpiry).subtract(
            medicalTypeData.daysBeforeExpiry ?? 0,
            "days"
          )
        )
      )
        throw new HttpException(
          400,
          `${
            medicalTypeData.name
          } medical type request has been allow only before ${
            medicalTypeData.daysBeforeExpiry ?? 0
          } days of expiry.`,
          null,
          true
        );
    } else if (formatType?.value === 4) {
      if (!["Tuesday", "Thursday"].includes(medicalRequestDate.format("dddd")))
        throw new HttpException(
          400,
          `${medicalTypeData.name} medical type request has been allow only tuesday and thursday`,
          null,
          true
        );
    }

    let data = await MedicalRequest.create({
      ...body,
      medicalDate,
      medicalExpiry,
      reference: reference,
      createdBy: user.id,
    });
    // const timesheetData = await Timesheet.findOne({
    // 	where: {
    // 		employeeId: body.employeeId,
    // 		startDate: { [Op.lte]: moment(body.medicalDate).toDate() },
    // 		endDate: { [Op.gte]: moment(body.medicalDate).toDate() },
    // 	},
    // 	include: [{ model: Client, attributes: ['code'] }],
    // });

    // if (timesheetData && medicalTypeData.amount) {
    // 	const accountPOsData = await AccountPO.findOne({ where: { timesheetId: timesheetData.id, type: 'Medical' } });
    // 	const previousRate = accountPOsData ? accountPOsData.dailyRate : 0;
    // 	const poNumber = 'PO' + String(timesheetData.id) + String(Math.floor(1000 + Math.random() * 9000));
    // 	const serviceMonth = moment(timesheetData?.startDate).format('MMM');
    // 	const serviceYear = moment(timesheetData?.startDate).format('YY');
    // 	const clientCode = timesheetData?.client?.code;
    // 	const invoiceNo = `${Math.floor(
    // 		Math.random() * 100000,
    // 	)}/${serviceMonth.toLocaleUpperCase()}${serviceYear}/${clientCode}`;
    // 	const managers = user?.loginUserData?.name
    // 		? user?.loginUserData?.name
    // 		: `${user.loginUserData?.lastName}+" "+${user.loginUserData?.firstName}`;
    // 	const accountData = {
    // 		timesheetId: timesheetData.id,
    // 		type: 'Medical',
    // 		poNumber: poNumber,
    // 		dailyRate: previousRate + Number(medicalTypeData.amount),
    // 		timesheetQty: 1,
    // 		startDate: timesheetData.startDate,
    // 		endDate: timesheetData.endDate,
    // 		segmentId: employeeData.segmentId,
    // 		subSegmentId: employeeData.subSegmentId,
    // 		invoiceNo: invoiceNo,
    // 		managers: managers,
    // 	};
    // 	!accountPOsData
    // 		? await AccountPO.create(accountData)
    // 		: await AccountPO.update(accountData, { where: { id: accountPOsData.id } });
    // }

    if (data) {
      await Employee.update(
        { medicalCheckDate: medicalDate, medicalCheckExpiry: medicalExpiry },
        { where: { id: data.employeeId }, individualHooks: true }
      );

      // *****************Medical Request Email Functionality (Medical Request Email Submission)*****************

      let emails = [];
      if (
        employeeData?.client?.medicalEmailSubmission ||
        employeeData?.client?.medicalEmailSubmission !== ""
      ) {
        emails = employeeData?.client?.medicalEmailSubmission.split(",");
      }

      const medicalType = await MedicalType.findOne({
        where: {
          id: data?.medicalTypeId,
        },
        attributes: ["name"],
      });

      if (medicalType) {
        const replacement = {
          client: employeeData.client.loginUserData.name,
          firstName: employeeData.loginUserData.firstName,
          lastName: employeeData.loginUserData.lastName,
          employeeNumber: employeeData.employeeNumber,
          logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          email: employeeData.loginUserData.email,
          mailHeader: `Medical Check Details`,
          checkReliquatUrl: "",
          message: `The medical check for ${medicalType?.name} for ${moment(
            data?.medicalDate
          ).format(
            "DD MMMM YYYY"
          )} for the respective employee has been created successfully`,
        };
        if (
          employeeData?.loginUserData?.email &&
          !emails.includes(employeeData?.loginUserData?.email)
        ) {
          emails.push(employeeData?.loginUserData?.email);
        }
        if (!emails.includes("admin@lred.com")) {
          emails.push("admin@lred.com");
        }
        const medicalRequestData = await this.getMedicalRequestById(data.id);
        const medicalTypeListData = await this.MedicalTypeService.getMedicalTypesData();
        const pdfName = `${moment().unix()}-medical-request.pdf`;
        if (medicalRequestData) {
          const resizeHeaderFooter = false;
          const footerContent = `Submitted by ${
            medicalRequestData.createdByUser.loginUserData.name
          } on ${moment(medicalRequestData.createdAt).format(
            "DD MMMM YYYY"
          )} at ${moment(medicalRequestData.createdAt).format("LT")}`;
          let typeList = `<td style="border: 1px solid #000; padding: 10px 0 0;">`;
          medicalTypeListData?.data?.map((item) => {
            if (item.id === medicalRequestData?.medicalTypeId) {
              typeList += `<p
							style="
							  font-size: 14px;
							  font-weight: 400;
							  line-height: 18px;
							  margin: 0 0 5px;
							  display: flex;
							  color:#6B070D ;
							  "
						  >
							<span class="icon">
							  <svg
								xmlns="http://www.w3.org/2000/svg"
								height="16"
								viewBox="0 -960 960 960"
								width="16"
								class="fill-current w-3 h-3 inline-block text-primaryRed"
							  >
								<path
								  d="M400-318 247-471l42-42 111 111 271-271 42 42-313 313Z"
								  fill="#6B070D"
								></path>
							  </svg>
							</span>
							${item.name}
						  </p>`;
            }
            // else {
            // 	typeList += `<p
            // 	style="
            // 	  font-size: 14px;
            // 	  font-weight: 400;
            // 	  line-height: 18px;
            // 	  margin: 0 0 5px;
            // 	  padding: 0 0 0 20px;
            // 	  "
            //   >
            //   ${item.name}
            //   </p>`;
            // }
          });
          typeList += `</td>`;
          const pdfReplacement = {
            status: medicalRequestData?.status,
            reference: medicalRequestData?.reference,
            medicalDate: moment(medicalRequestData?.medicalDate).format(
              "DD MMMM YYYY"
            ),
            firstName: medicalRequestData?.employee?.loginUserData?.firstName,
            lastName: medicalRequestData?.employee?.loginUserData?.lastName,
            employeeNumber: medicalRequestData?.employee?.employeeNumber,
            email: medicalRequestData?.employee?.loginUserData?.email,
            logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
            typeList: typeList,
          };
          const stampLogo =
            medicalRequestData?.employee?.client?.stampLogo !== null
              ? SERVER_URL + medicalRequestData?.employee?.client?.stampLogo
              : null;
          await pdf(
            pdfReplacement,
            `${pdfName}`,
            "medicalPdf",
            false,
            resizeHeaderFooter,
            stampLogo,
            footerContent
          );
        }
        const publicFolder = path.join(__dirname, "../../secure-file/");
        folderExistCheck(publicFolder);
        const filePath = path.join(publicFolder, `medicalPdf/${pdfName}`);
        if (emails && emails.length > 0) {
          // await sendMail(
          //   emails,
          //   "Medical Check Details",
          //   "generalMailTemplate",
          //   replacement,
          //   [{ path: filePath }]
          // );
        }
      }
    }

    data = parse(data);
    await createHistoryRecord({
      tableName: tableEnum.MEDICAL_REQUEST,
      moduleName: moduleName.MEDICAL,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryCreateMessage(
        user,
        tableEnum.MEDICAL_REQUEST,
        medicalTypeData
      ),
      jsonData: parse(data),
      activity: statusEnum.CREATE,
    });

    return data;
  }

  async updateMedicalRequestStatus({ user, id }: { user: User; id: number }) {
    const isExistMedicalRequest = await MedicalRequest.findOne({
      where: {
        id: id,
        deletedAt: null,
      },
      include: [
        {
          model: MedicalType,
          attributes: ["name"],
        },
      ],
    }).then((value) => parse(value));

    if (!isExistMedicalRequest) {
      throw new HttpException(404, this.msg.notFound);
    }

    const data = await MedicalRequest.update(
      { status: medicalRequestStatus.CANCELLED, updatedBy: user.id },
      {
        where: { id: id, status: medicalRequestStatus.ACTIVE },
        individualHooks: true,
      }
    );

    const employeeData = await Employee.findOne({
      where: { id: isExistMedicalRequest.employeeId, deletedAt: null },
      include: [
        {
          model: LoginUser,
          attributes: ["id", "email", "firstName", "lastName"],
        },
        {
          model: Client,
          attributes: ["id", "medicalEmailSubmission"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },
      ],
      attributes: [
        "clientId",
        "startDate",
        "medicalCheckDate",
        "medicalCheckExpiry",
        "employeeNumber",
        "segmentId",
        "subSegmentId",
      ],
    }).then((dataValue) => parse(dataValue));

    // cancel medical email functionality

    let emails = [];
    if (
      employeeData?.client?.medicalEmailSubmission ||
      employeeData?.client?.medicalEmailSubmission !== ""
    ) {
      emails = employeeData?.client?.medicalEmailSubmission.split(",");
    }

    if (isExistMedicalRequest.medicalTypeData.name) {
      const replacement = {
        client: employeeData.client.loginUserData.name,
        firstName: employeeData.loginUserData.firstName,
        lastName: employeeData.loginUserData.lastName,
        employeeNumber: employeeData.employeeNumber,
        logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
        email: employeeData.loginUserData.email,
        mailHeader: `Medical Check Details`,
        checkReliquatUrl: "",
        message: `The medical check for ${
          isExistMedicalRequest.medicalTypeData?.name
        } for ${moment(isExistMedicalRequest?.medicalDate).format(
          "DD MMMM YYYY"
        )} for the respective employee has been cancelled successfully`,
      };
      if (
        employeeData?.loginUserData?.email &&
        !emails.includes(employeeData?.loginUserData?.email)
      ) {
        emails.push(employeeData?.loginUserData?.email);
      }
      if (!emails.includes("admin@lred.com")) {
        emails.push("admin@lred.com");
      }
      const medicalRequestData = await this.getMedicalRequestById(
        isExistMedicalRequest.id
      );
      const medicalTypeListData = await this.MedicalTypeService.getMedicalTypesData();
      const pdfName = `${moment().unix()}-medical-request.pdf`;
      if (medicalRequestData) {
        const resizeHeaderFooter = false;
        const footerContent = `Submitted by ${
          medicalRequestData.createdByUser.loginUserData.name
        } on ${moment(medicalRequestData.createdAt).format(
          "DD MMMM YYYY"
        )} at ${moment(medicalRequestData.createdAt).format(
          "LT"
        )}, cancelled by ${
          medicalRequestData?.updatedByUser.loginUserData.name
        } on ${moment(medicalRequestData.updatedAt).format(
          "DD MMMM YYYY"
        )} at ${moment(medicalRequestData.updatedAt).format("LT")}`;
        let typeList = `<td style="border: 1px solid #000; padding: 10px 0 0;">`;
        medicalTypeListData?.data?.map((item) => {
          if (item.id === medicalRequestData?.medicalTypeId) {
            typeList += `<p
						style="
						  font-size: 14px;
						  font-weight: 400;
						  line-height: 18px;
						  margin: 0 0 5px;
						  display: flex;
						  color:#6B070D ;
						  "
					  >
						<span class="icon">
						  <svg
							xmlns="http://www.w3.org/2000/svg"
							height="16"
							viewBox="0 -960 960 960"
							width="16"
							class="fill-current w-3 h-3 inline-block text-primaryRed"
						  >
							<path
							  d="M400-318 247-471l42-42 111 111 271-271 42 42-313 313Z"
							  fill="#6B070D"
							></path>
						  </svg>
						</span>
						${item.name}
					  </p>`;
          }
          // else {
          // 	typeList += `<p
          // 	style="
          // 	  font-size: 14px;
          // 	  font-weight: 400;
          // 	  line-height: 18px;
          // 	  margin: 0 0 5px;
          // 	  padding: 0 0 0 20px;
          // 	  "
          //   >
          //   ${item.name}
          //   </p>`;
          // }
        });
        typeList += `</td>`;
        const pdfReplacement = {
          status: "CANCELLED",
          reference: medicalRequestData?.reference,
          medicalDate: moment(medicalRequestData?.medicalDate).format(
            "DD MMMM YYYY"
          ),
          firstName: medicalRequestData?.employee?.loginUserData?.firstName,
          lastName: medicalRequestData?.employee?.loginUserData?.lastName,
          employeeNumber: medicalRequestData?.employee?.employeeNumber,
          email: medicalRequestData?.employee?.loginUserData?.email,
          logourl: FRONTEND_URL + "/assets/images/lred-main-logo.png",
          typeList: typeList,
        };
        const stampLogo =
          medicalRequestData?.employee?.client?.stampLogo !== null
            ? SERVER_URL + medicalRequestData?.employee?.client?.stampLogo
            : null;
        await pdf(
          pdfReplacement,
          `${pdfName}`,
          "medicalPdf",
          false,
          resizeHeaderFooter,
          stampLogo,
          footerContent
        );
      }
      const publicFolder = path.join(__dirname, "../../secure-file/");
      folderExistCheck(publicFolder);
      const filePath = path.join(publicFolder, `medicalPdf/${pdfName}`);
      if (emails && emails.length > 0) {
        // await sendMail(
        //   emails,
        //   "Medical Check Details",
        //   "generalMailTemplate",
        //   replacement,
        //   [{ path: filePath }]
        // );
      }
    }
    // finished cancel medical email functionality
    await createHistoryRecord({
      tableName: tableEnum.MEDICAL_REQUEST,
      moduleName: moduleName.MEDICAL,
      userId: user?.id,
      lastlogintime: user?.loginUserData?.logintimeutc,
      custom_message: await customHistoryUpdateMesage(
        null,
        null,
        user,
        null,
        tableEnum.MEDICAL_TYPE,
        `Medical Request Status Update`
      ),
      jsonData: parse(data),
      activity: statusEnum.UPDATE,
    });

    return data;
  }

  async medicalservicesCountForDashboard(query: any, user: User) {
    try {
      const { clientId, medicalType, expiryType } = query;
      // Base filters
      const baseWhere = { deletedAt: null, status: "ACTIVE" };
      const employeeInclude = {
        model: Employee,
        required: true,
        where: clientId ? { clientId } : {},
        attributes: ["id", "clientId", "loginUserId"],
      };
  
      // Fetch all active medical records with employee and medical type
      const data = await this.getAllData({
        where: baseWhere,
        include: [
          employeeInclude,
          {
            model: MedicalType,
            required: true,
          },
        ],
      });
  
      let paidCount = 0;
      let unpaidCount = 0;
  
      if (data.count > 0) {
        for (const record of data.rows) {
          const isChargeable = record?.medicalTypeData?.chargeable === "yes";
          isChargeable ? paidCount++ : unpaidCount++;
        }
      }
  
      // Get count for specific medical type (if provided)
      const medicalTypeCount = medicalType
        ? await MedicalRequest.count({
            where: {
              ...baseWhere,
              medicalTypeId: medicalType,
            },
            include: [employeeInclude],
          })
        : 0;
  
      // Get count for medical expiry within next 30 days (if provided)
      const medicalExpiryCount = await MedicalRequest.count({
            where: {
              ...baseWhere,
              // medicalTypeId: expiryType,
              medicalExpiry: {
                [Op.between]: [
                  moment().toDate(),
                  moment().add(30, "days").toDate(),
                ],
              },
            },
            include: [
              {
                ...employeeInclude,
                attributes: [
                  "id",
                  "clientId",
                  "loginUserId",
                  "medicalCheckExpiry",
                ],
              },
            ],
          })
        ;
  
      // Final response
      return {
        totalCount: data.count,
        paidCount,
        unpaidCount,
        medicalTypeCount,
        medicalExpiryCount,
      };
    } catch (error) {
      console.log("error", error);
    }
  }
  
}
