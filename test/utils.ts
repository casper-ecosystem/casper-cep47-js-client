import { CasperClient } from "casper-js-sdk";

export const parseTokenMeta = (str: string): Array<[string, string]> => str.split(",").map(s => {
  const map = s.split(" ");
  return [map[0], map[1]]
});

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getDeploy = async (NODE_URL: string, deployHash: string) => {
  const client = new CasperClient(NODE_URL);
  let i = 300;
  while (i != 0) {
      const [deploy, raw] = await client.getDeploy(deployHash);
      if (raw.execution_results.length !== 0){
          // @ts-ignore
          if (raw.execution_results[0].result.Success) {
              return deploy;
          } else {
              // @ts-ignore
              throw Error("Contract execution: " + raw.execution_results[0].result.Failure.error_message);
          }
      } else {
          i--;
          await sleep(1000);
          continue;
      }
  }
  throw Error('Timeout after ' + i + 's. Something\'s wrong');
}
