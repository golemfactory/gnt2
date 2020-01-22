import {InsufficientFunds, MetamaskError, TransactionDenied, UnknownError} from '../errors';

interface ProviderError extends Error {
  code: number;
}

export const mapCodeToError = (error: ProviderError) => {
  console.log(error);
  if (error.code) {
    switch (error.code.toString()) {
      case '-32000':
        return new InsufficientFunds(error);
      case '4001':
        return new TransactionDenied(error);
      case '-32603':
        return new MetamaskError(error);
      default:
        return new UnknownError(error);
    }
  }
  return new UnknownError(error);
};
