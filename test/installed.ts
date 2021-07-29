import { config } from "dotenv";
config();
import { CEP47Client, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLPublicKeyType,
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  WASM_PATH,
  KEY_PAIR_PATH,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  CONTRACT_HASH,
  INSTALL_PAYMENT_AMOUNT,
  MINT_ONE_PAYMENT_AMOUNT,
  MINT_COPIES_PAYMENT_AMOUNT,
  BURN_ONE_PAYMENT_AMOUNT,
  MINT_ONE_META_SIZE,
  MINT_COPIES_META_SIZE,
  MINT_COPIES_COUNT,
  MINT_MANY_META_SIZE,
  MINT_MANY_META_COUNT,
} = process.env;

const TOKEN_META = new Map(parseTokenMeta(process.env.TOKEN_META!));

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${KEY_PAIR_PATH}/public_key.pem`,
  `${KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
  const cep47 = new CEP47Client(
    NODE_ADDRESS!,
    CHAIN_NAME!,
    EVENT_STREAM_ADDRESS!
  );

  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await utils.getAccountNamedKeyValue(accountInfo, `${TOKEN_NAME!}_contract`);

  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  cep47.setContractHash(contractHash.slice(5));

};

test();

