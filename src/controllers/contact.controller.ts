import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import ContactRepo from '@/repository/contact.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class ContactController {
	private ContactService = new ContactRepo();
	private msg = new MessageFormation('Contact').message;

	public findAllContacts = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContactService.getAllContacts(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getContactData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContactService.getContactData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getManagerData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContactService.getManagerData(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findContactById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContactService.getContactById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findContactBySlug = catchAsync(async (req: Request, res: Response) => {
		const slug = req.params.slug;
		const responseData = await this.ContactService.getContactBySlugService(slug);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addContact = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ContactService.addContact({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateContact = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContactService.updateContact({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteContact = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.ContactService.deleteContact(+id, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default ContactController;
