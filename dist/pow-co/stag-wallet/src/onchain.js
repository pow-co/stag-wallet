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
exports.post = void 0;
const bsv = require("bsv");
const actor_1 = require("./actor");
const uuid_1 = require("uuid");
const powco_1 = require("powco");
const txo_1 = require("txo");
const wallet_1 = require("./wallet");
var wallet;
// use default wallet
function post(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return onchain().post(params);
    });
}
exports.post = post;
const onchain = (wallet) => {
    return {
        post: (params) => __awaiter(void 0, void 0, void 0, function* () {
            if (!wallet) {
                wallet = yield (0, wallet_1.loadWallet)();
            }
            const actor = new actor_1.Actor({
                wallet
            });
            const message = {
                app: params.app,
                event: params.key,
                payload: params.val,
                nonce: (0, uuid_1.v4)()
            };
            console.log('onchain.publish.message', message);
            const txid = yield actor.publishMessage(message);
            console.log('onchain.publish.message.result', { result: txid, message });
            const txhex = yield (0, powco_1.fetch)(txid);
            const txo = yield (0, txo_1.fromTx)(txhex);
            return {
                txid,
                txhex,
                txo,
                tx: new bsv.Transaction(txhex)
            };
        })
    };
};
exports.default = onchain;
