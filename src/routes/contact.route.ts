import ContactController from '@/controllers/contact.controller';
import { FeaturesNameEnum, PermissionEnum } from '@/interfaces/functional/feature.interface';
import { Routes } from '@/interfaces/general/routes.interface';
import authMiddleware from '@/middleware/auth.middleware';
import validationMiddleware from '@/middleware/middleware';
import rolePermissionMiddleware from '@/middleware/rolePermission.middleware';
import { paramsIdSchema, paramsSlugSchema } from '@/validationSchema/common.validation';
import { ContactCreateSchema, ContactUpdateSchema } from '@/validationSchema/contact.validation';
import { Router } from 'express';

class ContactRoute implements Routes {
	public path = '/contacts';
	public router = Router();
	public contactController = new ContactController();
	constructor() {
		this.initializeRoutes();
	}
	private initializeRoutes() {
		this.router.get(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Contact, PermissionEnum.View),
			this.contactController.findAllContacts,
		); // Get All Contacts (Private)

		this.router.get(`${this.path}/get-contact-data`, authMiddleware, this.contactController.getContactData); // Get Contacts Data (Public)

		this.router.get(`${this.path}/get-manager-data`, authMiddleware, this.contactController.getManagerData); // Get Manager Data (Public)

		this.router.get(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Contact, PermissionEnum.View),
			validationMiddleware(paramsIdSchema, 'params'),
			this.contactController.findContactById,
		); // Get Contact By Id (Private)

		this.router.get(
			`${this.path}/get-slug-data/:slug`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Contact, PermissionEnum.View),
			validationMiddleware(paramsSlugSchema, 'params'),
			this.contactController.findContactBySlug,
		); // Get Contact By Slug (Private)

		this.router.post(
			`${this.path}`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Contact, PermissionEnum.Create),
			validationMiddleware(ContactCreateSchema, 'body'),
			this.contactController.addContact,
		); // Add Contact (Private)

		this.router.put(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Contact, PermissionEnum.Update),
			validationMiddleware(paramsIdSchema, 'params'),
			validationMiddleware(ContactUpdateSchema, 'body'),
			this.contactController.updateContact,
		); // Update Contact (Private)

		this.router.delete(
			`${this.path}/:id`,
			authMiddleware,
			rolePermissionMiddleware(FeaturesNameEnum.Contact, PermissionEnum.Delete),
			validationMiddleware(paramsIdSchema, 'params'),
			this.contactController.deleteContact,
		); // Delete Contact (Private)
	}
}

export default ContactRoute;
