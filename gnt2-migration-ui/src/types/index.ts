type MetamaskEthereum = {
  send: (eventName: string) => Chain;
  isMetaMask: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (eventName: string, callback: (param?: any) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(eventName: string, callback: (param?: any) => void): void;
};

interface Window {
  ethereum: MetamaskEthereum;
}

type Callback = () => void;

interface Chain {
  id: number;
  jsonrpc: string;
  result: string;
}
