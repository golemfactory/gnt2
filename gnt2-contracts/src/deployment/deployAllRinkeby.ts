import {Wallet, providers, utils} from 'ethers';
import {deployOldToken, wrapGNTtoGNTB} from './deployDevGolemContracts';
import {GolemNetworkTokenBatchingFactory} from '../../build/contract-types/GolemNetworkTokenBatchingFactory';
import {NewGolemNetworkTokenFactory} from '../../build/contract-types/NewGolemNetworkTokenFactory';
import {GNTDepositFactory} from '../..';

import {writeFile} from 'fs';

const infuraAddress = 'https://rinkeby.infura.io/v3/e9c991e7745b46908ce2b091a4cf643a';
const walletPrivateKeyAddress = '0xACE228774FDCDD8CEF12E94FE561747C7CD3601C9119AA389ECB43D9909E0BDC';

const delay = 48 * 60 * 60;

async function deployAllContracts() {
  const provider = new providers.JsonRpcProvider(infuraAddress);
  const deployer = new Wallet(walletPrivateKeyAddress, provider);

  console.log(`Deploying GNT ...`);
  const {token: oldGNT, holderSignedToken} = await deployOldToken(provider, deployer, deployer);
  console.log(`GNT deployed at address: ${oldGNT.address}`);

  console.log(`Deploying GNTB ...`);
  const GNTB = await new GolemNetworkTokenBatchingFactory(deployer).deploy(oldGNT.address);
  console.log(`GNTB deployed at address: ${GNTB.address}`);

  console.log(`Deploying deposit contract ...`);
  const GNTD = await new GNTDepositFactory(deployer).deploy(GNTB.address, oldGNT.address, deployer.address, delay);
  console.log(`Deposit contract deployed at address: ${GNTD.address}`);

  console.log(`Deploying NGNT ...`);
  const NGNT = await new NewGolemNetworkTokenFactory(deployer).deploy();
  console.log(`NGNT deployed at address: ${NGNT.address}`);

  console.log(`Wrapping oldGNT to GNTB ...`);
  const wrapHash = await wrapGNTtoGNTB(deployer, GNTB, holderSignedToken, utils.parseUnits('10000000').toString());
  console.log(`done. hash: ${wrapHash.hash}`);

  console.log(`Transfer funds to deposit ...`);
  const depositHash = await GNTB.transferAndCall(GNTD.address, utils.parseUnits('100'), [], {gasLimit: 100000});
  console.log(`done. hash: ${depositHash.hash}`);

  const data = {
    deployer: {
      publicKey: deployer.address,
      privateKey: deployer.privateKey
    },
    addresses: {
      oldGNT: oldGNT.address,
      GNTB: GNTB.address,
      GNTD: GNTD.address,
      NGNT: NGNT.address
    }
  };

  writeFile('deploy.json', JSON.stringify({data}), (err) => err && console.log(JSON.stringify(err)));
}

deployAllContracts();
