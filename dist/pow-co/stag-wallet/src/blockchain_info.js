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
exports.listUnspent = void 0;
const config_1 = require("./config");
const axios = require('axios');
const log_1 = require("./log");
class BlockchainInfoError extends Error {
}
function listUnspent(coin, address) {
    return __awaiter(this, void 0, void 0, function* () {
        if (coin !== 'BTC') {
            throw new BlockchainInfoError('Only BTC supported on blockchain.info');
        }
        try {
            const key = config_1.default.get('crypto_apis_io_api_key');
            const { data } = yield axios.get(`https://blockchain.info/unspent?active=${address}`);
            return data.unspent_outputs.map((output) => {
                return {
                    txid: output.tx_hash,
                    vout: output.tx_output_n,
                    value: output.value,
                    scriptPubKey: output.script
                };
            });
        }
        catch (err) {
            const error = new BlockchainInfoError(err.message);
            log_1.log.error('blockchain.info.api.error', error);
            throw error;
        }
    });
}
exports.listUnspent = listUnspent;
