"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTokenBalances = exports.run = exports.broadcast = void 0;
const axios_1 = require("axios");
function broadcast(rawtx) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.post(`https://api.run.network/v1/main/tx`, {
            rawtx
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return data;
    });
}
exports.broadcast = broadcast;
const Run = require('run-sdk');
const blockchain = new Run.plugins.WhatsOnChain({ network: 'main' });
exports.run = new Run({ blockchain });
function listTokenBalances(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default.get(`https://staging-backend.relayx.com/api/user/balance2/#${address}`);
        return data.data;
    });
}
exports.listTokenBalances = listTokenBalances;
