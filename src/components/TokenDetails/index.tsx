/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
import { useTokenDetailsData } from 'src/hook/tokenDetails/useTokenDetailsData';
import { getNetwork } from 'src/constants/networks';
import { commaSeparators } from 'src/utils/commaSeparators';
import { useTranslation } from 'react-i18next';

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

interface ITokenDetails {
  pairIndex: number;
  setPairIndex: (value: number) => void;
}

export const TokenDetails = ({ pairIndex, setPairIndex }: ITokenDetails) => {
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
    logos.xrpLogo,
    logos.chfLogo,
    logos.cnhLogo,
    logos.mxnLogo
  ];

  const addressZero = '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    oracleSocket.on('data', (data: any) => {
      setOracleData(data);
    });
  }, []);
  const [oracleData, setOracleData] = useState(Array(42).fill({ price: '0', spread: '0' }));

  const [oi, setOi] = useState<any>({ longOi: 0, shortOi: 0, maxOi: 0 });
  const [pairData, setPairData] = useState<any>({});
  const [openFees, setOpenFees] = useState<any>({});
  const [closeFees, setCloseFees] = useState<any>({});
  const [vaultFunding, setVaultFunding] = useState<any>({});
  const [referral, setReferral] = useState(addressZero);
  const { t } = useTranslation();
  const liveTokenDetailsData = useTokenDetailsData(pairIndex);
  useEffect(() => {
    if (liveTokenDetailsData) {
      setOi(liveTokenDetailsData.openInterest);
      setPairData(liveTokenDetailsData.pairData);
      setOpenFees(liveTokenDetailsData.openFees);
      setCloseFees(liveTokenDetailsData.closeFees);
      setVaultFunding(liveTokenDetailsData.vaultFunding);
      setReferral(String(liveTokenDetailsData.referral));
    }
  }, [liveTokenDetailsData]);

  useEffect(() => {
    calculateFundingAPR();
  }, [vaultFunding, pairData, oi]);

  const [longAPRHourly, setLongAPRHourly] = useState(0);
  const [shortAPRHourly, setShortAPRHourly] = useState(0);

  function calculateFundingAPR() {
    const longOi = Number(oi?.longOi);
    const shortOi = Number(oi?.shortOi);

    const diff = longOi > shortOi ? longOi - shortOi : shortOi - longOi;

    const baseFundingRate = Number(pairData?.baseFundingRate);
    const base = diff * baseFundingRate;

    let shortAPR = base / shortOi;
    let longAPR = base / longOi;

    if (longOi > shortOi) shortAPR = shortAPR * -1;
    else longAPR = longAPR * -1;

    let shortAPRHourly = shortAPR / 365 / 24 / 1e8;
    let longAPRHourly = longAPR / 365 / 24 / 1e8;

    if (longOi < shortOi) {
      longAPRHourly = (longAPRHourly * (1e10 - Number(vaultFunding))) / 1e10;
    } else if (shortOi < longOi) {
      shortAPRHourly = (shortAPRHourly * (1e10 - Number(vaultFunding))) / 1e10;
    } else if (longOi === 0 && shortOi === 0) {
      longAPRHourly = 0;
      shortAPRHourly = 0;
    }
    setShortAPRHourly(shortAPRHourly);
    setLongAPRHourly(longAPRHourly);
  }

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
            <Tokens>
              <img src={LogoArray[pairIndex]} style={{ height: '28px' }} />
              <span className="token-name">{assets[pairIndex].name}</span>
              <Box className="multi-value">
                <span>{assets[pairIndex].maxLev}X</span>
              </Box>
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
              <Box className="index-info">
                <p className="title">{t('header.priceSpread')}</p>
                <p className="value">
                  {oracleData[pairIndex] ? (Number(oracleData[pairIndex].spread) / 1e8).toFixed(3) + '%' : '0.000%'}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.openFee')}</p>
                <p className="value">
                  {openFees
                    ? (
                        ((Number(openFees[0]) +
                          Number(openFees[1]) -
                          Number(referral !== addressZero ? openFees[2] : 0)) *
                          (Number(pairData?.feeMultiplier) / 1e10)) /
                        1e8
                      )
                        .toFixed(3)
                        .replace('NaN', '0.100') + '%'
                    : '0.100%'}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.closeFee')}</p>
                <p className="value">
                  {closeFees
                    ? (
                        ((Number(closeFees[0]) +
                          Number(closeFees[1]) -
                          Number(referral !== addressZero ? closeFees[2] : 0)) *
                          (Number(pairData?.feeMultiplier) / 1e10)) /
                        1e8
                      )
                        .toFixed(3)
                        .replace('NaN', '0.100') + '%'
                    : '0.100%'}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.longOpenInterest')}</p>
                <p className="value">
                  {(oi ? Number(oi.longOi) / 1e18 : 0).toFixed(0) + '/'}
                  <span>
                    {oi
                      ? String(oi.maxOi) === '0'
                        ? 'Unlimited'
                        : commaSeparators((Number(oi.maxOi) / 1e18).toFixed(0))
                      : 'Loading...'}
                  </span>
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.shortOpenInterest')}</p>
                <p className="value">
                  {(oi ? Number(oi.shortOi) / 1e18 : 0).toFixed(0) + '/'}
                  <span>
                    {oi
                      ? String(oi.maxOi) === '0'
                        ? 'Unlimited'
                        : commaSeparators((Number(oi.maxOi) / 1e18).toFixed(0))
                      : 'Loading...'}
                  </span>
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.longFundingFee')}</p>
                <p
                  className="value"
                  style={{ color: longAPRHourly <= 0 || isNaN(longAPRHourly) ? '#26A69A' : '#EF534F' }}
                >
                  {longAPRHourly.toFixed(5).replace('NaN', '0.00000').replace('Infinity', 'ထ') +
                    `% ${t('header.perHour')}`}
                </p>
              </Box>
              <Box className="index-info">
                <p className="title">{t('header.shortFundingFee')}</p>
                <p
                  className="value"
                  style={{ color: shortAPRHourly <= 0 || isNaN(shortAPRHourly) ? '#26A69A' : '#EF534F' }}
                >
                  {shortAPRHourly.toFixed(5).replace('NaN', '0.00000').replace('Infinity', 'ထ') +
                    `% ${t('header.perHour')}`}
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
              <p className="title">{t('header.priceSpread')}</p>
              <p className="value">
                {oracleData[pairIndex] ? (Number(oracleData[pairIndex].spread) / 1e8).toFixed(3) + '%' : '0.000%'}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.openFee')}</p>
              <p className="value">
                {openFees
                  ? (
                      ((Number(openFees[0]) +
                        Number(openFees[1]) -
                        Number(referral !== addressZero ? openFees[2] : 0)) *
                        (Number(pairData?.feeMultiplier) / 1e10)) /
                      1e8
                    )
                      .toFixed(3)
                      .replace('NaN', '0.100') + '%'
                  : '0.100%'}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.closeFee')}</p>
              <p className="value">
                {closeFees
                  ? (
                      ((Number(closeFees[0]) +
                        Number(closeFees[1]) -
                        Number(referral !== addressZero ? closeFees[2] : 0)) *
                        (Number(pairData?.feeMultiplier) / 1e10)) /
                      1e8
                    )
                      .toFixed(3)
                      .replace('NaN', '0.100') + '%'
                  : '0.100%'}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.longOpenInterest')}</p>
              <p className="value">
                {(oi ? Number(oi.longOi) / 1e18 : 0).toFixed(0) + '/'}
                <span>
                  {oi
                    ? String(oi.maxOi) === '0'
                      ? 'Unlimited'
                      : commaSeparators((Number(oi.maxOi) / 1e18).toFixed(0))
                    : 'Unlimited'}
                </span>
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.shortOpenInterest')}</p>
              <p className="value">
                {(oi ? Number(oi.shortOi) / 1e18 : 0).toFixed(0) + '/'}
                <span>
                  {oi
                    ? String(oi.maxOi) === '0'
                      ? 'Unlimited'
                      : commaSeparators((Number(oi.maxOi) / 1e18).toFixed(0))
                    : 'Unlimited'}
                </span>
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.longFundingFee')}</p>
              <p
                className="value"
                style={{ color: longAPRHourly <= 0 || isNaN(longAPRHourly) ? '#26A69A' : '#EF534F' }}
              >
                {longAPRHourly.toFixed(5).replace('NaN', '0.00000').replace('Infinity', 'ထ') +
                  `% ${t('header.perHour')}`}
              </p>
            </Box>
            <Box className="index-info">
              <p className="title">{t('header.shortFundingFee')}</p>
              <p
                className="value"
                style={{ color: shortAPRHourly <= 0 || isNaN(shortAPRHourly) ? '#26A69A' : '#EF534F' }}
              >
                {shortAPRHourly.toFixed(5).replace('NaN', '0.00000').replace('Infinity', 'ထ') +
                  `% ${t('header.perHour')}`}
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
  backgroundColor: '#161221',
  // height: '63px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));

const TradeWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
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
  padding: '15px 15px 15px 0',
  cursor: 'pointer',
  borderRight: '1px solid #23262F',
  [theme.breakpoints.down('md')]: {
    justifyContent: 'space-between',
    width: '100%',
    borderRight: 'none',
    borderBottom: '1px solid #23262F'
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
  width: 'calc(96vw - 206.2px)',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  },
  '.index-info': {
    padding: '0 11px',
    borderRight: '1px solid #23262F',
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
