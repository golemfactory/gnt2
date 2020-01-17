type MetamaskEthereum = {
  send: () => void;
  isMetaMask: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (eventName: string, callback: (param?: any) => void) => void;
  networkVersion: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(eventName: string, callback: (param?: any) => void): void;
};

interface Window {
  ethereum: MetamaskEthereum;
}

type Callback = () => void;
