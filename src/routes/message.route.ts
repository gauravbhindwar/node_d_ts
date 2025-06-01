import MessageController from '@/controllers/message.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { MessageCreateSchema, MessageUpdateSchema } from '@/validationSchema/message.validation';
import { Router } from 'express';
import multer from 'multer';

class MessageRoutes implements Routes {
	public path = '/message';
	public router = Router();
	public messageController = new MessageController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Message, PermissionEnum.View),
			this.messageController.findAllMessage,
		); // Get All Message (Private)

		this.router.get(
			`${this.path}/get-salary-message`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SalaryMessage, PermissionEnum.View),
			this.messageController.findAllSalaryMessage,
		); // Get All Message (Private)

		this.router.get(
			`${this.path}/get-salary-message-employee-option`,
			authMiddleware,
			this.messageController.getSalaryMessageEmployeeDataSuggestiveDropdown,
		); // Get All Employee Data For Search Dropdown (Private)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Message, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.messageController.findMessageById,
		); // Get Message By ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Message, PermissionEnum.Create),
			multer().none(),
			validationMiddleware(MessageCreateSchema, 'body'),
			this.messageController.addMessage,
		); // Add Message (Private)

		this.router.post(
			`${this.path}/add-salary-message`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SalaryMessage, PermissionEnum.Update),
			validationMiddleware(MessageCreateSchema, 'body'),
			this.messageController.addSalaryMessage,
		); // Add Salary Message (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Message, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			multer().none(),
			validationMiddleware(MessageUpdateSchema, 'body'),
			this.messageController.updateMessage,
		); // Update Message By Message Id (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Message, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.messageController.deleteMessage,
		); // Delete Message (Private)
	}
}

export default MessageRoutes;
