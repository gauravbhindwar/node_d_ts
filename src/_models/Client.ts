import {
    DataTypes,
    Model,
    Sequelize,
} from 'sequelize';
import { ClientAttributes } from '../_types/models/ClientAttributes';
import { timestamps } from '../_utils/timestamps';
export class ClientModel extends Model<Required<ClientAttributes>, Partial<ClientAttributes>> {}
export class Client extends ClientModel implements Required<ClientAttributes> {
  id!: number;
  clienttype!: string;
  code!: string;
  client!: string;
  taxAmount!: number;
  weekendDays!: string;
  email!: string;
  contractN!: string;
  address!: string;
  contractTagline!: string;
  country!: string;
  startdateatutc!: string;
  enddateatutc!: string;
  startDate!: Date;
  endDate!: Date;
  autoUpdateEndDate!: number;
  timeSheetStartDay!: number;
  approvalEmail!: string[];
  isShowPrices!: boolean;
  isShowCostCenter!: boolean;
  isShowCatalogueNo!: boolean;
  isResetBalance!: boolean;
  startMonthBack!: number;
  isCountCR!: boolean;
  isShowNSS!: boolean;
  timezone!: string;
  currency!: string;
  isShowCarteChifa!: boolean;
  isShowSalaryInfo!: boolean;
  isShowRotation!: boolean;
  isShowBalance!: boolean;
  logo!: string;
  stampLogo!: string | null;
  segment!: string;
  subSegment!: string;
  bonusType!: string;

  readonly created_at!: Date;
  readonly updated_at!: Date;

  static initialize(sequelize: Sequelize) {
    Client.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      clienttype: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      client: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      taxAmount: DataTypes.INTEGER,
      weekendDays: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      contractN: DataTypes.STRING,
      address: DataTypes.STRING,
      contractTagline: DataTypes.TEXT,
      country: DataTypes.STRING,
      startdateatutc: DataTypes.STRING,
      enddateatutc: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      autoUpdateEndDate: DataTypes.INTEGER,
      timeSheetStartDay: DataTypes.INTEGER,
      approvalEmail: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      isShowPrices: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isShowCostCenter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isShowCatalogueNo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isResetBalance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      startMonthBack: DataTypes.INTEGER,
      isCountCR: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isShowNSS: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      timezone: DataTypes.STRING,
      currency: DataTypes.STRING,
      isShowCarteChifa: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isShowSalaryInfo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isShowRotation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isShowBalance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      logo: DataTypes.STRING,
      stampLogo: DataTypes.STRING,
      segment: DataTypes.STRING,
      subSegment: DataTypes.STRING,
      bonusType: DataTypes.STRING,
      ...timestamps(),
    }, {
      sequelize,
      tableName: 'clients',
    });
  }
}
