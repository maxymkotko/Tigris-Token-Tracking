import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Chain, RainbowKitProvider, connectorsForWallets, DisclaimerComponent, Theme } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  metaMaskWallet,
  ledgerWallet,
  walletConnectWallet,
  argentWallet,
  braveWallet,
  imTokenWallet,
  omniWallet,
  rainbowWallet,
  trustWallet,
  rabbyWallet,
  okxWallet
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import './Rainbowkit.css';
import './index.css';
import 'react-toastify/dist/ReactToastify.min.css';
import './toast.css';
import { mtrgLogo } from './config/images';

// eslint-disable-next-line @typescript-eslint/no-var-requires
window.Buffer = require('buffer').Buffer;

export const arbitrum: Chain = {
  id: 42161,
  name: 'Arbitrum',
  network: 'arbitrum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://arb1.arbitrum.io/rpc']
    },
    public: {
      http: ['https://arb1.arbitrum.io/rpc']
    },
    private: {
      http: ['https://arb-mainnet.g.alchemy.com/v2/UPlEA-oy7bCjKAtcNULRVoo3buQQDUH6']
    }
  },
  blockExplorers: {
    etherscan: { name: 'Arbiscan', url: 'https://arbiscan.io' },
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: 11_907_934
    }
  }
};

export const polygon: Chain = {
  id: 137,
  name: 'Polygon',
  network: 'matic',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://polygon-rpc.com']
    },
    public: {
      http: ['https://polygon-rpc.com']
    },
    private: {
      http: ['https://polygon-mainnet.g.alchemy.com/v2/ohUaxUBzQDB9HJp2PdWzwgN1zh5QB0FF']
    }
  },
  blockExplorers: {
    etherscan: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com'
    },
    default: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: 11_907_934
    }
  }
};

export const meter: Chain = {
  id: 82,
  name: 'Meter',
  network: 'meter',
  iconUrl: mtrgLogo,
  nativeCurrency: { name: 'MTR', symbol: 'MTR', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://meter.blockpi.network/v1/rpc/public']
    },
    public: {
      http: ['https://meter.blockpi.network/v1/rpc/public']
    },
    private: {
      http: ['https://meter.blockpi.network/v1/rpc/cbc400023333ad1da1e63e2b9531ca47f20c1c80']
    }
  },
  blockExplorers: {
    etherscan: {
      name: 'MeterScan',
      url: 'https://scan.meter.io'
    },
    default: {
      name: 'MeterScan',
      url: 'https://scan.meter.io'
    }
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
      blockCreated: 11_907_934
    }
  }
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [arbitrum, polygon, meter],
  [publicProvider()],
  {
    batch: { multicall: true }
  }
);

const projectID = 'c5751c18aa5397e9e0ea423d4b5dbe91';

const connectors = connectorsForWallets([
  {
    groupName: 'Select your wallet',
    wallets: [
      metaMaskWallet({ chains, shimDisconnect: true, projectId: projectID }),
      rabbyWallet({ chains, shimDisconnect: true }),
      trustWallet({ chains, shimDisconnect: true, projectId: projectID }),
      walletConnectWallet({ chains, projectId: projectID }),
      okxWallet({ chains, projectId: projectID }),
      ledgerWallet({ chains, projectId: projectID }),
      braveWallet({ chains }),
      argentWallet({ chains, projectId: projectID }),
      imTokenWallet({ chains, projectId: projectID }),
      omniWallet({ chains, projectId: projectID }),
      rainbowWallet({ chains, projectId: projectID }),
      injectedWallet({ chains, shimDisconnect: true })
    ]
  }
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const TigrisTheme: Theme = {
  blurs: {
    modalOverlay: 'none'
  },
  colors: {
    accentColor: '#232031',
    accentColorForeground: '#FFFFFF',
    actionButtonBorder: '#363A44',
    actionButtonBorderMobile: '#000000',
    actionButtonSecondaryBackground: '#000000',
    closeButton: '#FFFFFF',
    closeButtonBackground: '#23262F',
    connectButtonBackground: '#232031',
    connectButtonBackgroundError: '#232031',
    connectButtonInnerBackground: '#232031',
    connectButtonText: '#FFFFFF',
    connectButtonTextError: '#FFFFFF',
    connectionIndicator: 'green',
    downloadBottomCardBackground: '#FFFFFF',
    downloadTopCardBackground: '#FFFFFF',
    error: '#FFFFFF',
    generalBorder: '#363A44',
    generalBorderDim: '#363A44',
    menuItemBackground: '#363A44',
    modalBackdrop: 'rgba(0,0,0,0.5)',
    modalBackground: '#161221',
    modalBorder: '#363A44',
    modalText: '#FFFFFF',
    modalTextDim: '#FFFFFF',
    modalTextSecondary: '#FFFFFF',
    profileAction: '#23262F',
    profileActionHover: '#363A44',
    profileForeground: '#161221',
    selectedOptionBorder: '#363A44',
    standby: '#000000'
  },
  fonts: {
    body: '...'
  },
  radii: {
    actionButton: '...',
    connectButton: '...',
    menuButton: '...',
    modal: '...',
    modalMobile: '...'
  },
  shadows: {
    connectButton: '...',
    dialog: '...',
    profileDetailsAction: '...',
    selectedOption: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    selectedWallet: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    walletLogo: '...'
  }
};

interface DisclaimerProps {
  Text: any;
  Link: any;
}
const Disclaimer: DisclaimerComponent = ({ Text, Link }: DisclaimerProps) => (
  <Text>
    New to Tigris Trade?
    <Link href="https://docs.tigris.trade"> Click here to read Tigris Trade documentation.</Link>
  </Text>
);

root.render(
  <WagmiConfig config={wagmiConfig} i18nIsDynamicList={true}>
    <RainbowKitProvider
      locale={'en-US'}
      i18nIsDynamicList={true}
      chains={chains}
      theme={TigrisTheme}
      modalSize="compact"
      appInfo={{
        appName: 'Tigris Trade',
        disclaimer: Disclaimer
      }}
    >
      <App />
    </RainbowKitProvider>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
