import {getEnv} from './getEnv';
import {AddressZero} from 'ethers/constants';

export interface ContractAddresses {
  oldGolemToken: string;
  newGolemToken: string;
  batchingGolemToken: string;
  gntDeposit: string;
  migrationAgent: string;
}

export type NetworkName = 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'local';

export type ContractAddressesByNetwork = Partial<Record<NetworkName, ContractAddresses>>;

export const contractAddressesConfig: ContractAddressesByNetwork = Object.freeze({
  rinkeby: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x35017049a0D75707484474c8C5415B639Ae2938D'),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x9eA04974BA834be90fF68779Fc811983795D1198'),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x7f42f3F1c22c9266F360f83Bdb436e2dc79C89C2'),
    gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_RINKEBY', '0xfD75A6d50055D6eEC6f568464E78963ceC38Bc07'),
    migrationAgent: getEnv('MIGRATION_AGENT_CONTRACT_ADDRESS_RINKEBY', '0x6379653453492BBd9D20931e0293518D77F')
  },
  local: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA'),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0x94BA4d5Ebb0e05A50e977FFbF6e1a1Ee3D89299c'),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xCA633a093C280377ac8449E0cdA64Efd839C976c'),
    gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_LOCAL', '0xbD73caE58B275Dce33fBf7877F40434623A1E6a9'),
    migrationAgent: getEnv('MIGRATION_AGENT_CONTRACT_ADDRESS_LOCAL', '0xaC8444e7d45c34110B34Ed269AD86248884E78C7')
  },
  mainnet: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET', '0xa74476443119A942dE498590Fe1f2454d7D4aC0d'),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET', AddressZero),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET', '0xA7dfb33234098c66FdE44907e918DAD70a3f211c'),
    gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_MAINNET', '0x98d3ca6528A2532Ffd9BDef50F92189568932570'),
    migrationAgent: getEnv('MIGRATION_AGENT_CONTRACT_ADDRESS_MAINNET', AddressZero)
  }
});

export const gasLimit = 750000;
