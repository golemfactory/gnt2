import {expect} from 'chai';
import {ConnectionService} from '../src/services/connectionService';
import sinon from 'sinon';

const mockedEthereum = {
  sendAsync: sinon.stub(),
  send: sinon.stub(),
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
