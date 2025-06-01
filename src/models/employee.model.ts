import {
  EmployeeAttributes,
  employeeStatus,
} from "@/interfaces/model/employee.interface";
import { DataTypes } from "sequelize";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Bank from "./bankDetails.model";
import Client from "./client.model";
import EmployeeBonus from "./employeeBonus.model";
import EmployeeCatalogueNumber from "./employeeCatalogueNumber.model";
import EmployeeContract from "./employeeContract.model";
import EmployeeFile from "./employeeFile.model";
import EmployeeLeave from "./employeeLeave.model";
import EmployeeRotation from "./employeeRotation.model";
import EmployeeSalary from "./employeeSalary.model";
import EmployeeSegment from "./employeeSegment.model";
import LoginUser from "./loginUser.model";
import MedicalRequest from "./medicalRequest.model";
import ReliquatAdjustment from "./reliquatAdjustment.model";
import ReliquatCalculation from "./reliquatCalculation.model";
import ReliquatCalculationV2 from "./reliquatCalculationV2.model";
import ReliquatPayment from "./reliquatPayment.model";
import Rotation from "./rotation.model";
import IncrementRequests from "./salaryIncreaseRequest.model";
import Segment from "./segment.model";
import SubSegment from "./subSegment.model";
import Timesheet from "./timesheet.model";
import TimesheetSchedule from "./timesheetSchedule.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "employee",
  indexes: [],
  hooks: {
		beforeCreate: (document: Employee) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: Employee) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class Employee extends Model<EmployeeAttributes>
  implements EmployeeAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => LoginUser)
  @Column
  loginUserId: number;

  @BelongsTo(() => LoginUser, {
    foreignKey: "loginUserId",
    constraints: false,
    as: "loginUserData",
  })
  loginUserData?: LoginUser;

  @Column({
    type: DataTypes.STRING,
  })
  slug: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  employeeNumber: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  TempNumber: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  contractNumber: string;

  @Column({
    type: DataTypes.STRING,
  })
  employeeType: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  contractSignedDate: Date;

  @Column({
    type: DataTypes.DATE,
  })
  startDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  fonction: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  nSS: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  terminationDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  baseSalary: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  travelAllowance: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  Housing: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  monthlySalary: number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  address: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  medicalCheckDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  medicalCheckExpiry: Date;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
  })
  medicalInsurance: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  contractEndDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  LREDContractEndDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  dailyCost: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  hourlyRate: number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  nextOfKinMobile: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  catalogueNumber: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  nextOfKin: string;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  initialBalance: number;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  photoVersionNumber: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  overtime01Bonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  overtime02Bonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  weekendOvertimeBonus: number;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  customBonus: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  xeroContactId: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  utcstartDate: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  utcmedicalCheckDate: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  utcmedicalCheckExpiry: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  utcdOB: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  utccontractSignedDate: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  utccontractEndDate: string;
  
  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
  })
  isAdminApproved: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isAbsenseValueInReliquat: boolean;

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @BelongsTo(() => Client, {
    foreignKey: "clientId",
    constraints: false,
    as: "client",
  })
  client?: Client;

  @ForeignKey(() => Segment)
  @Column({
    allowNull: true,
  })
  segmentId: number;

  @BelongsTo(() => Segment, {
    foreignKey: "segmentId",
    constraints: false,
    as: "segment",
  })
  segment?: Segment;

  @Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;


  @ForeignKey(() => SubSegment)
  @Column
  subSegmentId: number;

  @BelongsTo(() => SubSegment, {
    foreignKey: "subSegmentId",
    constraints: false,
    as: "subSegment",
  })
  subSegment?: SubSegment;

  @ForeignKey(() => Rotation)
  @Column
  rotationId: number;

  @BelongsTo(() => Rotation, {
    foreignKey: "rotationId",
    constraints: false,
    as: "rotation",
  })
  rotation?: Rotation;

  @ForeignKey(() => Bank)
  @Column
  bankId: number;

  @BelongsTo(() => Bank, {
    foreignKey: "bankId",
    constraints: false,
    as: "bank",
  })
  bank?: Bank;

  @Column({
    type: DataTypes.STRING,
  })
  oldEmployeeId: string;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  fonctionDate: Date;

  @Column({
    type: DataTypes.ENUM(...Object.values(employeeStatus)),
    defaultValue: employeeStatus.SAVED,
  })
  employeeStatus: employeeStatus;

  @CreatedAt
  createdAt: Date;

  @ForeignKey(() => User)
  @Column
  createdBy: number;

  @BelongsTo(() => User, {
    foreignKey: "createdBy",
    constraints: false,
    as: "createdByUser",
  })
  createdByUser?: User;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  updatedBy: number;

  @DeletedAt
  deletedAt: Date;

  @HasMany(() => EmployeeRotation)
  employeeRotation?: EmployeeRotation[];

  @HasMany(() => EmployeeCatalogueNumber)
  employeeCatalogueNumber?: EmployeeCatalogueNumber[];

  @HasMany(() => EmployeeSegment)
  employeeSegment?: EmployeeSegment[];

  @HasMany(() => EmployeeBonus)
  employeeBonus?: EmployeeBonus[];

  @HasMany(() => EmployeeContract, {
    foreignKey: "employeeId",
    constraints: false,
    as: "employeeContracts",
  })
  employeeContracts?: EmployeeContract[];

  @HasMany(() => EmployeeFile, {
    foreignKey: "employeeId",
    constraints: false,
    as: "employeeFiles",
  })
  employeeFiles?: EmployeeFile[];

  @HasMany(() => TimesheetSchedule)
  timeSheetSchedule?: TimesheetSchedule[];

  @HasMany(() => Timesheet)
  timeSheet?: Timesheet[];

  @HasMany(() => EmployeeLeave)
  employeeLeave?: EmployeeLeave[];

  @HasMany(() => EmployeeSalary)
  employeeSalary?: EmployeeSalary[];

  @HasMany(() => ReliquatCalculation)
  reliquatCalculation?: ReliquatCalculation[];

  @HasMany(() => ReliquatCalculationV2)
  reliquatCalculationV2?: ReliquatCalculationV2[];

  @HasMany(() => ReliquatPayment)
  reliquatPayment?: ReliquatPayment[];

  @HasMany(() => ReliquatAdjustment)
  reliquatAdjustment?: ReliquatAdjustment[];

  @HasMany(() => MedicalRequest)
  medicalRequest?: MedicalRequest[];

  @HasMany(() => IncrementRequests)
  IncrementRequest?: IncrementRequests[];
}
