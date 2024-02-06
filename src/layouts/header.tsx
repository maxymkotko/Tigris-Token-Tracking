import React, { useEffect, useState } from 'react';
import { Avatar, Badge, Box, Button, Divider, IconButton, Modal } from '@mui/material';
import { styled } from '@mui/system';
import { Container } from '../components/Container';
import { GasStationSvg, FullLogo } from '../../src/config/images';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { a11yProps } from '../components/TabPanel';
import { useStore } from '../context/StoreContext';
import { NotificationsNone, Person, Dehaze, Search, Close, Translate, NavigateBefore } from '@mui/icons-material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork } from 'wagmi';
import { LanguageList } from '../components/List/Language';
import { CurrencyList } from '../components/List/Currency';
import { NavList } from '../components/List/NavList';
import { AccountSetting } from '../components/List/AccountSetting';
import { useNavigate } from 'react-router-dom';
import { TraderProfile } from 'src/context/profile';
import { getProxyAddress, checkProxyWallet } from 'src/proxy_wallet';
import NotificationMenu from 'src/components/Menu/NotificationMenu';
import { useGasBalance } from 'src/hook/useGasBalance';
import '../Rainbowkit.css';
import { WalletConnectButton } from 'src/components/WalletConnectButton';
import { XTigTab } from '../components/XTigTab';
import { formatEther } from 'viem';
import TranslateMenu from 'src/components/Menu/TranslateMenu';
import { useTranslation } from 'react-i18next';
import { GB, CN, JP } from 'country-flag-icons/react/3x2';
import { CustomConnectButton } from 'src/components/CustomConnectButton';

const CountryList = [
  {
    id: 0,
    name: 'EN',
    flag: <GB width={20} height={20} />
  },
  {
    id: 1,
    name: 'CN',
    flag: <CN width={20} height={20} />
  },
  {
    id: 2,
    name: 'JP',
    flag: <JP width={20} height={20} />
  }
];

export const Header = () => {
  const navigate = useNavigate();
  const { page, setPage, setMiniPage, lang, setLang } = useStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [notiData, setNotiData] = useState<string[]>([]);
  const [notiCount, setNotiCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shellAddress, setShellAddress] = useState(getProxyAddress());
  const [transAnchorEl, setTransAnchorEl] = useState<null | HTMLElement>(null);
  const [country, setCountry] = useState(CountryList[0]);
  const isTranslateOpen = Boolean(transAnchorEl);

  useEffect(() => {
    const language = lang;
    switch (language) {
      case 'English':
        setCountry(CountryList[0]);
        break;
      case '中文':
        setCountry(CountryList[1]);
        break;
      case '日本語':
        setCountry(CountryList[2]);
        break;
      default:
        break;
    }
  }, [lang]);

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { t } = useTranslation();

  const [gasBalanceData, setGasBalanceData] = useState<any>({ formatted: '0', symbol: 'ETH' });
  const liveGasBalance = useGasBalance();
  useEffect(() => {
    checkProxyWallet(address as string).then();
    const x = async () => {
      if (liveGasBalance === undefined || liveGasBalance !== gasBalanceData) {
        setShellAddress(getProxyAddress());
        setGasBalanceData({
          formatted: formatEther((liveGasBalance ?? 0) as bigint),
          symbol: chain?.id === 137 ? 'MATIC' : 'ETH'
        });
      }
    };
    const interval = setInterval(() => {
      x();
    }, 1000);

    return () => clearInterval(interval);
  }, [liveGasBalance, address, chain, gasBalanceData, shellAddress]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPage(newValue);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        fetch(`https://notifications.tigristrade.info/notification/data/${chain?.id}/${address}`).then((response) => {
          response.json().then((data) => {
            setNotiData(data);
            setNotiCount(data.length);
          });
        });
      } else {
        setNotiData([]);
        setNotiCount(0);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotiCount(0);
    setAnchorEl(event.currentTarget);
  };

  const handleTransClick = (event: React.MouseEvent<HTMLElement>) => {
    setTransAnchorEl(event.currentTarget);
  };

  const style = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: 340,
    maxHeight: '100vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    overflow: 'auto'
  };

  return (
    <>
      <HeaderContainer>
        <Container>
          <ContainerWrapper>
            <TigrisLogo
              onClick={() => {
                setPage(0);
                setMiniPage(0);
                navigate('/');
              }}
            >
              <Img src={FullLogo} alt="tigris-logo" />
            </TigrisLogo>
            <ActiveBar>
              <TabContainer>
                <Tabs
                  TabIndicatorProps={{ style: { height: '0px' } }}
                  value={page}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  {/* <CustomTab
                    label={t('header.Options')}
                    {...a11yProps(0)}
                    onClick={() => {
                      setMiniPage(0);
                      navigate('/');
                    }}
                    style={{ color: page === 1 ? '#FFFFFF' : '#B1B5C3', fontWeight: page === 0 ? 500 : 400 }}
                    disableRipple
                  /> */}
                  {/* <CustomTab
                    label={t('header.Referral')}
                    {...a11yProps(1)}
                    onClick={() => {
                      setMiniPage(0);
                      navigate('/');
                    }}
                    style={{ color: page === 4 ? '#FFFFFF' : '#B1B5C3', fontWeight: page === 3 ? 500 : 400 }}
                    disableRipple
                  /> */}
                </Tabs>
              </TabContainer>
              <MobileTab onClick={() => setModalOpen(true)}>
                <Dehaze />
              </MobileTab>
              <Actions>
                {/* <XTigTabWrapper
                  onClick={() => {
                    setPage(5);
                  }}
                >
                  <XTigTab />
                </XTigTabWrapper> */}
                {isConnected ? (
                  <ShellButton onClick={() => navigate('/proxy')}>
                    <img src={GasStationSvg} alt="gas-station" style={{ width: '20px', height: '20px' }} />
                    <GasAmount>
                      {gasBalanceData ? gasBalanceData?.formatted.slice(0, 6) : '0'} {chain?.nativeCurrency.symbol}
                    </GasAmount>
                  </ShellButton>
                ) : (
                  <></>
                )}
                {/* <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} /> */}
                <CustomConnectButton />
                <IconButton
                  onClick={() => {
                    navigate('/profile/' + (TraderProfile().username as string));
                  }}
                  sx={{ marginLeft: 1 }}
                >
                  <Avatar sx={{ width: 30, height: 30 }}>
                    <Person />
                  </Avatar>
                </IconButton>
                <FlagButton onClick={handleTransClick}>
                  <FlagName>
                    {country.flag}
                    {country.name}
                  </FlagName>
                  {isTranslateOpen ? (
                    <NavigateBefore sx={{ transform: 'rotate(90deg)' }} />
                  ) : (
                    <NavigateBefore sx={{ transform: 'rotate(-90deg)' }} />
                  )}
                </FlagButton>
                <IconButton aria-label="alarm" component="label" sx={{ marginRight: 1 }} onClick={handleBellClick}>
                  <Badge
                    badgeContent={notiCount}
                    color="success"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                  >
                    <NotificationsNone />
                  </Badge>
                </IconButton>
              </Actions>
            </ActiveBar>
            <MobileActiveBar>
              <IconButton aria-label="alarm" component="label">
                <Search />
              </IconButton>

              <IconButton aria-label="alarm" component="label" sx={{ marginRight: 1 }} onClick={handleBellClick}>
                <Badge
                  badgeContent={notiCount}
                  color="success"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                >
                  <NotificationsNone />
                </Badge>
              </IconButton>

              <IconButton aria-label="alarm" component="label" onClick={() => setModalOpen(true)}>
                <Dehaze />
              </IconButton>
            </MobileActiveBar>
          </ContainerWrapper>
        </Container>
      </HeaderContainer>
      <Modal
        keepMounted
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <ModalContainer>
            <IconButton sx={{ width: 40, height: 40 }} onClick={() => setModalOpen(false)}>
              <Close />
            </IconButton>
            <WalletConnectButton />
            {/* </WalletButtons> */}
            <MobileShellButton onClick={() => navigate('/proxy')}>
              <img src={GasStationSvg} alt="gas-station" style={{ width: '20px', height: '20px' }} />
              <GasAmount>
                {gasBalanceData ? gasBalanceData?.formatted.slice(0, 6) : '0'} {chain?.nativeCurrency.symbol}
              </GasAmount>
            </MobileShellButton>
          </ModalContainer>
          <LanguageList />
          <CurrencyList />
          <Divider />
          <NavList />
          <Divider />
          <AccountSetting />
          <NotificationMenu state={anchorEl} setState={setAnchorEl} data={notiData} />
          <TranslateMenu
            state={transAnchorEl}
            setState={setTransAnchorEl}
            setCountry={setCountry}
            countryList={CountryList}
          />
        </Box>
      </Modal>
    </>
  );
};

const HeaderContainer = styled(Box)({
  height: '60px',
  borderBottom: '1px solid #2E2E30',
  backgroundColor: '#161221'
});

const ContainerWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  justifyContent: 'inherit',
  [theme.breakpoints.down('tablet')]: {
    justifyContent: 'space-between'
  }
}));

const TigrisLogo = styled(Box)({
  width: '200px',
  height: 'auto',
  cursor: 'pointer',
  marginBottom: '-5px',
  paddingLeft: '20px'
});

const Img = styled('img')({
  width: 'auto',
  height: '30px'
});

const ActiveBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  [theme.breakpoints.down('tablet')]: {
    display: 'none'
  }
}));

const MobileTab = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  display: 'none',
  [theme.breakpoints.down(1280)]: {
    display: 'block'
  }
}));

const TabContainer = styled(Box)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  [theme.breakpoints.down(1280)]: {
    display: 'none'
  }
}));

const CustomTab = styled(Tab)({
  color: '#ffffff',
  textTransform: 'none',
  disableRipple: 'true',
  disableFocusRipple: 'true'
});

const Actions = styled(Box)({
  display: 'flex',
  alignItems: 'center'
});

const MobileActiveBar = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('tablet')]: {
    display: 'flex',
    alignItems: 'center'
  }
}));

const ShellButton = styled(Button)(({ theme }) => ({
  border: '1px solid #FFFFFF',
  background: '#191B1F',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: 9,
  marginRight: '12px'
}));

const MobileShellButton = styled(Button)(({ theme }) => ({
  border: '1px solid #FFFFFF',
  borderRadius: '0px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const GasAmount = styled(Box)(({ theme }) => ({
  fontWeight: '500',
  fontSize: '15px',
  lineHeight: '14px'
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  padding: '1rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
}));

const XTigTabWrapper = styled(Box)(({ theme }) => ({
  alignItems: 'center'
}));

const TranslateDropDown = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginLeft: '10px',
  cursor: 'pointer'
}));

const FlagName = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const FlagButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  background: '#232031',
  borderRadius: '4px',
  padding: '8px 10px',
  margin: '0 6px'
}));
