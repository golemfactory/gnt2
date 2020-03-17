import {JsonRpcProvider} from 'ethers/providers';
import {AccountService} from '../../src/services/AccountsService';
import sinon from 'sinon';
import {ConnectionService} from '../../src/services/ConnectionService';
import {deployDevGolemContracts, GolemContractsDeploymentAddresses} from 'gnt2-contracts';
import {ContractAddressService} from '../../src/services/ContractAddressService';
import {ContractAddresses} from '../../src/config';
import {Services} from '../../src/services';
import {getWallets} from 'ethereum-waffle';
import {TokensService} from '../../src/services/TokensService';
import {MockedEthereum} from './mockedEthereum';
import {RefreshService} from '../../src/services/RefreshService';

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

async function testConnectionService(provider: JsonRpcProvider, address?: string) {
  const connectionService = new ConnectionService(new MockedEthereum());
  connectionService['provider'] = provider;
  if (!address) {
    const wallets = await provider.listAccounts();
    address = wallets[0];
  }
  sinon.stub(provider, 'listAccounts').resolves([address]);
  await connectionService.checkConnection();
  await connectionService.checkNetwork();
  return connectionService;
}

function testContractAddressService(connectionService: ConnectionService, addresses: GolemContractsDeploymentAddresses) {

  return new ContractAddressService(connectionService, {
    local: addresses as ContractAddresses,
    rinkeby: addresses as ContractAddresses
  });
}
export async function createTestServices(provider: JsonRpcProvider, withEmptyWallet?: boolean): Promise<Services> {
  const [holderWallet, deployWallet, emptyWallet] = getWallets(provider);
  const wallet = withEmptyWallet ? emptyWallet.address : holderWallet.address;
  const addresses = await deployDevGolemContracts(provider, deployWallet, holderWallet, noOpLogger);
  const connectionService = await testConnectionService(provider, wallet);
  const contractAddressService = testContractAddressService(connectionService, addresses);
  const accountService = testAccountService(provider, wallet);
  const tokensService = new TokensService(() => provider, contractAddressService, connectionService);
  const refreshService = new RefreshService();
  return {
    startServices: sinon.stub(),
    tokensService,
    accountService,
    connectionService,
    contractAddressService,
    refreshService
  };
}
