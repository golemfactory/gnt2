import createEnv from './createEnv';
import spawnProcess from './spawnProcess';
import {startGanache} from './startGanache'
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {deployDevGolemContracts} from '../../gnt2-contracts';


async function start() {
  const jsonRpcUrl: string = await startGanache(8888);
  const provider = createMockProvider({port: 8888});
  const [deployWallet, holderWallet] = getWallets(provider);
  const golemContractsDevDeployment = await deployDevGolemContracts(provider, deployWallet, holderWallet);
  const env = createEnv({jsonRpcUrl, ...golemContractsDevDeployment});
  runWebServer(env);
}

function runWebServer(vars: any) {
  const env = {...process.env, ...vars};
  spawnProcess(
    'webpack',
    'yarn', ['start:webpack'],
    {env}
  );
}

start().catch(console.error);
