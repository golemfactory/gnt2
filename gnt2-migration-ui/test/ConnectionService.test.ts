import {expect} from 'chai';
import {ConnectionService} from '../src/services/connectionService';

describe('Connections Service', () => {
  describe('create', () => {
    let connectionService: ConnectionService;
    beforeEach(() => {
      const mockedEthereum = {
        isMetaMask: true,
        on: () => {
          /* empty */
        }
      };
      connectionService = new ConnectionService(() => mockedEthereum);
    });

    it('provider should be undefined', () => {
      expect(() => connectionService.getProvider()).to.throw(/Provider requested, but not yet initialized/);
    });

  });
});
