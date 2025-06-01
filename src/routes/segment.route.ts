import SegmentController from '@/controllers/segment.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema, paramsSlugSchema } from '@/validationSchema/common.validation';
import {
	SegmentCreateSchema,
	SegmentFetchAllSchema,
	SegmentUpdateSchema,
	segmentStatusUpdateSchema,
} from '@/validationSchema/segment.validation';
import { Router } from 'express';
import multer from 'multer';

class SegmentRoutes implements Routes {
	public path = '/segment';
	public router = Router();
	public segmentController = new SegmentController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(
			`${this.path}/getSegmentListByClients`,
			authMiddleware,
			this.segmentController.findAllSegmentsByClientIds,
		); // Get All Segments by Client Ids (Public)

		this.router.get(
			`${this.path}/get-segments-for-search-dropdown`,
			authMiddleware,
			this.segmentController.getSegmentsForSearchDropdown,
		); // Get All Segments for Search Dropdown (Public)

		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Segment, PermissionEnum.View),
			validationMiddleware(SegmentFetchAllSchema, 'query'),
			this.segmentController.findAllSegment,
		); // Get All Segment (Private)

		this.router.get(
			`${this.path}/get-segment-data`,
			authMiddleware,
			validationMiddleware(SegmentFetchAllSchema, 'query'),
			this.segmentController.getSegmentData,
		); // Get All Segment (Public)

		this.router.get(
			`${this.path}/get-segment-employee-data`,
			authMiddleware,
			// validationMiddleware(SegmentFetchAllSchema, 'query'),
			this.segmentController.getSegmentEmployeeData,
		); // Get All Segment (Public)

		this.router.get(
			`${this.path}/get-segments-for-client/:id`,
			authMiddleware,
			this.segmentController.getSegmentsForClientTimesheet,
		);

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Segment, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.segmentController.findSegmentById,
		); // Get Segment By ID (Private)

		this.router.get(
			`${this.path}/get-slug-data/:slug`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Segment, PermissionEnum.View),
			validationMiddleware(paramsSlugSchema, 'params'),
			this.segmentController.findSegmentBySlug,
		); // Get Segment By Slug (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Segment, PermissionEnum.Create),
			multer().none(),
			validationMiddleware(SegmentCreateSchema, 'body'),
			this.segmentController.addSegment,
		); //Add Segment (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Segment, PermissionEnum.Update),
			multer().none(),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(SegmentUpdateSchema, 'body'),
			this.segmentController.updateSegment,
		); // Update Segment By Segment Id (Private)

		this.router.put(
			`${this.path}/status/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Segment, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(segmentStatusUpdateSchema, 'body'),
			this.segmentController.updateSegmentStatus,
		); // Update Segment Status (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Segment, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.segmentController.deleteSegment,
		); // Delete Segment (Private)
	}
}

export default SegmentRoutes;
