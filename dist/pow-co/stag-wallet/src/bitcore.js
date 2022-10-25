"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSatoshis = exports.getBitcore = void 0;
const bignumber_js_1 = require("bignumber.js");
const path_1 = require("path");
const assetsTs = require('require-all')({
    dirname: (0, path_1.join)(__dirname, 'assets'),
    filter: /\index.ts/,
    recursive: true
});
const assetsJs = require('require-all')({
    dirname: (0, path_1.join)(__dirname, 'assets'),
    filter: /\index.js/,
    recursive: true
});
function getBitcore(asset) {
    const tsAsset = assetsTs[asset.toLowerCase()];
    const jsAsset = assetsJs[asset.toLowerCase()];
    const bitcore = tsAsset ? (tsAsset['index.ts'].bitcore) : (jsAsset['index.js'].bitcore);
    if (!bitcore) {
        throw new Error(`bitcore not available for ${asset}`);
    }
    return bitcore;
}
exports.getBitcore = getBitcore;
function toSatoshis(amount) {
    let amt = new bignumber_js_1.BigNumber(amount);
    let scalar = new bignumber_js_1.BigNumber(100000000);
    return amt.times(amount).toNumber();
}
exports.toSatoshis = toSatoshis;
