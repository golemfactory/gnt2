import { promisify } from 'util';
import Ganache from 'ganache';
import { defaultAccounts, getWallets } from 'ethereum-waffle';
import { providers } from 'ethers';

function printWallets(wallets) {
  console.log('  Wallets:');
  for (const wallet of wallets) {
    console.log(`    ${wallet.address} - ${wallet.privateKey}`);
  }
  console.log('');
}

async function startGanache(port) {
  for (var el of defaultAccounts) {
    el.balance = "0x" + BigInt(el.balance).toString(16);
  }

  console.log(JSON.stringify(defaultAccounts));
  const options = { accounts: defaultAccounts, hardfork: 'constantinople' };
  const server = Ganache.server(options);
  const listenPromise = promisify(server.listen);
  await listenPromise(port);

  const jsonRpcUrl = `http://localhost:${port}`;

  const provider = new providers.JsonRpcProvider(jsonRpcUrl);
  const wallets = await getWallets(provider);
  printWallets(wallets);

  console.log(`  Node url (ganache): ${jsonRpcUrl}...`);
  return provider;
}

export { startGanache };
