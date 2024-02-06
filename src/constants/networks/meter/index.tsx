/* eslint-disable */
import {
  POSITIONS_ABI,
  TRADING_ABI,
  ERC20_ABI,
  PAIR_ABI,
  VAULT_ABI,
  NFT_SALE,
  GOV_NFT,
  TRADINGLIBRARY_ABI,
  STAKING_ABI,
  REF_ABI,
  BOND_ABI,
  LOCK_ABI,
  TIG_ABI,
  XTIG_ABI,
  SWAP_ABI,
  TRADENFT_ABI,
  OPTIONS_ABI,
  FORWARDER_ABI, LPSTAKING_ABI
} from '../../abis';

import {tigusdLogo, usdtLogo, mtrgLogo, tigmtrgLogo} from '../../../config/images';

export const NETWORK = {
  network_id: 82,
  name: 'Meter',
  rpc: 'https://meter.blockpi.network/v1/rpc/public',
  layerzero: 176,
  addresses: {
    positions: '0x509C4854BEe2b099ba7fA9659134F67Fbf9672d3', //
    trading: '0xD1705f847b421b6C0bb31e649fBA1983257B77D3', //
    tradinglibrary: '0xE05F22c20A5841AcB8058d2F1ee39E7488BbB0E0', //
    pairscontract: '0x2F3B2ba7D71b0e4da086076c5A1beC90CB982EC8', //
    nftsale: '',
    treasury: '',
    govnft: '',
    staking: '',
    referrals: '0x6C2851177741a100a6279647c34f036A6E63B96b', //
    lock: '',
    bond: '',
    tig: '0xc797E9BB22D453Bc8ecdfe91E4548b39AbC6e0A7',
    tigstaking: '0x07bcF31D1E059c7d6B1db8e308513949fC6AAB46',
    xtig: '0x8987063e5F7c6aC3cA802e3B94391B1582181fA1', //
    options: '0xDa3662a982625e1f2649b0a1e571207C0D87B76E', //
    tradenft: '0xF3dC6FB10fA04486421a80b1729b9e325697D0f6',
    swapnft: '',
    forwarder: '0x71B3EdDD0628875C22ec49D8D1E0eEE20759945E',
    lpstaking: '0x4C468e762425eF58357845CDa2Be4A5f6f138348'
  },
  abis: {
    positions: POSITIONS_ABI,
    trading: TRADING_ABI,
    tradinglibrary: TRADINGLIBRARY_ABI,
    erc20: ERC20_ABI,
    pairscontract: PAIR_ABI,
    tigusdvault: VAULT_ABI,
    nftsale: NFT_SALE,
    govnft: GOV_NFT,
    staking: STAKING_ABI,
    referrals: REF_ABI,
    options: OPTIONS_ABI,
    tradenft: TRADENFT_ABI,
    lock: LOCK_ABI,
    bond: BOND_ABI,
    tig: TIG_ABI,
    xtig: XTIG_ABI,
    swapnft: SWAP_ABI,
    forwarder: FORWARDER_ABI,
    lpstaking: LPSTAKING_ABI
  },
  icon: mtrgLogo,
  gasLimit: 7_000_000,
  proxyGas: '1',
  minProxyGas: 0.1,
  assets: [],
  vaults: [
    {
      name: 'MTRG',
      address: '0xd417D7e0B2d795CAF96393bfdB22EB3D2E54534B',
      icon: tigmtrgLogo,
      baseTokenIndex: 0,
      marginTokenIndexes: [1]
    }
  ],
  marginAssets: [
    {
      name: 'tigMTRG',
      address: '0xE0Fb1Fd042428419E2A3D87B1F36DD7B9cC78d56',
      stablevault: '0xd417D7e0B2d795CAF96393bfdB22EB3D2E54534B',
      vaultIndex: 0,
      decimals: 18,
      hasPermit: true,
      icon: tigmtrgLogo
    },
    {
      name: 'MTRG',
      address: '0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3',
      stablevault: '0xd417D7e0B2d795CAF96393bfdB22EB3D2E54534B',
      vaultIndex: 0,
      decimals: 18,
      hasPermit: true,
      icon: mtrgLogo
    }
  ]
};
