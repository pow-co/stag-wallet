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
const rpc_1 = require("../rpc");
commander_1.program
    .command('listunspent <chain> <address>')
    .action((chain, address) => __awaiter(void 0, void 0, void 0, function* () {
    let { listUnspent } = (0, rpc_1.getRPC)(chain);
    let utxos = yield listUnspent(address);
    console.log(utxos);
}));
commander_1.program.parse(process.argv);
