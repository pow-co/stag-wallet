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
exports.TestClient = void 0;
class TestClient {
    constructor(supertest, url, options = {}) {
        this.supertest = supertest;
        this.url = url;
        this.headers = options.headers || {};
    }
    getPaymentOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            let { result } = yield this.supertest.inject({
                method: 'GET',
                url: this.url,
                headers: Object.assign(this.headers, {
                    'x-paypro-version': 2,
                    'accept': 'application/payment-options'
                })
            });
            return result;
        });
    }
    selectPaymentOption(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let { result } = yield this.supertest.inject({
                method: "POST",
                url: this.url,
                payload: params,
                headers: Object.assign(this.headers, {
                    'x-paypro-version': 2,
                    'content-type': 'application/payment-request'
                })
            });
            return result;
        });
    }
    verifyPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let { result } = yield this.supertest.inject({
                method: 'POST',
                url: this.url,
                payload: params,
                headers: Object.assign(this.headers, {
                    'x-paypro-version': 2,
                    'content-type': 'application/payment-verification'
                })
            });
            return result;
        });
    }
    sendPayment(wallet, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let transaction = yield wallet.buildPayment(params.instructions[0].outputs, params.chain);
            const payment = {
                chain: params.chain,
                currency: params.chain,
                transactions: [{ tx: transaction }]
            };
            let { result } = yield this.supertest({
                method: "POST",
                url: this.url,
                payload: payment,
                headers: Object.assign(this.headers, {
                    'x-paypro-version': 2,
                    'content-type': 'application/payment'
                })
            });
            return result;
        });
    }
}
exports.TestClient = TestClient;
