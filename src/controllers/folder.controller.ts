import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import EmployeeFileRepo from '@/repository/employeeFile.repository';
import FolderRepo from '@/repository/folder.repository';
import { catchAsync } from '@/utils/catchAsync';
import generalResponse from '@/utils/generalResponse';
import { Request, Response } from 'express';

class FolderController {
	private FolderService = new FolderRepo();
	private EmployeeFileService = new EmployeeFileRepo();
	private msg = new MessageFormation('Folder').message;

	public findAllFolders = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.FolderService.getAllFolders(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getFolderData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.FolderService.getFolderData();
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findFolderById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.FolderService.getFolderById(+id);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});


	public findFilesByFolderId = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.EmployeeFileService.findFilesByFolderId(+id, req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public addFolder = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.FolderService.createFolder({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	public updateFolder = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.FolderService.updateFolder({
			body: req.body,
			user: req.user as User,
			id: +id,
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	public deleteFolder = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.FolderService.deleteFolder(+id, req.user as User);
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});

	public findFileCount = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.FolderService.getFileCount(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});
}

export default FolderController;
