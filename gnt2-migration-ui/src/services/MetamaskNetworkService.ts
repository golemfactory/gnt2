
export class MetamaskNetworkService {
  network: string | undefined;
  constructor(private globalEthereum: () => any) {
    this.network = this.globalEthereum().networkVersion;
    console.log(this.globalEthereum().networkVersion);

  }

  static create() {
    return new MetamaskNetworkService(() => window.ethereum as any);
  }

  getNetwork() {
    return this.globalEthereum().networkVersion;
  }
}
