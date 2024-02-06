import { Box, css, keyframes } from '@mui/material';
import { styled } from '@mui/system';
import { TVChartContainer } from './TradingView';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChartMechanicsContext } from '../../context/ChartMechanics';
import { IChartingLibraryWidget } from '../../charting_library';
import { toast } from 'react-toastify';
import { oracleSocket } from '../../context/socket';
import { formatEther } from 'viem';
import { FeeSettingsContext } from '../../context/FeeSettings';
import { useTokenDetailsData } from '../../hook/tokenDetails/useTokenDetailsData';
import { Theme } from '@mui/material/styles';

interface Props {
  asset: any;
  positionData: any;
  showBidAsk: any;
}

const TradingChart = ({ asset, positionData, showBidAsk }: Props) => {
  const { showOpening, showClosing } = useContext(FeeSettingsContext);

  const currentAsset = useRef<any>(0);
  useEffect(() => {
    currentAsset.current = asset;
    setExecutionPrice(0);
    setLiqLineOnChart(0);
    setTakeProfitOnChart(0);
    setStopLossOnChart(0);
  }, [asset]);

  const {
    tradingStatus,
    executionPrice,
    setExecutionPrice,
    setExpectingClick,
    expectingClick,
    openPrice,
    setOpenPrice,
    isLong,
    leverage,
    margin,
    orderType,
    takeProfitPrice,
    stopLossPrice,
    setStopLossPrice,
    setTakeProfitPrice,
    setStopLossPriceDisplay,
    setTakeProfitPriceDisplay,
    isTpFixed,
    isSlFixed,
    setTpFixed,
    setSlFixed,
    takeProfitPercent,
    stopLossPercent,
    setTakeProfitPercent,
    setStopLossPercent
  } = useContext(ChartMechanicsContext);
  const [widget, setWidget] = useState<any>();
  const overlayRef = useRef<any>();
  const tpLineRef = useRef<any>();
  const slLineRef = useRef<any>();
  const limitLineRef = useRef<any>();
  const liqLineRef = useRef<any>();

  const calcValues = useMemo(
    () => ({
      isTpFixed,
      isSlFixed,
      openPrice,
      orderType,
      isLong,
      leverage,
      takeProfitPercent,
      takeProfitPrice,
      stopLossPercent,
      stopLossPrice
    }),
    [
      isTpFixed,
      isSlFixed,
      openPrice,
      orderType,
      isLong,
      leverage,
      takeProfitPercent,
      takeProfitPrice,
      stopLossPercent,
      stopLossPrice
    ]
  );

  const calcValuesRef = useRef(calcValues);
  const widgetRef = useRef<IChartingLibraryWidget>();

  useEffect(() => {
    // sync ref with the latest values
    calcValuesRef.current = calcValues;
    if (oracleDataRef.current === undefined) return;
    const price = Number(oracleDataRef.current.price) / 1e18;
    const spread = Number(oracleDataRef.current.spread) / 1e10;
    const lev = Number(formatEther(calcValuesRef.current.leverage));
    let openPrice = calcValuesRef.current.isLong ? price + price * spread : price - price * spread;
    openPriceRef.current = openPrice;
    if (calcValuesRef.current.orderType !== 'Market') {
      openPrice = Number(calcValuesRef.current.openPrice);
    }
    try {
      const tpPercent = Number(calcValuesRef.current.takeProfitPercent) / 100;
      const tpPrice = calcValuesRef.current.isTpFixed
        ? Number(formatEther(calcValuesRef.current.takeProfitPrice))
        : tpPercent === 0
        ? 0
        : calcValuesRef.current.isLong
        ? openPrice + (openPrice * tpPercent) / lev
        : openPrice - (openPrice * tpPercent) / lev;
      setTakeProfitOnChart(tpPrice);
      if (calcValuesRef.current.isTpFixed) {
        let liveTpPercent;
        if (calcValuesRef.current.isLong) {
          liveTpPercent = (Number(formatEther(calcValuesRef.current.takeProfitPrice)) / openPrice - 1) * lev * 100;
        } else {
          liveTpPercent = (openPrice / Number(formatEther(calcValuesRef.current.takeProfitPrice)) - 1) * lev * 100;
        }
        setTakeProfitPercent(liveTpPercent.toFixed(2));
      }
    } catch {}
    try {
      const slPercent = Number(calcValuesRef.current.stopLossPercent) / 100;
      const slPrice = calcValuesRef.current.isSlFixed
        ? Number(formatEther(calcValuesRef.current.stopLossPrice))
        : slPercent === 0
        ? 0
        : calcValuesRef.current.isLong
        ? openPrice - (openPrice * slPercent) / lev
        : openPrice + (openPrice * slPercent) / lev;
      setStopLossOnChart(slPrice);
      if (calcValuesRef.current.isSlFixed) {
        let liveSlPercent;
        if (calcValuesRef.current.isLong) {
          liveSlPercent = (openPrice / Number(formatEther(calcValuesRef.current.stopLossPrice)) - 1) * lev * 100;
        } else {
          liveSlPercent = (Number(formatEther(calcValuesRef.current.stopLossPrice)) / openPrice - 1) * lev * 100;
        }
        setStopLossPercent(liveSlPercent.toFixed(2));
      }
    } catch {}
    let liqPrice = 0;
    if (calcValuesRef.current.leverage !== BigInt(0)) {
      if (calcValuesRef.current.isLong) {
        liqPrice = openPrice - (openPrice * 0.9) / lev;
      } else {
        liqPrice = openPrice + (openPrice * 0.9) / lev;
      }
    }
    try {
      setLiqLineOnChart(liqPrice);
    } catch {}
  }, [calcValues]); // update the ref every time calcValues changes

  const openPriceRef = useRef(0);

  const oracleDataRef = useRef<any>({ price: 0, spread: 0 });
  useEffect(() => {
    oracleSocket.on('data', (data: any) => {
      if (!data[currentAsset.current]) return;
      oracleDataRef.current = data[currentAsset.current];
      const price = Number(data[currentAsset.current].price) / 1e18;
      const spread = Number(data[currentAsset.current].spread) / 1e10;
      const lev = Number(formatEther(calcValuesRef.current.leverage));
      let openPrice = calcValuesRef.current.isLong ? price + price * spread : price - price * spread;
      if (calcValuesRef.current.orderType !== 'Market') {
        openPrice = Number(calcValuesRef.current.openPrice);
      } else {
        openPriceRef.current = openPrice;
      }
      try {
        const tpPercent = Number(calcValuesRef.current.takeProfitPercent) / 100;
        const tpPrice = calcValuesRef.current.isTpFixed
          ? Number(formatEther(calcValuesRef.current.takeProfitPrice))
          : tpPercent === 0
          ? 0
          : calcValuesRef.current.isLong
          ? openPrice + (openPrice * tpPercent) / lev
          : openPrice - (openPrice * tpPercent) / lev;
        setTakeProfitOnChart(tpPrice);
      } catch {}
      try {
        const slPercent = Number(calcValuesRef.current.stopLossPercent) / 100;
        const slPrice = calcValuesRef.current.isSlFixed
          ? Number(formatEther(calcValuesRef.current.stopLossPrice))
          : slPercent === 0
          ? 0
          : calcValuesRef.current.isLong
          ? openPrice - (openPrice * slPercent) / lev
          : openPrice + (openPrice * slPercent) / lev;
        setStopLossOnChart(slPrice);
      } catch {}
      let liqPrice = 0;
      if (calcValuesRef.current.leverage !== BigInt(0)) {
        if (calcValuesRef.current.isLong) {
          liqPrice = openPrice - (openPrice * 0.9) / lev;
        } else {
          liqPrice = openPrice + (openPrice * 0.9) / lev;
        }
      }
      try {
        setLiqLineOnChart(liqPrice);
      } catch {}
    });
  }, []);

  useEffect(() => {
    if (!widget) return;
    if (executionPrice === 0) {
      setStopLossOnChart(0);
      setTakeProfitOnChart(0);
      setLiqLineOnChart(0);
    }
    try {
      setLimitOrderOnChart(0);
      setIsMouseDown(false);
    } catch {}
  }, [executionPrice, widget]);

  const addressZero = '0x0000000000000000000000000000000000000000';
  const [fees, setFees] = useState(0.001);
  const liveTokenDetailsData = useTokenDetailsData(asset);
  useEffect(() => {
    if (liveTokenDetailsData.openFees) {
      const pairData: any = liveTokenDetailsData.pairData;
      const referral: any = liveTokenDetailsData.referral;
      const closeFees: any = liveTokenDetailsData.closeFees;
      const openFees: any = liveTokenDetailsData.closeFees;
      const totalOpenFees =
        ((Number(openFees[0]) + Number(openFees[1]) - Number(referral !== addressZero ? openFees[2] : 0)) *
          (Number(pairData?.feeMultiplier) / 1e10)) /
        1e10;
      const totalCloseFees =
        ((Number(closeFees[0]) + Number(closeFees[1]) - Number(referral !== addressZero ? closeFees[2] : 0)) *
          (Number(pairData?.feeMultiplier) / 1e10)) /
        1e10;
      let totalFees = 0;
      if (showClosing === 'After closing fees') {
        totalFees = totalCloseFees;
      }
      if (showOpening === 'After opening fees') {
        totalFees = totalFees + totalOpenFees;
      }
      if (fees !== totalFees) {
        setFees(totalFees);
      }
    }
  }, [liveTokenDetailsData, showOpening, showClosing, fees]);

  useEffect(() => {
    try {
      const marginValue = Number(formatEther(margin));
      const leverageValue = Number(formatEther(leverage));
      const tradePrice = orderType === 'Market' ? openPriceRef.current : Number(openPrice);
      const _stopLossPrice = isSlFixed
        ? Number(formatEther(stopLossPrice))
        : isLong
        ? tradePrice - (tradePrice * Number(stopLossPercent)) / 100 / leverageValue
        : tradePrice + (tradePrice * Number(stopLossPercent)) / 100 / leverageValue;
      const feesToBePaid: number = isLong
        ? (_stopLossPrice / tradePrice) * leverageValue * marginValue * fees
        : (tradePrice / _stopLossPrice) * leverageValue * marginValue * fees;
      const expectedPayout: number = isLong
        ? marginValue + (_stopLossPrice / tradePrice - 1) * leverageValue * marginValue - feesToBePaid
        : marginValue + (1 - _stopLossPrice / tradePrice) * leverageValue * marginValue - feesToBePaid;
      slLineRef.current?.setQuantity(
        'PnL: ' + Math.max(expectedPayout, 0).toFixed(2).replace('Infinity', '-').replace('NaN', '-')
      );
    } catch {}
  }, [margin, leverage, stopLossPrice, stopLossPercent, isSlFixed, isLong, orderType, openPrice, widget, fees]);

  useEffect(() => {
    try {
      const marginValue = Number(formatEther(margin));
      const leverageValue = Number(formatEther(leverage));
      const tradePrice = orderType === 'Market' ? openPriceRef.current : Number(openPrice);
      const _takeProfitPrice = isTpFixed
        ? Number(formatEther(takeProfitPrice))
        : isLong
        ? tradePrice + (tradePrice * Number(takeProfitPercent)) / 100 / leverageValue
        : tradePrice - (tradePrice * Number(takeProfitPercent)) / 100 / leverageValue;
      const feesToBePaid: number = isLong
        ? (_takeProfitPrice / tradePrice) * leverageValue * marginValue * fees
        : (tradePrice / _takeProfitPrice) * leverageValue * marginValue * fees;
      const expectedPayout: number = isLong
        ? marginValue + (_takeProfitPrice / tradePrice - 1) * leverageValue * marginValue - feesToBePaid
        : marginValue + (1 - _takeProfitPrice / tradePrice) * leverageValue * marginValue - feesToBePaid;
      tpLineRef.current?.setQuantity(
        'PnL: ' + Math.max(expectedPayout, 0).toFixed(2).replace('Infinity', '-').replace('NaN', '-')
      );
    } catch {}
  }, [margin, leverage, takeProfitPrice, takeProfitPercent, isTpFixed, isLong, orderType, openPrice, widget, fees]);

  useEffect(() => {
    if (orderType !== 'Market') {
      setLimitOrderOnChart(Number(openPrice));
    } else {
      setLimitOrderOnChart(0);
    }
  }, [openPrice, orderType]);

  const handleWidgetCreated = (widget: IChartingLibraryWidget) => {
    setWidget(widget);
    widgetRef.current = widget;
  };

  const handleOverlayClick = (event: any, mouseHeldDown: boolean) => {
    // if(!showBidAsk) return;
    const { type, callback } = expectingClick;
    setExpectingClick(false, 'none');
    if (!widgetRef.current) return;
    const priceRange = widgetRef.current.activeChart().getPanes()[0].getMainSourcePriceScale()?.getVisiblePriceRange();
    if (!priceRange) return;
    const containerBounds = overlayRef.current?.getBoundingClientRect();
    const relativeClickPos = event.clientY - containerBounds.top;
    const chartHeight = containerBounds.height;
    const pricePerPixel = (priceRange?.to - priceRange?.from) / chartHeight;
    const priceAtClickPos = priceRange?.to - pricePerPixel * relativeClickPos;
    overlayAction(priceAtClickPos, type, callback, mouseHeldDown);
  };

  const overlayAction = (
    priceAtClickPos: number,
    type: string,
    callback: ((...args: unknown[]) => void) | undefined,
    mouseHeldDown: boolean
  ) => {
    if (!showBidAsk && type !== 'Limit' && type !== 'Stop') return;
    if (type === 'Limit' || type === 'Stop') {
      if (mouseHeldDown) {
        initiateLimitOrderFromOrderForm(priceAtClickPos, type, callback);
      } else {
        setOpenPrice(priceAtClickPos.toString());
      }
    } else if (type === 'sl') {
      setStopLossOnChart(priceAtClickPos, true);
    } else if (type === 'tp') {
      setTakeProfitOnChart(priceAtClickPos, true);
    } else if (type === 'updatetpsl') {
      if (
        tradingStatus === 'APPROVE PROXY' ||
        tradingStatus === 'FUND PROXY' ||
        tradingStatus === 'UNLOCK PROXY' ||
        tradingStatus === 'MARKET CLOSED' ||
        tradingStatus === 'MARKET UNAVAILABLE'
      ) {
        const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
        toast.warn(message);
        return;
      }
      updateTPSLFromOpenPositionsTable(priceAtClickPos, callback);
    }
  };

  async function setStopLossOnChart(slPrice: number, onClick?: boolean) {
    try {
      if (slPrice === 0) {
        try {
          slLineRef.current?.remove();
        } catch {}
      }
      setStopLossPrice(BigInt(slPrice * 1e36) / BigInt(1e18));
      if (!calcValuesRef.current.isSlFixed || onClick === true) {
        setStopLossPriceDisplay(String(slPrice));
      }
      if (slPrice === 0) setStopLossPercent('0');
      // Make red line on chart widget
      if (widgetRef.current === null || widgetRef.current === undefined || slPrice === 0) return;
      try {
        slLineRef.current.setPrice(slPrice);
        setStopLossPercent(calcValuesRef.current.stopLossPercent);
      } catch {
        slLineRef.current = widgetRef.current
          .activeChart()
          .createOrderLine({
            disableUndo: true
          })
          .setText('SETTING SL')
          .setPrice(slPrice)
          .setQuantity('')
          .setLineStyle(3)
          .setEditable(true)
          .setLineColor('#E33B2E')
          .setBodyBorderColor('rgba(0,0,0,0)')
          .setBodyBackgroundColor('rgba(0,0,0,0)')
          .setCancelTooltip('Remove SL')
          .setCancelButtonBorderColor('rgba(0,0,0,0)')
          .setCancelButtonBackgroundColor('rgba(0,0,0,0)')
          .setCancelButtonIconColor('#E33B2E')
          .setQuantityBorderColor('rgba(0,0,0,0)')
          .setQuantityBackgroundColor('rgba(0,0,0,0)')
          .setQuantityTextColor('#FFFFFF')
          .setQuantityFont('400 13pt DM Sans')
          .setBodyTextColor('#E33B2E')
          .setBodyFont('400 13pt DM Sans')
          .onMove(() => {
            setSlFixed(true);
            setStopLossPriceDisplay(slLineRef.current.getPrice().toString());
            setStopLossPrice(BigInt(slLineRef.current.getPrice() * 1e18));
          })
          .onCancel(() => {
            setSlFixed(false);
            setStopLossPrice(BigInt(0));
            setStopLossPriceDisplay('0');
            setStopLossPercent('0');
            slLineRef.current?.remove();
          });
        setStopLossPercent(calcValuesRef.current.stopLossPercent);
      }
    } catch {}
  }

  const setTakeProfitOnChart = (tpPrice: number, onClick?: boolean) => {
    try {
      if (tpPrice === 0) {
        try {
          tpLineRef.current?.remove();
        } catch {}
      }
      setTakeProfitPrice(BigInt(tpPrice * 1e36) / BigInt(1e18));
      if (!calcValuesRef.current.isTpFixed || onClick === true) {
        setTakeProfitPriceDisplay(String(tpPrice));
      }
      if (tpPrice === 0) setTakeProfitPercent('0');
      // Make green line on chart widget
      if (widgetRef.current === null || widgetRef.current === undefined || tpPrice === 0) return;
      try {
        tpLineRef.current.setPrice(tpPrice);
        setTakeProfitPercent(calcValuesRef.current.takeProfitPercent);
      } catch {
        setTakeProfitPercent(calcValuesRef.current.takeProfitPercent);
        tpLineRef.current = widgetRef.current
          .activeChart()
          .createOrderLine({
            disableUndo: true
          })
          .setText('SETTING TP')
          .setPrice(tpPrice)
          .setLineStyle(3)
          .setEditable(true)
          .setLineColor('#229342')
          .setBodyBorderColor('rgba(0,0,0,0)')
          .setBodyBackgroundColor('rgba(0,0,0,0)')
          .setCancelTooltip('Remove TP')
          .setCancelButtonBorderColor('rgba(0,0,0,0)')
          .setCancelButtonBackgroundColor('rgba(0,0,0,0)')
          .setCancelButtonIconColor('#229342')
          .setBodyTextColor('#229342')
          .setQuantity('')
          .setQuantityBorderColor('rgba(0,0,0,0)')
          .setQuantityBackgroundColor('rgba(0,0,0,0)')
          .setQuantityTextColor('#FFFFFF')
          .setQuantityFont('400 13pt DM Sans')
          .setBodyFont('400 13pt DM Sans')
          .onMove(() => {
            setTpFixed(true);
            setTakeProfitPriceDisplay(tpLineRef.current.getPrice().toString());
            setTakeProfitPrice(BigInt(tpLineRef.current.getPrice() * 1e18));
          })
          .onCancel(() => {
            setTpFixed(false);
            setTakeProfitPrice(BigInt(0));
            setTakeProfitPriceDisplay('0');
            setTakeProfitPercent('0');
            tpLineRef.current?.remove();
          });
      }
    } catch {}
  };

  async function setLimitOrderOnChart(limitPrice: number) {
    try {
      try {
        limitLineRef.current?.remove();
      } catch {}
      // Make blue line on chart widget
      if (widgetRef.current === null || widgetRef.current === undefined || limitPrice === 0) return;
      limitLineRef.current = widgetRef.current
        .activeChart()
        .createOrderLine({
          disableUndo: true
        })
        .setText(orderType === 'Limit' ? 'SETTING LIMIT' : 'SETTING STOP')
        .setPrice(limitPrice)
        .setQuantity('')
        .setLineStyle(3)
        .setEditable(false)
        .setLineColor('#3772FF')
        .setBodyBorderColor('rgba(0,0,0,0)')
        .setBodyBackgroundColor('rgba(0,0,0,0)')
        .setBodyTextColor('#3772FF')
        .setBodyFont('400 13pt DM Sans');
    } catch {}
  }

  function setLiqLineOnChart(liqPrice: number) {
    try {
      if (liqPrice === 0) {
        try {
          liqLineRef.current?.remove();
        } catch {}
      }
      // Make blue line on chart widget
      if (
        widgetRef.current === null ||
        widgetRef.current === undefined ||
        liqPrice === 0 ||
        !showBidAsk ||
        leverage === BigInt(0)
      )
        return;
      try {
        liqLineRef.current.setPrice(liqPrice);
      } catch {
        liqLineRef.current = widgetRef.current
          .activeChart()
          .createOrderLine({
            disableUndo: true
          })
          .setText('SETTING LIQ')
          .setPrice(liqPrice)
          .setQuantity('')
          .setLineStyle(3)
          .setEditable(false)
          .setLineColor('#FBC116')
          .setBodyBorderColor('rgba(0,0,0,0)')
          .setBodyBackgroundColor('rgba(0,0,0,0)')
          .setQuantityFont('400 13pt DM Sans')
          .setBodyTextColor('#FBC116')
          .setBodyFont('400 13pt DM Sans');
      }
    } catch {}
  }

  async function initiateLimitOrderFromOrderForm(
    price: number,
    type: string,
    callback: ((...args: unknown[]) => void) | undefined
  ) {
    callback?.(String(price), type);
  }

  async function updateTPSLFromOpenPositionsTable(price: number, callback: ((...args: unknown[]) => void) | undefined) {
    callback?.(String(price));
  }

  const [overlayCursorPosition, setOverlayCursorPosition] = useState({ x: 0, y: 0 });
  const overlayHorizontalRef = useRef<any>();
  function handleMouseMoveOnOverlay(e: any) {
    // Get price and time from mouse position
    if (!widgetRef.current) return;
    try {
      widgetRef.current.activeChart().removeEntity(overlayHorizontalRef.current);
    } catch {}

    const priceRange = widgetRef.current.activeChart().getPanes()[0].getMainSourcePriceScale()?.getVisiblePriceRange();
    if (!priceRange) return;
    const containerBounds = overlayRef.current?.getBoundingClientRect();
    const relativeClickPosY = e.clientY - containerBounds.top;
    const chartHeight = containerBounds.height;
    const pricePerPixel = (priceRange.to - priceRange.from) / chartHeight;
    const priceAtPos = priceRange.to - pricePerPixel * relativeClickPosY;

    try {
      overlayHorizontalRef.current = widgetRef.current.activeChart().createShape(
        {
          time: 0,
          price: priceAtPos
        },
        {
          shape: 'horizontal_line',
          lock: true,
          disableSelection: true,
          overrides: {
            showPrice: true,
            linestyle: 2,
            linewidth: 1,
            linecolor: '#9598A1',
            showLabel: true,
            textcolor: '#FFFFFF'
          }
        }
      );
    } catch {}
    const relativeX = e.clientX - containerBounds.left - 150.5;
    const relativeY = e.clientY - containerBounds.top - 74;
    setOverlayCursorPosition({ x: relativeX, y: relativeY });
  }

  useEffect(() => {
    try {
      if (!widgetRef.current) return;
      widgetRef.current.activeChart().removeEntity(overlayHorizontalRef.current);
    } catch {}
  }, [expectingClick]);

  const isMouseDownRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const mouseClickEventRef = useRef<any>();
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = (e: any) => {
    // if(!showBidAsk) return;
    // Set the mouseDown state as true
    isMouseDownRef.current = true;
    setIsMouseDown(true);

    mouseClickEventRef.current = {
      clientX: e.clientX,
      clientY: e.clientY
    };

    // Initiate a timeout function that will trigger after 2 seconds
    const id = setTimeout(() => {
      if (isMouseDownRef.current) {
        const clickEvent = mouseClickEventRef.current;
        handleOverlayClick(clickEvent, true);
        setIsMouseDown(false);
      }
    }, 500);

    // Store the timeout function ID so that it can be cancelled if necessary
    timerRef.current = id;
  };

  const handleMouseUp = () => {
    // Set the mouseDown state as false
    isMouseDownRef.current = false;
    setIsMouseDown(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const clickEvent = mouseClickEventRef.current;
      handleOverlayClick(clickEvent, false);
    }
  };

  return (
    <Wrapper>
      <TVChartContainer
        asset={asset}
        positionData={positionData}
        showBidAsk={showBidAsk}
        onWidgetCreated={handleWidgetCreated}
      />
      {expectingClick.isExpecting && (
        <>
          <Overlay
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            ref={overlayRef}
            onMouseMove={handleMouseMoveOnOverlay}
          >
            <Indicator />
            {isMouseDown && (
              <MouseHoldIndicator
                active={String(isMouseDown)}
                style={{ left: `${overlayCursorPosition.x}px`, top: `${overlayCursorPosition.y}px` }}
              >
                <svg>
                  <ProgressCircle cx="50%" cy="50%" r="15" fill="transparent" stroke="#3772FF" strokeWidth="3" />
                </svg>
              </MouseHoldIndicator>
            )}
          </Overlay>
        </>
      )}
    </Wrapper>
  );
};

// Green indicator at top right of overlay
const Indicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '10px',
  height: '10px',
  backgroundColor: '#25A296',
  borderRadius: '50%'
}));

const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '39px',
  left: '56px',
  right: '80px',
  bottom: '68px',
  '&:hover': {
    cursor: 'crosshair'
  }
}));

const Wrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  backgroundColor: '#161221',
  userSelect: 'none',
  MozUserSelect: 'none',
  KhtmlUserSelect: 'none',
  WebkitUserSelect: 'none',
  [theme.breakpoints.down('desktop')]: {
    height: '640px'
  }
}));

const fillAnimation = keyframes`
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
`;

const ProgressCircle = styled('circle')(({ theme }) => ({
  strokeDasharray: 100,
  strokeDashoffset: 100,
  animation: `${fillAnimation} 0.4s linear 0.1s forwards`
}));

interface MouseHoldIndicatorProps {
  active: string;
  theme?: Theme;
}
const MouseHoldIndicator = styled(Box)(({ theme, active }: MouseHoldIndicatorProps) =>
  css({
    position: 'absolute',
    width: '40px',
    height: '40px',
    opacity: active ? 1 : 0,
    pointerEvents: 'none'
  })
);

export default TradingChart;
