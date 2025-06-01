import Employee from '@/models/employee.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import moment from 'moment';
import { Op, Transaction } from 'sequelize';
import { logger } from '@/utils/logger';

/**
 * Interface for timesheet data
 */
interface TimesheetData {
  startDate: Date | string;
  endDate?: Date | string;
  employeeId: number;
  status?: string;
}

/**
 * Interface for bonus flags
 */
interface BonusFlags {
  weekend?: boolean;
  overtime1?: boolean;
  overtime2?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Utility class for timesheet operations
 */
export class TimesheetUtil {
  /**
   * Validates timesheet dates against employee termination date
   * @param timesheetData - The timesheet data to validate
   * @param employee - The employee data
   * @returns True if valid, false otherwise
   */
  static async validateTimesheetDates(
    timesheetData: TimesheetData,
    employee: any
  ): Promise<boolean> {
    try {
      if (!employee) {
        logger.error('Employee data is missing for timesheet validation');
        return false;
      }

      if (!timesheetData.startDate) {
        logger.error('Timesheet start date is missing');
        return false;
      }

      // If employee has no termination date, timesheet is valid
      if (!employee.terminationDate) return true;

      // Check if timesheet start date is before or equal to termination date
      return moment(timesheetData.startDate).isSameOrBefore(employee.terminationDate);
    } catch (error) {
      logger.error(`Error validating timesheet dates: ${error}`);
      return false;
    }
  }

  /**
   * Generates a unique database key for timesheet entries
   * @param date - The date for the timesheet entry
   * @param employeeId - The employee ID
   * @returns A unique key string
   */
  static generateTimesheetKey(date: Date | string, employeeId: number): string {
    try {
      if (!date || !employeeId) {
        throw new Error('Date and employeeId are required for key generation');
      }
      
      const formattedDate = moment(date).format('DDMMYYYY');
      return `${formattedDate}_${employeeId}`;
    } catch (error) {
      logger.error(`Error generating timesheet key: ${error}`);
      return `error_${Date.now()}_${employeeId}`;
    }
  }

  /**
   * Formats bonus codes with additional flags
   * @param baseCode - The base bonus code
   * @param flags - Object containing bonus flags
   * @returns Formatted bonus code string
   */
  static formatBonusCode(baseCode: string = '', flags: BonusFlags = {}): string {
    try {
      const codes: string[] = baseCode ? [baseCode] : [];
      
      // Add flags to codes array
      Object.entries(flags).forEach(([key, value]) => {
        if (value === true) {
          switch (key) {
            case 'weekend':
              codes.push('W');
              break;
            case 'overtime1':
              codes.push('O1');
              break;
            case 'overtime2':
              codes.push('O2');
              break;
            default:
              if (key) codes.push(key.toUpperCase());
          }
        }
      });
      
      return codes.join(',');
    } catch (error) {
      logger.error(`Error formatting bonus code: ${error}`);
      return baseCode || '';
    }
  }

  /**
   * Handles bulk timesheet schedule creation with duplicate checking
   * @param schedules - Array of timesheet schedules to create
   * @param transaction - Optional transaction for database operations
   * @returns Promise resolving to created records count
   */
  static async bulkCreateTimesheetSchedules(
    schedules: any[],
    transaction?: Transaction
  ): Promise<number> {
    try {
      if (!schedules || !schedules.length) {
        logger.info('No schedules to create');
        return 0;
      }

      // Validate schedules before creation
      const validSchedules = schedules.filter(schedule => 
        schedule && schedule.date && schedule.employeeId
      );
      
      if (validSchedules.length === 0) {
        logger.warn('No valid schedules found in the input data');
        return 0;
      }

      // Create schedules with transaction if provided
      const result = await TimesheetSchedule.bulkCreate(validSchedules, {
        ignoreDuplicates: true,
        transaction,
      });

      return result.length;
    } catch (error) {
      logger.error(`Error creating timesheet schedules: ${error}`);
      throw new Error(`Failed to create timesheet schedules: ${error.message}`);
    }
  }

  /**
   * Cleans up invalid timesheet entries
   * @param options - Optional parameters for cleanup
   * @returns Promise resolving to number of deleted records
   */
  static async cleanupInvalidTimesheets(options: {
    beforeDate?: Date | string;
    transaction?: Transaction;
  } = {}): Promise<number> {
    const { beforeDate, transaction } = options;
    let deletedCount = 0;

    try {
      // Find employees with termination dates
      const employees = await Employee.findAll({
        where: { 
          terminationDate: { [Op.not]: null } 
        },
        attributes: ['id', 'terminationDate'],
        transaction,
      });

      if (!employees.length) {
        logger.info('No terminated employees found for timesheet cleanup');
        return 0;
      }

      // Process each employee
      for (const employee of employees) {
        const dateFilter: any = {
          date: { [Op.gt]: employee.terminationDate }
        };
        
        // Add additional date filter if provided
        if (beforeDate) {
          dateFilter.date[Op.lt] = beforeDate;
        }

        // Delete invalid timesheets
        const deleted = await TimesheetSchedule.destroy({
          where: {
            employeeId: employee.id,
            ...dateFilter
          },
          transaction,
        });

        deletedCount += deleted;
      }

      logger.info(`Cleaned up ${deletedCount} invalid timesheet entries`);
      return deletedCount;
    } catch (error) {
      logger.error(`Error cleaning up invalid timesheets: ${error}`);
      throw new Error(`Failed to clean up invalid timesheets: ${error.message}`);
    }
  }
}