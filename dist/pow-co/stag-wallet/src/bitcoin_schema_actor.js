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
exports.Actor = exports.authorIdentityPrefix = void 0;
const bsv = require("bsv-2");
const filepay_1 = require("./filepay");
const uuid = require("uuid");
const run_1 = require("./run");
exports.authorIdentityPrefix = '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva';
const stagFeeAddress = '1EfMdNM8rsCCM9C15ZgGEBKXJU3cGunMhk';
const stagFeeAmount = 1000;
class Actor {
    constructor({ wallet }) {
        this.wallet = wallet;
        this.purse = new bsv.PrivKey().fromWif(wallet.cards[0].privatekey);
        this.owner = new bsv.PrivKey().fromWif(wallet.cards[0].privatekey);
    }
    get identity() {
        return new bsv.Address().fromPrivKey(this.owner).toString();
    }
    publishMessage(newMessage) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            newMessage.nonce = newMessage.nonce || uuid.v4();
            const keypair = new bsv.KeyPair().fromPrivKey(this.owner);
            const payload = JSON.stringify(Object.assign(newMessage.payload, {
                nonce: newMessage.nonce
            }));
            const signature = bsv.Bsm.sign(Buffer.from(payload), keypair);
            let address = new bsv.Address().fromString(this.identity);
            let verified = bsv.Bsm.verify(Buffer.from(payload, 'utf8'), signature, address);
            if (!verified) {
                throw new Error('SIGNATURE NOT VERIFIED');
            }
            const unspent = yield this.wallet.cards[0].listUnspent();
            const inputs = unspent.map(utxo => {
                return {
                    "txid": utxo.txid,
                    "value": utxo.value,
                    "script": utxo.scriptPubKey,
                    "outputIndex": utxo.vout,
                    "required": false
                };
            });
            const params = {
                pay: {
                    key: this.purse.toWif(),
                    inputs,
                    to: [{
                            data: [
                                'onchain.sv',
                                'B',
                                payload,
                                'application/json',
                                'utf8',
                                '|',
                                'MAP',
                                'SET',
                                'app',
                                newMessage.app,
                                'type',
                                newMessage.event,
                                "|",
                                exports.authorIdentityPrefix,
                                "BITCOIN_ECDSA",
                                this.identity,
                                signature,
                                0x05 // signed index #5 "payloadToSign"
                            ],
                            value: 0
                        }, {
                            data: [
                                'stagwallet.io',
                                stagFeeAddress,
                                stagFeeAmount
                            ],
                            value: 0
                        }, {
                            address: stagFeeAddress,
                            value: stagFeeAmount
                        }]
                }
            };
            filepay_1.default.build(params, (error, tx) => __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    return reject(error.response);
                }
                const txhex = tx.serialize();
                const result = yield run_1.run.blockchain.broadcast(txhex);
                resolve(result);
            }));
        }));
    }
}
exports.Actor = Actor;
