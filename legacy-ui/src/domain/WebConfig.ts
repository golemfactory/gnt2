import {ConfirmationHeights} from './ConfirmationHeights';
import {ContractAddressesByNetwork} from './Network';

export interface WebConfig {
  gasLimit: number;
  confirmationHeights: ConfirmationHeights;
  contractAddresses: ContractAddressesByNetwork;
}
