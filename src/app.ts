import { NODE_ENV, PORT, SERVER_URL, SWAGGER_PASSWORD, SWAGGER_USER } from '@config';
import { Routes } from '@interfaces/general/routes.interface';
import { UserAttributes } from '@interfaces/model/user.interface';
import errorMiddleware from '@middleware/error.middleware';
import { logger, stream } from '@utils/logger';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from "dotenv";
import express from 'express';
import basicAuth from 'express-basic-auth';
import { App as FirebaseApp } from 'firebase-admin/app';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import socket from 'socket';
import socketIO from 'socket.io';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import FileToken from './models/fileToken.model';
import { parse } from './utils/common.util';
dotenv.config();

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface User extends UserAttributes {}
	}
}
const publicFolder = path.join(__dirname, '../secure-file');
class App {
	public app: express.Application;
	public env: string;
	public port: string | number;
	private server?: http.Server;
	public firebaseApp: FirebaseApp;
	private io: socketIO.Server;

	constructor(routes: Routes[]) {
		this.app = express();
		this.env = NODE_ENV || 'development';
		this.port = PORT || 3000;
		this.initializeMiddleware();
		this.initializeRoutes(routes);
		this.initializeSwagger();
		this.initializeErrorHandling();
		this.createServer();
		this.connectSocket();
		// this.initializeCrons();
	}

	public listen = async () => {
		this.server.listen(this.port, () => {
			logger.info(`=================================`);
			logger.info(`======= ENV: ${this.env} =======`);
			logger.info(`🚀 App listening on the port ${this.port}`);
			logger.info(`=================================`);
		});
	};
	public getServer() {
		return this.app;
	}

	public getFirebaseApp() {
		return this.firebaseApp;
	}


	private initializeMiddleware() {
		this.app.set('view engine', 'ejs');
		this.app.use(morgan('dev', { stream }));
		  this.app.use(cors())
		//   const whitelist = [FRONTEND_URL];
		//   const corsOptions = {
		// 	origin: function (origin, callback) {
		// 	  if (whitelist.indexOf(origin) !== -1) {
		// 		callback(null, true);
		// 	  } else {
		// 		callback(new Error("Not allowed by CORS"));
		// 	  }
		// 	},
		//   };
		// this.app.use(cors(corsOptions));
		this.app.use((req, res, next) => {
			res.setHeader('Access-Control-Allow-Origin', '*')
			res.setHeader(
				'Access-Control-Allow-Methods',
				'GET, POST, PUT, PATCH, DELETE'
			)
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Token')
			if (req.method === 'OPTIONS') {
				return res.json({});
			};
			next()
		});
		this.app.use('/', express.static('public'));
		this.app.use('/', async (req, res, next) => {
			const { token }: any = req.query;
			const reqPath = decodeURIComponent(req.path);
			if (token) {
				const generatedToken = await FileToken.findOne({ where: { token: token } }).then((parserData) =>
					parse(parserData),
				);
				if (generatedToken) {
					const filePath = path.join(publicFolder, reqPath);
					await FileToken.destroy({ where: { token: token }, force: true });
					res.sendFile(filePath);
				} else {
					next();
				}
			} else {
				next();
			}
		});
		this.app.use('/documentation', express.static('postman'));
		this.app.use(hpp());
		this.app.use(helmet());
		this.app.use(compression());
		this.app.use(express.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(cookieParser());
		this.app.use(passport.initialize());
	}

	private initializeRoutes(routes: Routes[]) {
		routes.forEach((route) => {
			this.app.use('/', route.router);
		});
	}

	private initializeSwagger() {
		const options = {
			definition: {
				openapi: '3.0.0',
				info: {
					title: 'BOU',
					version: '1.0.0',
					description: `<h3>Introduction</h3><p> Optimizing the Household tasks in the smartest way possible. This includes Task Management, Task Planning and Scheduling Communication (Internal family chat), Meal planning, Task progress Task tracking and Task Organizing, Travel checklist helper etc. </p><p>Database: MYSQL</p><h3>Things that the developers should know about</h3><p>We have added examples and possible payloads. Please refer it.</p><h3>Authentication</h3><h4>What is the preferred way of using the API?</h4><p>We are using JWT Authentication in Authorization header. Pass jwt + token to authorize the user.</p><h3>Error Codes</h3><h4>What errors and status codes can a user expect?</h4><p>400, 401, 500, 404</p><p>We have provided the postman collection that can be use for developers.Please check this for payload descriptions.</p><a href='${SERVER_URL}/documentation/postmanCollection.json'>Postman Collection</a></br>`,
				},
			},
			apis: ['result.yaml'],
		};

		const specs = swaggerJSDoc(options);

		this.app.use(
			'/api-docs',
			basicAuth({
				authorizer: this.myAsyncAuthorizer,
				authorizeAsync: true,
				challenge: true,
			}),
			swaggerUi.serve,
			swaggerUi.setup(specs, { swaggerOptions: { docExpansion: 'none', filter: true, persistAuthorization: true } }),
		);
		this.app.get('/api-docs.json', (req, res) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(specs);
		});
	}

	myAsyncAuthorizer(username: string, password: string, cb) {
		let condition = false;
		const users = { admin: 'admin' };
		users[SWAGGER_USER] = SWAGGER_PASSWORD;

		Object.entries(users).forEach((e) => {
			if (username === e[0] && password === e[1]) condition = true;
		});

		if (condition) return cb(null, true);
		else return cb(null, false);
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}

	private initializeCrons() {
		require('./crons/index.cron');
	}

	private createServer(): void {
		this.server = http.createServer(this.app);
	}

	private connectSocket(): void {
		socket.connect(this.server);
	}
}

export default App;
