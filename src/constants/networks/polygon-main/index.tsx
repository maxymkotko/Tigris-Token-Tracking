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
  LOCK_ABI,
  BOND_ABI,
  TIG_ABI,
  XTIG_ABI,
  SWAP_ABI,
  OPTIONS_ABI,
  TRADENFT_ABI,
  FORWARDER_ABI, LPSTAKING_ABI
} from '../../abis';

import { tigusdLogo, daiLogo, PolygonSvg } from '../../../config/images';

export const NETWORK = {
  network_id: 137,
  name: 'Polygon',
  rpc: 'https://polygon-rpc.com',
  layerzero: 109,
  addresses: {
    positions: '0xb60F2011d30b5b901d55a701C58f63aB34b4C23f',
    trading: '0xA35eabB4be62Ed07E88c2aF73234fe7dD48a73D4',
    tradinglibrary: '0xAf58aEf6ece14f8f7Ddcb3109638A19b7098Ce70',
    pairscontract: '0xdEe683A3A201597DC5d3059E8d4694001cE37832',
    nftsale: '0x1727FC1d930912FA075ff82741d9f50362350589',
    treasury: '0x4f7046f36B5D5282A94cB448eAdB3cdf9Ff2b051',
    govnft: '0x5DF98AA475D8815df7cd4fC4549B5c150e8505Be',
    staking: '0x5EbA69d5572F583b631E0E4F5608E167467c4BB3',
    referrals: '0x07d0FB12215bF3A3169d0cC54fC4DB467D686489',
    lock: '0x638e39D4a927EfE3040F0f6D4d27e4CccD8c996A',
    bond: '0xC5d9B681086b2617626B0Ed05A7D632660Fc99f4',
    tig: '0x7157fe7533f2fc77498755cc253d79046c746560',
    tigstaking: '0xC6c32eD781450228dFadfa49A430d7868B110F44',
    xtig: '0xF941293E521F494Ce9A53a6a288f723a6768f352',
    swapnft: '0x1F4BEa5860Ec1271d05111e724eEbdf9BCEaAEE0',
    options: '0xFeABeC2CaC8A1A2f1C0c181572aA88c8b91288B2',
    tradenft: '0x7B7ce91d7d69f49D86FCA80B034c6A103837CbB8',
    forwarder: '0x17eE6D3ec827863119698D125EFB3200B49e90c6',
    lpstaking: '0x399214eE22bF068ff207adA462EC45046468B766'
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
  icon: PolygonSvg,
  gasLimit: 2_000_000,
  proxyGas: "5",
  minProxyGas: 1,
  assets: [],
  vaults: [
    {
      name: 'USD',
      address: '0x3677415Dc23e49B7780ef46976F418F4a9d5031B',
      icon: tigusdLogo,
      baseTokenIndex: 0,
      marginTokenIndexes: [1]
    }
  ],
  marginAssets: [
    {
      name: 'tigUSD',
      address: '0x76973Ba2AFF24F87fFE41FDBfD15308dEBB8f7E8',
      stablevault: '0x3677415Dc23e49B7780ef46976F418F4a9d5031B',
      vaultIndex: 0,
      decimals: 18,
      hasPermit: true,
      icon: tigusdLogo
    },
    {
      name: 'DAI',
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      stablevault: '0x3677415Dc23e49B7780ef46976F418F4a9d5031B',
      vaultIndex: 0,
      decimals: 18,
      hasPermit: false,
      icon: daiLogo
    }
  ]
};
