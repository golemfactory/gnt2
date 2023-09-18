class ServiceError extends Error {
  constructor(message: string, public wrappedError?: Error) {
    super(message);
  }
}

export class TransactionDenied extends ServiceError {
  constructor(wrappedError: Error) {
    super(`User denied transaction signature.`, wrappedError);
    Object.setPrototypeOf(this, TransactionDenied.prototype);
  }
}

export class MetamaskError extends ServiceError {
  constructor(wrappedError: Error) {
    super(`Metamask error, please restart browser.`, wrappedError);
    Object.setPrototypeOf(this, MetamaskError.prototype);
  }
}

export class UnknownError extends ServiceError {
  constructor(wrappedError: Error) {
    super(`Something went wrong, try again later.`, wrappedError);
    Object.setPrototypeOf(this, UnknownError.prototype);
  }
}

export class TransactionFailedError extends Error {
  constructor() {
    super('Ethereum transaction failed');
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}
