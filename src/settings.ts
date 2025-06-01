import env from 'env-var';

export const BASE_DIR = env.get('BASE_DIR').default(__dirname).asString();

export const DB_USER = env.get('DB_USER').required().asString();
export const DB_PASS = env.get('DB_PASS').required().asString();
export const DB_HOST = env.get('DB_HOST').required().asString();
export const DB_PORT = env.get('DB_PORT').default('5432').asInt();
export const DB_NAME = env.get('DB_NAME').required().asString();
export const DB_LOGGING_ENABLED = env.get('DB_LOGGING_ENABLED').default('false').asBool();

/** @deprecated Please use URL utilities instead of directly using this */
export const SERVICE_URI = env.get('SERVICE_URI').default('https://localhost:4000').asString();
export const NODE_ENV = env.get('NODE_ENV').default('production').asString();
export const AWS_S3_ASSET_ICONS_BUCKET_NAME = env.get('AWS_S3_ASSET_ICONS_BUCKET_NAME').asString();
export const IS_DEVELOPMENT = true