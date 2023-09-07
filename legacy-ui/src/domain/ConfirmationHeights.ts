import {NetworkName} from './Network';

export type ConfirmationHeights = Partial<Record<NetworkName | 'default', number>>;
