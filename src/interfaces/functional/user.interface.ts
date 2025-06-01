import { Request } from 'express';
import User from '../../models/user.model';

export interface BuildUserArgs {
	data: Request['body'];
	action: 'create' | 'update';
	user?: User;
}

export interface BuildUserUpdateArgs {
	id: number;
	data: Request['body'];
	action: 'create' | 'update';
	user?: User;
  authUser?: User;
}
