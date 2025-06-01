import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import MedicalTypeRepo from '@/repository/medicalType.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class MedicalTypeController {
	private MedicalTypeService = new MedicalTypeRepo();
	private msg = new MessageFormation('MedicalType').message;

	public findAllMedicalTypes = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MedicalTypeService.getAllMedicalTypes(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getMedicalTypesData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MedicalTypeService.getMedicalTypesData();
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findMedicalTypeById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MedicalTypeService.getMedicalTypeById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addMedicalType = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.MedicalTypeService.addMedicalType({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateMedicalType = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MedicalTypeService.updateMedicalType({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteMedicalType = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.MedicalTypeService.deleteMedicalType(+id, req.user as User,);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}
export default MedicalTypeController;
