export type Callback = () => void;

export interface Chain {
  id: number;
  jsonrpc: string;
  result: string;
}
