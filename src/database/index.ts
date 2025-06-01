import CLS from 'cls-hooked';
import * as pg from 'pg';
import { Sequelize, Transaction } from 'sequelize';
import {
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_LOGGING_ENABLED,
} from '../settings';
import patchSequelizeForComments from './commenting';
import auditing from './auditing'; // eslint-disable-line
export * from './resolvers';

// Create a new Continuation-Local-Storage (CLS) namespace and tell Sequelize to
// use it
export const namespace = CLS.createNamespace('sequelize');
Sequelize.useCLS(namespace);

/**
 * Create a new database connection.
 */
export function create_instance() {
  const sequelize = new Sequelize({
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    define: {
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: { connectTimeout: 5 },
    logging: DB_LOGGING_ENABLED,
    minifyAliases: true,
  });
  return patchSequelizeForComments(auditing(sequelize));
}

// Default sequelize instance
export default create_instance();

/**
 * Retrieves the existing transaction according to the CLS namespace, or
 * produces a new transaction if one was not found.
 * NOTE: Just realized I was a total idiot and named this in snake_case instead
 *     of camelCase like everything else - Sincerely, Thomas
 */
export const get_or_create_transaction = async <R>(cb: (...args: any) => R) => (
  namespace.get('transaction')
    ? cb(namespace.get('transaction'))
    : exports.default.transaction(cb)
);

/**
 * Retrieve the current transaction from CLS context.
 */
export const getCurrentTransaction = () => (
  namespace.get('transaction')
);

/**
 * Executes the given callback when the current transaction has successfully
 * committed.
 */
export const afterCommit = (cb) => {
  getCurrentTransaction().afterCommit(cb);
};

export { Sequelize, Transaction };
