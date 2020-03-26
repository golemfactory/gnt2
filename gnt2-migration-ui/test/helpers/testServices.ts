import {JsonRpcProvider, Provider, Web3Provider} from 'ethers/providers';
import {AccountService} from '../../src/services/AccountsService';
import sinon from 'sinon';
import {ConnectionService} from '../../src/services/ConnectionService';
import {deployDevGolemContracts, GolemContractsDeploymentAddresses} from 'gnt2-contracts';
import {ContractAddressService} from '../../src/services/ContractAddressService';
import {loadFixture} from 'ethereum-waffle';
import {TokensService} from '../../src/services/TokensService';
import {MockedEthereum} from './mockedEthereum';
import {RefreshService} from '../../src/services/RefreshService';
import {Wallet} from 'ethers';
import {TransactionsService} from '../../src/services/TransactionService';
import {ContractAddresses} from '../../src/domain/Network';
import config from '../../src/config';
import {EtherService} from '../../src/services/EtherService';

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

function restoreStubs(provider: JsonRpcProvider) {
  const possibleStub = provider.listAccounts as any;
  if (possibleStub.restore) {
    possibleStub.restore();
  }
}

async function testConnectionService(provider: JsonRpcProvider, address?: string) {
  const connectionService = new ConnectionService(new MockedEthereum());
  connectionService['provider'] = provider;
  restoreStubs(provider);
  if (!address) {
    const wallets = await provider.listAccounts();
    address = wallets[0];
  }
  sinon.stub(provider, 'listAccounts').resolves([address]);
  return connectionService;
}

function testContractAddressService(connectionService: ConnectionService, addresses: GolemContractsDeploymentAddresses) {

  return new ContractAddressService(connectionService, {
    local: addresses as ContractAddresses,
    rinkeby: addresses as ContractAddresses
  });
}
const fixture = async (provider: Provider, [holderWallet, deployWallet, emptyWallet, gntOnlyWallet]: Wallet[]) => {
  const deployment = await deployDevGolemContracts(provider, deployWallet, holderWallet, gntOnlyWallet, noOpLogger);
  return {addresses: deployment, provider: provider as Web3Provider, holderWallet, deployWallet, emptyWallet, gntOnlyWallet};
};
type AccountType = 'holderUser' | 'empty' | 'holder';

function selectWallet(loginAs: AccountType, emptyWallet: Wallet, holderWallet: Wallet, gntOnlyWallet: Wallet) {
  switch (loginAs) {
    case 'empty':
      return emptyWallet;
    case 'holderUser':
      return holderWallet;
    case 'holder':
      return gntOnlyWallet;
  }
}

function testTransactionService(provider: Web3Provider, connectionService: ConnectionService) {
  localStorage.clear();
  return new TransactionsService(() => provider, connectionService, config.confirmationHeights);
}

export async function createTestServices(loginAs: AccountType = 'holderUser') {
  const {addresses, holderWallet, emptyWallet, gntOnlyWallet, provider} = await loadFixture(fixture);
  const wallet = selectWallet(loginAs, emptyWallet, holderWallet, gntOnlyWallet).address;
  const connectionService = await testConnectionService(provider, wallet);
  const contractAddressService = testContractAddressService(connectionService, addresses);
  const accountService = testAccountService(provider, wallet);
  const tokensService = new TokensService(() => provider, contractAddressService, connectionService, config.gasLimit);
  await connectionService.checkConnection();
  await connectionService.checkNetwork();
  const refreshService = new RefreshService();
  const transactionService = testTransactionService(provider, connectionService);
  const etherService = new EtherService(() => provider, connectionService);

  return {
    services: {
      startServices: sinon.stub(),
      tokensService,
      accountService,
      connectionService,
      contractAddressService,
      refreshService,
      transactionService,
      etherService
    },
    provider
  };
}
