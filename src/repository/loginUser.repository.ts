import LoginUser from '@/models/loginUser.model';
import BaseRepository from './base.repository';

export default class LoginUserRepo extends BaseRepository<LoginUser> {
	constructor() {
		super(LoginUser.name);
	}
}
