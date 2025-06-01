import RequestTypeController from '@/controllers/requestType.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import {
	RequestTypeCreateSchema,
	RequestTypeStatusUpdateSchema,
	RequestTypeUpdateSchema,
} from '@/validationSchema/requestType.validation';
import { Router } from 'express';

class RequestTypeRoute implements Routes {
	public path = '/request-type';
	public router = Router();
	public requestTypeController = new RequestTypeController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.RequestType, PermissionEnum.View),
			this.requestTypeController.findAllRequestTypes,
		); // Get all Request Types (Private)

		this.router.get(`${this.path}/get-request-type-data`, this.requestTypeController.getRequestTypes); // Get all Request Types (Public)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.RequestType, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.requestTypeController.findRequestTypeById,
		); // Get Request Type by ID (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.RequestType, PermissionEnum.Create),
			validationMiddleware(RequestTypeCreateSchema, 'body'),
			this.requestTypeController.addRequestType,
		); // Add Request Type (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.RequestType, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(RequestTypeStatusUpdateSchema, 'body'),
			this.requestTypeController.updateRequestTypeStatus,
		); // Update Request Type Status (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.RequestType, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(RequestTypeUpdateSchema, 'body'),
			this.requestTypeController.updateRequestType,
		); // Update Request Type (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.RequestType, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.requestTypeController.deleteRequestType,
		); // Delete Request Type (Private)
	}
}

export default RequestTypeRoute;
