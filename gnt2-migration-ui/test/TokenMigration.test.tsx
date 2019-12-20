import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import {render} from '@testing-library/react';
import App from "../src/ui/App";
import {createMockProvider, getWallets} from "ethereum-waffle";
import {NewGolemNetworkTokenFactory} from 'gnt2-contracts/build/contract-types/NewGolemNetworkTokenFactory'

describe('Token migration UI with contracts', () => {

  test('migrates token via UI', async () => {
    const testMessage = 'Test Message';
    render(
      <App>{testMessage}</App>,
    );

    const provider = createMockProvider();
    const [wallet] = getWallets(provider);
    const token = await new NewGolemNetworkTokenFactory(wallet).deploy();
    expect(await token.symbol()).toBe('NGNT');
  });

});
