import TimesheetScheduleController from '@/controllers/timesheetSchedule.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import {
	TimesheetScheduleFetchAllSchema
} from '@/validationSchema/timesheetSchedule.validation';
import { Router } from 'express';
import multer from 'multer';

class TimesheetScheduleRoutes implements Routes {
	public path = '/timesheet-schedule';
	public router = Router();
	public timesheetScheduleController = new TimesheetScheduleController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Timesheet, PermissionEnum.View),
			validationMiddleware(TimesheetScheduleFetchAllSchema, 'query'),
			this.timesheetScheduleController.findAllTimesheetSchedule,
		); // Get All Timesheet schedule (Private)

		this.router.put(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Timesheet, PermissionEnum.Update),
			multer().none(),
			// validationMiddleware(TimesheetScheduleUpdateSchema, 'body'),
			this.timesheetScheduleController.updateTimesheetSchedule,
		); // update Timesheet schedule (Private)
	}
}

export default TimesheetScheduleRoutes;