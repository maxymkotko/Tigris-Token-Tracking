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

import { tigusdLogo, usdtLogo, ArbiScanSvg } from '../../../config/images';

export const NETWORK = {
  network_id: 42161,
  name: 'Arbitrum',
  rpc: 'https://arb1.arbitrum.io/rpc',
  layerzero: 110,
  addresses: {
    positions: '0x09D74999e5315044956ad15D5F2Aeb8d393E85eD',
    trading: '0xd89B4B1C8918150f137cc68E83E3876F9e309aB9',
    tradinglibrary: '0xFd30d872B0eecBf0D12dDb957129ea8FF4d4BA3E',
    pairscontract: '0xB93e43C81CE6D23209932ff25E0953b1e4cd2043',
    nftsale: '0x8Ad92Ba1B0F3d208Bbd9e4882fC9a07c00F81f42',
    treasury: '0xF416C2b41Fb6c592c9BA7cB6B2f985ed593A51d7',
    govnft: '0x303c470c0e0342a1CCDd70b0a17a14b599FF1474',
    staking: '0x6E8BFBb31A46D0F5502426050Ea28b19F8E761f4',
    referrals: '0x75C8C4913F35077e93C0c08C6Ea3B04F21F5cd9E',
    lock: '0x76e0c3bda3dD22A2cFDCdbCafdaC997927F80483',
    bond: '0x36D7B9907caEdD2a9acd761ae51fce5F6A03774e',
    tig: '0x3A33473d7990a605a88ac72A78aD4EFC40a54ADB',
    tigstaking: '0x6E8BFBb31A46D0F5502426050Ea28b19F8E761f4',
    xtig: '0xe1c41c487B2DefC8abCc4eD8B956adCDe3979d7c',
    options: '0x8895b0B946b3d5bCd7D1E9E31DCfaeB51644922A',
    tradenft: '0x4E0bb7b156eb236260C18F98fB7f83F647F9C1Dd',
    swapnft: '0x3C0924e5F2d793E8Db8C719C416C72EbD51847E1',
    forwarder: '0xEC75cf9a18eF82Fa7F8F2A7afAf2521cD998D757',
    lpstaking: '0x2349443D0CB8FaB1E40cC6aCD3C0eB25bc7ABf7D'
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
  icon: ArbiScanSvg,
  gasLimit: 7_000_000,
  proxyGas: "0.005",
  minProxyGas: 0.002,
  assets: [],
  vaults: [
    {
      name: 'USD',
      address: '0xe82fcefbDD034500B5862B4827CAE5c117f6b921',
      icon: tigusdLogo,
      baseTokenIndex: 0,
      marginTokenIndexes: [1],
    }
  ],
  marginAssets: [
    {
      name: 'tigUSD',
      address: '0x7E491F53bF807f836E2dd6C4A4FBd193e1913EFd',
      stablevault: '0xe82fcefbDD034500B5862B4827CAE5c117f6b921',
      vaultIndex: 0,
      decimals: 18,
      hasPermit: true,
      icon: tigusdLogo
    },
    {
      name: 'USDT',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      stablevault: '0xe82fcefbDD034500B5862B4827CAE5c117f6b921',
      vaultIndex: 0,
      decimals: 6,
      hasPermit: true,
      icon: usdtLogo
    }
  ]
};
