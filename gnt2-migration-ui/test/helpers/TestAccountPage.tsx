import {Services} from '../../src/services';
import {fireEvent, render, wait, waitForElement} from '@testing-library/react';
import {expect} from 'chai';
import {ServiceContext} from '../../src/ui/hooks/useServices';
import {Account} from '../../src/ui/Account';
import React from 'react';


function renderAccount(services: Services) {
  return render(
    <ServiceContext.Provider value={services}>
      <Account/>
    </ServiceContext.Provider>
  );
}

export class TestAccountPage {
  private getByTestId: any;
  private queryByTestId: any;

  constructor(private services: Services) {
  }

  async load() {
    const {getByTestId, queryByTestId} = await renderAccount(this.services);
    this.getByTestId = getByTestId;
    this.queryByTestId = queryByTestId;
    return this;
  }

  async startMigration() {
    await this.clickConvert();
    return this.findMigrationInput();
  }

  async clickConvert() {
    fireEvent.click(await waitForElement(() => this.getByTestId('convert-button')));
  }

  async migrate(amount: string) {
    const input = await this.startMigration();
    this.confirmMigration(input, amount);
  }

  confirmMigration(input: any, amount: string) {
    fireEvent.change(input, {target: {value: amount}});
    fireEvent.click(this.getByTestId('convert-button'));
  }

  async findMigrationInput() {
    return waitForElement(() => this.getByTestId('convert-input'));
  }

  async completeTransaction() {
    await wait(() => {
      expect(this.getByTestId('modal')).to.contain.text('Transaction complete');
    });
    fireEvent.click(this.getByTestId('modal-close'));
  }

  find(testId: string) {
    return this.getByTestId(testId);
  }

  query(testId: string) {
    return this.queryByTestId(testId);
  }

  async clickContinueMigration() {
    fireEvent.click(await waitForElement(() => this.getByTestId('modal-button-continue')));
  }

  confirmUnlock() {
    fireEvent.click(this.getByTestId('confirm-button'));
  }
}
