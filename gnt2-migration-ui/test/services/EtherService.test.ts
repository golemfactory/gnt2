import {createTestServices} from '../helpers/testServices';
import {EtherService} from '../../src/services/EtherService';
import {JsonRpcProvider} from 'ethers/providers';
import sinon from 'sinon';
import chai, {expect} from 'chai';
import {solidity} from 'ethereum-waffle';
import {ConnectionService} from '../../src/services/ConnectionService';
import {AddressZero} from 'ethers/constants';
import {parseEther} from 'ethers/utils';
import {wait} from '@testing-library/react';

chai.use(solidity);

describe('Ether Service', () => {
  let etherService: EtherService;
  let connectionService: ConnectionService;
  let unsubscribe: () => void;
  let provider: JsonRpcProvider;

  beforeEach(async () => {
    ({services: {etherService, connectionService}, provider} = await createTestServices());
    unsubscribe = etherService.etherBalance.subscribe(sinon.stub());
  });

  afterEach(() => {
    unsubscribe();
  });

  it('updates balance on transfer', async () => {
    await wait(() => {
      expect(etherService.etherBalance.get()).to.eq('9999999999999999972001234000000000');
    });

    await provider.getSigner(connectionService.account.get()).sendTransaction({to: AddressZero, value: parseEther('100')});

    await wait(() => {
      expect(etherService.etherBalance.get()).to.eq('9999999999999899971959234000000000');
    });
  });
});
