#!/usr/bin/env ts-node
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
const commander_1 = require("commander");
const wallet_1 = require("../wallet");
const payment_protocol_1 = require("/Users/zyler/github/anypay/payment-protocol");
commander_1.program
    .command('balances')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let wallet = yield (0, wallet_1.loadWallet)();
        let balances = yield wallet.balances();
        console.log({ balances });
    }
    catch (error) {
        console.error(error);
    }
}));
commander_1.program
    .command('balance <asset>')
    .action((asset) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let wallets = yield (0, wallet_1.loadWallet)();
        let wallet = wallets.asset(asset);
        let balance = yield wallet.balance();
        console.log({ balance });
    }
    catch (error) {
        console.error(error);
    }
}));
commander_1.program
    .command('payuri <uri> <asset>')
    .action((invoice_uid, asset) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let wallet = yield (0, wallet_1.loadWallet)();
        let payment = yield wallet.payUri(invoice_uid, asset, { transmit: true });
        console.log({ payment });
    }
    catch (error) {
        console.error(error);
    }
}));
commander_1.program
    .command('pay <invoice_uid> <asset>')
    .action((invoice_uid, asset) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let wallet = yield (0, wallet_1.loadWallet)();
        let payment = yield wallet.payInvoice(invoice_uid, asset);
        console.log({ payment });
    }
    catch (error) {
        console.error(error);
    }
}));
commander_1.program
    .command('buildpayment <invoice_uid> <asset>')
    .action((invoice_uid, asset) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let wallet = yield (0, wallet_1.loadWallet)();
        let payment = yield wallet.payInvoice(invoice_uid, asset, { transmit: false });
        console.log({ payment });
    }
    catch (error) {
        console.error(error);
    }
}));
commander_1.program
    .command('receive <value> <currency>')
    .action((value, currency) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let wallet = yield (0, wallet_1.loadWallet)();
        /*let invoice = await wallet.receive({
          currency, value
        })
  
        console.log({ invoice })
        */
    }
    catch (error) {
        console.error(error);
    }
}));
commander_1.program
    .command('paymentrequest <uri> <currency>')
    .action((uri, currency) => __awaiter(void 0, void 0, void 0, function* () {
    let client = new payment_protocol_1.Client(uri);
    try {
        let { paymentOptions } = yield client.getPaymentOptions();
        let paymentRequest = yield client.selectPaymentOption({
            chain: currency,
            currency: currency
        });
        console.log(JSON.stringify(paymentRequest));
    }
    catch (error) {
        console.error(error);
    }
}));
commander_1.program.parse(process.argv);
