import { Model, Table, Column, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

// Define the interface for the Queue model
interface QueueAttributes {
  id: number;
  processName: string;
  clientEndDate: Date;
  startDate: Date;
}

@Table({
  tableName: 'queue1',
  modelName: 'Queue1',
  timestamps: true,  // Enable timestamps
  paranoid: false,   // Disable soft deletes for simplicity
  schema: 'public',  // Use the 'public' schema
})
export default class Queue extends Model<QueueAttributes> implements QueueAttributes {

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
  processName: string;

  @Column({
    type: DataTypes.DATE,
    allowNull: false,
  })
  clientEndDate: Date;

  @Column({
    type: DataTypes.DATE,
    allowNull: true,
  })
  startDate: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
