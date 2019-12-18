import {ethers} from 'ethers';
import '../types';
import {AsyncSendable} from 'ethers/providers';

export default async function connectToMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    const metamaskProvider = window.ethereum as AsyncSendable;
    const provider = new ethers.providers.Web3Provider(metamaskProvider);
    const accounts = await provider.send('eth_requestAccounts', []);
    console.log(accounts);
    const balance = await provider.getBalance(accounts[0]);
    return [accounts[0], balance];
  }
}
