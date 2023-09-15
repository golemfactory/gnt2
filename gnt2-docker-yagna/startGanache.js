import { promisify } from "util";
import Ganache from "ganache";
import { defaultAccounts } from "ethereum-waffle";
import { providers } from "ethers";
import { MockProvider } from "ethereum-waffle";

function printWallets(wallets) {
  for (const wallet of wallets) {
    console.log(`    ${wallet.address} - ${wallet.privateKey}`);
  }
  console.log("");
}

async function startGanache(port) {
  const options = {
    accounts: defaultAccounts,
    hardfork: "london",
    chainId: 4
  };
  const server = Ganache.server(options);

  server.listen(port);

  const jsonRpcUrl = `http://localhost:${port}`;

  const provider = new providers.JsonRpcProvider(jsonRpcUrl);
  const wallets = new MockProvider().getWallets();
  printWallets(wallets);

  return provider;
}

export { startGanache };
