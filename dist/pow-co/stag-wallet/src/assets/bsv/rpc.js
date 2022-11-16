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
exports.getBalance = exports.listUnspent = exports.RpcClient = void 0;
const axios_1 = require("axios");
class RpcClient {
    constructor(params) {
        this.url = params.url;
    }
    listUnspent(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let method = 'listunspent';
            //let params = [0, 9999999, `["${address}"]`]
            let params = [0, 9999999, [address]];
            let { data } = yield axios_1.default.post(this.url, { method, params }, {
                auth: {
                    username: process.env.BSV_RPC_USER,
                    password: process.env.BSV_RPC_PASSWORD
                }
            });
            return data.result;
        });
    }
}
exports.RpcClient = RpcClient;
const run_1 = require("../../run");
function listUnspent(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const utxos = yield run_1.run.blockchain.utxos(address);
        return utxos.map(utxo => {
            return {
                txid: utxo.txid,
                vout: utxo.vout,
                value: utxo.satoshis,
                scriptPubKey: utxo.script
            };
        });
    });
}
exports.listUnspent = listUnspent;
function getBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const utxos = yield listUnspent(address);
        return utxos.reduce((sum, { value }) => sum + value, 0);
    });
}
exports.getBalance = getBalance;
