import {getEnv} from './getEnv';

export interface ContractAddresses {
  oldGolemToken: string;
  newGolemToken: string;
  batchingGolemToken: string;
  gntDeposit: string;
}

export type NetworkName = 'rinkeby' | 'local';

export type ContractAddressesByNetwork = Record<NetworkName, ContractAddresses>;

export const contractAddressesConfig: ContractAddressesByNetwork = Object.freeze({
  rinkeby: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x5f04440eeBE94581152C1654fF06726043114461'),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x3D775f0285ce59B470cFb21F82B5C6Aa2B931f16'),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x22f8707c775aEF9243B751F6831B59BfC85A4175'),
    gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_RINKEBY', '0xD08D7EAd2b8FFA32dcF32754280484F4982c3c4B')
  },
  local: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA'),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0x94BA4d5Ebb0e05A50e977FFbF6e1a1Ee3D89299c'),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xCA633a093C280377ac8449E0cdA64Efd839C976c'),
    gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_LOCAL', '0xbD73caE58B275Dce33fBf7877F40434623A1E6a9')
  }
});

export const gasLimit = 750000;
