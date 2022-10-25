"use strict";
/*
 * import { pay } from 'stag-wallet'
 *
 * const { txid, txhex } = await pay('https://name.sv/owenkellogg/1-USD')
 *
 */
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
exports.pay = void 0;
const wallet_1 = require("./wallet");
function pay(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = yield (0, wallet_1.loadWallet)();
        const result = yield wallet.payUri(url, 'BSV');
        return result;
    });
}
exports.pay = pay;
