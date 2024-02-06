import { useEffect, useState, useContext } from 'react';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/system';

import * as logos from '../../../src/config/images';

import { Star, StarBorder } from '@mui/icons-material';
import { Container } from '../Container';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { LeftArrow, RightArrow } from './arrow';
import { oracleSocket } from '../../context/socket';
import { FavPairsContext } from 'src/context/FavPairs';
import { PairSelectionModal } from '../Modal/PairSelectionModal';
import { useTokenDetailsDataOptions } from 'src/hook/tokenDetails/useTokenDetailsData';
import { getNetwork } from 'src/constants/networks';
import { commaSeparators } from 'src/utils/commaSeparators';
import { useTranslation } from 'react-i18next';

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

interface ITokenDetails {
  pairIndex: number;
  setPairIndex: (value: number) => void;
}

export const OptionsTokenDetails = ({ pairIndex, setPairIndex }: ITokenDetails) => {
  const { assets } = getNetwork(0);
  const { favPairs, changeFavPair } = useContext(FavPairsContext);
  const LogoArray = [
    logos.btcLogo,
    logos.ethLogo,
    logos.goldLogo,
    logos.maticLogo,
    logos.linkLogo,
    logos.eurLogo,
    logos.gbpLogo,
    logos.jpyLogo,
    logos.btcLogo, // rub
    logos.btcLogo, // chf
    logos.cadLogo,
    logos.ethLogo, // eth/btc
    logos.xrpLogo,
    logos.bnbLogo,
    logos.adaLogo,
    logos.atomLogo,
    logos.btcLogo, // hbar
    logos.btcLogo, // tron
    logos.solLogo,
    logos.dogeLogo,
    logos.ltcLogo,
    logos.bchLogo,
    logos.btcLogo, // etc
    logos.dotLogo,
    logos.xmrLogo,
    logos.btcLogo, // shib
    logos.avaxLogo,
    logos.uniLogo,
    logos.btcLogo, // xlm
    logos.nearLogo,
    logos.algoLogo,
    logos.btcLogo, // icp
    logos.silverLogo, // xag
    logos.linkLogo, // link/btc
    logos.xmrLogo, // xmr/btc
    logos.arbLogo,
    logos.pepeLogo,
    logos.gmxLogo,
    logos.xrpLogo
  ];

  const addressZero = '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    oracleSocket.on('data', (data: any) => {
      setOracleData(data);
    });
  }, []);
  const [oracleData, setOracleData] = useState(Array(35).fill({ price: '0', spread: '0' }));

  const [oi, setOi] = useState<any>({ longOi: 0, shortOi: 0, maxOi: 0 });
  const [pairData, setPairData] = useState<any>({});
  const [referral, setReferral] = useState(addressZero);
  const { t } = useTranslation();
  const liveTokenDetailsData = useTokenDetailsDataOptions(pairIndex);
  useEffect(() => {
    if (liveTokenDetailsData.pairData) {
      setPairData(liveTokenDetailsData.pairData);
      setReferral(String(liveTokenDetailsData.referral));
    }
  }, [liveTokenDetailsData]);

  function onWheel(apiObj: scrollVisibilityApiType, ev: React.WheelEvent): void {
    const isTouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;

    if (isTouchpad) {
      ev.stopPropagation();
      return;
    }

    if (ev.deltaY < 0) {
      apiObj.scrollNext();
    } else if (ev.deltaY > 0) {
      apiObj.scrollPrev();
    }
  }
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleTokenClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  function handleStarClick(e: any, name: string, setFav: boolean) {
    e.stopPropagation();
    changeFavPair(name, setFav);
  }

  return (
    <TradeContainer>
      <Container>
        <TradeWrapper>
          <KindOfToken onClick={handleTokenClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1.60092 1.65127V6.99556H6.9452V1.65127H1.60092ZM7.83616 0.760315V7.88652H0.709961V0.760315H7.83616ZM1.60092 9.44533V14.7896H6.9452V9.44533H1.60092ZM7.83616 8.55437V15.6806H0.709961V8.55437H7.83616ZM8.50401 8.55437H15.6302V15.6806H8.50401V8.55437ZM9.39497 1.65127V6.99556H14.7393V1.65127H9.39497ZM15.6302 0.760315V7.88652H8.50401V0.760315H15.6302Z"
                fill="#E1E8F5"
              />
            </svg>
            <Tokens>
              <img src={LogoArray[pairIndex]} style={{ height: '28px' }} />
              <span className="token-name">{assets[pairIndex].name}</span>
            </Tokens>
            {favPairs.includes(assets[pairIndex].name) ? (
              <IconButton
                onClick={(e) => {
                  handleStarClick(e, assets[pairIndex].name, false);
                }}
                sx={{ padding: 0 }}
              >
                <Star sx={{ width: '20px', height: '20px', color: '#FABE3C' }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={(e) => {
                  handleStarClick(e, assets[pairIndex].name, true);
                }}
                sx={{ padding: 0 }}
              >
                <StarBorder style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
              </IconButton>
            )}
          </KindOfToken>

          <PairSelectionModal
            state={anchorEl}
            setState={setAnchorEl}
            pairIndex={pairIndex}
            setPairIndex={setPairIndex}
          />
          <DesktopStatusInfos>
            <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow} onWheel={onWheel}>
              <Box className="index-info">
                <p className="title">{t('header.oraclePrice')}</p>
                <p className="value">
                  {oracleData[pairIndex] ? (parseInt(oracleData[pairIndex].price) / 1e18).toPrecision(6) : 'Loading...'}
                </p>
              </Box>
              {/* <Box className="index-info">
                <p className="title">Spread</p>
                <p className="value">
                  {oracleData[pairIndex] ? (parseInt(oracleData[pairIndex].spread) / 1e8).toPrecision(2) : 'Loading...'}%
                </p>
              </Box> */}
              <Box className="index-info">
                <p className="title">{t('header.Open Interest')}</p>
                <p className="value">
                  {(pairData ? Number(pairData[5]) / 1e18 : 0).toFixed(0) + '/'}
                  <span>{oi ? commaSeparators((Number(pairData[4]) / 1e18).toFixed(0)) : 'Loading...'}</span>
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.Min Collateral')}</p>
                <p className="value" style={{}}>
                  {pairData ? Number(pairData[1]) / 1e18 : Number(0)}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.Max Collateral')}</p>
                <p className="value" style={{}}>
                  {pairData ? Number(pairData[0]) / 1e18 : Number(0)}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.Min Duration')}</p>
                <p className="value" style={{}}>
                  {pairData ? Number(pairData[3]) / 60 : Number(0)} {t('Min')}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.Max Duration')}</p>
                <p className="value" style={{}}>
                  {pairData ? Number(pairData[2]) / 60 : Number(0)} {t('Min')}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.Payout')}</p>
                <p className="value" style={{ color: '#26A69A', fontWeight: 'bold' }}>
                  70%
                </p>
              </Box>
            </ScrollMenu>
          </DesktopStatusInfos>
          <MobileStatusInfos>
            <Box className="index-info">
              <p className="title">{t('header.oraclePrice')}</p>
              <p className="value">
                {oracleData[pairIndex] ? (parseInt(oracleData[pairIndex].price) / 1e18).toPrecision(6) : 'Loading...'}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('Spread')}</p>
              <p className="value">
                {oracleData[pairIndex] ? (parseInt(oracleData[pairIndex].spread) / 1e8).toPrecision(2) : 'Loading...'}%
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.Open Interest')}</p>
              <p className="value">
                {(pairData ? Number(pairData[5]) / 1e18 : 0).toFixed(0) + '/'}
                <span>{oi ? commaSeparators((Number(pairData[4]) / 1e18).toFixed(0)) : 'Loading...'}</span>
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.Min Collateral')}</p>
              <p className="value" style={{}}>
                {pairData ? Number(pairData[1]) / 1e18 : Number(0)}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.Max Collateral')}</p>
              <p className="value" style={{}}>
                {pairData ? Number(pairData[0]) / 1e18 : Number(0)}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('Duration')}</p>
              <p className="value" style={{}}>
                {pairData ? Number(pairData[3]) / 60 : Number(0)} {t('Min')} -{' '}
                {pairData ? Number(pairData[2]) / 60 : Number(0)} {t('Min')}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('Payout')}</p>
              <p className="value" style={{ color: '#26A69A', fontWeight: 'bold' }}>
                70%
              </p>
            </Box>
          </MobileStatusInfos>
        </TradeWrapper>
      </Container>
    </TradeContainer>
  );
};

const TradeContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  background: '#161221',
  // height: '63px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));

const TradeWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1440px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));

const KindOfToken = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '15px',
  cursor: 'pointer',
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
    width: '100%',
    borderRight: 'none',
    borderBottom: '1px solid #23262F',
    paddingLeft: '25px'
  },
  svg: {
    color: '#FABE3C'
  }
}));

const Tokens = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  '.token-name': {
    color: '#E5E3EC',
    fontWeight: '600',
    fontSize: '18px',
    lineHeight: '32px'
  },
  '.multi-value': {
    borderImage: 'linear-gradient(150deg, #3772FF 10%, #D737FF 100%)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '4px',
    borderImageSlice: 1,
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    span: {
      marginLeft: '4px',
      marginRight: '4px',
      fontWeight: '600',
      fontSize: '11px',
      lineHeight: '9px',
      background: '#FFFFFF',
      backgroundClip: 'text',
      textFillColor: 'transparent'
    }
  }
}));

const DesktopStatusInfos = styled(Box)(({ theme }) => ({
  height: '100%',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  },
  '.index-info': {
    padding: '0 11px',
    '.title': {
      color: '#D2CEDE',
      fontSize: '12px',
      lineHeight: '12px',
      fontFamily: 'DMSans-Regular',
      whiteSpace: 'nowrap'
    },
    '.value': {
      fontSize: '12px',
      lineHeight: '16px',
      fontFamily: 'DMSans-Regular',
      margin: '3px 0',
      whiteSpace: 'nowrap',
      span: {
        color: 'rgba(229, 227, 236, 0.47)'
      }
    }
  }
}));

const MobileStatusInfos = styled(Box)(({ theme }) => ({
  padding: '15px',
  display: 'none',
  width: '100%',
  gridTemplateColumns: 'auto auto auto',
  [theme.breakpoints.down('md')]: {
    display: 'grid',
    gap: '1rem'
  },
  [theme.breakpoints.down('xs')]: {
    gridTemplateColumns: 'auto auto'
  },
  '.index-info': {
    maxHeight: '35px',
    padding: '0 11px',
    '.title': {
      color: '#D2CEDE',
      fontSize: '10px',
      lineHeight: '12px',
      fontFamily: 'DMSans-Regular',
      whiteSpace: 'nowrap'
    },
    '.value': {
      fontSize: '12px',
      lineHeight: '16px',
      fontFamily: 'DMSans-Regular',
      margin: '3px 0',
      whiteSpace: 'nowrap',
      span: {
        color: 'rgba(229, 227, 236, 0.47)'
      }
    }
  }
}));
