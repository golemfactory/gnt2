import {JsonRpcProvider} from 'ethers/providers';

export class TokensService {
  constructor(private provider: () => JsonRpcProvider, oldGolemTokenContractAddress: string, newGolemTokenContractAddress: string) {

  }

}
