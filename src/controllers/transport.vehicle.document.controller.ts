import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import TransportVehicleDocumentRepo from '@/repository/transport.vehicle.document.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class TransportVehicleDocumentController {
	private TransportVehicleDocumentService = new TransportVehicleDocumentRepo();
	private msg = new MessageFormation('TransportVehicleDocument').message;

	public getAllTransportVehicleDocument = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TransportVehicleDocumentService.getAllTransportVehicleDocument(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getTransportVehicleDocumentById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.TransportVehicleDocumentService.getTransportVehicleDocumentById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addTransportVehicleDocument = catchAsync(async (req: Request, res: Response) => {
		const { file: files } = req;

		if (files)
			req.body = {
				...req.body,
				documentSize: files.size,
				documentPath: `/vehicleDocuments/${files.filename}`,
			};
		const responseData = await this.TransportVehicleDocumentService.addTransportVehicleDocument({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateTransportVehicleDocument = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const { file: files } = req;

		if (files) {
			req.body = {
				...req.body,
				documentSize: files.size,
				documentPath: `/vehicleDocuments/${files.filename}`,
			};
		} else {
			req.body = {
				...req.body,
			};
		}
		const responseData = await this.TransportVehicleDocumentService.updateTransportVehicleDocument({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteTransportVehicleDocument = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.TransportVehicleDocumentService.deleteTransportVehicleDocument(+id, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}
export default TransportVehicleDocumentController;
