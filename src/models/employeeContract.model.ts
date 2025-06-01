import {
  EmployeeContractAttributes,
  RequiredEmployeeContractAttributes,
} from "@/interfaces/model/employeeContract.interface";
import { DataTypes } from "sequelize";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import ContractTemplate from "./contractTemplete.model";
import ContractTemplateVersion from "./contractTempleteVersion.model";
import Employee from "./employee.model";
import User from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  tableName: "employee_contract",
  indexes: [],
  hooks: {
		beforeCreate: (document: EmployeeContract) => {
		  const utcDate = new Date().toISOString(); // UTC in ISO format
		  document.createdatutc = utcDate;
		  document.updatedatutc = utcDate;
		},
		beforeUpdate: (document: EmployeeContract) => {
		  const utcDate = new Date().toISOString(); // Update updatedAt with UTC
		  document.updatedatutc = utcDate;
		},
	  },
})
export default class EmployeeContract
  extends Model<EmployeeContractAttributes, RequiredEmployeeContractAttributes>
  implements EmployeeContractAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @ForeignKey(() => Employee)
  @Column
  employeeId: number;

  @BelongsTo(() => Employee, {
    foreignKey: "employeeId",
    constraints: false,
    as: "employeeDetail",
  })
  employeeDetail?: Employee;

  @Column
  newContractNumber: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  description: string;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  workOrderDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  endOfAssignmentDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  contractorsPassport: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  workOrderNumber: string;

  @Column({
    type: DataTypes.STRING,
  })
  utcstartDate: string;

  @Column({
    type: DataTypes.STRING,
  })
  utcendDate: string;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  remuneration: number;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  uniqueWorkNumber: number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  workCurrency: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  descriptionOfAssignmentAndOrderConditions: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  durationOfAssignment: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  workLocation: string;

  @ForeignKey(() => ContractTemplate)
  @Column
  contractTemplateId: number;

  @BelongsTo(() => ContractTemplate, {
    foreignKey: "contractTemplateId",
    constraints: false,
    as: "contractTemplate",
  })
  contractTemplate?: ContractTemplate;

  @ForeignKey(() => ContractTemplateVersion)
  @Column
  contractVersionId: number;

  @BelongsTo(() => ContractTemplateVersion, {
    foreignKey: "contractVersionId",
    constraints: false,
    as: "contractTemplateVersion",
  })
  contractTemplateVersion?: ContractTemplateVersion;

  @Column
  startDate: Date;

  @Column
  endDate: Date;

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

  // New Keys added after client requirement
  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  employeeName: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  fonction: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  address: string;

  @Column({
    allowNull: true,
    type: DataTypes.INTEGER,
  })
  monthlySalary: number;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  birthDate: Date;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  contractTagline: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  probationPeriod: string | number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  clientContractNumber: string;

  @Column
	updatedatutc: string;
  
	@Column
	createdatutc: string;
  
	@Column
	deletedatutc: string;

//   @Column({
//     allowNull: true,
//     type: DataTypes.INTEGER,
//   })
//   weekOn: number;

//   @Column({
//     allowNull: true,
//     type: DataTypes.INTEGER,
//   })
//   weekOff: number;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}
