import React from 'react';
import {ContractTransaction, errors} from 'ethers';
import {createMockProvider} from 'ethereum-waffle';
import {Web3Provider} from 'ethers/providers';
import {render, wait} from '@testing-library/react';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {Services} from '../src/services';
import {ServiceContext} from '../src/ui/useServices';
import {createTestServices} from './helpers/testServices';
import {TransactionStatus} from '../src/ui/TransactionStatus';
import {SnackbarProvider} from '../src/ui/Snackbar/SnackbarProvider';
import {MetamaskError, TransactionDenied, UnknownError} from '../src/errors';

chai.use(chaiDom);

const providerTransactionDenied = async (): Promise<ContractTransaction> => {
  throw errors.throwError('User denied transaction signature.', '4001', '');
};
const providerMetamaskError = async (): Promise<ContractTransaction> => {
  throw errors.throwError('Metamask error, please restart browser.', '-32603', '');
};
const providerUnknownError = async (): Promise<ContractTransaction> => {
  throw errors.throwError('Something went wrong, try again later.', '420', '');
};

async function renderTransaction(services: Services, transactionToBeExecuted: (() => Promise<ContractTransaction>) | undefined) {
  return render(
    <ServiceContext.Provider value={services}>
      <SnackbarProvider>
        <TransactionStatus transactionToBeExecuted={transactionToBeExecuted} onClose={() => null}/>
      </SnackbarProvider>
    </ServiceContext.Provider>
  );
}

describe('Transaction Status UI', () => {

  let services: Services;
  let provider: Web3Provider;
  beforeEach(async () => {
    provider = createMockProvider();
    services = await createTestServices(provider);
  });

  [{simulatedError: providerTransactionDenied, ExpectedError: TransactionDenied},
    {simulatedError: providerMetamaskError, ExpectedError: MetamaskError},
    {simulatedError: providerUnknownError, ExpectedError: UnknownError}
  ].forEach(({simulatedError, ExpectedError}) => {
    it(`returns error with message '${ExpectedError.name}'`, async () => {
      const {getByTestId} = await renderTransaction(services, () => simulatedError());

      await wait(() => {
        expect(getByTestId('error-message')).to.have.text((new ExpectedError(new Error())).message);
      });

    });
  });

});
