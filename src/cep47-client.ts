import {
  CasperClient,
  DeployUtil,
  Keys,
  RuntimeArgs,
  CLValueBuilder,
  CLValue,
  CLPublicKey,
  CLString,
  CLTypeBuilder,
} from "casper-js-sdk";
import * as utils from "./utils";

class CEP47Client {
  private contractHash: string;

  constructor(private nodeAddress: string, private chainName: string) {}

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

  public setContractHash(hash: string) {
    this.contractHash = hash;
  }

  public async name(account: CLPublicKey) {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["name"]
    );
    return result.value();
  }

  public async symbol(account: CLPublicKey) {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["symbol"]
    );
    return result.value();
  }

  public async meta(account: CLPublicKey) {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["meta"]
    );
    return result.value();
  }

  public async balanceOf(account: CLPublicKey) {
    const key = `balances_${Buffer.from(account.toAccountHash()).toString(
      "hex"
    )}`;
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      [key]
    );
    return fromCLMap(result.value());
  }

  public async getOwnerOf(tokenId: string) {
    const key = `owners_${tokenId}`;
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      [key]
    );
    return (result as CLPublicKey).toHex();
  }

  public async totalSupply() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["total_supply"]
    );
    return result.value().toString();
  }

  public async getTokenMeta(tokenId: string) {
    const key = `metas_${tokenId}`;
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      [key]
    );
    return fromCLMap(result.value());
  }

  public async pause(keys: Keys.AsymmetricKey, paymentAmount: string) {
    const runtimeArgs = RuntimeArgs.fromMap({});

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "pause",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async unpause(keys: Keys.AsymmetricKey, paymentAmount: string) {
    const runtimeArgs = RuntimeArgs.fromMap({});

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "unpause",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  // Error: state query failed: ValueNotFound
  public async isPaused() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["is_paused"]
    );
    return result.value();
  }

  public async getTokensOf(account: CLPublicKey) {
    const key = `tokens_${Buffer.from(account.toAccountHash()).toString(
      "hex"
    )}`;
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      [key]
    );
    return result.value();
  }

  public async mintOne(
    keys: Keys.AsymmetricKey,
    recipient: CLPublicKey,
    meta: Map<string, string>,
    paymentAmount: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: recipient,
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
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async mintCopies(
    keys: Keys.AsymmetricKey,
    recipient: CLPublicKey,
    meta: Map<string, string>,
    count: number,
    paymentAmount: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: recipient,
      token_meta: toCLMap(meta),
      count: CLValueBuilder.u256(count),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "mint_copies",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async mintMany(
    keys: Keys.AsymmetricKey,
    recipient: CLPublicKey,
    meta: Array<Map<string, string>>,
    paymentAmount: string
  ) {
    const clMetas = meta.map(toCLMap);
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: recipient,
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
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async burnOne(
    keys: Keys.AsymmetricKey,
    owner: CLPublicKey,
    tokenId: string,
    paymentAmount: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      owner,
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
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async burnMany(
    keys: Keys.AsymmetricKey,
    owner: CLPublicKey,
    tokenIds: string[],
    paymentAmount: string
  ) {
    const clTokenIds = tokenIds.map(CLValueBuilder.string);
    const runtimeArgs = RuntimeArgs.fromMap({
      owner,
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
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async transferToken(
    keys: Keys.AsymmetricKey,
    sender: CLPublicKey,
    recipient: CLPublicKey,
    tokenId: string,
    paymentAmount: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient,
      sender,
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
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async transferManyTokens(
    keys: Keys.AsymmetricKey,
    sender: CLPublicKey,
    recipient: CLPublicKey,
    tokenIds: string[],
    paymentAmount: string
  ) {
    const clTokenIds = tokenIds.map(CLValueBuilder.string);
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient,
      sender,
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
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async transferAllTokens(
    keys: Keys.AsymmetricKey,
    sender: CLPublicKey,
    recipient: CLPublicKey,
    paymentAmount: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient,
      sender,
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "transfer_all_tokens",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
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
    new DeployUtil.DeployParams(keys.publicKey, chainName),
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
}

const contractCall = async ({
  nodeAddress,
  keys,
  chainName,
  contractHash,
  entryPoint,
  runtimeArgs,
  paymentAmount,
}: IContractCallParams) => {
  const client = new CasperClient(nodeAddress);
  const contractHashAsByteArray = utils.contractHashToByteArray(contractHash);

  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(keys.publicKey, chainName),
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
