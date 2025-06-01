import { GlobalSettingsAttributes, RequiredGlobalSettingsAttributes } from '@/interfaces/model/globalsetting.interface';
import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

@Table({
  timestamps: false,
  paranoid: false,
  tableName: 'global_settings',
})
export default class GlobalSettings
  extends Model<GlobalSettingsAttributes, RequiredGlobalSettingsAttributes>
  implements GlobalSettingsAttributes
{
  dateFormat: string;
  timeFormat: string;
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  id: number;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  timezone_utc: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  dateformat: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  timeformat: string;

  @Column({
    type: DataTypes.STRING,
  })
  currency: string;
}
