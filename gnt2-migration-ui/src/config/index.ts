import {getEnv} from './getEnv';

export const config = {
  oldGolemTokenContractAddress: process.env['OLD_GNT_TOKEN_CONTRACT_ADDRESS'] || '',
  newGolemTokenContractAddress: process.env['NEW_GNT_TOKEN_CONTRACT_ADDRESS'] || '',
  batchingGolemTokenContractAddress: process.env['BATCHING_GNT_TOKEN_CONTRACT_ADDRESS'] || ''
};

export const getNetworks = () => Object.freeze({
  rinkeby: {
    oldGolemTokenContractAddress: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x924442A66cFd812308791872C4B242440c108E19'),
    newGolemTokenContractAddress: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0xef6A0668be10276f6B74eB80593B01B5d0606a2f'),
    batchingGolemTokenContractAddress: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x123438d379BAbD07134d1d4d7dFa0BCbd56ca3F3')
  },
  local: {
    oldGolemTokenContractAddress: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA'),
    newGolemTokenContractAddress: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xaC8444e7d45c34110B34Ed269AD86248884E78C7'),
    batchingGolemTokenContractAddress: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL', '0xf278DDe7F235D1736d1981a036637A5B9Cf20316')
  }
});
