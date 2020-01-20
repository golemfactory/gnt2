import chai, {expect} from 'chai';
import {ConnectionService, ConnectionState} from '../src/services/ConnectionService';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Connections Service', () => {
  let mockedEthereum: MetamaskEthereum & { simulateAccountChanged: (accounts: string[]) => void, simulateNetworkChange: (network: string) => void };

  let connectionService: ConnectionService;

    beforeEach(() => {
      let mockedEthereumCallback: (params?: any) => void = () => { /* empty */ };
      mockedEthereum = {
        simulateAccountChanged: function (accounts = []) {
          mockedEthereumCallback(accounts);
        },
        simulateNetworkChange: function (network = '') {
          mockedEthereumCallback(network);
        },
        send: sinon.mock().returns('4'),
        isMetaMask: true,
        networkVersion: '4',
        on: (eventName, callback) => {
          mockedEthereumCallback = callback;
        },
        off: (eventName, callback) => {
          mockedEthereumCallback = callback;
        }
      };
      connectionService = new ConnectionService(mockedEthereum);
    });

  describe('when initialized', () => {
    it('has no provider', () => {
      expect(() => connectionService.getProvider()).to.throw(/Provider requested, but not yet initialized/);
    });

    it('is in UNKNOWN state', () => {
      expectState().to.eq(ConnectionState.UNKNOWN);
    });

  });

  describe('when asked to create provider', () => {
    it('creates provider, but does not connect automatically', () => {
      tryToCreateProvider();
      expect(connectionService.getProvider()).to.be.not.null;
      expectState().to.eq(ConnectionState.NOT_CONNECTED);
    });

    it('detects no extension is installed', () => {
      connectionService = new ConnectionService(undefined);
      tryToCreateProvider();
      expectState().to.eq(ConnectionState.NO_METAMASK);
    });

    it('detects MetaMask is not installed', () => {
      mockedEthereum.isMetaMask = false;
      tryToCreateProvider();
      expectState().to.eq(ConnectionState.NO_METAMASK);
    });

  });

  it('delivers network change event', () => {
    const callback = sinon.mock();
    connectionService.subscribe(callback);
    mockedEthereum.simulateNetworkChange('4');
    expect(connectionService.network.get()).to.eq('Rinkeby');
    expect(callback).to.have.been.called;
  });

  it('delivers account change event', () => {
    tryToCreateProvider();
    const callback = sinon.mock();
    connectionService.account.subscribe(callback);
    mockedEthereum.simulateAccountChanged(['account']);
    expect(callback).to.have.been.called;
  });

  it('is in CONNECTED state when there is an account in provider', () => {
    tryToCreateProvider();
    mockedEthereum.simulateAccountChanged(['account']);
    expectState().to.eq(ConnectionState.CONNECTED);
  });

  it('keeps the state as NOT_CONNECTED when there are no accounts', () => {
    tryToCreateProvider();
    mockedEthereum.simulateAccountChanged([]);
    expectState().to.eq(ConnectionState.NOT_CONNECTED);
  });

  it('checks connection by trying to list accounts', () => {
    tryToCreateProvider();
    connectionService.checkConnection();
    expect(mockedEthereum.send).to.have.been.calledWithMatch({method: 'eth_accounts'});
  });

  it('connects by requesting accounts', () => {
    tryToCreateProvider();
    connectionService.connect();
    expect(mockedEthereum.send).to.have.been.calledWithMatch({method: 'eth_requestAccounts'});
  });

  it('sets network state based on MetaMask', async () => {
    mockedEthereum.networkVersion = '4';
    connectionService = new ConnectionService(mockedEthereum);
    await connectionService.checkNetwork();
    expect(connectionService.network.get()).to.eq('Rinkeby');
  });

  it('throws error when asked to check network with no MetaMask', () => {
    connectionService = new ConnectionService(undefined);
    expect(() => connectionService.checkNetwork()).to.throw(/Metamask requested, but not yet initialized/);
  });

  function tryToCreateProvider() {
    connectionService['createProvider']();
  }

  function expectState() {
    return expect(connectionService.connectionState);
  }
});
