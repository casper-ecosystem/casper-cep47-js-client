import { config } from "dotenv";
config();

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  MASTER_KEY_PAIR_PATH,
  TOKEN_NAME,
  MINT_ONE_PAYMENT_AMOUNT
} = process.env;

import {
  Keys
} from "casper-js-sdk";

import { CEP47Client, utils } from "../../src";
import { sleep } from "../utils";

// This is parts of our demo app
import listen from "./event-listener";
import pendingDeploys from "./pending-deploys";

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
  // I'm checking state of pendingDeploys in a loop
  setInterval(() => {
    console.log(pendingDeploys.get());
  }, 15000);

  const cep47 = new CEP47Client(
    NODE_ADDRESS!,
    CHAIN_NAME!,
  );

  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  const contractHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${TOKEN_NAME!}_contract`
  );

  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await cep47.setContractHash(contractHash.slice(5));

  // Here I'm creating a listener, but as you can see I'm not doing anything special, just passing the contract hash and event stream address
  // So in fact this can be standalone process as long as I can sync somehow list of deploys
  const listener = listen(EVENT_STREAM_ADDRESS!, contractHash);

  // Here i'm minting in a loop
  const mintInLoop = async () => {
    for (let i = 0; i < 10; i ++) {
      const mintDeployHash = await cep47.mintOne(
        KEYS,
        KEYS.publicKey,
        null,
        new Map([["name", `${i}`]]),
        MINT_ONE_PAYMENT_AMOUNT!,
        900000
      );
      // On every mint, I'm adding mintDeployHash to pendingDeploys
      pendingDeploys.add(mintDeployHash);
      console.log(`... Mint_one ${i} deploy hash: `, mintDeployHash);
      await sleep(5 * 1000);
    }
  }

  mintInLoop();
};

test();
