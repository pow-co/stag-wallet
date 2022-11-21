"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const winston = require("winston");
const config_1 = require("./config");
const transports = [
    new winston.transports.Console({
        format: winston.format.json()
    })
];
if (config_1.default.get('loki_host')) {
    const LokiTransport = require("winston-loki");
    const lokiConfig = {
        format: winston.format.json(),
        host: config_1.default.get('loki_host'),
        json: true,
        batching: false,
        labels: { app: config_1.default.get('loki_label_app') }
    };
    if (config_1.default.get('loki_basic_auth')) {
        lokiConfig['basicAuth'] = config_1.default.get('loki_basic_auth');
    }
    transports.push(new LokiTransport(lokiConfig));
}
const log = winston.createLogger({
    level: 'info',
    transports,
    format: winston.format.json()
});
exports.log = log;
if (config_1.default.get('loki_host')) {
    log.debug('loki.enabled');
}
exports.default = log;
