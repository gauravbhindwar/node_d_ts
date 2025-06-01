import { Dialect } from 'sequelize/types';

interface DBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
  use_env_variable?: string;
}

const config: { [key: string]: DBConfig } = {
  development: {
    username: 'postgres',
    password: 'password',
    database: 'test_db',
    host: 'localhost',
    dialect: 'postgres' as Dialect,
  },
  test: {
    username: 'postgres',
    password: 'password',
    database: 'test_db',
    host: 'localhost',
    dialect: 'postgres' as Dialect,
  },
  production: {
    username: 'postgres',
    password: 'password',
    database: 'test_db',
    host: 'localhost',
    dialect: 'postgres' as Dialect,
    use_env_variable: 'DATABASE_URL', // Example environment variable for production
  },
};

export default config;
