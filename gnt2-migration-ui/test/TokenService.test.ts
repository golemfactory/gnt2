import {expect} from 'chai';
import {TokensService} from '../src/services/TokensService';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {deployDevGolemContracts} from '../../gnt2-contracts';


describe('Token Service', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  describe('migrateTokens', () => {
    it('returns message about insufficient funds.', async () => {
      const {oldGolemTokenContractAddress,
        newGolemTokenContractAddress,
        batchingGolemTokenContractAddress} = await deployDevGolemContracts(provider, deployWallet, holder, {log: () => { /* do nothing */ }});
      const tokensService = new TokensService(() => provider, oldGolemTokenContractAddress, newGolemTokenContractAddress, batchingGolemTokenContractAddress);
      expect(await tokensService.migrateTokens('1000000')).to.be.eq('Insufficient funds.');
    });
  });
});
