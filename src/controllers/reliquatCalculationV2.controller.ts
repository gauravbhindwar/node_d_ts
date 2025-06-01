import { MessageFormation } from '@/constants/messages.constants';
import ReliquatCalculationV2Repo from '@/repository/reliquatCalculationV2.repository';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

class ReliquatCalculationV2Controller {
	private ReliquatCalculationV2Service = new ReliquatCalculationV2Repo();
	private msg = new MessageFormation('Reliquat Calculation V2').message;

	public findAllReliquatCalculationV2 = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ReliquatCalculationV2Service.getAllReliquatCalculationV2Service(req);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getEmployeeReliquat = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.ReliquatCalculationV2Service.getEmployeeReliquatData(req);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});
}

export default ReliquatCalculationV2Controller;
