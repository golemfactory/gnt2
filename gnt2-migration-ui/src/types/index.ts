type MetamaskEthereum = {
  send: () => void;
  isMetaMask: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (eventName: string, callback: (param?: any) => void) => void;
};

interface Window {
  ethereum: MetamaskEthereum;
}
