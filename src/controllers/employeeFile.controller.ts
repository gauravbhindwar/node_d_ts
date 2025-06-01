import { MessageFormation } from '@/constants/messages.constants';
import { secureFileToken } from '@/helpers/secureFolder.helper';
import User from '@/models/user.model';
import EmployeeFileRepo from '@/repository/employeeFile.repository';
import FolderRepo from '@/repository/folder.repository';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

class EmployeeFileController {
	private EmployeeFileService = new EmployeeFileRepo();
	private FolderService = new FolderRepo();
	private msg = new MessageFormation('Employee File').message;

	public findAllEmployeeFile = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.EmployeeFileService.getAllEmployeeFileService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findEmployeeFileById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.EmployeeFileService.getEmployeeFileByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Employee File Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addEmployeeFile = catchAsync(async (req: Request, res: Response) => {
		const { file: files } = req;

		if (files) {
			req.body = {
				...req.body,
				fileSize: files.size,
				name: files?.originalname,
				fileName: `/employeeRelatedFiles/${files.filename}`,
				status: 0,
			};
		} else {
			req.body = {
				...req.body,
				fileLink: true,
				name: req.body.fileName,
				status: 0,
			};
		}

		const responseData = await this.EmployeeFileService.addEmployeeFileService({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	/**
	 * Update Employee Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateEmployeeFile = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;

		const responseData = await this.EmployeeFileService.updateEmployeeFileService({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Employee File Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteEmployeeFile = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.EmployeeFileService.deleteEmployeeFileService({
			id: Number(id),
      user: req.user as User
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});

	public getEmployeeFilePath = catchAsync(async (req: Request, res: Response) => {
		const body = req.body;
		const fileNameMatch = body.filename.replace(/\?token=.*/, '');
		const result = await secureFileToken(fileNameMatch);
		return generalResponse(req, res, result, this.msg.fetch, 'success', false);
	});
}

export default EmployeeFileController;
