import { Box, Divider } from '@mui/material';
import { styled } from '@mui/system';
import { Container } from '../../../src/components/Container';
import { NavigateNext } from '@mui/icons-material';
import { useStore } from '../../../src/context/StoreContext';
import { CumulativeChart } from '../../../src/components/CumulativeChart';
import { useState, useEffect } from 'react';
import { TradingLogsBoard } from '../../../src/components/TradeLogsTable';
import { useAccount, useNetwork } from 'wagmi';
import { PRIVATE_ROUTES } from 'src/config/routes';
import { getNetwork } from 'src/constants/networks';

interface tradeDataProps {
  totalPnlDollar: number;
  totalPnlPro: number;
  totalNumberTrade: number;
  totalVolumeTrade: number;
  longestWinStreak: number;
  biggestWin: number;
  biggestLoss: number;
  mostTradedPair: number;
}

export const Cumulative = () => {
  const { setMiniPage } = useStore();
  const [tradeData, setTradeData] = useState<tradeDataProps>();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { assets } = getNetwork(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const chainId = chain?.id;
    if (address && chainId) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const toFetch = `${PRIVATE_ROUTES.serverUrl}/profileStats/${chainId}/${address}`;
      const response = await fetch(toFetch);
      const resData = await response.json();
      console.log(resData.mostTradedPair);
      setTradeData(resData);
    }
  };
  return (
    <Container>
      <CumulativeContainer>
        <BreadCrumb>
          <TrippleDot>...</TrippleDot>
          <NavigateNext />
          <BreadItem active={0} onClick={() => setMiniPage(0)}>
            Trade
          </BreadItem>
          <NavigateNext />
          <BreadItem active={1}>Cumulative perfomance</BreadItem>
        </BreadCrumb>
        <ContentContainer>
          <CumulativeChartWrapper>
            <Bar>
              <BarTitle sx={{ textTransform: 'uppercase' }}>Cumulative perfomance</BarTitle>
            </Bar>
            <CumulativeChart />
          </CumulativeChartWrapper>
          <OverviewWrapper>
            <Bar>
              <BarTitle>Overview</BarTitle>
            </Bar>
            <OverviewContent>
              <OverviewSeparator>
                <OverviewItem
                  title={'Total PnL ($)'}
                  value={tradeData?.totalPnlDollar != null ? tradeData?.totalPnlDollar.toFixed(2) : `-`}
                  colorValue="rgba(255, 255, 255, 0.6)"
                />
                <OverviewItem
                  title={'Total PnL (%)'}
                  value={tradeData?.totalPnlPro != null ? `${(tradeData?.totalPnlPro * 100).toFixed(2)}%` : `-`}
                  colorValue="rgba(255, 255, 255, 0.6)"
                />
                <OverviewItem
                  title={'Total number of trades'}
                  value={tradeData?.totalNumberTrade != null ? tradeData?.totalNumberTrade : `-`}
                  colorValue="#B1B5C3"
                />
                <OverviewItem
                  title={'Total volume traded'}
                  value={tradeData?.totalVolumeTrade != null ? tradeData?.totalVolumeTrade.toFixed(2) : `-`}
                  colorValue="#B1B5C3"
                />
              </OverviewSeparator>
              <ResponsiveDevider1 />
              <ResponsiveDevider2 />
              <OverviewSeparator>
                <OverviewItem
                  title={'Longest win streak'}
                  value={tradeData?.longestWinStreak != null ? tradeData?.longestWinStreak : `-`}
                  colorValue="#B1B5C3"
                />
                <OverviewItem
                  title={'Biggest win'}
                  value={tradeData?.biggestWin != null ? tradeData?.biggestWin.toFixed(2) : `-`}
                  colorValue="#B1B5C3"
                />
                <OverviewItem
                  title={'Biggest loss'}
                  value={tradeData?.biggestLoss != null ? tradeData?.biggestLoss.toFixed(2) : `-`}
                  colorValue="#B1B5C3"
                />
                <OverviewItem
                  title={'Most traded pair'}
                  value={tradeData?.mostTradedPair != null ? assets[tradeData?.mostTradedPair].name : `-`}
                  colorValue="#B1B5C3"
                />
              </OverviewSeparator>
            </OverviewContent>
          </OverviewWrapper>
          <TradingLogsBoard />
        </ContentContainer>
      </CumulativeContainer>
    </Container>
  );
};

interface OverviewItemProps {
  title: string;
  value: string | number;
  colorValue: string;
}

const OverviewItem = (props: OverviewItemProps) => {
  const { title, value, colorValue } = props;
  return (
    <OverviewItemContainer>
      <ItemTitle>{title}</ItemTitle>
      <ItemValue sx={{ color: colorValue }}>{value}</ItemValue>
    </OverviewItemContainer>
  );
};

const OverviewItemContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const ItemTitle = styled(Box)(({ theme }) => ({
  color: '#B1B5C3',
  fontSize: '12px',
  lineHeight: '20px'
}));

const ItemValue = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  lineHeight: '20px'
}));

const CumulativeContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  paddingTop: '50px'
}));

const TrippleDot = styled(Box)(({ theme }) => ({
  color: '#667085'
}));

const BreadCrumb = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

interface BreadItemProps {
  active: number;
}

const BreadItem = styled(Box)<BreadItemProps>(({ theme, active }) => ({
  color: active === 1 ? '#3772FF' : '#667085',
  fontSize: '14px',
  cursor: 'pointer'
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  gap: '13px',
  paddingTop: '26px',
  [theme.breakpoints.down(1440)]: {
    display: 'flex',
    flexDirection: 'column',
    gridTemplateColumns: 'none'
  }
}));

const CumulativeChartWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: '1082px',
  width: '100%',
  [theme.breakpoints.down(1440)]: {
    minWidth: 'auto'
  }
}));

const Bar = styled(Box)(({ theme }) => ({
  padding: '10px 17.5px',
  width: '100%',
  background: '#161221',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const BarTitle = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  letterSpacing: '0.1em',
  lineHeight: '20px',
  color: '#FFFFFF'
}));

const OverviewWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: '320px'
}));

const OverviewContent = styled(Box)(({ theme }) => ({
  padding: '26px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  height: '100%',
  backgroundColor: '#161221',
  [theme.breakpoints.down(1440)]: {
    flexDirection: 'row'
  },
  [theme.breakpoints.down(768)]: {
    flexDirection: 'column'
  }
}));

const OverviewSeparator = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%'
}));

const ResponsiveDevider1 = styled(Box)(({ theme }) => ({
  width: '1px',
  backgroundColor: '#343538',
  [theme.breakpoints.down(768)]: {
    display: 'none'
  }
}));

const ResponsiveDevider2 = styled(Divider)(({ theme }) => ({
  [theme.breakpoints.down(1440)]: {
    display: 'none'
  }
}));
