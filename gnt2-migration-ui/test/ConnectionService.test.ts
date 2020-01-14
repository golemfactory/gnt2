import chai, {expect} from 'chai';
import {ConnectionService, ConnectionState} from '../src/services/ConnectionService';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('Connections Service', () => {
  let mockedEthereum: MetamaskEthereum & {simulateAccountChanged: (accounts: string[]) => void, simulateNetworkChange: (accounts: string) => void};

  describe('create', () => {
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
        send: sinon.mock(),
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

    it('provider should be undefined after construction', () => {
      expect(() => connectionService.getProvider()).to.throw(/Provider requested, but not yet initialized/);
    });

    it('delivers network change event', () => {

      let networkChangeDetected = false;

      const connectionService = new ConnectionService(mockedEthereum);
      connectionService.subscribe(() => {
        networkChangeDetected = true;
        connectionService.checkNetwork();
      });

      mockedEthereum.simulateNetworkChange('4');

      expect(connectionService.network.get()).to.eq('Rinkeby');
      expect(networkChangeDetected).to.be.true;
    });
    it('starts in UNKNOWN state', () => {
      expectState().to.eq(ConnectionState.UNKNOWN);
    });

    it('creates provider but does not connect automatically', () => {
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

    it('exposes account change event', () => {
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

    function tryToCreateProvider() {
      connectionService['createProvider']();
    }

    function expectState() {
      return expect(connectionService.connectionState);
    }

  });
});
