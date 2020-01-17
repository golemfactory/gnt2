import {TokensService} from '../src/services/TokensService';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {
  deployDevGolemContracts,
  GolemNetworkTokenFactory
} from '../../gnt2-contracts';
import sinon from 'sinon';
import {throwError} from 'ethers/errors';
import {GolemNetworkToken} from 'gnt2-contracts/build/contract-types/GolemNetworkToken';
import {ContractTransaction} from 'ethers';
import {parseUnits} from 'ethers/utils';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

const transactionDenied = async (): Promise<ContractTransaction> => {
  throw throwError('User denied transaction signature.', '4001', '');
};
const MetamaskError = async (): Promise<ContractTransaction> => {
  throw throwError('Metamask error, please restart browser.', '-32603', '');
};
const UnknownError = async (): Promise<ContractTransaction> => {
  throw throwError('Something went wrong, try again later.', '420', '');
};

describe('Token Service', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  describe('migrateTokens', () => {
    let tokensService: TokensService;

    beforeEach(async () => {
      const {oldGolemTokenContractAddress,
        newGolemTokenContractAddress,
        batchingGolemTokenContractAddress} = await deployDevGolemContracts(provider, holder, deployWallet, {log: () => { /* do nothing */ }});
      tokensService = new TokensService(() => provider, oldGolemTokenContractAddress, newGolemTokenContractAddress, batchingGolemTokenContractAddress);
    });

    it(`returns error with message 'Insufficient funds.'`, async () => {
      await expect(tokensService.migrateTokens(parseUnits('10000000000').toString())).to.be.rejectedWith('Insufficient funds.');
    });

    it(`returns transaction hash`, async () => {
      const result = await tokensService.migrateTokens('100');
      expect(result).to.match(/0x[0-9a-fA-F]{64}/);
    });

    [{simulatedError: transactionDenied, expectedMessage: 'User denied transaction signature.'},
      {simulatedError: MetamaskError, expectedMessage: 'Metamask error, please restart browser.'},
      {simulatedError: UnknownError, expectedMessage: 'Something went wrong, try again later.'}
    ].forEach(({simulatedError, expectedMessage}) => {
      it(`returns error with message '${expectedMessage}'`, async () => {
        sinon.stub(GolemNetworkTokenFactory, 'connect').callsFake(() => ({migrate: simulatedError} as unknown as GolemNetworkToken));

        await expect(tokensService.migrateTokens('10000')).to.be.rejectedWith(expectedMessage);

        sinon.restore();
      });
    });
  });
});
