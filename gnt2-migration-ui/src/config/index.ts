import {getEnv} from './getEnv';

export interface GolemTokenAddresses {
  oldGolemToken: string;
  newGolemToken: string;
  batchingGolemToken: string;
  depositGolemToken: string;
}

export type NetworkName = 'rinkeby' | 'local';

export type TokenContractsAddresses = Record<NetworkName, GolemTokenAddresses>;

export const tokenContractsAddresses: TokenContractsAddresses = Object.freeze({
  rinkeby: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x924442A66cFd812308791872C4B242440c108E19'),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0xef6A0668be10276f6B74eB80593B01B5d0606a2f'),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x123438d379BAbD07134d1d4d7dFa0BCbd56ca3F3'),
    depositGolemToken: getEnv('DEPOSIT_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '')

  },
  local: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA'),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xaC8444e7d45c34110B34Ed269AD86248884E78C7'),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xf278DDe7F235D1736d1981a036637A5B9Cf20316'),
    depositGolemToken: getEnv('DEPOSIT_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xDD547519c6D11A8eA57B98A752EeBB903D154A3B')
  }
});

export const gasLimit = 750000;
