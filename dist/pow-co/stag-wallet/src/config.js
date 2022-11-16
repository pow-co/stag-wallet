"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var config = require('nconf');
config.argv()
    .env();
config.defaults({
    'domain': 'api.anypayx.com',
    'api_base': 'https://api.anypayx.com'
});
exports.default = config;
