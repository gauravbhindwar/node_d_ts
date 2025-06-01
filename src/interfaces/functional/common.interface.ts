import { Request } from 'express';
import User from '../../models/user.model';

export interface BuildArgs {
	data: Request['body'];
	action: 'create' | 'update';
	user?: User;
}
