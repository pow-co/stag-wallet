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
exports.Client = void 0;
const axios = require('axios');
const log_1 = require("./log");
class Client {
    constructor(url) {
        this.url = url;
    }
    getPaymentOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            let { data } = yield axios.get(this.url, {
                headers: {
                    'x-paypro-version': 2,
                    'accept': 'application/payment-options'
                }
            });
            return data;
        });
    }
    selectPaymentOption(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let { data } = yield axios.post(this.url, params, {
                headers: {
                    'x-paypro-version': 2,
                    'content-type': 'application/payment-request'
                }
            });
            return data;
        });
    }
    verifyPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let { data } = yield axios.post(this.url, params, {
                headers: {
                    'x-paypro-version': 2,
                    'content-type': 'application/payment-verification'
                },
            });
            return data;
        });
    }
    transmitPayment(params, transaction, options) {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.log.info('wallet-bot.simple-wallet.transmitPayment', { params, transaction, options });
            var payment;
            if (params.chain === 'XMR') {
                payment = {
                    chain: params.chain,
                    currency: params.chain,
                    transactions: [{ tx: transaction, tx_key: options.tx_key, tx_hash: options.tx_hash }]
                };
            }
            else {
                payment = {
                    chain: params.chain,
                    currency: params.chain,
                    transactions: [{ tx: transaction }]
                };
            }
            let { data } = yield axios.post(this.url, payment, {
                headers: {
                    'x-paypro-version': 2,
                    'content-type': 'application/payment'
                }
            });
            return data;
        });
    }
    sendPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let { data } = yield axios.post(this.url, params, {
                headers: {
                    'x-paypro-version': 2,
                    'content-type': 'application/payment'
                }
            });
            return data;
        });
    }
}
exports.Client = Client;
