/* eslint-disable no-console */
import { NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import _ from 'lodash';
import * as socketIO from 'socket.io';
import App from './app';
import { events, socketEvents } from './ioServer/socket.constants';
import { logger } from './utils/logger';
interface DecodedAttributes {
	userId: string;
	role: string;
	email: string;
	iat: number;
	exp: number;
}
interface SocketAttribute extends socketIO.Socket {
	decoded: DecodedAttributes;
}
let connection: Socket = null;
let socketServer: socketIO.Server = null;
export class Socket {
	socket: SocketAttribute | null;
	socketServer: socketIO.Server | null;
	constructor() {
		this.socket = null;
	}

	connect(server: App['server']) {
		// const io = new socketIO.Server(server, {
		// 	cors: {
		// 		origin: ["http://localhost:3001", "https://lred-dev.techgreenwave-dev.com", "http://3.6.123.205:3002"],
		// 		methods: ['GET', 'POST']
		// 	},
		// });
		const io = new socketIO.Server(server);
		socketServer = io;
		io.use(function (socket: SocketAttribute, next: NextFunction) {
			if (socket.handshake.query?.token) {
				jwt.verify(
					socket.handshake.query.token as string,
					process.env.JWT_SECRET,
					function (err: jwt.VerifyErrors, decoded: DecodedAttributes) {
						if (err) return next(new Error('Authentication error'));
						socket.decoded = decoded;
						next();
					},
				);
				socket.join(`${events.CONNECT}-${socket.decoded.userId}`);
			} else {
				next(new Error('Authentication error'));
			}
		}).on(socketEvents.CONNECTION, async (socket: SocketAttribute) => {
			this.socket = socket;
			const userData = { ...(socket.decoded ? { user: { id: Number(socket.decoded?.userId) } } : {}) };
			logger.info('Socket Connected Successfully', socket.id);

			io.emit(socketEvents.USER_ACTIVE, userData?.user?.id);
			socket.on(socketEvents.DISCONNECT, () => {
				io.emit(socketEvents.USER_INACTIVE, userData?.user?.id);
				logger.info('Client disconnected');
			});
		});
	}

	emit<T>(event: string, data: T) {
		this.socket.emit(event, data);
	}

	static init(server: App['server']) {
		if (!connection) {
			connection = new Socket();
			connection.connect(server);
		}
	}

	static getConnection() {
		if (connection) {
			return connection;
		}
	}

	static emit<T>(event: string, data: T) {
		if (connection?.socket) {
			connection.emit<T>(event, data);
		}
	}

	static getServer() {
		if (!_.isNull(socketServer)) {
			return socketServer;
		}
	}
}
export default {
	connect: Socket.init,
	connection: Socket.getConnection,
	emit: Socket.emit,
	getServer: Socket.getServer,
};
