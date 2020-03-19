import createEnv from './createEnv';
import spawnProcess from './spawnProcess';
import {startGanache} from './startGanache';
import {getWallets} from 'ethereum-waffle';
import {deployDevGolemContracts} from '../../gnt2-contracts';
import {JsonRpcProvider} from 'ethers/providers';

const PORT = 8545;

async function start() {
  const provider: JsonRpcProvider = await startGanache(PORT);
  const [deployWallet, holderWallet, gntOnlyWallet] = getWallets(provider);
  const golemContractsDevDeployment = await deployDevGolemContracts(provider, deployWallet, holderWallet, gntOnlyWallet);
  const env = createEnv(golemContractsDevDeployment);
  runWebServer(env);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runWebServer(vars: any) {
  const env = {...process.env, ...vars};
  spawnProcess(
    'webpack',
    'yarn', ['start:webpack'],
    {env}
  );
}

start().catch(console.error);
