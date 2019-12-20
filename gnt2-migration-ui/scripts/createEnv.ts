import {GolemContractsDevDeployment} from '../../gnt2-contracts/src/deployment/deployDevGolemContracts';

interface CreateEnvParams extends GolemContractsDevDeployment {
  jsonRpcUrl: string,
}

function createEnv({jsonRpcUrl, oldGolemTokenContractAddress, newGolemTokenContractAddress}: CreateEnvParams) {
  return {
    JSON_RPC_URL: jsonRpcUrl,
    OLD_GNT_TOKEN_CONTRACT_ADDRESS: oldGolemTokenContractAddress,
    NEW_GNT_TOKEN_CONTRACT_ADDRESS: newGolemTokenContractAddress
  };
}

export default createEnv;


