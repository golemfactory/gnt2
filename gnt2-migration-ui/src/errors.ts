class ServiceError extends Error {
  constructor(message: string, public wrappedError?: Error) {
    super(message);
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

export class InsufficientFunds extends ServiceError {
  constructor(wrappedError: Error) {
    super(`Insufficient funds.`, wrappedError);
  }
}
export class TransactionDenied extends ServiceError {
  constructor(wrappedError: Error) {
    super(`User denied transaction signature.`, wrappedError);
  }
}
export class MetamaskError extends ServiceError {
  constructor(wrappedError: Error) {
    super(`Metamask error, please restart browser.`, wrappedError);
  }
}
export class UnknownError extends ServiceError {
  constructor(wrappedError: Error) {
    super(`Something went wrong, try again later.`, wrappedError);
  }
}
