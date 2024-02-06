/* eslint-disable */
import { NETWORK as POLYGON } from './polygon-main/index';
import { NETWORK as ARBITRUM } from './arbitrum/index';
import { NETWORK as METER } from './meter/index';
import {tigusdLogo, daiLogo, usdtLogo, tigethLogo, ethLogo, tigbtcLogo, btcLogo} from '../../config/images';
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
  TRADENFT_ABI,
  LOCK_ABI,
  BOND_ABI,
  TIG_ABI,
  XTIG_ABI,
  SWAP_ABI,
  FORWARDER_ABI,
  OPTIONS_ABI, LPSTAKING_ABI
} from '../abis';

export const getNetwork = (networkId: any) => {
  switch (networkId) {
    case 137:
      return POLYGON;
    case 42161:
      return ARBITRUM;
    case 82:
      return METER;
    default:
      return {
        network_id: 0,
        name: 'Unsupported',
        rpc: '',
        icon: 'assets/images/unsupported.png',
        layerzero: 0,
        gasLimit: 10_000_000,
        addresses: {
          positions: '',
          trading: '',
          tradinglibrary: '',
          pairscontract: '',
          referrals: '',
          treasury: '0xF416C2b41Fb6c592c9BA7cB6B2f985ed593A51d7',
          nftsale: '',
          govnft: '0x',
          options: '',
          tradenft: '',
          lock: '',
          bond: '',
          tig: '',
          tigstaking: '',
          xtig: '',
          swapnft: '',
          forwarder: '',
          lpstaking: '',
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
        proxyGas: '0.01',
        minProxyGas: 0.002,
        assets: [
          {
            name: 'BTC/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 2
          },
          {
            name: 'ETH/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 2
          },
          {
            name: 'XAU/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 2
          },
          {
            name: 'MATIC/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'LINK/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.00075,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'EUR/USD',
            minPosition: 2500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'GBP/USD',
            minPosition: 2500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'USD/JPY',
            minPosition: 2500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 3
          },
          {
            name: 'RUB/USD',
            minPosition: 2500,
            minLev: 2,
            maxLev: 10,
            fee: 0.005,
            defaultLev: 10,
            defaultMargin: 50,
            decimals: 5
          },
          {
            name: 'OLDUSD/CHF',
            minPosition: 2500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'USD/CAD',
            minPosition: 2500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'ETH/BTC',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 6
          },
          {
            name: 'OLDXRP/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'BNB/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.00075,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 3
          },
          {
            name: 'ADA/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'ATOM/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 4
          },
          {
            name: 'HBAR/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 6
          },
          {
            name: 'TRX/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 6
          },
          {
            name: 'SOL/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 4
          },
          {
            name: 'DOGE/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.00075,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 7
          },
          {
            name: 'LTC/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.00075,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 4
          },
          {
            name: 'BCH/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 3
          },
          {
            name: 'ETC/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 3
          },
          {
            name: 'DOT/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'XMR/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.00075,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 3
          },
          {
            name: 'SHIB/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 9
          },
          {
            name: 'AVAX/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 4
          },
          {
            name: 'UNI/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'XLM/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 7
          },
          {
            name: 'NEAR/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'ALGO/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'ICP/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 3
          },
          {
            name: 'XAG/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0005,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 4
          },
          {
            name: 'LINK/BTC',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 7
          },
          {
            name: 'XMR/BTC',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 6
          },
          {
            name: 'ARB/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.00075,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 6
          },
          {
            name: 'PEPE/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 10
          },
          {
            name: 'GMX/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.00075,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 4
          },
          {
            name: 'XRP/USD',
            minPosition: 500,
            minLev: 2,
            maxLev: 100,
            fee: 0.0009,
            defaultLev: 100,
            defaultMargin: 25,
            decimals: 6
          },
          {
            name: 'USD/CHF',
            minPosition: 12500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'USD/CNH',
            minPosition: 12500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 5
          },
          {
            name: 'USD/MXN',
            minPosition: 12500,
            minLev: 4,
            maxLev: 500,
            fee: 0.0001,
            defaultLev: 500,
            defaultMargin: 25,
            decimals: 5
          }
        ],
        vaults: [
          {
            name: 'USD',
            address: '',
            icon: tigusdLogo,
            baseTokenIndex: 0,
            marginTokenIndexes: [1, 2]
          },
          {
            name: 'ETH',
            address: '',
            icon: tigethLogo,
            baseTokenIndex: 3,
            marginTokenIndexes: [4]
          },
          {
            name: 'BTC',
            address: '',
            icon: tigbtcLogo,
            baseTokenIndex: 5,
            marginTokenIndexes: [6]
          }
        ],
        marginAssets: [
          {
            name: 'tigUSD',
            address: '',
            stablevault: '',
            vaultIndex: 0,
            decimals: 18,
            hasPermit: false,
            icon: tigusdLogo
          },
          {
            name: 'DAI',
            address: '',
            stablevault: '',
            vaultIndex: 0,
            decimals: 18,
            hasPermit: false,
            icon: daiLogo
          },
          {
            name: 'USDT',
            address: '',
            stablevault: '',
            vaultIndex: 0,
            decimals: 6,
            hasPermit: false,
            icon: usdtLogo
          },
          {
            name: 'tigETH',
            address: '',
            stablevault: '',
            vaultIndex: 1,
            decimals: 18,
            hasPermit: false,
            icon: tigethLogo
          },
          {
            name: 'WETH',
            address: '',
            stablevault: '',
            vaultIndex: 1,
            decimals: 18,
            hasPermit: false,
            icon: ethLogo
          },
          {
            name: 'tigBTC',
            address: '',
            stablevault: '',
            vaultIndex: 2,
            decimals: 18,
            hasPermit: false,
            icon: tigbtcLogo
          },
          {
            name: 'WBTC',
            address: '',
            stablevault: '',
            vaultIndex: 2,
            decimals: 8,
            hasPermit: false,
            icon: btcLogo
          }
        ],
      };
  }
};
