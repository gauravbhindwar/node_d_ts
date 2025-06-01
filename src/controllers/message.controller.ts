import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import MessageRepo from '@/repository/message.repository';
import generalResponse from '@/utils/generalResponse';

class MessageController {
	private MessageService = new MessageRepo();
	private msg = new MessageFormation('Message').message;

	/**
	 * Get Message Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findAllMessage = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MessageService.getAllMessageService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findAllSalaryMessage = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MessageService.getAllSalaryMessageService(req.query, req.user as User);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getSalaryMessageEmployeeDataSuggestiveDropdown = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MessageService.getSalaryMessageEmployeeDataSuggestiveDropdown(req.query, null);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Get By Id Message Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public findMessageById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MessageService.getMessageByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Message Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addMessage = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.MessageService.addMessage({
				body: req.body,
				user: req.user as User,
			});
			return generalResponse(req, res, responseData, this.msg.create, 'success', true);
		} catch (error) {
			const parts = error.message.split('Error:');
			const errorPart = parts.find((part) => part.trim() !== '');
			const finalErrorMessage = errorPart ? errorPart.trim() : 'Unknown Error';
			return generalResponse(req, res, error, finalErrorMessage, 'error', true, 400);
		}
	});

	public addSalaryMessage = catchAsync(async (req: Request, res: Response) => {
		try {
			const responseData = await this.MessageService.addSalaryMessage({
				body: req.body,
				user: req.user as User,
			});
			return generalResponse(req, res, responseData, this.msg.create, 'success', true);
		} catch (error) {
			const parts = error.message.split('Error:');
			const errorPart = parts.find((part) => part.trim() !== '');
			const finalErrorMessage = errorPart ? errorPart.trim() : 'Unknown Error';
			return generalResponse(req, res, error, finalErrorMessage, 'error', true, 400);
		}
	});

	/**
	 * Update Message Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateMessage = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MessageService.updateMessageService({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Message Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteMessage = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MessageService.deleteMessageService({
			id: Number(id),
			authuser: req.user as User
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default MessageController;
