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
exports.loadWallet = exports.Card = exports.Wallet = exports.UnsufficientFundsError = void 0;
require('dotenv').config();
const rpc_1 = require("./rpc");
const config_1 = require("./config");
const bignumber_js_1 = require("bignumber.js");
const bitcore_1 = require("./bitcore");
const invoice_1 = require("./invoice");
const client_1 = require("./client");
const blockchair = require("./blockchair");
const axios_1 = require("axios");
class UnsufficientFundsError extends Error {
    constructor({ currency, address, paymentRequest, balance, required }) {
        super();
        this.currency = currency;
        this.address = address;
        this.balance = balance;
        this.required = required;
        this.paymentRequest = paymentRequest;
        this.message = `Insufficient ${currency} Balance of ${balance} in ${address}: ${required} required`;
    }
}
exports.UnsufficientFundsError = UnsufficientFundsError;
var assets = require('require-all')({
    dirname: __dirname + '/assets',
    recursive: true,
    filter: /(.+)\.ts$/,
    map: (name) => name.toUpperCase()
});
const log_1 = require("./log");
const balance_1 = require("./balance");
class Wallet {
    constructor(params) {
        this.cards = params.cards;
    }
    static load(cards) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Wallet({ cards: cards.map(card => new Card(card)) });
        });
    }
    balances() {
        return __awaiter(this, void 0, void 0, function* () {
            let balances = yield Promise.all(this.cards.map((card) => __awaiter(this, void 0, void 0, function* () {
                //if (card.asset === 'DOGE') { return }
                try {
                    let balance = yield card.balance();
                    return balance;
                }
                catch (error) {
                    log_1.default.error('balances.error', error);
                    return null;
                }
            })));
            return balances.filter(balance => balance !== null);
        });
    }
    payInvoice(invoice_uid, asset, { transmit } = { transmit: true }) {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.default.info(`wallet-bot.simple-wallet.payInvoice`, {
                invoice_uid,
                asset,
                transmit
            });
            return this.payUri(`${config_1.default.get('API_BASE')}/i/${invoice_uid}`, asset, { transmit });
        });
    }
    payUri(uri, asset, { transmit } = { transmit: true }) {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.default.info(`wallet-bot.simple-wallet.payUri`, {
                uri,
                asset,
                transmit
            });
            let client = new client_1.Client(uri);
            let paymentRequest = yield client.selectPaymentOption({
                chain: asset,
                currency: asset
            });
            var payment;
            var options;
            payment = yield this.buildPayment(paymentRequest, asset);
            if (!transmit)
                return payment;
            try {
                let result = yield client.transmitPayment(paymentRequest, payment, options);
                log_1.default.info('simple-wallet.transmitPayment.result', result);
            }
            catch (error) {
                log_1.default.info('simple-wallet.transmitPayment.error', error);
                throw error;
            }
            return payment;
        });
    }
    asset(asset) {
        return this.cards.filter(card => card.asset === asset)[0];
    }
    newInvoice(newInvoice) {
        return __awaiter(this, void 0, void 0, function* () {
            return new invoice_1.Invoice();
        });
    }
    buildPayment(paymentRequest, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            let { instructions } = paymentRequest;
            let wallet = this.asset(asset);
            let balance = yield wallet.balance();
            yield wallet.listUnspent();
            let bitcore = (0, bitcore_1.getBitcore)(asset);
            let privatekey = new bitcore.PrivateKey(wallet.privatekey);
            var tx, totalInput, totalOutput = 0;
            const unspent = yield Promise.all(wallet.unspent.map((utxo) => __awaiter(this, void 0, void 0, function* () {
                if (utxo.scriptPubKey) {
                    return utxo;
                }
                const raw_transaction = yield blockchair.getRawTx(wallet.asset, utxo.txid);
                return Object.assign(utxo, {
                    scriptPubKey: raw_transaction['vout'][utxo.vout].scriptPubKey.hex,
                });
            })));
            try {
                const coins = unspent.map(utxo => {
                    const result = {
                        txId: utxo.txid,
                        outputIndex: utxo.vout,
                        satoshis: utxo.value,
                        scriptPubKey: utxo.scriptPubKey
                    };
                    return result;
                });
                tx = new bitcore.Transaction()
                    .from(coins)
                    .change(wallet.address);
            }
            catch (error) {
                log_1.default.error('buildPayment', error);
            }
            totalInput = wallet.unspent.reduce((sum, input) => {
                let satoshis = new bignumber_js_1.default(input.value).times(100000000).toNumber();
                return sum.plus(satoshis);
            }, new bignumber_js_1.default(0)).toNumber();
            for (let output of instructions[0].outputs) {
                // TODO: Support Script Instead of Address
                if (output.address) {
                    let address = bitcore.Address.fromString(output.address);
                    let script = bitcore.Script.fromAddress(address);
                    tx.addOutput(bitcore.Transaction.Output({
                        satoshis: output.amount,
                        script: script.toHex()
                    }));
                    totalOutput += output.amount;
                }
                else if (output.script) {
                    let script = bitcore.Script(output.script);
                    tx.addOutput(bitcore.Transaction.Output({
                        satoshis: output.amount,
                        script: script.toHex()
                    }));
                    totalOutput += output.amount;
                }
            }
            if (totalInput < totalOutput) {
                log_1.default.info('InsufficientFunds', {
                    currency: wallet.asset,
                    totalInput,
                    totalOutput
                });
                throw new Error(`Insufficient ${wallet.asset} funds to pay invoice`);
            }
            if (totalOutput > totalInput) {
                throw new UnsufficientFundsError({
                    currency: wallet.asset,
                    address: wallet.address,
                    paymentRequest,
                    balance: totalInput,
                    required: totalOutput
                });
            }
            tx.sign(privatekey);
            return tx.toString('hex');
        });
    }
    getInvoice(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            let { data } = yield axios_1.default.get(`${config_1.default.get('api_base')}/invoices/${uid}`);
            return data;
        });
    }
}
exports.Wallet = Wallet;
class Card {
    constructor(params) {
        this.unspent = [];
        this.asset = params.asset;
        this.privatekey = params.privatekey;
        this.address = params.address;
        let bitcore = (0, bitcore_1.getBitcore)(this.asset);
        if (bitcore.PrivateKey) {
            this.address = new bitcore.PrivateKey(this.privatekey).toAddress().toString();
        }
    }
    getUnspent() {
        return __awaiter(this, void 0, void 0, function* () {
            const blockchairUnspent = yield blockchair.listUnspent(this.asset, this.address);
            this.unspent = blockchairUnspent;
        });
    }
    listUnspent() {
        return __awaiter(this, void 0, void 0, function* () {
            let rpc = (0, rpc_1.getRPC)(this.asset);
            if (rpc['listUnspent']) {
                this.unspent = yield rpc['listUnspent'](this.address);
            }
            else {
                try {
                    this.unspent = yield blockchair.listUnspent(this.asset, this.address);
                }
                catch (error) {
                    error.asset = this.asset;
                    error.address = this.address;
                    log_1.default.error('blockchair.listUnspent.error', error);
                }
            }
            return this.unspent;
        });
    }
    balance() {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = this.asset;
            let rpc = (0, rpc_1.getRPC)(this.asset);
            var value;
            const errors = [];
            if (rpc['getBalance']) {
                value = yield rpc['getBalance'](this.address);
            }
            else {
                try {
                    value = yield blockchair.getBalance(this.asset, this.address);
                }
                catch (error) {
                    errors.push(error);
                    error.asset = this.asset;
                    error.address = this.address;
                    log_1.default.error('blockchair.getBalance.error', error);
                }
            }
            const { amount: value_usd } = yield (0, balance_1.convertBalance)({
                currency: this.asset,
                amount: this.asset === 'XMR' ? value : value / 100000000
            }, 'USD');
            try {
                this.unspent = yield this.listUnspent();
                if (!value) {
                    value = this.unspent.reduce((sum, output) => {
                        return sum.plus(output.value);
                    }, new bignumber_js_1.default(0)).toNumber();
                }
                if (errors.length > 0 && !value) {
                    value = false;
                }
                return {
                    asset: this.asset,
                    value: value,
                    value_usd,
                    address: this.address,
                    errors
                };
            }
            catch (error) {
                return {
                    asset: this.asset,
                    value: value,
                    value_usd,
                    address: this.address,
                    errors
                };
            }
        });
    }
}
exports.Card = Card;
function loadWallet(loadCards) {
    return __awaiter(this, void 0, void 0, function* () {
        let cards = [];
        if (loadCards) {
            for (let loadCard of loadCards) {
                cards.push(new Card(loadCard));
            }
        }
        else {
            if (process.env.stag_private_key) {
                cards.push(new Card({
                    asset: 'BSV',
                    privatekey: process.env.stag_private_key
                }));
            }
            else if (process.env.STAG_PRIVATE_KEY) {
                cards.push(new Card({
                    asset: 'BSV',
                    privatekey: process.env.STAG_PRIVATE_KEY
                }));
            }
            else if (process.env.BSV_PRIVATE_KEY) {
                cards.push(new Card({
                    asset: 'BSV',
                    privatekey: process.env.BSV_PRIVATE_KEY
                }));
            }
        }
        return new Wallet({ cards });
    });
}
exports.loadWallet = loadWallet;
