import FeatureController from '@/controllers/feature.controller';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import { paramsIdSchema } from '@/validationSchema/common.validation';
import { FeatureCreateSchema, FeatureUpdateSchema } from '@/validationSchema/feature.validation';
import { Router } from 'express';
import { Routes } from 'interfaces/general/routes.interface';

class FeatureRoute implements Routes {
	public path = '/feature';
	public router = Router();
	public featureController = new FeatureController();
	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}`, authMiddleware, this.featureController.findAllFeature); // Get All Feature

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			validationMiddleware(paramsIdSchema, 'params'),
			this.featureController.findFeatureById,
		); // Get Feature By Id

		this.router.post(
			`${this.path}`,
			authMiddleware,
			validationMiddleware(FeatureCreateSchema, 'body'),
			this.featureController.addFeature,
		); // Add Feature

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(FeatureUpdateSchema, 'body'),
			this.featureController.updateFeature,
		); // Update Feature

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			validationMiddleware(paramsIdSchema, 'params'),
			this.featureController.deleteFeature,
		); // Delete Feature
	}
}

export default FeatureRoute;
