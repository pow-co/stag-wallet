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
exports.boostpow = void 0;
const wallet_1 = require("./wallet");
const boostpow_1 = require("boostpow");
const powco_1 = require("powco");
const axios = require('axios');
function boostpow(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const newJob = {
            content: params.content,
            diff: params.difficulty,
        };
        if (params.category) {
            newJob['category'] = Buffer.from(params.category).toString('hex');
        }
        if (params.tag) {
            newJob['tag'] = Buffer.from(params.tag).toString('hex');
        }
        const job = boostpow_1.BoostPowJob.fromObject(newJob);
        const script = job.toScript().toHex();
        const wallet = yield (0, wallet_1.loadWallet)();
        const payment = yield wallet.buildPayment({
            instructions: [{
                    outputs: [{
                            script,
                            amount: params.satoshis
                        }]
                }]
        }, 'BSV');
        const result = yield (0, powco_1.broadcast)(payment);
        axios.get(`http://pow.co/api/v1/boost/jobs/${result}`);
        return boostpow_1.BoostPowJob.fromRawTransaction(payment);
    });
}
exports.boostpow = boostpow;
