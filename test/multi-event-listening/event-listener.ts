import {
  EventName,
  EventStream,
} from "casper-js-sdk";

import { CEP47Events } from "../../src/constants";
import { parseEvent } from "../../src/utils";
import pendingDeploys from "./pending-deploys";

// This is an example function that utilizes casper-js-sdk `EventStream` and casper-cep47-js-client `parseEvent` function.
const listener = (eventStreamAddress: string, contractPackageHash: string) => {

  const es = new EventStream(eventStreamAddress);

  es.subscribe(EventName.DeployProcessed, (value: any) => {
      // Taking out deploy hash from an event
      const deployHash = value.body.DeployProcessed.deploy_hash;

      // Checking if the event is related to any of the previously sent deploys
      // Here I'm first time using pendingDeploys imported from other file. It's basically mocked
      // storage containing deploy hashes which is shared between event-listener.ts and index.ts.
      // Note that there is no reference passed.
      const pendingDeploy = pendingDeploys.find(deployHash);

      // If this event isn't related to sent deploys - return.
      if (!pendingDeploy) {
        return;
      }

      // Check if the event succeeded / errored and store returned data in a variable. 
      // The eventNames here is set for only one of event type - mint_one
      const parsedEvent = parseEvent({ contractPackageHash, eventNames: [CEP47Events.MintOne] }, value);

      // If the event contains error - proceed accordingly
      // For example you can update the object in db with success flag set to true.
      console.log(`... Deploy hash: ${deployHash}`);
      if (parsedEvent.error !== null) {
        console.log(`... Deploy errored`);
        console.log(`... Error message: ${parsedEvent.error}`);
      // If there is no error - the parsedEvent will contain data
      // For example you can update the object in db with success flag set to false and error message.
      } else {
        console.log(`... Deploy successful`);
        parsedEvent.data.forEach((d: any) => {
          console.log(`... ... Event name: ${d.name}`);
          console.log(`... ... Event data: ${d.clValue}`);
        });
      }

      // Remove parsed deploy from pending queue (both if it errored or succeeded) - the result was handled in a previous step.
      pendingDeploys.remove(deployHash);
  });

  es.start();
};

export default listener;
