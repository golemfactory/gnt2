import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import HiddenMessage from '../src/ui/HiddenMessage';

test('shows the children when the checkbox is checked', () => {
  const testMessage = 'Test Message';
  const {queryByText, getByLabelText, getByText} = render(
    <HiddenMessage>{testMessage}</HiddenMessage>,
  );

  // query* functions will return the element or null if it cannot be found
  // get* functions will return the element or throw an error if it cannot be found
  expect(queryByText(testMessage)).toBeNull();

  // the queries can accept a regex to make your selectors more resilient to content tweaks and changes.
  fireEvent.click(getByLabelText(/show/i));

  // .toBeInTheDocument() is an assertion that comes from jest-dom
  // otherwise you could use .toBeDefined()
  expect(getByText(testMessage)).toBeInTheDocument();
});
