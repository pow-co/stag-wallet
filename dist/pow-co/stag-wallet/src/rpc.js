"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRPC = void 0;
require('dotenv').config();
const bsv_1 = require("./assets/bsv");
function getRPC(currency) {
    switch (currency) {
        case 'BSV':
            return bsv_1.rpc;
        default:
            throw new Error('rpc for currency not found');
    }
}
exports.getRPC = getRPC;
