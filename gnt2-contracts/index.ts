import { GolemContractsDevDeployment } from "./src/deployment/interfaces";
export type GolemContractsDeploymentAddresses = GolemContractsDevDeployment;
export { deployDevGolemContracts } from "./src/deployment/deployDevGolemContracts";

// export { NewGolemNetworkTokenFactory } from "./build/contract-types/NewGolemNetworkTokenFactory";
// export { GolemNetworkTokenBatchingFactory } from "./build/contract-types/GolemNetworkTokenBatchingFactory";
// export { GolemNetworkTokenFactory } from "./build/contract-types/GolemNetworkTokenFactory";
// export { GNTDepositFactory } from "./build/contract-types/GNTDepositFactory";
// export { GNTMigrationAgentFactory } from "./build/contract-types/GNTMigrationAgentFactory";
// export { NGNTFaucetFactory } from "./build/contract-types/NGNTFaucetFactory";
// export { ZkSyncFactory } from "./build/contract-types/ZkSyncFactory";

export * from "./build/contract-types";
