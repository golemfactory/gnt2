import {JsonRpcProvider, Provider, Web3Provider} from 'ethers/providers';
import sinon from 'sinon';
import {ConnectionService} from '../../src/services/ConnectionService';
import {deployDevGolemContracts, GolemContractsDeploymentAddresses} from 'gnt2-contracts';
import {ContractAddressService} from '../../src/services/ContractAddressService';
import {loadFixture} from 'ethereum-waffle';
import {TokensService} from '../../src/services/TokensService';
import {MockedEthereum} from './mockedEthereum';
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

async function testConnectionService(provider: JsonRpcProvider, mockedEthereum: MockedEthereum) {
  const connectionService = new ConnectionService(mockedEthereum);
  connectionService['provider'] = provider;
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
  const mockedEthereum = new MockedEthereum();
  const connectionService = await testConnectionService(provider, mockedEthereum);
  const contractAddressService = testContractAddressService(connectionService, addresses);
  const tokensService = new TokensService(() => provider, contractAddressService, connectionService, config.gasLimit);
  const transactionService = testTransactionService(provider, connectionService);
  const etherService = new EtherService(() => provider, connectionService);
  await connectionService['handleAccountsChange']([wallet]);
  await connectionService.checkNetwork();

  return {
    services: {
      startServices: sinon.stub(),
      tokensService,
      connectionService,
      contractAddressService,
      transactionService,
      etherService
    },
    provider,
    mockedEthereum
  };
}
