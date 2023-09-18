import {getEnv} from './getEnv';
import {WebConfig} from '../domain/WebConfig';

const getConfig = () => Object.freeze<WebConfig>(
  {
    gasLimit: Number.parseInt(getEnv('GAS_LIMIT', '120000')),
    confirmationHeights: {
      local: 1,
      rinkeby: 6,
      default: Number.parseFloat(getEnv('DEFAULT_CONFIRMATION_HEIGHT', '12'))
    },
    contractAddresses: {
      rinkeby: {
        oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0xf29f58E2C0A718B1f7b925450585cA42ABa5cE36'),
        newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x021eb5b4fE672Ff4A4C66656108544676D62735E'),
        batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', '0x234E4151f828Cb5141ACA8436405EB8D5C04a06B'),
        gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_RINKEBY', '0x3a3bED8432175905c8949a5411BCeac8F4aB00E8'),
        migrationAgent: getEnv('MIGRATION_AGENT_CONTRACT_ADDRESS_RINKEBY', '0x249FE202a043C4e87B4518b9188359E54e1E8C68')
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
        newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET', '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429'),
        batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_MAINNET', '0xA7dfb33234098c66FdE44907e918DAD70a3f211c'),
        gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_MAINNET', '0x98d3ca6528A2532Ffd9BDef50F92189568932570'),
        migrationAgent: getEnv('MIGRATION_AGENT_CONTRACT_ADDRESS_MAINNET', '0xBFAd98d76598961827bA832108c21445aa4FEE9A')
      }
    }
  }
);

export default getConfig;
