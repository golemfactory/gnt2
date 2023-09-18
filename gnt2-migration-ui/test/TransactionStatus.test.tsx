import React from 'react';
import {ContractTransaction, errors} from 'ethers';
import {render, wait} from '@testing-library/react';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {Services} from '../src/services';
import {ServiceContext} from '../src/ui/hooks/useServices';
import {createTestServices} from './helpers/testServices';
import {TransactionStatus} from '../src/ui/TransactionStatus';
import {MetamaskError, TransactionDenied, UnknownError} from '../src/errors';
import {TransactionWithDescription} from '../src/ui/Account';

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

async function renderTransaction(services: Services, transactionToBeExecuted: TransactionWithDescription) {
  return render(
    <ServiceContext.Provider value={services}>
      <TransactionStatus transactionToBeExecuted={transactionToBeExecuted} onClose={() => null}/>
    </ServiceContext.Provider>
  );
}

describe('Transaction Status UI', () => {

  let services: Services;
  beforeEach(async () => {
    ({services} = await createTestServices());
  });

  [{simulatedError: providerTransactionDenied, ExpectedError: TransactionDenied},
    {simulatedError: providerMetamaskError, ExpectedError: MetamaskError},
    {simulatedError: providerUnknownError, ExpectedError: UnknownError}
  ].forEach(({simulatedError, ExpectedError}) => {
    it(`returns error with message '${ExpectedError.name}'`, async () => {
      const {getByTestId} = await renderTransaction(services, {txFunction: () => simulatedError(), description: ''});

      await wait(() => {
        expect(getByTestId('error-message')).to.contain.text((new ExpectedError(new Error())).message);
      });

    });
  });

});
