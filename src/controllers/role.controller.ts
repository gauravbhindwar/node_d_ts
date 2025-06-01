import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import { MessageFormation } from '@/constants/messages.constants';
import User from '@/models/user.model';
import RoleRepo from '@/repository/role.repository';
import generalResponse from '@/utils/generalResponse';

class RoleController {
	private RoleService = new RoleRepo();
	private msg = new MessageFormation('Role').message;

	public findAllRole = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RoleService.getAllRoleService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public getRoleData = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RoleService.getRoleDataService(req.query);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public findRoleById = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.RoleService.getRoleByIdService(Number(id));
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	/**
	 * Add Role Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public addRole = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.RoleService.addRoleService({
			body: req.body,
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.create, 'success', true);
	});

	/**
	 * Update Role Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public updateRole = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.RoleService.updateRoleService({
			body: req.body,
			user: req.user as User,
			id: Number(id),
		});
		return generalResponse(req, res, responseData, this.msg.update, 'success', true);
	});

	/**
	 * Delete Role Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public deleteRole = catchAsync(async (req: Request, res: Response) => {
		const id = req.params.id;
		const responseData = await this.RoleService.deleteRoleService({
			id: Number(id),
			user: req.user as User,
		});
		return generalResponse(req, res, responseData, this.msg.delete, 'success', true);
	});
}

export default RoleController;
