import {
  CasperClient,
  CLPublicKey,
  CLAccountHash,
  CLByteArray,
  CLKey,
  CLString,
  CLTypeBuilder,
  CLValue,
  CLValueBuilder,
  CLValueParsers,
  CLMap,
  DeployUtil,
  EventName,
  EventStream,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";
import { Some, None } from "ts-results";
import { CEP47Events, DEFAULT_TTL } from "./constants";
import * as utils from "./utils";
import { RecipientType, IPendingDeploy } from "./types";

import { concat } from '@ethersproject/bytes';
import blake from "blakejs";

class CEP47Client {
  private contractHash: string;
  private contractPackageHash: string;
  private namedKeys: {
    balances: string;
    metadata: string;
    // ownedTokens: string;
    ownedTokensByIndex: string;
    owners: string;
    issuers: string;
    paused: string;
  };
  private isListening = false;
  private pendingDeploys: IPendingDeploy[] = [];

  constructor(
    private nodeAddress: string,
    private chainName: string,
    private eventStreamAddress?: string
  ) {}

  public async install(
    keys: Keys.AsymmetricKey,
    tokenName: string,
    tokenSymbol: string,
    tokenMeta: Map<string, string>,
    paymentAmount: string,
    wasmPath: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      token_name: CLValueBuilder.string(tokenName),
      token_symbol: CLValueBuilder.string(tokenSymbol),
      token_meta: toCLMap(tokenMeta),
    });

    const deployHash = await installWasmFile({
      chainName: this.chainName,
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys,
      pathToContract: wasmPath,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Problem with installation");
    }
  }

  public async setContractHash(hash: string) {
    const stateRootHash = await utils.getStateRootHash(this.nodeAddress);
    const contractData = await utils.getContractData(
      this.nodeAddress,
      stateRootHash,
      hash
    );

    const { contractPackageHash, namedKeys } = contractData.Contract!;
    this.contractHash = hash;
    this.contractPackageHash = contractPackageHash.replace(
      "contract-package-wasm",
      ""
    );
    const LIST_OF_NAMED_KEYS = [
      "balances",
      "metadata",
      // "owned_tokens",
      "owned_tokens_by_index",
      "owners",
      "issuers",
      "paused",
    ];
    // @ts-ignore
    this.namedKeys = namedKeys.reduce((acc, val) => {
      if (LIST_OF_NAMED_KEYS.includes(val.name)) {
        return { ...acc, [utils.camelCased(val.name)]: val.key };
      }
      return acc;
    }, {});
  }

  public async name() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["name"]
    );
    return result.value();
  }

  public async symbol() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["symbol"]
    );
    return result.value();
  }

  public async meta() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["meta"]
    );
    const res: Array<[CLValue, CLValue]> = result.value();

    const jsMap = new Map();

    for (const [innerKey, value] of res) {
      jsMap.set(innerKey.value(), value.value());
    }
    return jsMap;
  }

  public async balanceOf(account: CLPublicKey) {
    const accountHash = Buffer.from(account.toAccountHash()).toString("hex");
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      accountHash,
      this.namedKeys.balances
    );
    const maybeValue = result.value().unwrap();
    return maybeValue.value().toString();
  }

  public async getOwnerOf(tokenId: string) {
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      tokenId,
      this.namedKeys.owners
    );
    const maybeValue = result.value().unwrap();
    return `account-hash-${Buffer.from(maybeValue.value().value()).toString(
      "hex"
    )}`;
  }

  public async getIssuerOf(tokenId: string) {
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      tokenId,
      this.namedKeys.issuers
    );
    const maybeValue = result.value().unwrap();
    return `account-hash-${Buffer.from(maybeValue.value().value()).toString(
      "hex"
    )}`;
  }

  public async totalSupply() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["total_supply"]
    );
    return result.value();
  }

  public async getTokenMeta(tokenId: string) {
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      tokenId,
      this.namedKeys.metadata
    );
    const maybeValue = result.value().unwrap();
    const map: Array<[CLValue, CLValue]> = maybeValue.value();

    const jsMap = new Map();

    for (const [innerKey, value] of map) {
      jsMap.set(innerKey.value(), value.value());
    }

    return jsMap;
  }

  public async pause(keys: Keys.AsymmetricKey, paymentAmount: string, ttl = DEFAULT_TTL) {
    const runtimeArgs = RuntimeArgs.fromMap({});

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "pause",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async unpause(keys: Keys.AsymmetricKey, paymentAmount: string, ttl = DEFAULT_TTL) {
    const runtimeArgs = RuntimeArgs.fromMap({});

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "unpause",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  // TODO: Error: state query failed: ValueNotFound
  public async isPaused() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["is_paused"]
    );
    return result.value();
  }

  public async getTokensOf(account: CLPublicKey) {
    const accountKey = utils.createRecipientAddress(account);
    const accountBytes = CLValueParsers.toBytes(accountKey).unwrap();
    const balanceOri = await this.balanceOf(account);
    const balance = parseInt(balanceOri, 10);

    let tokenIds: string[] = [];

    for (let i = 0; i < balance; i++) {
      const numBytes = CLValueParsers.toBytes(CLValueBuilder.u256(i)).unwrap();
      const concated = concat([accountBytes, numBytes]);
      const blaked = blake.blake2b(concated, undefined, 32)
      const str = Buffer.from(blaked).toString("hex"); 
      const result = await utils.contractDictionaryGetter(
        this.nodeAddress,
        str,
        this.namedKeys.ownedTokensByIndex
      );
      const maybeValue = result.value().unwrap();
      tokenIds = [...tokenIds, maybeValue.value()];
    }

    return tokenIds;
  }

  public async mintOne(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    id: string | null,
    meta: Map<string, string>,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const tokenId = id
      ? CLValueBuilder.option(Some(CLValueBuilder.string(id)))
      : CLValueBuilder.option(None, CLTypeBuilder.string());

    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: utils.createRecipientAddress(recipient),
      token_id: tokenId,
      token_meta: toCLMap(meta),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "mint_one",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.MintOne, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async mintCopies(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    meta: Map<string, string>,
    ids: string[] | null,
    count: number,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const tokenIds = ids
      ? CLValueBuilder.option(
          Some(CLValueBuilder.list(ids.map((id) => CLValueBuilder.string(id))))
        )
      : CLValueBuilder.option(None, CLTypeBuilder.list(CLTypeBuilder.string()));

    const runtimeArgs = RuntimeArgs.fromMap({
      count: CLValueBuilder.u32(count),
      recipient: utils.createRecipientAddress(recipient),
      token_ids: tokenIds,
      token_meta: toCLMap(meta),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "mint_copies",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.MintOne, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async mintMany(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    meta: Array<Map<string, string>>,
    ids: string[] | null,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    if (ids && ids.length !== meta.length) {
      throw new Error(
        `Ids length (${ids.length}) not equal to meta length (${meta.length})!`
      );
    }

    const clMetas = meta.map(toCLMap);

    const tokenIds = ids
      ? CLValueBuilder.option(
          Some(CLValueBuilder.list(ids.map((id) => CLValueBuilder.string(id))))
        )
      : CLValueBuilder.option(None, CLTypeBuilder.list(CLTypeBuilder.string()));

    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: utils.createRecipientAddress(recipient),
      token_ids: tokenIds,
      token_metas: CLValueBuilder.list(clMetas),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "mint_many",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.MintOne, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async updateTokenMetadata(
    keys: Keys.AsymmetricKey,
    tokenId: string,
    meta: Map<string, string>,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      token_id: CLValueBuilder.string(tokenId),
      token_meta: toCLMap(meta),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "update_token_metadata",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.MetadataUpdate, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async burnOne(
    keys: Keys.AsymmetricKey,
    owner: RecipientType,
    tokenId: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      owner: utils.createRecipientAddress(owner),
      token_id: CLValueBuilder.string(tokenId),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "burn_one",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.BurnOne, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async burnMany(
    keys: Keys.AsymmetricKey,
    owner: RecipientType,
    tokenIds: string[],
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const clTokenIds = tokenIds.map(CLValueBuilder.string);
    const runtimeArgs = RuntimeArgs.fromMap({
      owner: utils.createRecipientAddress(owner),
      token_ids: CLValueBuilder.list(clTokenIds),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "burn_many",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.BurnOne, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async transferToken(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    tokenId: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: utils.createRecipientAddress(recipient),
      token_id: CLValueBuilder.string(tokenId),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "transfer_token",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.TransferToken, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async transferManyTokens(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    tokenIds: string[],
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const clTokenIds = tokenIds.map(CLValueBuilder.string);
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: utils.createRecipientAddress(recipient),
      token_ids: CLValueBuilder.list(clTokenIds),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "transfer_many_tokens",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.TransferToken, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async transferAllTokens(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: utils.createRecipientAddress(recipient),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "transfer_all_tokens",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
      ttl
    });

    if (deployHash !== null) {
      this.addPendingDeploy(CEP47Events.TransferToken, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public onEvent(
    eventNames: CEP47Events[],
    callback: (
      eventName: CEP47Events,
      deployStatus: {
        deployHash: string;
        success: boolean;
        error: string | null;
      },
      result: any | null
    ) => void
  ): any {
    if (!this.eventStreamAddress) {
      throw Error("Please set eventStreamAddress before!");
    }
    if (this.isListening) {
      throw Error(
        "Only one event listener can be create at a time. Remove the previous one and start new."
      );
    }
    const es = new EventStream(this.eventStreamAddress);
    this.isListening = true;

    es.subscribe(EventName.DeployProcessed, (value: any) => {
      const deployHash = value.body.DeployProcessed.deploy_hash;

      const pendingDeploy = this.pendingDeploys.find(
        (pending) => pending.deployHash === deployHash
      );

      if (!pendingDeploy) {
        return;
      }

      if (
        !value.body.DeployProcessed.execution_result.Success &&
        value.body.DeployProcessed.execution_result.Failure
      ) {
        callback(
          pendingDeploy.deployType,
          {
            deployHash,
            error:
              value.body.DeployProcessed.execution_result.Failure.error_message,
            success: false,
          },
          null
        );
      } else {
        const { transforms } =
          value.body.DeployProcessed.execution_result.Success.effect;

        const cep47Events = transforms.reduce((acc: any, val: any) => {
          if (
            val.transform.hasOwnProperty("WriteCLValue") &&
            typeof val.transform.WriteCLValue.parsed === "object" &&
            val.transform.WriteCLValue.parsed !== null
          ) {
            const maybeCLValue = CLValueParsers.fromJSON(
              val.transform.WriteCLValue
            );
            const clValue = maybeCLValue.unwrap();
            if (clValue && clValue instanceof CLMap) {
              const hash = clValue.get(
                CLValueBuilder.string("contract_package_hash")
              );
              const event = clValue.get(CLValueBuilder.string("event_type"));
              if (
                hash &&
                hash.value() === this.contractPackageHash &&
                event &&
                eventNames.includes(event.value())
              ) {
                acc = [...acc, { name: event.value(), clValue }];
              }
            }
          }
          return acc;
        }, []);

        cep47Events.forEach((d: any) =>
          callback(
            d.name,
            { deployHash, error: null, success: true },
            d.clValue
          )
        );
      }

      this.pendingDeploys = this.pendingDeploys.filter(
        (pending) => pending.deployHash !== deployHash
      );
    });
    es.start();

    return {
      stopListening: () => {
        es.unsubscribe(EventName.DeployProcessed);
        es.stop();
        this.isListening = false;
        this.pendingDeploys = [];
      },
    };
  }

  private addPendingDeploy(deployType: CEP47Events, deployHash: string) {
    this.pendingDeploys = [...this.pendingDeploys, { deployHash, deployType }];
  }
}

interface IInstallParams {
  nodeAddress: string;
  keys: Keys.AsymmetricKey;
  chainName: string;
  pathToContract: string;
  runtimeArgs: RuntimeArgs;
  paymentAmount: string;
}

const installWasmFile = async ({
  nodeAddress,
  keys,
  chainName,
  pathToContract,
  runtimeArgs,
  paymentAmount,
}: IInstallParams): Promise<string> => {
  const client = new CasperClient(nodeAddress);

  // Set contract installation deploy (unsigned).
  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(
      CLPublicKey.fromHex(keys.publicKey.toHex()),
      chainName
    ),
    DeployUtil.ExecutableDeployItem.newModuleBytes(
      utils.getBinary(pathToContract),
      runtimeArgs
    ),
    DeployUtil.standardPayment(paymentAmount)
  );

  // Sign deploy.
  deploy = client.signDeploy(deploy, keys);

  // Dispatch deploy to node.
  return await client.putDeploy(deploy);
};

interface IContractCallParams {
  nodeAddress: string;
  keys: Keys.AsymmetricKey;
  chainName: string;
  entryPoint: string;
  runtimeArgs: RuntimeArgs;
  paymentAmount: string;
  contractHash: string;
  ttl: number;
}

const contractCall = async ({
  nodeAddress,
  keys,
  chainName,
  contractHash,
  entryPoint,
  runtimeArgs,
  paymentAmount,
  ttl
}: IContractCallParams) => {
  const client = new CasperClient(nodeAddress);
  const contractHashAsByteArray = utils.contractHashToByteArray(contractHash);

  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(keys.publicKey, chainName, 1, ttl),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHashAsByteArray,
      entryPoint,
      runtimeArgs
    ),
    DeployUtil.standardPayment(paymentAmount)
  );

  // Sign deploy.
  deploy = client.signDeploy(deploy, keys);

  // Dispatch deploy to node.
  const deployHash = await client.putDeploy(deploy);

  return deployHash;
};

const contractSimpleGetter = async (
  nodeAddress: string,
  contractHash: string,
  key: string[]
) => {
  const stateRootHash = await utils.getStateRootHash(nodeAddress);
  const clValue = await utils.getContractData(
    nodeAddress,
    stateRootHash,
    contractHash,
    key
  );

  if (clValue && clValue.CLValue instanceof CLValue) {
    return clValue.CLValue!;
  } else {
    throw Error("Invalid stored value");
  }
};

const toCLMap = (map: Map<string, string>) => {
  const clMap = CLValueBuilder.map([
    CLTypeBuilder.string(),
    CLTypeBuilder.string(),
  ]);
  for (const [key, value] of Array.from(map.entries())) {
    clMap.set(CLValueBuilder.string(key), CLValueBuilder.string(value));
  }
  return clMap;
};

const fromCLMap = (map: Map<CLString, CLString>) => {
  const jsMap = new Map();
  for (const [key, value] of Array.from(map.entries())) {
    jsMap.set(key.value(), value.value());
  }
  return jsMap;
};

export default CEP47Client;
