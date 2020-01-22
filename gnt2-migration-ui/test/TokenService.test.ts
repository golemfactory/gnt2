import {TokensService} from '../src/services/TokensService';
import {createMockProvider, getWallets, solidity} from 'ethereum-waffle';
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
import {GolemContractsDevDeployment} from '../../gnt2-contracts/src/deployment/deployDevGolemContracts';

chai.use(solidity);
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
  const [holder, deployWallet] = getWallets(provider);

  describe('migrateTokens', () => {
    let tokensService: TokensService;
    let addresses: GolemContractsDevDeployment;

    beforeEach(async () => {
      addresses = await deployDevGolemContracts(provider, deployWallet, holder, {log: () => { /* no op */ }});
      const contractAddressService = {
        golemNetworkTokenAddress: new State<GolemTokenAddresses>(addresses)
      } as unknown as ContractAddressService;
      tokensService = new TokensService(() => provider, contractAddressService);
    });

    it('gets account balance', async () => {
      expect(await tokensService.balanceOfOldTokens(holder.address)).to.eq(utils.parseEther('140000000.0'));
    });

    it('returns unknown error upon transaction revert', async () => {
      await expect(tokensService.migrateAllTokens(AddressZero)).to.be.rejectedWith(UnknownError);
    });

    it('migrates all tokens and returns transaction hash', async () => {
      const result = await tokensService.migrateAllTokens(holder.address);
      expect(await tokensService.balanceOfOldTokens(holder.address)).to.eq(0);
      expect(result).to.match(/0x[0-9a-fA-F]{64}/);
    });

    [{simulatedError: providerTransactionDenied, expectedError: TransactionDenied},
      {simulatedError: providerMetamaskError, expectedError: MetamaskError},
      {simulatedError: providerUnknownError, expectedError: UnknownError}
    ].forEach(({simulatedError, expectedError}) => {
      it(`returns error with message '${expectedError.name}'`, async () => {
        sinon.restore();
        const oldTokenContract = GolemNetworkTokenFactory.connect(addresses.oldGolemToken, provider);

        sinon.stub(GolemNetworkTokenFactory, 'connect').callsFake(() => ({...oldTokenContract, migrate: simulatedError} as unknown as GolemNetworkToken));
        await expect(tokensService.migrateAllTokens(holder.address)).to.be.rejectedWith(expectedError);
      });
    });
  });
});
