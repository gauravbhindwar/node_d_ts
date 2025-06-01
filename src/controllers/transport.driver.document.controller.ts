import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportDriverDocumentRepo from '@/repository/transport.driver.document.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class TransportDriverDocumentController {
	private TransportDriverDocumentService = new TransportDriverDocumentRepo();
	private msg = new MessageFormation('TransportDriverDocument').message;

	public getAllTransportDriverDocument = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportDriverDocumentService.getAllTransportDriverDocument(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportDriverDocumentById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.TransportDriverDocumentService.getTransportDriverDocumentById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addTransportDriverDocument = catchAsync(async (req: Request, res: Response) => {
		const { file: files } = req;

		if (files)
			req.body = {
				...req.body,
				documentSize: files.size,
				documentPath: `/driverDocuments/${files.filename}`,
			};
		const responseData = await this.TransportDriverDocumentService.addTransportDriverDocument({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateTransportDriverDocument = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const { file: files } = req;

		if (files) {
			req.body = {
				...req.body,
				documentSize: files.size,
				documentPath: `/driverDocuments/${files.filename}`,
			};
		} else {
			req.body = {
				...req.body,
			};
		}
		const responseData = await this.TransportDriverDocumentService.updateTransportDriverDocument({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteTransportDriverDocument = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportDriverDocumentService.deleteTransportDriverDocument(+id, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}
export default TransportDriverDocumentController;
