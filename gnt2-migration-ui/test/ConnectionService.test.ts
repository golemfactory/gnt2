import {expect} from 'chai';
import '../src/types/index.d.ts';
import {ConnectionService} from '../src/services/connectionService';

const mockedEthereum = {
  sendAsync: jest.fn(),
  send: jest.fn(),
  host: '0000'
};


describe('Connections Service', () => {
  describe('create', () => {
    let connectionService: ConnectionService;
    beforeEach(() => {
      connectionService = new ConnectionService(() => mockedEthereum);
    });

    it('provider should be undefined', () => {
      expect(() => connectionService.getProvider()).to.throw(/Provider requested, but not yet initialized/);
    });

  });
});
