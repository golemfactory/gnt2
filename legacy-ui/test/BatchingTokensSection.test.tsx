import {fireEvent, wait, waitForElement} from '@testing-library/react';
import {Services} from '../src/services';
import chai, {expect} from 'chai';
import chaiDom from 'chai-dom';
import {createTestServices} from './helpers/testServices';
import {TransactionDenied} from '../src/errors';
import {TestAccountPage} from './helpers/TestAccountPage';

chai.use(chaiDom);

describe('Batching tokens UI', () => {

  let services: Services;

  beforeEach(async () => {
    ({services} = await createTestServices());
  });

  it('hides after unwrap tokens', async () => {
    const accountPage = await new TestAccountPage(services).load();
    await waitForElement(() => accountPage.find('GNTB-balance'));

    const btn = await waitForElement(() => accountPage.find('unwrap-tokens-button'));
    fireEvent.click(btn);
    const input = await accountPage.findMigrationInput();
    await accountPage.confirmMigration(input, '4999900');
    await accountPage.completeTransaction();

    await wait(() => {
      expect(accountPage.query('unwrap-tokens-button')).to.not.exist;
      expect(accountPage.query('GNTB-balance')).to.not.exist;
    });
  });

  it('shows error in modal with when user denied transaction', async () => {
    services.tokensService.unwrap = async () => {
      throw new TransactionDenied(new Error());
    };

    const accountPage = await new TestAccountPage(services).load();

    const btn = await waitForElement(() => accountPage.find('unwrap-tokens-button'));
    fireEvent.click(btn);
    const input = await accountPage.findMigrationInput();
    await accountPage.confirmMigration(input, '100');

    await wait(() => {
      expect(accountPage.find('modal')).to.exist;
      expect(accountPage.find('error-message')).to.exist;
    });
  });

});
