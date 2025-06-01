import User from '@/models/user.model';
import socketIo from '../socket';

export const generateModalData = async ({
	user,
	percentage,
	message,
}: {
	user: User;
	percentage: number;
	message: string;
}) => {
	const io = socketIo.getServer();
	const data = {
		percentage: Number(percentage),
		type: 'success',
		message: message,
	};
	io.to(`connect-${user?.id}`).emit('generate-modal-data', data);
};
