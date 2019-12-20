import {expect} from 'chai';
import {AccountService} from '../src/services/AccountsService';
import {JsonRpcProvider} from 'ethers/providers';

describe('AccountsService', () => {
  const mockedProvider = {
    getBalance: jest.fn(() => '420'),
    listAccounts: jest.fn(() => ['0x123'])
  };

  const accountService = new AccountService(() => mockedProvider as any as JsonRpcProvider);

  describe('balanceOf', () => {
    it('should return balance of account', () => {
      expect(accountService.balanceOf('0x123')).to.equal('420');
    });
  });

  describe('getDefaultAccount', () => {
    it('should return address of account', async () => {
      expect(await accountService.getDefaultAccount()).to.equal('0x123');
    });
  });

});
