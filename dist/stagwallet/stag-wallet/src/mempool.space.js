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
exports.getRecommendedFees = exports.FeeRates = void 0;
const axios_1 = require("axios");
var FeeRates;
(function (FeeRates) {
    FeeRates[FeeRates["fastestFee"] = 0] = "fastestFee";
    FeeRates[FeeRates["halfHourFee"] = 1] = "halfHourFee";
    FeeRates[FeeRates["hourFee"] = 2] = "hourFee";
    FeeRates[FeeRates["economyFee"] = 3] = "economyFee";
    FeeRates[FeeRates["minimumFee"] = 4] = "minimumFee";
})(FeeRates = exports.FeeRates || (exports.FeeRates = {}));
function getRecommendedFees() {
    return __awaiter(this, void 0, void 0, function* () {
        let { data } = yield axios_1.default.get('https://mempool.space/api/v1/fees/recommended');
        return data;
    });
}
exports.getRecommendedFees = getRecommendedFees;
