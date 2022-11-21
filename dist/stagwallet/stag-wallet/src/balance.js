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
exports.convertBalance = void 0;
const axios = require('axios');
const currency_1 = require("./currency");
const bignumber_js_1 = require("bignumber.js");
function convertBalance(balance, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        const api = 'https://api.anypayx.com';
        if (balance.currency === currency_1.Currencies.Satoshis) {
            balance.amount = new bignumber_js_1.default(balance.amount).dividedBy(100000000).toNumber();
            balance.currency = currency_1.Currencies.BSV;
        }
        let { data } = yield axios.get(`${api}/convert/${balance.amount}-${balance.currency}/to-${currency}`);
        let amount = data.conversion.output.value;
        return {
            amount,
            currency
        };
    });
}
exports.convertBalance = convertBalance;
