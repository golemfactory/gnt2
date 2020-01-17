import {TokensService} from '../src/services/TokensService';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {
  deployDevGolemContracts,
  GolemNetworkTokenFactory
} from '../../gnt2-contracts';
import sinon from 'sinon';
import {GolemNetworkToken} from 'gnt2-contracts/build/contract-types/GolemNetworkToken';
import {ContractTransaction, utils, errors} from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {ContractAddressService, GolemTokenAddresses} from '../src/services/ContractAddressService';
import {State} from 'reactive-properties';
chai.use(chaiAsPromised);
const expect = chai.expect;

const transactionDenied = async (): Promise<ContractTransaction> => {
  throw errors.throwError('User denied transaction signature.', '4001', '');
};
const MetamaskError = async (): Promise<ContractTransaction> => {
  throw errors.throwError('Metamask error, please restart browser.', '-32603', '');
};
const UnknownError = async (): Promise<ContractTransaction> => {
  throw errors.throwError('Something went wrong, try again later.', '420', '');
};

describe('Token Service', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  describe('migrateTokens', () => {
    let tokensService: TokensService;

    beforeEach(async () => {
      const addresses = await deployDevGolemContracts(provider, holder, deployWallet, {log: () => { /* do nothing */ }});
      const contractAddressService = {
        golemNetworkTokenAddress: new State<GolemTokenAddresses>(addresses)
      } as unknown as ContractAddressService;
      tokensService = new TokensService(() => provider, contractAddressService);
    });

    it(`returns error with message 'Insufficient funds.'`, async () => {
      const tokens = utils.parseEther('500000000').toString();
      await expect(tokensService.migrateTokens(tokens)).to.be.rejectedWith('Something went wrong, try again later.');
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
