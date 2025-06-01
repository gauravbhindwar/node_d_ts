require('ts-node/register');
require('tsconfig-paths/register');

const config = require('./config.ts');
module.exports = config.default || config;