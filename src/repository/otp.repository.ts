import OTP from '../models/otp.model';
import BaseRepository from './base.repository';
import UserRepo from './user.repository';

export default class OtpRepo extends BaseRepository<OTP> {
	private userRepository = new UserRepo();
	constructor() {
		super(OTP.name);
	}
}
