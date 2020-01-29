import {GolemContractsDevDeployment} from '../../gnt2-contracts/src/deployment/interfaces';

function createEnv({oldGolemToken, newGolemToken, batchingGolemToken, gntDeposit}: GolemContractsDevDeployment) {
  return {
    OLD_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: oldGolemToken,
    NEW_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: newGolemToken,
    BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: batchingGolemToken,
    DEPOSIT_GNT_TOKEN_CONTRACT_ADDRESS_LOCAL: gntDeposit
  };
}

export default createEnv;
