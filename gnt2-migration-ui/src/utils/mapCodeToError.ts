import {MetamaskError, TransactionDenied, UnknownError} from '../errors';

interface ProviderError extends Error {
  code: number;
}

export const mapCodeToError = (error: ProviderError) => {
  if (error.code) {
    switch (error.code.toString()) {
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
