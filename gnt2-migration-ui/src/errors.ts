
export class InsufficientFunds extends Error {
  constructor() {
    super(`Insufficient funds.`);
  }
}
export class TransactionDenied extends Error {
  constructor() {
    super(`User denied transaction signature.`);
  }
}
export class MetamaskError extends Error {
  constructor() {
    super(`Metamask error, please restart browser`);
  }
}
export class UnknownError extends Error {
  constructor() {
    super(`Something went wrong, try again later.`);
  }
}
