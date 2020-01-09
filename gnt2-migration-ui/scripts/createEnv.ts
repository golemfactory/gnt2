import {GolemContractsDevDeployment} from '../../gnt2-contracts/src/deployment/deployDevGolemContracts';

function createEnv({oldGolemTokenContractAddress, newGolemTokenContractAddress, batchingGolemTokenContractAddress}: GolemContractsDevDeployment) {
  return {
    OLD_GNT_TOKEN_CONTRACT_ADDRESS: oldGolemTokenContractAddress,
    NEW_GNT_TOKEN_CONTRACT_ADDRESS: newGolemTokenContractAddress,
    BATCHING_GNT_TOKEN_CONTRACT_ADDRESS: batchingGolemTokenContractAddress
  };
}

export default createEnv;
