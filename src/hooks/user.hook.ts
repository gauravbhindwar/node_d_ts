import LoginUser from '@/models/loginUser.model';
import * as bcrypt from 'bcrypt';

export const passwordHook = async (user: LoginUser) => {
	if (user.randomPassword && user.changed('randomPassword')) {
		user.randomPassword = await bcrypt.hash(user.randomPassword, 10);
	}
	if (user.password && user.changed('password')) {
		user.password = await bcrypt.hash(user.password, 10);
	}
};
