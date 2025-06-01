import { Sequelize } from 'sequelize-typescript';
import { MSSQL_DATABASE, MSSQL_PASSWORD, MSSQL_SERVER, MSSQL_USER } from './config';

let mssqldb: Sequelize;

const initSequelize = () => {
	const sequelize = new Sequelize(MSSQL_DATABASE, MSSQL_USER, MSSQL_PASSWORD, {
		dialect: 'mssql',
		host: MSSQL_SERVER,
		dialectOptions: {
			encrypt: true,
		},
	});

	sequelize
		.authenticate()
		.then(async () => {
			console.log('MSSQL Database connected');
		})
		.catch((err) => {
			console.log('Unable to connect to database', err);
		});

	return sequelize;
};

if (!mssqldb) {
	mssqldb = initSequelize();
}

export default mssqldb;
