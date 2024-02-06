import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { Container } from '../../src/components/Container';
import { OptionsTokenDetails } from '../../src/components/OptionsTokenDetails';
import TradingChart from '../../src/components/TradingChart/TradingChart';
import { OptionsOrderForm } from '../../src/components/OptionsOrderForm';
import { Chatbox } from '../../src/components/Chatbox';
import { useStore } from '../../src/context/StoreContext';
import { Cumulative } from './MiniPage/Cumulative';
import { TraderProfile } from 'src/context/profile';
import { PairSelectionTable } from 'src/components/PairSelectionTable';
import { useAccount, useNetwork } from 'wagmi';
import { OptionsTradesData } from 'src/components/Table/OptionsTradesData';
import { OptionsTradesTable } from 'src/components/OptionsTradesTable';
import { ChartMechanicsProvider } from 'src/context/ChartMechanics';
import { FeeSettingsProvider } from 'src/context/FeeSettings';

export const Options = () => {
  const { optionsTradesData } = OptionsTradesData();

  const [pairIndex, setPairIndex] = useState(
    localStorage.getItem('LastPairSelected') !== null ? parseInt(localStorage.getItem('LastPairSelected') as string) : 0
  );
  const { miniPage } = useStore();

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  useEffect(() => {
    if (localStorage.getItem('FavPairs') === null) localStorage.setItem('FavPairs', '["BTC/USD", "ETH/USD"]');
  }, []);

  useEffect(() => {
    TraderProfile();
  }, [address, chain]);

  useEffect(() => {
    console.log(optionsTradesData);
  }, [optionsTradesData]);

  return (
    <TradeContainer>
      {miniPage === 0 && (
        <>
          <Chatbox />
          <Container>
            <FeeSettingsProvider>
              <ChartMechanicsProvider>
                <TradingForm>
                  <TradingSection>
                    <TokenDetailContainer>
                      <OptionsTokenDetails pairIndex={pairIndex} setPairIndex={setPairIndex} />
                      {/* <PairTableContainer>
                        <PairSelectionTable isMobile={false} setPairIndex={setPairIndex} />
                      </PairTableContainer> */}
                    </TokenDetailContainer>
                    <TradingChart asset={pairIndex} positionData={optionsTradesData} showBidAsk={false} />
                  </TradingSection>
                  <OrderFormContainer>
                    <OptionsOrderForm pairIndex={pairIndex} />
                  </OrderFormContainer>
                </TradingForm>
                <OptionsTradesTable setPairIndex={setPairIndex} optionsTradesData={optionsTradesData} />
              </ChartMechanicsProvider>
            </FeeSettingsProvider>
          </Container>
        </>
      )}
      {miniPage === 1 && <Cumulative />}
    </TradeContainer>
  );
};

const TradeContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'hidden'
});

const TradingForm = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: '8px',
  display: 'grid',
  gridTemplateColumns: '3fr 0fr',
  marginBottom: '8px',
  gap: '8px',
  [theme.breakpoints.down(1280)]: {
    gridTemplateColumns: '1fr',
    gap: '0px'
  }
}));

const TradingSection = styled(Box)(({ theme }) => ({
  width: '100%',
  gap: '8px',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('desktop')]: {
    gridColumn: '1 / 3',
    order: 1
  },
  [theme.breakpoints.down('md')]: {
    marignTop: '8px'
  }
}));

const TokenDetailContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
}));

const OrderFormContainer = styled(Box)(({ theme }) => ({
  width: '400px',
  // maxWidth: '400px',
  height: '100%',
  [theme.breakpoints.down('desktop')]: {
    order: 2,
    // maxWidth: '500px',
    width: '100%',
    marginTop: '8px'
  },
  [theme.breakpoints.down('md')]: {
    order: 2
  }
}));

const PairTableContainer = styled(Box)(({ theme }) => ({
  minWidth: '400px',
  width: '100%',
  height: '100%',
  minHeight: '560px',
  backgroundColor: '#161221 !important',
  display: 'none',
  [theme.breakpoints.down('desktop')]: {
    display: 'block',
    order: 2
  },
  [theme.breakpoints.down(1280)]: {
    display: 'none'
  }
}));
