import { MessageFormation } from "@/constants/messages.constants";
import { HttpException } from "@/exceptions/HttpException";
import { getAllHistory } from "@/helpers/history.helper";
import { IQueryParameters } from "@/interfaces/general/general.interface";
import Client from "@/models/client.model";
import Employee from "@/models/employee.model";
import EmployeeContract from "@/models/employeeContract.model";
import EmployeeLeave from "@/models/employeeLeave.model";
import ErrorLogs from "@/models/errorLogs.model";
import LoginUser from "@/models/loginUser.model";
import Request from "@/models/request.model";
import Role from "@/models/role.model";
import Rotation from "@/models/rotation.model";
import Segment from "@/models/segment.model";
import SubSegment from "@/models/subSegment.model";
import TransportDriver from "@/models/transport.driver.model";
import TransportVehicle from "@/models/transport.vehicle.model";
import User from "@/models/user.model";
import UserClient from "@/models/userClient.model";
import TimesheetRepo from "@/repository/timesheet.repository";
import {
  getSegmentAccessForUser,
  getSubSegmentAccessForUser,
  parse,
} from "@/utils/common.util";
import _ from "lodash";
import moment from "moment";
import { Op } from "sequelize";
import AccountPORepo from "./accountPo.repository";
import ClientRepo from "./client.repository";
import EmployeeRepo from "./employee.repository";
import EmployeeContractRepo from "./employeeContract.repository";
import IncreaseRequest from "./incrementRequest.repository";
import MedicalRequestRepo from "./medicalRequest.repository";
import ReliquatCalculationRepo from "./reliquatCalculation.repository";

export default class DashboardRepo {
  private msg = new MessageFormation("Dashboard").message;
  private reliquatCalculationRepo = new ReliquatCalculationRepo();
  private employeeContractRepo = new EmployeeContractRepo();
  private accountPoRepo = new AccountPORepo();
  private medicalRequestRepo = new MedicalRequestRepo();
  private TimesheetService = new TimesheetRepo();
  private clientService = new ClientRepo();
  private EmployeeService = new EmployeeRepo();
  private SalaryBonusReq = new IncreaseRequest();

  async getAllDashboardData(
    query: IQueryParameters,
    contractEndFilter: number,
    user: User
  ) {
    const { clientId, limit, type } = query;
    const segmentIds = getSegmentAccessForUser(user);
    const subSegmentIds = getSubSegmentAccessForUser(user);
    const currentDate = moment();
    const expiryDate = moment().add(30, "days");
    const dayWiseCount = [];
    const condition =
      type && type != "all"
        ? {
            deletedAt: null,
            clientId: clientId,
            isAdminApproved: true,
            terminationDate:
              type == "active"
                ? { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } }
                : { [Op.not]: null, [Op.lte]: new Date() },
            segmentId: { [Op.not]: null },
          }
        : {
            deletedAt: null,
            clientId: clientId,
            segmentId: { [Op.not]: null },
          };

    // Request Data
    let requestData = await Request.findAndCountAll({
      attributes: [
        "id",
        "name",
        "contractNumber",
        "documentTotal",
        "deliveryDate",
        "createdAt",
        "createdatutc",
      ],
      include: [
        {
          model: Client,
          attributes: ["id"],
          include: [{ model: LoginUser, attributes: ["name"] }],
        },

        {
          model: Employee,
          required: true,
          attributes: ["segmentId", "subSegmentId"],
          include: [{ model: Segment }, { model: SubSegment, required: false }],
          where: {
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
        },
      ],
      where: {
        clientId: clientId,
        deletedAt: null,
      },
      limit: limit ?? undefined,
      order: [["createdAt", "desc"]],
    });

    // Employee Select Dropdown Data

    let employeeDropdownData = await Employee.findAll({
      where: {
        ...condition,
        ...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
        ...(subSegmentIds?.length > 0 && {
          [Op.or]: [
            { subSegmentId: { [Op.in]: subSegmentIds } },
            { subSegmentId: null },
          ],
        }),
      },
      attributes: ["id", "employeeNumber", "contractEndDate", "contractNumber"],
      include: [
        {
          model: LoginUser,
          attributes: ["firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Total Employee Count

    const employeeCount = await Employee.count({
      where: {
        ...condition,
        ...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
        ...(subSegmentIds?.length > 0 && {
          [Op.or]: [
            { subSegmentId: { [Op.in]: subSegmentIds } },
            { subSegmentId: null },
          ],
        }),
      },
    });

    // Total Contract End Data
    let totalContractEndData = await this.employeeContractRepo.getAllEmployeeContractEndService(
      (query = {
        clientId,
        startDate: moment("01-01-2021", "DD-MM-YYYY").toDate(),
        endDate: moment().add(1, "month").toDate(),
      }),
      user
    );

    // Total Contract End Count
    // let totalContractEndCount = totalContractEndData?.length ?? 0;

    // totalContractEndData = totalContractEndData
    //   .sort((a, b) =>
    //     a?.employeeDetail?.contractEndDate < b?.employeeDetail?.contractEndDate
    //       ? -1
    //       : 1
    //   )
    //   .slice(0, 5);

    // Total Contract Count

    const totalContractCount = await EmployeeContract.count({
      where: {
        deletedAt: null,
        endDate: {
          [Op.gte]: currentDate,
        },
      },
      include: [
        {
          model: Employee,
          attributes: ["clientId"],
          where: {
            ...(segmentIds?.length > 0 && {
              segmentId: { [Op.in]: segmentIds },
            }),
            ...(subSegmentIds?.length > 0 && {
              [Op.or]: [
                { subSegmentId: { [Op.in]: subSegmentIds } },
                { subSegmentId: null },
              ],
            }),
            clientId: clientId,
            terminationDate: null,
          },
        },
      ],
    });

    // Total Medical Expiry Count and Data

    let totalMedicalExpiryCount = await Employee.findAndCountAll({
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
      attributes: ["id", "medicalCheckExpiry"],
      include: [
        {
          model: LoginUser,
          attributes: ["firstName", "lastName"],
        },
      ],
      limit: limit ?? undefined,
      order: [["medicalCheckExpiry", "asc"]],
    });

    // Failed Login Data

    const failedLoginData = await ErrorLogs.findAll({
      where: {
        type: "auth",
      },
      attributes: ["createdAt", "email", "status", "createdatutc"],
      order: [["createdAt", "desc"]],
      limit: limit ?? undefined,
    });

    // Contract End Graph Data
    if (contractEndFilter !== 365) {
      for (let i = 1; i <= contractEndFilter; i++) {
        const startExpiry = moment().add(i, "days").startOf("day").toDate();
        const endExpiry = moment().add(i, "days").endOf("day").toDate();
        let dataCount = 0;
        const employeeContractTableCount = await EmployeeContract.count({
          where: {
            endDate: {
              [Op.and]: {
                [Op.gte]: startExpiry,
                [Op.lt]: endExpiry,
              },
            },
            deletedAt: null,
          },
          include: {
            model: Employee,
            where: {
              clientId: clientId,
              terminationDate: null,
              ...(segmentIds?.length > 0 && {
                segmentId: { [Op.in]: segmentIds },
              }),
              ...(subSegmentIds?.length > 0 && {
                [Op.or]: [
                  { subSegmentId: { [Op.in]: subSegmentIds } },
                  { subSegmentId: null },
                ],
              }),
            },
          },
        });
        const employeeTableCount = await Employee.count({
          where: {
            contractEndDate: {
              [Op.and]: {
                [Op.gte]: startExpiry,
                [Op.lt]: endExpiry,
              },
            },
          },
        });
        dataCount = employeeContractTableCount + employeeTableCount;

        const employeeContractEndCounts = {
          expiryDate: startExpiry,
          dataCount: dataCount,
        };

        dayWiseCount.push(employeeContractEndCounts);
      }
    } else {
      for (let i = 0; i <= 11; i++) {
        const currentMonthName = moment().month(i).format("MMM");
        const startExpiry = moment()
          .month(i)
          .startOf("month")
          .startOf("day")
          .toDate();
        const endExpiry = moment()
          .month(i)
          .endOf("month")
          .endOf("day")
          .toDate();

        const dataCount = await EmployeeContract.count({
          where: {
            endDate: {
              [Op.and]: {
                [Op.gte]: startExpiry,
                [Op.lt]: endExpiry,
              },
            },
            deletedAt: null,
          },
          include: {
            model: Employee,
            where: {
              clientId: clientId,
              terminationDate: null,
              ...(segmentIds?.length > 0 && {
                segmentId: { [Op.in]: segmentIds },
              }),
              ...(subSegmentIds?.length > 0 && {
                [Op.or]: [
                  { subSegmentId: { [Op.in]: subSegmentIds } },
                  { subSegmentId: null },
                ],
              }),
            },
          },
        });

        const employeeContractEndCounts = {
          expiryDate: currentMonthName,
          dataCount: dataCount,
        };

        dayWiseCount.push(employeeContractEndCounts);
      }
    }

    requestData = parse(requestData);
    employeeDropdownData = parse(employeeDropdownData);
    // totalContractEndCount = parse(totalContractEndCount);
    totalMedicalExpiryCount = parse(totalMedicalExpiryCount);

    return {
      requestData,
      employeeCount,
      employeeDropdownData,
      totalContractEndData: totalContractEndData,
      // totalContractEndCount,
      totalContractCount,
      totalMedicalExpiryCount,
      dayWiseCount,
      failedLoginData,
      limit: limit ?? undefined,
    };
  }

  async getAllEmployeeData(query: IQueryParameters) {
    const { clientId, employeeId } = query;

    // Get Employee Details by Employee ID

    let employeeDetail = await EmployeeContract.findAll({
      where: {
        deletedAt: null,
        employeeId: employeeId,
      },
      attributes: ["newContractNumber"],
      include: [
        {
          model: Employee,
          attributes: ["id", "medicalCheckDate", "slug", "medicalCheckExpiry"],
          where: {
            clientId: clientId,
            segmentId: { [Op.not]: null },
          },
          required: true,
          include: [
            {
              model: LoginUser,
              attributes: ["firstName", "lastName"],
            },
            {
              model: Segment,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    // Get Balance(Reliquat Calculation)
    let reliquatCalculation = null;
    reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService(
      {
        employeeId: String(employeeId),
        date: moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY").toDate(),
      }
    );
    if (reliquatCalculation === undefined) {
      const reliquatCalculationData = await this.reliquatCalculationRepo.get({
        where: {
          employeeId: String(employeeId),
          startDate: {
            [Op.lte]: moment(
              moment().format("DD-MM-YYYY"),
              "DD-MM-YYYY"
            ).toDate(),
          },
        },
        order: [["startDate", "desc"]],
      });
      reliquatCalculation = reliquatCalculationData?.reliquat;
    }

    // Get Employee Name By ID and Employee Leave Data

    let employeeName = await Employee.findOne({
      where: {
        clientId: clientId,
        id: employeeId,
        deletedAt: null,
        segmentId: { [Op.not]: null },
      },
      attributes: ["id", "slug", "contractNumber"],
      include: [
        {
          model: LoginUser,
          attributes: ["firstName", "lastName"],
        },
        {
          model: EmployeeLeave,
          attributes: ["id", "startDate"],
          separate: true,
          limit: 1,
          order: [["startDate", "ASC"]],
        },
        {
          model: Segment,
          attributes: ["name"],
        },
      ],
    });
    employeeDetail = parse(employeeDetail);
    employeeName = parse(employeeName);
    // reliquatCalculation = parse(reliquatCalculation);
    return { employeeDetail, employeeName, reliquatCalculation };
  }

  async getAllTransportData(query: IQueryParameters) {
    const { clientId, limit } = query;

    // Available Drivers Data

    let driversData = await TransportDriver.findAll({
      where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
      attributes: ["id", "unavailableDates", "driverNo"],
    });

    driversData = parse(driversData);

    let availableDriverData = [];

    for (const data of driversData) {
      filterData(data, availableDriverData);
    }

    availableDriverData = limit && availableDriverData.splice(0, limit);

    // Available Vehicles Data

    let vehiclesData = await TransportVehicle.findAll({
      where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
      attributes: ["id", "unavailableDates", "vehicleNo"],
    });

    vehiclesData = parse(vehiclesData);

    let availableVehicleData = [];

    for (const data of vehiclesData) {
      filterData(data, availableVehicleData);
    }

    availableVehicleData = limit && availableVehicleData.splice(0, limit);

    // Booked Driver Data

    let bookedDriverData = await TransportDriver.findAll({
      where: {
        ...(clientId && { clientId: clientId }),
        deletedAt: null,
        unavailableDates: {
          [Op.or]: {
            [Op.ne]: null,
            // [Op.ne]: '',
          },
        },
      },
      attributes: ["id", "driverNo", "unavailableDates"],
      limit: limit ?? undefined,
    });

    // Booked Vehicle Data

    let bookedVehiclesData = await TransportVehicle.findAll({
      where: {
        ...(clientId && { clientId: clientId }),
        deletedAt: null,
        unavailableDates: {
          [Op.or]: {
            [Op.ne]: null,
            // [Op.ne]: '',
          },
        },
      },
      attributes: ["id", "vehicleNo", "unavailableDates"],
      limit: limit ?? undefined,
    });

    bookedDriverData = parse(bookedDriverData);
    bookedVehiclesData = parse(bookedVehiclesData);

    return {
      availableDriverData,
      availableVehicleData,
      bookedDriverData,
      bookedVehiclesData,
      limit: limit ?? undefined,
    };
  }

  async getAllUserAccountsData(
    userAccountFilter: number,
    clientId: number | null
  ) {
    const dayWiseChartCount = [];
    const findAllUser = await User.findAll({
      where: {
        deletedAt: null,
        ...(clientId && {
          [Op.or]: {
            "$userClientList.clientId$": clientId,
            "$loginUserData.employee.clientId$": clientId,
            "$loginUserData.client.id$": clientId,
          },
        }),
      },
      include: [
        {
          model: LoginUser,
          required: true,
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
          model: Role,
          attributes: ["id"],
          where: {
            name: { [Op.ne]: "super admin" },
          },
          required: true,
        },
      ],
    });
    const getAllUserCount = findAllUser.length ?? 0;

    // User Account Graph Data
    if (userAccountFilter !== 365) {
      for (let i = userAccountFilter - 1; i >= 0; i--) {
        const startOfDay = moment().subtract(i, "days").startOf("day").toDate();
        const endOfDay = moment().subtract(i, "days").endOf("day").toDate();

        const dataCount = await User.count({
          where: {
            createdAt: {
              [Op.and]: {
                [Op.gte]: startOfDay,
                [Op.lt]: endOfDay,
              },
            },
            deletedAt: null,
          },
          include: [
            {
              model: Role,
              attributes: ["id"],
              where: {
                name: { [Op.ne]: "super admin" },
              },
              required: true,
            },
          ],
        });

        const userAccountChartCount = {
          date: startOfDay,
          dataCount: dataCount,
        };
        dayWiseChartCount.push(userAccountChartCount);
      }
    } else {
      for (let i = 0; i <= 11; i++) {
        const currentMonthName = moment().month(i).format("MMM");
        const startOfDay = moment()
          .month(i)
          .startOf("month")
          .startOf("day")
          .toDate();
        const endOfDay = moment().month(i).endOf("month").endOf("day").toDate();

        const dataCount = await User.count({
          where: {
            createdAt: {
              [Op.and]: {
                [Op.gte]: startOfDay,
                [Op.lt]: endOfDay,
              },
            },
            deletedAt: null,
          },
          include: [
            {
              model: Role,
              attributes: ["id"],
              where: {
                name: { [Op.ne]: "super admin" },
              },
              required: true,
            },
          ],
        });

        const userAccountChartCount = {
          date: currentMonthName,
          dataCount: dataCount,
        };
        dayWiseChartCount.push(userAccountChartCount);
      }
    }
    return { dayWiseChartCount, getAllUserCount };
  }

  // Created On Sep 26, 2024
  async getAllEmployeeDataNew(query: IQueryParameters) {
    try {
      const { clientId, employeeId } = query;
      let filter: any = {
        terminationDate: null,
        isAdminApproved: true,
      };
      if (clientId) {
        filter.clientId = clientId;
      }
      let data: any = {};
      // data with limit of 5
      let employeeData = await Employee.findAll({
        where: {
          deletedAt: null,
          ...filter,
        },
        attributes: [
          "id",
          "loginUserId",
          "employeeNumber",
          "employeeType",
          "clientId",
          "contractNumber",
          "terminationDate",
          "updatedBy",
          "createdatutc",
          "updatedatutc",
          "rotationId",
        ],
        include: [
          {
            model: LoginUser,
            attributes: ["id", "name", "email"],
          },
          {
            model: Client,
            attributes: ["id"],
            include: [
              {
                model: LoginUser,
                attributes: ["id", "name", "email"],
              },
            ],
          },
        ],
        limit: 5,
        offset: 0,
        order: [["createdAt", "DESC"]],
      });
      data.employeeData = parse(employeeData);

      let employeeTypedata = await Employee.findAll({
        where: {
          deletedAt: null,
          ...filter,
        },
        attributes: ["id", "clientId", "loginUserId", "rotationId"],
        include: [
          {
            model: Rotation,
            attributes: ["id", "name", "weekOn", "weekOff", "isResident"],
          },
        ],
      });
      employeeTypedata = parse(employeeTypedata);

      data.rotationEmpCount = employeeTypedata.filter(
        (el) =>
          el?.rotation?.isResident == false &&
          el?.rotation?.weekOn &&
          el?.rotation?.weekOff
      ).length;
      data.residentEmpCount = employeeTypedata.filter(
        (el) => el?.rotation?.isResident == true
      ).length;
      data.calloutEmpCount = employeeTypedata.filter(
        (el) =>
          el?.rotation?.isResident == false &&
          !el?.rotation?.weekOn &&
          !el?.rotation?.weekOff
      ).length;

      return data;
    } catch (error) {
      throw new HttpException(400, this.msg.notFound, null, true);
    }
  }

  // async getAllClientDataNew(query: any, user: User) {
  //   try {
  //     let data = [],
  //       total = 0;
  //     if (query.clientId) {
  //       const resp = await this.TimesheetService.getTimesheetDropdownDetails(
  //         query.clientId,
  //         user as User
  //       );
  //       query.dates = resp?.dates;
  // data = await this.accountPoRepo.accountPOdataforDashboard(query);
  //     }
  //     total = await Client.count({ where: { deletedAt: null } });

  //     return { data: data, totalclients: total };
  //   } catch (error) {
  //     throw new HttpException(400, this.msg.notFound, null, false);
  //   }
  // }

  async getAllClientDataNew(query: any, user: User) {
    try {
      // Initialize data structures
      const monthlyRevenueMap = new Map();
      const currenciesSet = new Set<string>();
      const graphData: Record<string, any[]> = {};
      const listingData: Record<string, any> = {};
  
      let totalClients = null;
      let filter: any = {};
  
      console.log("Starting dashboard data fetch...");
  
      // Fetch clients and revenue filter config
      const clientIds = await this.getclientdatafilterfordashboard(query, user);
      filter = await this.getclientRevneuetimeperioddata(query);

      console.log(`Found ${clientIds.length} clients to process.`);
  
      // Process revenue data per client
      for (const clientId of clientIds) {
        const timesheetResp = await this.TimesheetService.getTimesheetDropdownDetails(clientId, user);
  
        // Apply filter for this client
        filter.dates = timesheetResp?.dates;
        filter.client = parseInt(clientId);
        filter.isClientExists = !!query?.clientId;
  
        const revenueData = await this.accountPoRepo.accountPOdataforDashboardNew(filter);
  
        if (!revenueData.length) continue;
  
        for (const entry of revenueData) {
          const { month, currency, totalRevenue, client } = entry;
          const prevEntry = monthlyRevenueMap.get(month) || {};
  
          // Accumulate total revenue per month
          monthlyRevenueMap.set(month, {
            ...prevEntry,
            ...entry,
            totalRevenue: (
              parseFloat(prevEntry?.totalRevenue || 0) + parseFloat(totalRevenue || 0)
            ).toFixed(2),
          });
  
          // Build graph data for charting (currency-wise monthly revenue)
          if (!graphData[currency]) graphData[currency] = [];
          graphData[currency].push({
            month,
            totalRevenue: parseFloat(totalRevenue),
          });
  
          // Group listing data by currency -> client -> month
          const clientName = client?.name || `Client-${clientId}`;
          if (!listingData[currency]) listingData[currency] = {};
          if (!listingData[currency][clientName]) listingData[currency][clientName] = [];
  
          listingData[currency][clientName].push({ month, total: totalRevenue });
  
          // Track unique currencies
          currenciesSet.add(currency);
        }
      }
  
      // Convert aggregated data to array and apply sorting & filtering
      const sortedFilteredData = Array.from(monthlyRevenueMap.values())
        .sort((a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
        .filter((item) => {
          const itemMonth = moment(item.month, "MMM YY");
          return (
            itemMonth.isSameOrAfter(moment(filter.startMonth, "MMM YY")) &&
            itemMonth.isSameOrBefore(moment(filter.endMonth, "MMM YY"))
          );
        });
  
      // Fetch total client info
      totalClients = await Client.findAll({
        where: { deletedAt: null },
        attributes: ["id", "loginUserId", "isActive"],
      });
  
      const parsedClients = parse(totalClients);
      const totalCount = parsedClients.length;
      const activeCount = parsedClients.filter((c) => c.isActive).length;
      const archivedCount = totalCount - activeCount;
  
      // Final debug logs
      // console.log("Dashboard data aggregation complete.");
      // console.log("Currencies Used:", Array.from(currenciesSet));
      // console.log("Graph Data Preview:", graphData);
      // console.log("Listing Data Preview:", listingData);
  
      // Return final structured result
      return {
        data: sortedFilteredData,
        totalclients: totalCount,
        activeCount,
        archivedCount,
        graphData,
        listingData,
        currencies: Array.from(currenciesSet),
      };
  
    } catch (error) {
      console.error("Error in getAllClientDataNew:", error);
      throw new HttpException(400, this.msg.notFound, null, false);
    }
  }
  
  
  async getclientdatafilterfordashboard(query: any, user: User) {
    let { clientId, subclientId } = query,
    data = [];

    // check if client is selected
    if (clientId) {
      if (clientId && subclientId) {
        data = [clientId, ...subclientId.split(",")];
      } else {
        //get subclients of selected client if subclient is not there
        let subclient = await this.clientService.getSubClientDataByClientId(
          clientId,
          user as User
        );
        data = [clientId, ...subclient.data.map((element) => element?.id)];
      }
    } else {
      // get all client, sub-client if client is not selected
      let allclients: any = await this.clientService.getAllClientData(
        user as User
      );
      data = allclients.data.map((element) => element?.id);
    }

    return data;
  }

  async getclientRevneuetimeperioddata(query: any) {
    let { startYear, endYear, monthYear, startMonth, endMonth , year} = query;
   console.log("-------------------------------", query)
    let data: any = {
      startYear:  year || startYear || monthYear || moment().year().toString(),
      endYear: endYear || monthYear || moment().year().toString(),
      startMonth: startMonth || "Jan",
      endMonth: endMonth || "Dec",
    };

    data.startMonth = moment(
      `${data.startMonth} ${data.startYear}`,
      "MMM YYYY"
    ).format("MMM YY");
    data.endMonth = moment(
      `${data.endMonth} ${data.endYear}`,
      "MMM YYYY"
    ).format("MMM YY");

    //in case if start year is not given in that case start year will be taken as same as endYear
    if (!startYear && endYear) {
      data.startYear = endYear;
    }
    // console.log("###############", data)
    return data;
  }

  async getAllContractDataNew(query: IQueryParameters, user: User) {
    try {
      let contractsData = await this.employeeContractRepo.dashboardcontracsDataNew(
        query,
        user
      );

      let responseData = {
        ...contractsData,
      };
      return responseData;
    } catch (error) {
      console.log("error", error);
      throw new HttpException(400, this.msg.notFound, null, true);
    }
  }

  async getAllRequestDateNew(query: IQueryParameters, user: User) {
    try {
      const { page, limit, clientId, employeeId, sort, sortBy } = query;
      // Request Data
      let filter: any = {
        deletedAt: null,
      };
      if (clientId) {
        filter.clientId = clientId;
      }
      const segmentIds = getSegmentAccessForUser(user);
      const subSegmentIds = getSubSegmentAccessForUser(user);

      let requestData = await Request.findAndCountAll({
        attributes: [
          "id",
          "name",
          "status",
          "contractNumber",
          "documentTotal",
          "deliveryDate",
          "createdAt",
          "createdatutc",
        ],
        include: [
          {
            model: Client,
            attributes: ["id"],
            include: [{ model: LoginUser, attributes: ["name"] }],
          },
          {
            model: Employee,
            required: true,
            attributes: ["segmentId", "subSegmentId"],
            include: [
              // { model: Segment },
              // { model: SubSegment, required: false },
            ],
            // where: {
            //   [Op.and]: [
            //     {
            //       ...(segmentIds?.length > 0 && {
            //         segmentId: { [Op.in]: segmentIds },
            //       }),
            //     },
            //     {
            //       ...(subSegmentIds?.length > 0 && {
            //         [Op.or]: [
            //           { subSegmentId: { [Op.in]: subSegmentIds } },
            //           { subSegmentId: null },
            //         ],
            //       }),
            //     },
            //   ],
            // },
          },
        ],
        where: {
          ...filter,
        },
        limit: 5,
        order: [["createdAt", "desc"]],
      });
      return parse(requestData);
    } catch (error) {
      console.log("error", error);
      throw new HttpException(400, this.msg.notFound, null, true);
    }
  }

  async getMedicalRequestData(query: IQueryParameters, user: User) {
    try {
      let data = await this.medicalRequestRepo.getAllMedicalRequests({
        page: 1,
        limit: 5,
        ...query,
      });
      let medicalCount = await this.medicalRequestRepo.medicalservicesCountForDashboard(
        query,
        user
      );

      let responseData = {
        data: data.data,
        ...medicalCount,
      };
      return responseData;
    } catch (error) {
      console.log("error", error);
      throw new HttpException(400, this.msg.notFound, null, true);
    }
  }

  async auditlogslist(query: IQueryParameters) {
    try {
      let docs = await getAllHistory({ ...query, limit: 5 });
      return parse(docs);
    } catch (error) {
      console.log("error", error);
    }
  }


  async requestData(query: IQueryParameters, user: User) {
    try {
      let { clientId } = query;
      const segmentIds = getSegmentAccessForUser(user);
      const subSegmentIds = getSubSegmentAccessForUser(user);
      const currentDate = moment();
      const expiryDate = moment().add(30, "days");
      let filter: any = {
        deletedAt: null,
      };
      if (clientId) {
        filter.clientId = clientId;
      }
      let requestData = await Request.findAndCountAll({
        attributes: [
          "id",
          "name",
          "contractNumber",
          "collectionDelivery",
          "status",
          "documentTotal",
          "deliveryDate",
          "createdAt",
          "createdatutc",
        ],
        include: [
          {
            model: Client,
            attributes: ["id"],
            include: [{ model: LoginUser, attributes: ["name"] }],
          },
          {
            model: Employee,
            required: true,
            attributes: ["segmentId", "subSegmentId"],
            include: [
              { model: Segment },
              { model: SubSegment, required: false },
            ],
            where: {
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
          },
        ],
        where: { ...filter, status: "NEW" },
        limit: 5,
        order: [["createdAt", "desc"]],
      });

      let terminationData = await this.EmployeeService.getEmployeeStatusRequest(
        { ...filter, status: "PENDING", limit: 5 }
      );

      let salaryIncrementData = await this.SalaryBonusReq.getSalaryBonusIncrement(
        { ...filter, status: "PENDING", limit: 5 },
        user
      );

      return {
        requestData: parse(requestData),
        terminationData: {
          rows: terminationData.data,
          count: terminationData.total,
        },
        salaryIncrementData: {
          rows: salaryIncrementData.data,
          count: salaryIncrementData.total,
        },
      };
    } catch (error) {
      console.log("error-------------", error);
    }
  }
}



const filterData = async (data, availableData) => {
  let BookedDatesDifference, splitted, startDate, endDate;
  if (!_.isEmpty(data.unavailableDates)) {
    BookedDatesDifference = [];
    data?.unavailableDates?.split(",").forEach((element) => {
      splitted = element.split("-");

      startDate = moment(splitted[0], "DD/MM/YYYY");
      endDate = moment(splitted[1], "DD/MM/YYYY");

      for (
        let m = moment(startDate);
        m.isSameOrBefore(endDate);
        m.add(1, "days")
      ) {
        BookedDatesDifference.push(m.format("DD/MM/YYYY"));
      }
    });

    const result = BookedDatesDifference.some((element) => {
      return element === moment().format("DD/MM/YYYY");
    });

    if (!result) {
      availableData.push(data);
    }
  } else if (_.isEmpty(data.unavailableDates)) {
    availableData.push(data);
  }
  return availableData;
};
