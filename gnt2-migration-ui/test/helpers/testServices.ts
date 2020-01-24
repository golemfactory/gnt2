import {JsonRpcProvider} from 'ethers/providers';
import {AccountService} from '../../src/services/AccountsService';
import sinon from 'sinon';
import {ConnectionService} from '../../src/services/ConnectionService';
import {deployDevGolemContracts, GolemContractsDeploymentAddresses} from 'gnt2-contracts';
import {ContractAddressService} from '../../src/services/ContractAddressService';
import {GolemTokenAddresses} from '../../src/config';
import {Services} from '../../src/services';
import {getWallets} from 'ethereum-waffle';
import {TokensService} from '../../src/services/TokensService';

const noOpLogger = {
  log: () => {
    /* do nothing */
  }
};

function testAccountService(provider: JsonRpcProvider, address: string) {
  const accountService = new AccountService(() => provider);
  sinon.stub(accountService, 'getDefaultAccount').resolves(address);
  return accountService;
}

async function testConnectionService(provider: JsonRpcProvider) {
  const connectionService = new ConnectionService({
    send: sinon.mock().returns({result: '4'}),
    isMetaMask: true,
    on: () => { /* empty */ },
    off: () => { /* empty */ }
  });
  connectionService['provider'] = provider;
  await connectionService.checkConnection();
  await connectionService.checkNetwork();
  return connectionService;
}

function testContractAddressService(connectionService: ConnectionService, addresses: GolemContractsDeploymentAddresses) {

  return new ContractAddressService(connectionService, {
    local: addresses as GolemTokenAddresses,
    rinkeby: addresses as GolemTokenAddresses
  });
}
export async function createTestServices(provider: JsonRpcProvider): Promise<Services> {
  const [holderWallet, deployWallet] = getWallets(provider);
  const addresses = await deployDevGolemContracts(provider, deployWallet, holderWallet, noOpLogger);
  const connectionService = await testConnectionService(provider);
  const contractAddressService = testContractAddressService(connectionService, addresses);
  const accountService = testAccountService(provider, holderWallet.address);
  const tokensService = new TokensService(() => provider, contractAddressService);
  return {
    startServices: sinon.stub(),
    tokensService,
    accountService,
    connectionService,
    contractAddressService
  };
}
