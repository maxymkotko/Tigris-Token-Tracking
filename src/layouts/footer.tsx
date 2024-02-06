import { Box, Button, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { styled } from '@mui/system';
import { GoDotFill } from 'react-icons/go';
import { TbPlugConnectedX } from 'react-icons/tb';
import { Container } from '../components/Container';
import { GasStationSvg } from '../../src/config/images';
import { useFeeData } from 'wagmi';
import { RelayNode } from '../context/RelayNode';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const [latency, setLatency] = useState(0);
  const { data: feeData } = useFeeData({ watch: true });
  const [nodeUrl, setNodeUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(async () => {
      try {
        const result = await fetch(RelayNode + '/health?timestamp=' + String(Date.now()));
        const hostname = new URL(result.url).hostname;
        const ping = Date.now() - JSON.parse(await result.text()).timestamp;
        setNodeUrl(hostname);
        setLatency(ping);
        setIsActive(true);
      } catch {
        setIsActive(false);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [RelayNode]);

  return (
    <FooterContainer>
      <Container>
        <FooterWrapper>
          <FooterInfo>
            <TextCoin onClick={() => window.open('https://nodes.tigris.trade', '_blank')}>
              {isActive ? <GoDotFill color={'#7751FF'} /> : <TbPlugConnectedX color={'#FF0000'} />}

              {nodeUrl}
            </TextCoin>
            <SmallText sx={{ width: 'fit-content', textAlign: 'left' }}>
              {t('Ping')}: {latency} ms
            </SmallText>
            <GasFee>
              <img src={GasStationSvg} alt="gas-station" style={{ width: '12px', height: '12px' }} />
              <SmallText>
                {t('Gas Price')}: {(Number(feeData?.lastBaseFeePerGas) / 1e9).toFixed(2)} Gwei
              </SmallText>
            </GasFee>
          </FooterInfo>
          <Line />
          <FooterNav>
            <NavLinks>
              <SmallText sx={{ cursor: 'pointer' }} onClick={() => window.open('https://docs.tigris.trade', '_blank')}>
                {t('Docs')}
              </SmallText>
              <SmallText
                sx={{ cursor: 'pointer' }}
                onClick={() => window.open('https://discord.gg/9YqkK29Qx2', '_blank')}
              >
                Discord
              </SmallText>
              <SmallText
                sx={{ cursor: 'pointer' }}
                onClick={() => window.open('https://twitter.com/tigristrades', '_blank')}
              >
                Twitter
              </SmallText>
            </NavLinks>
            <SmallText>© 2024. {t('All rights reserved')}</SmallText>
          </FooterNav>
        </FooterWrapper>
      </Container>
    </FooterContainer>
  );
};

const FooterContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '50px',
  backgroundColor: '#13131D',
  alignItems: 'center',
  marginTop: '0px'
}));

const FooterWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

const FooterInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '2rem',
  minHeight: '50px',
  alignItems: 'center',
  marginRight: '2%',
  marginLeft: '2%',
  [theme.breakpoints.down('md')]: {
    justifyContent: 'space-between'
  },
  [theme.breakpoints.down('xs')]: {
    gap: '10px'
  }
}));

const TextCoin = styled(Button)(({ theme }) => ({
  display: 'flex',
  gap: '5px',
  alignItems: 'center',
  borderRadius: '4px',
  textTransform: 'none',
  background: '#1D1934',
  color: '#7751FF',
  fontSize: '12px',
  fontWeight: '500',
  lineHeight: '16px',
  '&:hover': {
    background: '#1D1934'
  }
}));

const Text = styled(Box)(({ theme }) => ({
  fontWeight: '500',
  fontSize: '12px',
  lineHeight: '20px',
  [theme.breakpoints.down('xs')]: {
    fontSize: '10px'
  }
}));

const SmallText = styled(Box)(({ theme }) => ({
  color: '#B1B5C3',
  fontWeight: '400',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center',
  [theme.breakpoints.down('xs')]: {
    fontSize: '10px'
  }
}));

const GasFee = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
}));

const FooterNav = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  minHeight: '50px',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginRight: '2%',
  marginLeft: '2%'
}));

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem'
}));

const Line = styled(Divider)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block'
  }
}));
