"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var casper_js_sdk_1 = require("casper-js-sdk");
var utils = __importStar(require("./utils"));
var CEP47Client = /** @class */ (function () {
    function CEP47Client(nodeAddress, chainName) {
        this.nodeAddress = nodeAddress;
        this.chainName = chainName;
    }
    CEP47Client.prototype.install = function (keys, tokenName, tokenSymbol, tokenMeta, paymentAmount, wasmPath) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token_name: casper_js_sdk_1.CLValueBuilder.string(tokenName),
                            token_symbol: casper_js_sdk_1.CLValueBuilder.string(tokenSymbol),
                            token_meta: toCLMap(tokenMeta),
                        });
                        return [4 /*yield*/, installWasmFile({
                                chainName: this.chainName,
                                paymentAmount: paymentAmount,
                                nodeAddress: this.nodeAddress,
                                keys: keys,
                                pathToContract: wasmPath,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Problem with installation");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.setContractHash = function (hash) {
        this.contractHash = hash;
    };
    CEP47Client.prototype.name = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, ["name"])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value()];
                }
            });
        });
    };
    CEP47Client.prototype.symbol = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, ["symbol"])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value()];
                }
            });
        });
    };
    CEP47Client.prototype.meta = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, ["meta"])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value()];
                }
            });
        });
    };
    CEP47Client.prototype.balanceOf = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var key, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "balances_" + Buffer.from(account.toAccountHash()).toString("hex");
                        return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, [key])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, fromCLMap(result.value())];
                }
            });
        });
    };
    CEP47Client.prototype.getOwnerOf = function (tokenId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "owners_" + tokenId;
                        return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, [key])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.toHex()];
                }
            });
        });
    };
    CEP47Client.prototype.totalSupply = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, ["total_supply"])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value().toString()];
                }
            });
        });
    };
    CEP47Client.prototype.getTokenMeta = function (tokenId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "metas_" + tokenId;
                        return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, [key])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, fromCLMap(result.value())];
                }
            });
        });
    };
    CEP47Client.prototype.pause = function (keys, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({});
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "pause",
                                paymentAmount: paymentAmount,
                                nodeAddress: this.nodeAddress,
                                keys: keys,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.unpause = function (keys, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({});
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "unpause",
                                paymentAmount: paymentAmount,
                                nodeAddress: this.nodeAddress,
                                keys: keys,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Error: state query failed: ValueNotFound
    CEP47Client.prototype.isPaused = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, ["is_paused"])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value()];
                }
            });
        });
    };
    CEP47Client.prototype.getTokensOf = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var key, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "tokens_" + Buffer.from(account.toAccountHash()).toString("hex");
                        return [4 /*yield*/, contractSimpleGetter(this.nodeAddress, this.contractHash, [key])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value()];
                }
            });
        });
    };
    CEP47Client.prototype.mintOne = function (keys, recipient, meta, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            recipient: recipient,
                            token_meta: toCLMap(meta),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "mint_one",
                                paymentAmount: paymentAmount,
                                nodeAddress: this.nodeAddress,
                                keys: keys,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.mintCopies = function (keys, recipient, meta, count, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            recipient: recipient,
                            token_meta: toCLMap(meta),
                            count: casper_js_sdk_1.CLValueBuilder.u256(count),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "mint_copies",
                                paymentAmount: paymentAmount,
                                nodeAddress: this.nodeAddress,
                                keys: keys,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.mintMany = function (keys, recipient, meta, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var clMetas, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clMetas = meta.map(toCLMap);
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            recipient: recipient,
                            token_metas: casper_js_sdk_1.CLValueBuilder.list(clMetas),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "mint_many",
                                paymentAmount: paymentAmount,
                                nodeAddress: this.nodeAddress,
                                keys: keys,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.burnOne = function (keys, owner, tokenId, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            owner: owner,
                            token_id: casper_js_sdk_1.CLValueBuilder.string(tokenId),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "burn_one",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.burnMany = function (keys, owner, tokenIds, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var clTokenIds, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clTokenIds = tokenIds.map(casper_js_sdk_1.CLValueBuilder.string);
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            owner: owner,
                            token_ids: casper_js_sdk_1.CLValueBuilder.list(clTokenIds),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "burn_many",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.transferToken = function (keys, sender, recipient, tokenId, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            recipient: recipient,
                            sender: sender,
                            token_id: casper_js_sdk_1.CLValueBuilder.string(tokenId),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "transfer_token",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.transferManyTokens = function (keys, sender, recipient, tokenIds, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var clTokenIds, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clTokenIds = tokenIds.map(casper_js_sdk_1.CLValueBuilder.string);
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            recipient: recipient,
                            sender: sender,
                            token_ids: casper_js_sdk_1.CLValueBuilder.list(clTokenIds),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "transfer_many_tokens",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CEP47Client.prototype.transferAllTokens = function (keys, sender, recipient, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            recipient: recipient,
                            sender: sender,
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "transfer_all_tokens",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return CEP47Client;
}());
var installWasmFile = function (_a) {
    var nodeAddress = _a.nodeAddress, keys = _a.keys, chainName = _a.chainName, pathToContract = _a.pathToContract, runtimeArgs = _a.runtimeArgs, paymentAmount = _a.paymentAmount;
    return __awaiter(void 0, void 0, void 0, function () {
        var client, deploy;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    client = new casper_js_sdk_1.CasperClient(nodeAddress);
                    deploy = casper_js_sdk_1.DeployUtil.makeDeploy(new casper_js_sdk_1.DeployUtil.DeployParams(keys.publicKey, chainName), casper_js_sdk_1.DeployUtil.ExecutableDeployItem.newModuleBytes(utils.getBinary(pathToContract), runtimeArgs), casper_js_sdk_1.DeployUtil.standardPayment(paymentAmount));
                    // Sign deploy.
                    deploy = client.signDeploy(deploy, keys);
                    return [4 /*yield*/, client.putDeploy(deploy)];
                case 1: 
                // Dispatch deploy to node.
                return [2 /*return*/, _b.sent()];
            }
        });
    });
};
var contractCall = function (_a) {
    var nodeAddress = _a.nodeAddress, keys = _a.keys, chainName = _a.chainName, contractHash = _a.contractHash, entryPoint = _a.entryPoint, runtimeArgs = _a.runtimeArgs, paymentAmount = _a.paymentAmount;
    return __awaiter(void 0, void 0, void 0, function () {
        var client, contractHashAsByteArray, deploy, deployHash;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    client = new casper_js_sdk_1.CasperClient(nodeAddress);
                    contractHashAsByteArray = utils.contractHashToByteArray(contractHash);
                    deploy = casper_js_sdk_1.DeployUtil.makeDeploy(new casper_js_sdk_1.DeployUtil.DeployParams(keys.publicKey, chainName), casper_js_sdk_1.DeployUtil.ExecutableDeployItem.newStoredContractByHash(contractHashAsByteArray, entryPoint, runtimeArgs), casper_js_sdk_1.DeployUtil.standardPayment(paymentAmount));
                    // Sign deploy.
                    deploy = client.signDeploy(deploy, keys);
                    return [4 /*yield*/, client.putDeploy(deploy)];
                case 1:
                    deployHash = _b.sent();
                    return [2 /*return*/, deployHash];
            }
        });
    });
};
var contractSimpleGetter = function (nodeAddress, contractHash, key) { return __awaiter(void 0, void 0, void 0, function () {
    var stateRootHash, clValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, utils.getStateRootHash(nodeAddress)];
            case 1:
                stateRootHash = _a.sent();
                return [4 /*yield*/, utils.getContractData(nodeAddress, stateRootHash, contractHash, key)];
            case 2:
                clValue = _a.sent();
                if (clValue && clValue.CLValue instanceof casper_js_sdk_1.CLValue) {
                    return [2 /*return*/, clValue.CLValue];
                }
                else {
                    throw Error("Invalid stored value");
                }
                return [2 /*return*/];
        }
    });
}); };
var toCLMap = function (map) {
    var clMap = casper_js_sdk_1.CLValueBuilder.map([
        casper_js_sdk_1.CLTypeBuilder.string(),
        casper_js_sdk_1.CLTypeBuilder.string(),
    ]);
    for (var _i = 0, _a = Array.from(map.entries()); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        clMap.set(casper_js_sdk_1.CLValueBuilder.string(key), casper_js_sdk_1.CLValueBuilder.string(value));
    }
    return clMap;
};
var fromCLMap = function (map) {
    var jsMap = new Map();
    for (var _i = 0, _a = Array.from(map.entries()); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        jsMap.set(key.value(), value.value());
    }
    return jsMap;
};
exports.default = CEP47Client;
//# sourceMappingURL=cep47-client.js.map