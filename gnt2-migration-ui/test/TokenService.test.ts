import {TokensService} from '../src/services/TokensService';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {deployDevGolemContracts, GolemNetworkTokenFactory} from '../../gnt2-contracts';
import sinon from 'sinon';
import {GolemNetworkToken} from 'gnt2-contracts/build/contract-types/GolemNetworkToken';
import {ContractTransaction, errors, utils} from 'ethers';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {ContractAddressService} from '../src/services/ContractAddressService';
import {State} from 'reactive-properties';
import {MetamaskError, TransactionDenied, UnknownError} from '../src/errors';
import {GolemTokenAddresses} from '../src/config';
import {AddressZero} from 'ethers/constants';

chai.use(chaiAsPromised);
const expect = chai.expect;

const providerTransactionDenied = async (): Promise<ContractTransaction> => {
  throw errors.throwError('User denied transaction signature.', '4001', '');
};
const providerMetamaskError = async (): Promise<ContractTransaction> => {
  throw errors.throwError('Metamask error, please restart browser.', '-32603', '');
};
const providerUnknownError = async (): Promise<ContractTransaction> => {
  throw errors.throwError('Something went wrong, try again later.', '420', '');
};

describe('Token Service', () => {
  const provider = createMockProvider();
  const [deployWallet, holder] = getWallets(provider);

  describe('migrateTokens', () => {
    let tokensService: TokensService;
    let oldTokenContract: GolemNetworkToken;

    beforeEach(async () => {
      const addresses = await deployDevGolemContracts(provider, holder, deployWallet, {log: () => { /* do nothing */ }});
      const contractAddressService = {
        golemNetworkTokenAddress: new State<GolemTokenAddresses>(addresses)
      } as unknown as ContractAddressService;
      tokensService = new TokensService(() => provider, contractAddressService);
      oldTokenContract = GolemNetworkTokenFactory.connect(addresses.oldGolemToken, provider);
    });

    it(`returns unknown error upon transaction revert`, async () => {
      await expect(tokensService.migrateAllTokens(AddressZero)).to.be.rejectedWith(UnknownError);
    });

    it('gets account balance', () => {
      expect(tokensService.balanceOfOldTokens(holder.address)).to.eq('150000000');
    });
    it(`returns transaction hash`, async () => {
      const result = await tokensService.migrateAllTokens(holder.address);
      expect(result).to.match(/0x[0-9a-fA-F]{64}/);
    });

    [{simulatedError: providerTransactionDenied, expectedError: TransactionDenied},
      {simulatedError: providerMetamaskError, expectedError: MetamaskError},
      {simulatedError: providerUnknownError, expectedError: UnknownError}
    ].forEach(({simulatedError, expectedError}) => {
      it(`returns error with message '${expectedError.name}'`, async () => {
        sinon.restore();

        sinon.stub(GolemNetworkTokenFactory, 'connect').callsFake(() => ({...oldTokenContract, migrate: simulatedError} as unknown as GolemNetworkToken));
        await expect(tokensService.migrateAllTokens(holder.address)).to.be.rejectedWith(expectedError);
      });
    });
  });
});
