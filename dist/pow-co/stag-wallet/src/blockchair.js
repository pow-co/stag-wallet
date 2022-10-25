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
exports.getRawTx = exports.listUnspent = exports.getBalance = exports.getAddress = exports.BlockchairApiError = void 0;
const axios_1 = require("axios");
const uuid_1 = require("uuid");
const log_1 = require("./log");
const config_1 = require("./config");
const currencies = {
    'BCH': 'bitcoin-cash',
    'BSV': 'bitcoin-sv',
    'BTC': 'bitcoin',
    'DASH': 'dash',
    'LTC': 'litecoin',
    'DOGE': 'dogecoin'
};
const key = config_1.default.get('blockchair_api_key');
class BlockchairApiError extends Error {
}
exports.BlockchairApiError = BlockchairApiError;
function getAddress(coin, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const trace = (0, uuid_1.v4)();
        try {
            log_1.default.debug('blockchair.api.dashboards.address', { address, coin, trace });
            const { data } = yield axios_1.default.get(`https://api.blockchair.com/${coin.toLowerCase()}/dashboards/address/${address}`);
            log_1.default.debug('blockchair.api.dashboards.address.result', { trace, data });
            return data;
        }
        catch (err) {
            const error = new BlockchairApiError(err.message);
            log_1.default.error('blockchair.api.dashboards', error);
            throw error;
        }
    });
}
exports.getAddress = getAddress;
function getBalance(asset, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            log_1.default.info('blockchair.getBalance', { asset, address });
            const currency = currencies[asset];
            const url = `https://api.blockchair.com/${currency}/dashboards/address/${address}?key=${key}`;
            const response = yield axios_1.default.get(url);
            const { data } = response;
            log_1.default.debug('blockchair.getBalance.result', data);
            const { balance: value, balance_usd: value_usd } = data['data'][address]['address'];
            const utxos = data['data'][address]['utxo'];
            return { asset, address, value: parseFloat(value), value_usd: parseFloat(value_usd.toFixed(2)) };
        }
        catch (err) {
            const error = new BlockchairApiError(err.message);
            log_1.default.error('blockchair.api.getBalance.error', error);
            throw error;
        }
    });
}
exports.getBalance = getBalance;
function listUnspent(asset, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            log_1.default.info('blockchair.listUnspent', { asset, address });
            const currency = currencies[asset];
            const { data } = yield axios_1.default.get(`https://api.blockchair.com/${currency}/dashboards/address/${address}?key=${key}`);
            log_1.default.debug('blockchair.listUnspent.result', data);
            const utxos = data['data'][address]['utxo'];
            return utxos.map(utxo => {
                return {
                    txid: utxo.transaction_hash,
                    vout: utxo.index,
                    value: utxo.value
                };
            });
        }
        catch (err) {
            const error = new BlockchairApiError(err.message);
            log_1.default.error('blockchair.api.listUnspent.error', error);
            throw error;
        }
    });
}
exports.listUnspent = listUnspent;
function getRawTx(asset, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currency = currencies[asset];
            const { data } = yield axios_1.default.get(`https://api.blockchair.com/${currency}/raw/transaction/${txid}?key=${key}`);
            log_1.default.info('blockchair.rawTx.result', { data, asset, txid });
            return data['data'][txid]['decoded_raw_transaction'];
        }
        catch (err) {
            const error = new BlockchairApiError(err.message);
            log_1.default.error('blockchair.api.getRawTx.error', error);
            throw error;
        }
    });
}
exports.getRawTx = getRawTx;
