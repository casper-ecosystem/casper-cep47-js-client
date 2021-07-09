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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.contractHashToByteArray = exports.getContractData = exports.getAccountNamedKeyValue = exports.getAccountInfo = exports.getStateRootHash = exports.getBinary = exports.getKeyPairOfContract = void 0;
var casper_js_sdk_1 = require("casper-js-sdk");
var fs_1 = __importDefault(require("fs"));
/**
 * Returns an ECC key pair mapped to an NCTL faucet account.
 * @param pathToFaucet - Path to NCTL faucet directory.
 */
exports.getKeyPairOfContract = function (pathToFaucet) {
    return casper_js_sdk_1.Keys.Ed25519.parseKeyFiles(pathToFaucet + "/public_key.pem", pathToFaucet + "/secret_key.pem");
};
/**
 * Returns a binary as u8 array.
 * @param pathToBinary - Path to binary file to be loaded into memory.
 * @return Uint8Array Byte array.
 */
exports.getBinary = function (pathToBinary) {
    return new Uint8Array(fs_1.default.readFileSync(pathToBinary, null).buffer);
};
/**
 * Returns global state root hash at current block.
 * @param {Object} client - JS SDK client for interacting with a node.
 * @return {String} Root hash of global state at most recent block.
 */
exports.getStateRootHash = function (nodeAddress) { return __awaiter(void 0, void 0, void 0, function () {
    var client, block;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = new casper_js_sdk_1.CasperServiceByJsonRPC(nodeAddress);
                return [4 /*yield*/, client.getLatestBlockInfo()];
            case 1:
                block = (_a.sent()).block;
                if (block) {
                    return [2 /*return*/, block.header.state_root_hash];
                }
                else {
                    throw Error("Problem when calling getLatestBlockInfo");
                }
                return [2 /*return*/];
        }
    });
}); };
exports.getAccountInfo = function (nodeAddress, publicKey) { return __awaiter(void 0, void 0, void 0, function () {
    var stateRootHash, client, accountHash, blockState;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getStateRootHash(nodeAddress)];
            case 1:
                stateRootHash = _a.sent();
                client = new casper_js_sdk_1.CasperServiceByJsonRPC(nodeAddress);
                accountHash = publicKey.toAccountHashStr();
                return [4 /*yield*/, client.getBlockState(stateRootHash, accountHash, [])];
            case 2:
                blockState = _a.sent();
                return [2 /*return*/, blockState.Account];
        }
    });
}); };
/**
 * Returns a value under an on-chain account's storage.
 * @param accountInfo - On-chain account's info.
 * @param namedKey - A named key associated with an on-chain account.
 */
exports.getAccountNamedKeyValue = function (accountInfo, namedKey) {
    var found = accountInfo.namedKeys.find(function (i) { return i.name === namedKey; });
    if (found) {
        return found.key;
    }
};
exports.getContractData = function (nodeAddress, stateRootHash, contractHash, path) {
    if (path === void 0) { path = []; }
    return __awaiter(void 0, void 0, void 0, function () {
        var client, blockState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new casper_js_sdk_1.CasperServiceByJsonRPC(nodeAddress);
                    return [4 /*yield*/, client.getBlockState(stateRootHash, "hash-" + contractHash, path)];
                case 1:
                    blockState = _a.sent();
                    return [2 /*return*/, blockState];
            }
        });
    });
};
exports.contractHashToByteArray = function (contractHash) {
    return Uint8Array.from(Buffer.from(contractHash, "hex"));
};
exports.sleep = function (num) {
    return new Promise(function (resolve) { return setTimeout(resolve, num); });
};
//# sourceMappingURL=utils.js.map