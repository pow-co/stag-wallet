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
exports.findOrCreate = exports.findAll = exports.findOne = exports.post = void 0;
const bsv = require("bsv");
const actor_1 = require("./actor");
const uuid_1 = require("uuid");
const powco_1 = require("powco");
const txo_1 = require("txo");
const wallet_1 = require("./wallet");
const log_1 = require("./log");
const axios = require('axios');
var wallet;
// use default wallet
function post(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return onchain().post(params);
    });
}
exports.post = post;
function findOne(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return onchain().findOne(params);
    });
}
exports.findOne = findOne;
function findAll(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return onchain().findAll(params);
    });
}
exports.findAll = findAll;
function findOrCreate(params) {
    return __awaiter(this, void 0, void 0, function* () {
        return onchain().findOrCreate(params);
    });
}
exports.findOrCreate = findOrCreate;
const onchain = (wallet) => {
    function findOne(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (params.app) {
                where['app'] = params.app;
            }
            if (params.author) {
                where['author'] = params.author;
            }
            if (params.type) {
                where['type'] = params.type;
            }
            if (params.content) {
                Object.keys(params.content).forEach(key => {
                    where[key] = params.content[key];
                });
                delete params.content;
            }
            const query = new URLSearchParams(where).toString();
            const url = `https://onchain.sv/api/v1/events?${query}`;
            log_1.log.debug('onchain.sv.events.get', { url });
            const { data } = yield axios.get(url);
            log_1.log.debug('onchain.sv.events.get.result', { url, data });
            const [event] = data.events;
            if (!event) {
                return;
            }
            return event;
        });
    }
    function findAll(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (params.app) {
                where['app'] = params.app;
            }
            if (params.author) {
                where['author'] = params.author;
            }
            if (params.type) {
                where['type'] = params.type;
            }
            if (params.content) {
                Object.keys(params.content).forEach(key => {
                    where[key] = params.content[key];
                });
                delete params.content;
            }
            const query = new URLSearchParams(where).toString();
            const url = `https://onchain.sv/api/v1/events?${query}`;
            log_1.log.debug('onchain.sv.events.get', { url });
            const { data } = yield axios.get(url);
            log_1.log.debug('onchain.sv.events.get.result', { url, data });
            return data.events;
        });
    }
    function post(params) {
        return __awaiter(this, void 0, void 0, function* () {
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
            axios.get(`https://onchain.sv/api/v1/events/${txid}`)
                .then((result) => {
                log_1.log.debug('onchain.sv.import.success', result.data);
            })
                .catch((error) => {
                log_1.log.error('onchain.sv.import.error', error);
            });
            return {
                txid,
                txhex,
                txo,
                tx: new bsv.Transaction(txhex)
            };
        });
    }
    function findOrCreate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var isNew = true;
            var result = yield findOne(params.where);
            if (result) {
                isNew = false;
            }
            if (!result) {
                yield post(params.defaults);
            }
            result = yield findOne(params.where);
            if (!result) {
                throw new Error('Failed To Find Or Create');
            }
            return [result, isNew];
        });
    }
    return {
        findOne,
        findOrCreate,
        post,
        findAll
    };
};
exports.default = onchain;
