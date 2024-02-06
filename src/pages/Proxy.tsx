import { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import { Container } from 'src/components/Container';
import { Notification } from 'src/components/Notification';
import { useAccount, useNetwork, usePublicClient, useWalletClient } from 'wagmi';
import { getProxyAddress, checkProxyWallet } from 'src/proxy_wallet';
import { getNetwork } from 'src/constants/networks';
import { toast } from 'react-toastify';
import { VaultInput } from 'src/components/Input';
import { PolygonSvg, ethLogo } from 'src/config/images';
import { useFundGas, useGasBalance, useWithdrawGas } from 'src/hook/useGasBalance';
import { formatEther } from 'viem';
import { LogError } from '../context/ErrorLogs';
import { useTranslation } from 'react-i18next';

export const Proxy = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { proxyGas } = getNetwork(chain?.id ?? 42161);
  const { t } = useTranslation();
  const publicClient = usePublicClient();

  const [editState, setEditState] = useState({
    fundValue: proxyGas
  });

  const [shellAddress, setShellAddress] = useState('Loading...');
  const [gasBalanceData, setGasBalanceData] = useState<any>({ formatted: '0', symbol: 'ETH' });
  const liveGasBalance = useGasBalance();
  const [withdrawGas] = useWithdrawGas();
  const [fundGas] = useFundGas(editState.fundValue);
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    checkProxyWallet(address as string);
    // unlockShellWallet();
    setShellAddress(getProxyAddress());
    setGasBalanceData({
      formatted: formatEther((liveGasBalance ?? 0) as bigint),
      symbol: chain?.id === 137 ? 'MATIC' : 'ETH'
    });
  }, [liveGasBalance, address, chain]);

  const handleEditState = (prop: string, value: any) => {
    setEditState({
      ...editState,
      [prop]: value
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*?)\..*/g, '$1')
        .replace(/^0[^.]/, '0')
    });
  };

  function handleSendGasBack() {
    sendGasBackToWallet();
  }

  async function sendGasBackToWallet() {
    if (address === undefined) {
      toast.dismiss();
      toast.error(t('Wallet not connected!'));
      return;
    }
    try {
      if (withdrawGas === undefined) {
        toast.dismiss();
        toast.error(t('Wallet not connected!'));
        return;
      }
      await withdrawGas();
    } catch (err: any) {
      console.log(err);
      toast.dismiss();
      toast.error(err);
    }
  }

  function handleFundShell() {
    fundShell();
  }
  async function fundShell() {
    if (address === undefined) {
      toast.dismiss();
      toast.error('Wallet not connected!');
      return;
    }
    if (walletClient === undefined || walletClient === null) {
      toast.dismiss();
      toast.error(t('Wallet not connected!'));
      return;
    }
    try {
      if (fundGas === undefined) {
        toast.dismiss();
        toast.error('Not enough ' + (chain?.id === 137 ? 'MATIC' : 'ETH') + ' in wallet!');
        return;
      }
      const traderGas = await publicClient.getBalance({ address: address });
      if (Number(traderGas) / 1e18 < Number(editState.fundValue)) {
        LogError(address, 'NO_GAS', false, 0, 'FUND_PROXY');
        toast.error(`Need at least ${editState.fundValue} ${chain?.id === 137 ? 'MATIC' : 'ETH'} to fund gas!`);
        return;
      }
      await fundGas();
    } catch (err: any) {
      toast.error(err);
    }
  }

  function copy() {
    navigator.clipboard.writeText(shellAddress);
  }

  const handleAddressClick = () => {
    let newLink = '';
    if (shellAddress !== undefined && isConnected) {
      if (chain?.id === 137) {
        newLink = 'https://polygonscan.com/address/';
      } else if (chain?.id === 42161) {
        newLink = 'https://arbiscan.io/address/';
      } else if (chain?.id === 421613) {
        newLink = 'https://goerli.arbiscan.io/address/';
      } else if (chain?.id === 82) {
        newLink = 'https://scan.meter.io/address/';
      } else {
        newLink = 'https://etherscan.io/';
      }
      window.open(`${newLink}${shellAddress}`, '_blank');
    } else {
      window.open('https://etherscan.io/', '_blank');
    }
  };

  return (
    <Container>
      <ProxyContainer>
        <ShellWalletMedia>
          <MediaBar>{t('Proxy Wallet')}</MediaBar>
          <MediaContent>
            <Notification
              content={t(
                'Proxy wallet is a frontend wallet that enables instant one-click trades. You need to fund the wallet with MATIC on Polygon or ETH on Arbitrum to start trading'
              )}
            />
            <AddressSection>
              <p>{t('Address')}</p>
              <DesktopAddress
                onClick={() => handleAddressClick()}
                style={{ color: '#3772FF', fontSize: '14px', textTransform: 'capitalize' }}
              >
                {isConnected ? shellAddress : t('Wallet not connected!')}
              </DesktopAddress>
              <MobileAddress onClick={() => handleAddressClick()}>
                {isConnected ? shellAddress : t('Wallet not connected!')}
              </MobileAddress>
            </AddressSection>
            <CopyAddressButton onClick={() => copy()}>{t('Copy proxy wallet address')}</CopyAddressButton>
          </MediaContent>
        </ShellWalletMedia>
        <ShellWalletAction>
          <GasBalanceContainer>
            <GasBalance>
              {gasBalanceData ? gasBalanceData?.formatted.slice(0, 6) : '0'} {chain?.nativeCurrency.symbol}
            </GasBalance>
            <p style={{ color: '#B1B5C3', fontSize: '15px', lineHeight: '20px' }}>{t('Proxy wallet gas balance')}</p>
          </GasBalanceContainer>
          <ButtonGroup>
            <InputFieldContainer>
              <VaultInput
                name="fundValue"
                type="text"
                value={editState.fundValue}
                setValue={handleEditState}
                placeholder={'0'}
                component={<TokenUnit symbol={chain?.nativeCurrency.symbol} />}
              />
              <SendGasButton onClick={() => handleFundShell()}>{t('Fund proxy wallet')}</SendGasButton>
            </InputFieldContainer>
            <WithdrawButton onClick={() => handleSendGasBack()}>{t('Withdraw balance')}</WithdrawButton>
          </ButtonGroup>
        </ShellWalletAction>
      </ProxyContainer>
    </Container>
  );
};

const ProxyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '13px',
  paddingTop: '70px',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  [theme.breakpoints.down(768)]: {
    paddingLeft: '20px',
    paddingRight: '20px'
  },
  [theme.breakpoints.down('xs')]: {
    paddingLeft: '0',
    paddingRight: '0'
  }
}));

const RecoverContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '13px',
  paddingBottom: '20px',
  paddingTop: '20px',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    alignItems: 'center'
  },
  [theme.breakpoints.down(768)]: {
    paddingLeft: '20px',
    paddingRight: '20px'
  },
  [theme.breakpoints.down('xs')]: {
    paddingLeft: '0',
    paddingRight: '0'
  }
}));

const ShellWalletMedia = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  width: '550px',
  [theme.breakpoints.down('lg')]: {
    width: '100%'
  }
}));

const RecoverBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  width: '964px',
  [theme.breakpoints.down('lg')]: {
    width: '100%'
  }
}));

const MediaBar = styled(Box)(({ theme }) => ({
  padding: '15px 23px',
  fontSize: '12px',
  lineHeight: '20px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  backgroundColor: '#161221'
}));

const MediaContent = styled(Box)(({ theme }) => ({
  padding: '23px',
  display: 'flex',
  flexDirection: 'column',
  gap: '23px',
  backgroundColor: '#161221'
}));

const AddressSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: '12px',
  lineHeight: '24px',
  color: '#B1B5C3',
  padding: '0 4px',
  [theme.breakpoints.down(520)]: {
    flexDirection: 'column'
  }
}));

const CopyAddressButton = styled(Button)(({ theme }) => ({
  borderRadius: '0px',
  backgroundColor: '#3772FF',
  '&:hover': {
    backgroundColor: '#3772FF'
  },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '40px',
  width: '100%',
  textTransform: 'none',
  fontSize: '14px',
  lineHeight: '24px'
}));

const ShellWalletAction = styled(Box)(({ theme }) => ({
  //   width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alingItems: 'center',
  backgroundColor: '#161221',
  width: '400px',
  [theme.breakpoints.down('lg')]: {
    width: '100%'
  }
}));

const GasBalanceContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '10px',
  padding: '28px',
  borderBottom: '1px solid #1F2332'
}));

const GasBalance = styled(Box)(({ theme }) => ({
  fontSize: '25px',
  lineHeight: '33px',
  fontWeight: '500'
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  padding: '28px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
}));

const SendGasButton = styled(Button)(({ theme }) => ({
  marginT: '10px',
  backgroundColor: '#3772FF',
  borderRadius: '0px',
  width: '100%',
  height: '40px',
  textTransform: 'none',
  border: '1px solid #3772FF',
  fontSize: '12px',
  lineHeight: '24px',
  fontWeight: '400',
  '&:hover': {
    backgroundColor: '#3772FF'
  },
  [theme.breakpoints.down(1024)]: {
    fontSize: '14px'
  },
  [theme.breakpoints.down(490)]: {
    fontSize: '12px'
  },
  [theme.breakpoints.down(400)]: {
    fontSize: '10px'
  },
  [theme.breakpoints.down(360)]: {
    fontSize: '14px'
  }
}));

const WithdrawButton = styled(Button)(({ theme }) => ({
  marginT: '10px',
  backgroundColor: 'none',
  borderRadius: '0px',
  width: '100%',
  height: '40px',
  textTransform: 'none',
  border: '1px solid #ffffff',
  fontSize: '14px',
  lineHeight: '24px',
  fontWeight: '400'
}));

const DesktopAddress = styled(Box)(({ theme }) => ({
  color: '#3772FF',
  fontSize: '14px',
  textTransform: 'capitalize',
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}));

const MobileAddress = styled(Box)(({ theme }) => ({
  color: '#3772FF',
  fontSize: '14px',
  textTransform: 'capitalize',
  display: 'none',
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    display: 'block'
  }
}));

const InputFieldContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  alignItems: 'center',
  [theme.breakpoints.down(360)]: {
    flexDirection: 'column'
  }
}));

interface TokenUnitProps {
  symbol?: string;
}

const TokenUnit = ({ symbol }: TokenUnitProps) => {
  let icon = ethLogo;
  if (symbol === 'ETH') {
    icon = ethLogo;
  } else if (symbol === 'MATIC') {
    icon = PolygonSvg;
  }
  return (
    <TokenUnitContainer>
      <TokenIcon src={icon} alt="token-icon" />
      <TokenName>{symbol}</TokenName>
    </TokenUnitContainer>
  );
};

const TokenIcon = styled('img')(({ theme }) => ({
  width: '20px',
  height: '20px'
}));

const TokenUnitContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
}));

const TokenName = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  [theme.breakpoints.down(1024)]: {
    fontSize: '14px'
  },
  [theme.breakpoints.down(490)]: {
    fontSize: '12px'
  },
  [theme.breakpoints.down(400)]: {
    fontSize: '10px'
  },
  [theme.breakpoints.down(360)]: {
    fontSize: '14px'
  }
}));
