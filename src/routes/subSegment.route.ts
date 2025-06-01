import SubSegmentController from '@/controllers/subSegment.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema, paramsSlugSchema } from '@/validationSchema/common.validation';
import {
	SubSegmentCreateSchema,
	SubSegmentFetchAllSchema,
	SubSegmentUpdateSchema,
	subSegmentStatusUpdateSchema,
} from '@/validationSchema/subsegment.validation';
import { Router } from 'express';

class SubSegmentRoutes implements Routes {
	public path = '/sub-segment';
	public router = Router();
	public subSegmentController = new SubSegmentController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SubSegment, PermissionEnum.View),
			validationMiddleware(SubSegmentFetchAllSchema, 'query'),
			this.subSegmentController.findAllSubSegment,
		); // Get All Sub Segment (Private)

		this.router.get(
			`${this.path}/get-sub-segment-data`,
			authMiddleware,
			validationMiddleware(SubSegmentFetchAllSchema, 'query'),
			this.subSegmentController.getSubSegmentData,
		); // Get Sub Segment Data (Public)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SubSegment, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.subSegmentController.findSubSegmentById,
		); // Get Sub Segment By ID (Private)

		this.router.get(
			`${this.path}/get-slug-data/:slug`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SubSegment, PermissionEnum.View),
			validationMiddleware(paramsSlugSchema, 'params'),
			this.subSegmentController.findSubSegmentBySlug,
		); // Get Sub Segment By Slug (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SubSegment, PermissionEnum.Create),
			validationMiddleware(SubSegmentCreateSchema, 'body'),
			this.subSegmentController.addSubSegment,
		); //Add Sub Segment (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SubSegment, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(SubSegmentUpdateSchema, 'body'),
			this.subSegmentController.updateSubSegment,
		); // Update Sub Segment By Segment Id (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SubSegment, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(subSegmentStatusUpdateSchema, 'body'),
			this.subSegmentController.updateSubSegmentStatus,
		); // Update Sub Segment Status (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.SubSegment, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.subSegmentController.deleteSubSegment,
		); // Delete Sub Segment (Private)
	}
}

export default SubSegmentRoutes;
