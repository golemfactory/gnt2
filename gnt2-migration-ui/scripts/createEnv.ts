import {GolemContractsDevDeployment} from '../../gnt2-contracts/src/deployment/deployDevGolemContracts';

function createEnv({oldGolemToken, newGolemToken, batchingGolemToken}: GolemContractsDevDeployment) {
  return {
    OLD_GNT_TOKEN_CONTRACT_ADDRESS: oldGolemToken,
    NEW_GNT_TOKEN_CONTRACT_ADDRESS: newGolemToken,
    BATCHING_GNT_TOKEN_CONTRACT_ADDRESS: batchingGolemToken
  };
}

export default createEnv;
