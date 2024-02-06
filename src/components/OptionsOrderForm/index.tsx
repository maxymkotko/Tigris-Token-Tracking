/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ErrorOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { useState, useRef, useEffect, useContext } from 'react';
import { OrderDurationInput, OrderInput, TigrisInput, TigrisSlider, TigrisTimeInput } from '../Input';
import { useAccount, useFeeData, useNetwork, usePublicClient } from 'wagmi';
import { oracleSocket, oracleData } from '../../context/socket';
import { IconDropDownMenu } from '../Dropdown/IconDrop';
import { getNetwork } from '../../constants/networks';
import { toast } from 'react-toastify';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useApproveToken, useTokenAllowance, useTokenBalance } from 'src/hook/useToken';
import { useProxyApproval } from 'src/hook/useProxy';
import Cookies from 'universal-cookie';

import { getProxyAddress, getProxyBalance, unlockProxyWallet, checkProxyWallet, forwarder } from '../../proxy_wallet';
import { getWalletClient, waitForTransaction } from '@wagmi/core';
import { encodeFunctionData, formatEther, parseEther } from 'viem';
import { LogError } from 'src/context/ErrorLogs';
import { ChartMechanicsContext } from 'src/context/ChartMechanics';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { useGasBalance } from '../../hook/useGasBalance';
import { decimalNumberToString } from 'src/utils/decimalNumberToString';
import { useTranslation } from 'react-i18next';
import { NO_PERMIT, NO_PRICE_DATA } from 'src/constants/EmptyDataStructs';
import { useTokenDetailsDataOptions } from '../../hook/tokenDetails/useTokenDetailsData';
import { CommonDropDown } from '../Dropdown';

const cookies = new Cookies();

interface IOrderForm {
  pairIndex: number;
}

export const OptionsOrderForm = ({ pairIndex }: IOrderForm) => {
  const { address: userAddress, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { openConnectModal } = useConnectModal();
  const [isMarketAvailable, setMarketAvailable] = useState(true);
  const [isMarketClosed, setMarketClosed] = useState(false);

  const { assets } = getNetwork(0);

  const [marginAssets, setMarginAssets] = useState({ marginAssetDrop: getNetwork(chain?.id ?? 42161).marginAssets });

  const [currentMargin, setCurrentMargin] = useState({
    marginAssetDrop: getNetwork(chain?.id ?? 42161).marginAssets[1]
  });
  const currentMarginRef = useRef<any>(getNetwork(chain?.id ?? 42161).marginAssets[1]);

  const [currentReturnMargin, setCurrentReturnMargin] = useState({
    marginAssetDrop: getNetwork(chain?.id ?? 42161).marginAssets[0]
  });
  const currentReturnMarginRef = useRef<any>(getNetwork(chain?.id ?? 42161).marginAssets[0]);

  const currentPairIndex = useRef(pairIndex);
  const publicClient = usePublicClient();

  // const [isLong, setLong] = useState(true);
  // const [openPrice, setOpenPrice] = useState('0');
  const [spread, setSpread] = useState('0');
  const { data: feeData } = useFeeData();

  // const [margin, setMargin] = useState('5');

  const [duration, setDuration] = useState(3 * 60);
  const [isMarketWillCloseError, setMarketWillCloseError] = useState(false);
  useEffect(() => {
    handleSetDuration(duration);
  }, []);

  // const [orderType, setOrderType] = useState('Market');

  const [tokenBalance, setTokenBalance] = useState('Loading...');
  const [isBalanceVisible, setBalanceVisible] = useState(true);
  const {
    openPrice,
    setOpenPrice,
    orderType,
    setOrderType,
    margin,
    setMargin,
    setLeverage,
    isLong,
    setIsLong,
    setExpectingClick,
    setExecutionPrice
  } = useContext(ChartMechanicsContext);

  // 0: proxy need approval and funding, 1: proxy needs funding, 2: proxy needs migration, 3: proxy is ready
  const [proxyState, setProxyState] = useState(0);
  const [isTokenAllowed, setIsTokenAllowed] = useState(true);
  const [approve] = useApproveToken(
    currentMargin.marginAssetDrop.address,
    getNetwork(chain?.id ?? 42161).addresses.options
  );
  const addressZero = '0x0000000000000000000000000000000000000000';
  const [activeProxyAddress, setActiveProxyAddress] = useState(addressZero);
  const [proxyActionCounter, setProxyActionCounter] = useState(0);
  const [collateralDisplay, setCollateralDisplay] = useState(10);
  const { t } = useTranslation();

  const liveGasBalance = useGasBalance();

  useEffect(() => {
    setMargin(BigInt(10e18));
    setLeverage(BigInt(0));
  }, []);
  const liveProxyAddress = useProxyApproval();
  useEffect(() => {
    const x = async () => {
      const { minProxyGas } = getNetwork(chain?.id ?? 42161);
      const proxyAddress = String(liveProxyAddress);
      setActiveProxyAddress(proxyAddress);
      if (userAddress === undefined) return;
      await checkProxyWallet(userAddress);
      const shellBalance = liveGasBalance ? formatEther(liveGasBalance as bigint) : '0';
      if (
        (cookies.get(userAddress + '_k') !== undefined ||
          localStorage.getItem(userAddress + '_e_private_key') !== null ||
          localStorage.getItem(userAddress + '_public_key') !== null) &&
        localStorage.getItem(userAddress + '_proxy_sig') === null
      ) {
        setProxyState(2); // Proxy needs migration
      } else if (getProxyAddress().toLowerCase() !== proxyAddress.toLowerCase()) {
        setProxyState(0); // Approve proxy
      } else if (Number(shellBalance) < minProxyGas) {
        console.log(shellBalance, minProxyGas);
        setProxyState(1); // Fund proxy
      } else {
        setProxyState(3); // Ready
      }
    };
    x();
  }, [liveProxyAddress, chain, userAddress, liveGasBalance, proxyActionCounter]);

  const tokenLiveBalance = useTokenBalance(currentMargin.marginAssetDrop.address);
  const tokenLiveAllowance = useTokenAllowance(
    currentMargin.marginAssetDrop.address,
    getNetwork(chain?.id ?? 42161).addresses.options
  );

  useEffect(() => {
    setTokenBalance(
      ((tokenLiveBalance ? Number(tokenLiveBalance) : 0) / 10 ** currentMargin.marginAssetDrop.decimals).toFixed(2)
    );
  }, [tokenLiveBalance, currentMargin]);
  useEffect(() => {
    setIsTokenAllowed(
      currentMargin.marginAssetDrop.address === getNetwork(chain?.id ?? 42161).marginAssets[0].address
        ? true
        : tokenLiveAllowance
        ? tokenLiveAllowance >= margin / BigInt(10) ** BigInt(18 - currentMargin.marginAssetDrop.decimals)
        : false
    );
  }, [tokenLiveAllowance, currentMargin, margin]);
  const [oi, setOi] = useState<any>({ max: 0, oi: 0 });
  const liveTokenDetails = useTokenDetailsDataOptions(pairIndex);
  useEffect(() => {
    if (liveTokenDetails?.pairData) {
      const { pairData } = liveTokenDetails;
      setOi({ max: formatEther((pairData as any)[5] as bigint), oi: formatEther((pairData as any)[4] as bigint) });
    }
  }, [liveTokenDetails]);

  const liveProxyApproval = useProxyApproval();

  const orderTypeRef = useRef(orderType);
  useEffect(() => {
    orderTypeRef.current = orderType;
  }, [orderType]);

  useEffect(() => {
    checkProxyWallet(userAddress as string);
  }, [userAddress, chain]);

  useEffect(() => {
    currentPairIndex.current = pairIndex;
    try {
      setOpenPrice(((oracleData[currentPairIndex.current] as any).price / 1e18).toPrecision(5));
      setSpread(((oracleData[currentPairIndex.current] as any).spread / 1e10).toPrecision(5));
    } catch {}
  }, [pairIndex]);

  useEffect(() => {
    [oracleSocket].forEach((socket) => {
      socket.on('data', (data: any) => {
        if (!data[currentPairIndex.current]) {
          setMarketAvailable(false);
          setOpenPrice('');
          return;
        }
        setMarketAvailable(true);
        setMarketClosed(data[currentPairIndex.current].is_closed);
        if (orderTypeRef.current === 'Market') {
          setOpenPrice((data[currentPairIndex.current].price / 1e18).toString());
          setSpread((data[currentPairIndex.current].spread / 1e10).toPrecision(5));
        }
      });
    });
  }, []);

  useEffect(() => {
    setMarginAssets({ marginAssetDrop: getNetwork(chain?.id ?? 42161).marginAssets });
    const _currentMargin = { marginAssetDrop: getNetwork(chain?.id ?? 42161).marginAssets[1] };
    setCurrentMargin(_currentMargin);
    currentMarginRef.current = _currentMargin;

    const _currentReturnMargin = { marginAssetDrop: getNetwork(chain?.id ?? 42161).marginAssets[0] };
    setCurrentReturnMargin(_currentReturnMargin);
    currentReturnMarginRef.current = _currentReturnMargin;
  }, [chain]);

  function handleDirectionChange(value: boolean) {
    setIsLong(value);
  }

  function handleMarginChange(event: any) {
    // setMargin(marginScale(parseFloat(event.target.value), tokenBalance).toString());
    const scaled = marginScale(Number(event.target.value), tokenBalance);
    setMargin(BigInt(scaled * 1e18));
    setCollateralDisplay(scaled);
  }

  function handleSetOpenPrice(value: any) {
    if (orderType === 'Market') {
      setOrderType('Limit');
      setOpenPrice(value.slice(0, 7));
    } else {
      setOpenPrice(value);
    }
  }

  function handleSetDuration(value: any) {
    if (
      pairIndex === 5 ||
      pairIndex === 6 ||
      pairIndex === 7 ||
      pairIndex === 8 ||
      pairIndex === 9 ||
      pairIndex === 10 ||
      pairIndex === 39 ||
      pairIndex === 40 ||
      pairIndex === 41 ||
      pairIndex === 2 ||
      pairIndex === 32
    ) {
      const optionCloseTime = new Date(Date.now() + value * 1000);
      const utcHour = optionCloseTime.getUTCHours();
      // If its saturday or sunday close
      if (optionCloseTime.getUTCDay() === 6 || optionCloseTime.getUTCDay() === 0) {
        setMarketWillCloseError(true);
      } else if (utcHour === 20 || utcHour === 21 || utcHour === 22 || utcHour === 23) {
        setMarketWillCloseError(true);
      } else {
        setMarketWillCloseError(false);
      }
    } else {
      setMarketWillCloseError(false);
    }
    setDuration(value);
  }

  const doMarginChange = (prop: string, value: string | number | boolean) => {
    const _currentMargin = { ...currentMargin, [prop]: value };
    setCurrentMargin(_currentMargin);
    currentMarginRef.current = _currentMargin;
    setTokenBalance('Loading...');
  };

  function handleCollateralInput(event: any) {
    if (event === undefined || event === '') {
      setCollateralDisplay(0);
      setMargin(BigInt(0));
    } else {
      setCollateralDisplay(event);
      setMargin(parseEther(decimalNumberToString(event)));
    }
  }

  const orderTypeArray = ['Market', 'Limit', 'Stop'];
  // const orderInputLabel =
  //   orderType === 'Market' ? t('orderForm.market') : orderType === 'Limit' ? t('orderForm.limit') : t('orderForm.stop');

  const hour = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);
  const handleTimeChange = (_hours: number, _minutes: number, _seconds: number) => {
    setDuration(3600 * _hours + 60 * _minutes + _seconds);
  };

  return (
    <Container>
      {/* <FormLabelContainer>
        <FormLabel>{t('orderForm.orderForm')}</FormLabel>
      </FormLabelContainer> */}
      <FormContainer>
        <FormAction sx={{ backgroundColor: '#211E2E', borderRadius: '3px' }}>
          <TradeTypeButton
            name="long"
            onClick={() => {
              // routeOpening(true);
              setIsLong(true);
            }}
            active={isLong ? 1 : 0}
          >
            {t('orderForm.long')}
          </TradeTypeButton>
          <TradeTypeButton
            name="short"
            onClick={() => {
              // routeOpening(true);
              setIsLong(false);
            }}
            active={isLong ? 0 : 1}
          >
            {t('orderForm.short')}
          </TradeTypeButton>
        </FormAction>
        <div style={{ margin: '11px' }} />
        {/* <FormAction sx={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <OrderTypeButton
            onClick={() => setOrderType('Market')}
            sx={{
              backgroundColor: orderType === 'Market' ? '#3772ff' : '#222630',
              color: orderType === 'Market' ? '#FFFFFF' : '#B1B5C3',
              '&:hover': {
                backgroundColor: orderType === 'Market' ? '#3772ff' : '#222630',
                color: orderType === 'Market' ? '#FFFFFF' : '#3772ff'
              }
            }}
          >
            {t('orderForm.market')}
          </OrderTypeButton>
          <OrderTypeButton
            onClick={() => {
              setOrderType('Limit');
              setOpenPrice(openPrice.slice(0, 8));
            }}
            sx={{
              backgroundColor: orderType === 'Limit' ? '#3772ff' : '#222630',
              color: orderType === 'Limit' ? '#FFFFFF' : '#B1B5C3',
              '&:hover': {
                backgroundColor: orderType === 'Limit' ? '#3772ff' : '#222630',
                color: orderType === 'Limit' ? '#FFFFFF' : '#3772ff'
              }
            }}
          >
            {t('orderForm.limit')}
          </OrderTypeButton>
          <OrderTypeButton
            onClick={() => {
              setOrderType('Stop');
              setOpenPrice(openPrice.slice(0, 8));
            }}
            sx={{
              backgroundColor: orderType === 'Stop' ? '#3772ff' : '#222630',
              color: orderType === 'Stop' ? '#FFFFFF' : '#B1B5C3',
              '&:hover': {
                backgroundColor: orderType === 'Stop' ? '#3772ff' : '#222630',
                color: orderType === 'Stop' ? '#FFFFFF' : '#3772ff'
              }
            }}
          >
            {t('orderForm.stop')}
          </OrderTypeButton>
        </FormAction> */}
        <FormAction sx={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CommonDropDown arrayData={orderTypeArray} name="order" state={orderType} setState={setOrderType} />
        </FormAction>
        <div style={{ margin: '11px' }} />
        {/* <TigrisInput
          label={t('orderForm.price')}
          placeholder="-"
          value={
            !isMarketAvailable
              ? ''
              : orderType === 'Market'
              ? getOpenPrice().replace('NaN', '-')
              : openPrice.replace('NaN', '-')
          }
          setValue={handleSetOpenPrice}
          onClick={() => {
            setOrderType(orderType !== 'Market' ? orderType : 'Limit');
            handleSetOpenPrice(getOpenPrice());
            setExpectingClick(true, 'Limit', (price, type) => handleSetOpenPrice(price as string));
          }}
        /> */}
        <OrderInput
          label={`${orderType} ${t('orderForm.price')}`}
          value={
            !isMarketAvailable
              ? ''
              : orderType === 'Market'
              ? getOpenPrice().replace('NaN', '-')
              : openPrice.replace('NaN', '-')
          }
          setValue={handleSetOpenPrice}
          onClick={() => {
            setOrderType(orderType !== 'Market' ? orderType : 'Limit');
            handleSetOpenPrice(getOpenPrice());
            setExpectingClick(true, 'Limit', (price, type) => handleSetOpenPrice(price as string));
          }}
          currency={'USD'}
        />
        <div style={{ margin: '13px' }}></div>
        <OrderDurationContainer>
          <OrderDurationLabel>Select Duration: 3 Min - 4 Hours</OrderDurationLabel>
          <OrderDurationInputContainer>
            <OrderDurationInput label={'H'} value={hour} setValue={(e) => handleTimeChange(e, minutes, seconds)} />
            <OrderDurationInput label={'Min'} value={minutes} setValue={(e) => handleTimeChange(hour, e, seconds)} />
            <OrderDurationInput label={'Sec'} value={seconds} setValue={(e) => handleTimeChange(hour, minutes, e)} />
          </OrderDurationInputContainer>
        </OrderDurationContainer>
        <div style={{ margin: '11px' }}></div>
        {/* <TigrisTimeInput label="Duration (3m - 4h)" duration={duration} setDuration={handleSetDuration} /> */}
        <FormAction sx={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <OrderTypeButton
            onClick={() => {
              handleSetDuration(60 * 3);
            }}
            sx={{
              backgroundColor: duration === 60 * 3 ? '#1D1934' : '#191923',
              border: duration === 60 * 3 ? '1px solid #1541D8' : 'none',
              color: duration === 60 * 3 ? '#FFFFFF' : '#9497A9',
              '&:hover': {
                backgroundColor: duration === 60 * 3 ? '#1D1934' : '#191923',
                color: duration === 60 * 3 ? '#FFFFFF' : '#9497A9'
              }
            }}
          >
            3 {t('Min')}
          </OrderTypeButton>
          <OrderTypeButton
            onClick={() => {
              handleSetDuration(60 * 30);
            }}
            sx={{
              backgroundColor: duration === 60 * 30 ? '#1D1934' : '#191923',
              border: duration === 60 * 30 ? '1px solid #1541D8' : 'none',
              color: duration === 60 * 30 ? '#FFFFFF' : '#9497A9',
              '&:hover': {
                backgroundColor: duration === 60 * 30 ? '#1D1934' : '#191923',
                color: duration === 60 * 30 ? '#FFFFFF' : '#9497A9'
              }
            }}
          >
            30 {t('Min')}
          </OrderTypeButton>
          <OrderTypeButton
            onClick={() => {
              handleSetDuration(60 * 60);
            }}
            sx={{
              backgroundColor: duration === 60 * 60 ? '#1D1934' : '#191923',
              border: duration === 60 * 60 ? '1px solid #1541D8' : 'none',
              color: duration === 60 * 60 ? '#FFFFFF' : '#9497A9',
              '&:hover': {
                backgroundColor: duration === 60 * 60 ? '#1D1934' : '#191923',
                color: duration === 60 * 60 ? '#FFFFFF' : '#9497A9'
              }
            }}
          >
            1 {t('Hour')}
          </OrderTypeButton>
          <OrderTypeButton
            onClick={() => {
              handleSetDuration(60 * 240);
            }}
            sx={{
              backgroundColor: duration === 60 * 240 ? '#1D1934' : '#191923',
              border: duration === 60 * 240 ? '1px solid #1541D8' : 'none',
              color: duration === 60 * 240 ? '#FFFFFF' : '#9497A9',
              '&:hover': {
                backgroundColor: duration === 60 * 240 ? '#1D1934' : '#191923',
                color: duration === 60 * 240 ? '#FFFFFF' : '#9497A9'
              }
            }}
          >
            4 {t('Hour')}
          </OrderTypeButton>
        </FormAction>
        <FormArea>
          <OrderInput
            label={'Collateral'}
            value={collateralDisplay.toString()}
            setValue={handleCollateralInput}
            currency={currentMargin.marginAssetDrop.name}
          />
          {/* <TigrisInput
            label="Collateral"
            value={collateralDisplay.toString()}
            setValue={handleCollateralInput}
            width="100%"
          /> */}
          <TigrisSlider
            defaultValue={10}
            aria-label="Default"
            valueLabelDisplay="auto"
            marks={[
              { value: 10, label: '10' },
              {
                value: 100,
                label: isBalanceVisible
                  ? tokenBalance === 'Loading...'
                    ? '10'
                    : String(Math.max(Math.floor(Number(tokenBalance)), 10))
                  : '•'
              }
            ]}
            min={10}
            step={0.001}
            max={100}
            scale={(value: number) => marginScale(value, tokenBalance)}
            onChange={(event: any) => handleMarginChange(event)}
            // value={Math.sqrt(parseFloat(margin))}
          />
        </FormArea>
        <h5 style={{ marginTop: '10px', marginBottom: '15px' }}>
          {t('Collateral')} {t('Assets')}
        </h5>
        <FormArea sx={{ paddingTop: '0px' }}>
          <IconDropDownMenu
            arrayData={marginAssets.marginAssetDrop}
            name="marginAssetDrop"
            state={currentMargin.marginAssetDrop}
            setState={doMarginChange}
          />
          <AssetBalance>
            <AssetBalanceLabel>
              {t('orderForm.balance')}
              <IconButton onClick={() => setBalanceVisible(!isBalanceVisible)}>
                {isBalanceVisible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
              </IconButton>
            </AssetBalanceLabel>
            {isBalanceVisible ? tokenBalance : '• • • • • • •'}
          </AssetBalance>
        </FormArea>
        <div style={{ margin: '22px' }} />
        {/* {getButtonText() === 'READY' ? (
          <FormAction>
            <LongButton
              onClick={() => routeOpening(true)}
              sx={{
                backgroundColor: '#26a69a',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: '#26a69a', color: '#FFFFFF' }
              }}
            >
              {t('orderForm.long')}
            </LongButton>
            <ShortButton
              onClick={() => routeOpening(false)}
              sx={{
                backgroundColor: '#EF5350',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: '#EF5350', color: '#FFFFFF' }
              }}
            >
              {t('orderForm.short')}
            </ShortButton>
          </FormAction>
        ) : (
        )} */}
        <ApproveButton onClick={() => routeTrade()} status={getButtonOnline()}>
          {getButtonText()}
        </ApproveButton>
        <Alert>
          {chain === undefined || userAddress === undefined ? (
            <Alert>
              <ErrorOutline sx={{ color: '#EB5757' }} fontSize="small" />
              <AlertContent>{t('orderForm.notConnectedMsg')}</AlertContent>
            </Alert>
          ) : (
            <></>
          )}
        </Alert>
      </FormContainer>
    </Container>
  );

  function getOpenPrice() {
    let _openPrice;
    if (isLong) {
      _openPrice = parseFloat(openPrice); // + parseFloat(openPrice) * (orderType === 'Market' ? parseFloat(spread) : 0);
      return _openPrice.toPrecision(7);
    } else {
      _openPrice = parseFloat(openPrice); // - parseFloat(openPrice) * (orderType === 'Market' ? parseFloat(spread) : 0);
      return _openPrice.toPrecision(7);
    }
  }

  function marginScale(value: number, _upperLimit: string) {
    if (_upperLimit === 'Loading...') return 10;
    const upperLimit = Math.max(Number(_upperLimit), 10);
    // Normalizing the value to [0, 1]
    const normalizedValue = value / 100;

    // Calculate logarithmic range and scale the value
    const minLog = Math.log(5);
    const maxLog = Math.log(upperLimit);
    const scale = (maxLog - minLog) * normalizedValue + minLog;

    // Round it to nearest integer to avoid fractional numbers
    return Math.floor(Math.exp(scale)) < 10 ? 10 : Math.floor(Math.exp(scale));
  }

  /*
  =============
  TRADING LOGIC
  =============
  */

  function getButtonOnline() {
    const s = getTradeStatus();
    const isOnline = s === 'Approve' || s === 'Proxy' || s === 'Ready' || s === 'Gas';
    return isOnline ? 1 : 0;
  }

  function getButtonText() {
    const s = getTradeStatus();
    const txt =
      s === 'Approve'
        ? `${t('orderForm.approve')} ${currentMargin.marginAssetDrop.name}`
        : s === 'Proxy'
        ? proxyState === 0
          ? t('orderForm.approveProxy')
          : proxyState === 2
          ? t('orderForm.migrateProxy')
          : proxyState === 1 && t('orderForm.fundProxy')
        : s === 'Ready'
        ? 'READY'
        : s === 'NotConnected'
        ? t('header.connectWallet')
        : s === 'Unavailable'
        ? t('orderForm.marketUnavailable')
        : s === 'Closed'
        ? t('orderForm.marketClosed')
        : s === 'WillClose'
        ? t('orderForm.marketWillClosed')
        : s === 'MaxOi'
        ? t('orderForm.openLimitReached')
        : s === 'Balance'
        ? t('orderForm.notEnoughBalance')
        : s === 'PosSize'
        ? t('orderForm.sizeTooLow')
        : s === 'Gas'
        ? t('orderForm.fundProxy')
        : t('orderForm.foundBug');
    return txt;
  }

  function getTradeStatus() {
    let status;
    chain === undefined || userAddress === undefined
      ? (status = 'NotConnected')
      : !isMarketAvailable
      ? (status = 'Unavailable')
      : isMarketClosed
      ? (status = 'Closed')
      : isMarketWillCloseError
      ? (status = 'WillClose')
      : Number(oi.max) - Number(oi.oi) < Number(formatEther(margin))
      ? (status = 'MaxOi')
      : !isTokenAllowed
      ? (status = 'Approve')
      : proxyState !== 3
      ? (status = 'Proxy')
      : parseFloat(formatEther(margin)) > parseFloat(tokenBalance)
      ? (status = 'Balance')
      : (status = 'Ready');
    return status;
  }

  function routeTrade() {
    const s = getTradeStatus();
    s === 'NotConnected'
      ? openConnectModal?.()
      : s === 'Approve'
      ? approve?.()
      : s === 'Proxy'
      ? approveProxy()
      : s === 'Ready' && (orderType === 'Market' ? initiateMarketOrder(true) : initiateLimitOrder(true));
  }

  function routeOpening(is: any) {
    if (orderType === 'Market') {
      initiateMarketOrder(is);
    } else {
      initiateLimitOrder(is);
    }
  }

  async function approveProxy() {
    if (userAddress === undefined || chain === undefined) {
      toast.error(t('Wallet not connected!'));
      return;
    }
    if (chain.id !== 42161 && chain.id !== 137 && chain.id !== 82) {
      toast.error(t('Wrong network!'));
      return;
    }
    const traderGas = await publicClient.getBalance({ address: userAddress });
    const proxyGas = getNetwork(chain?.id).proxyGas;
    if (Number(traderGas) / 1e18 < Number(proxyGas)) {
      LogError(userAddress, 'NO_GAS', false, 0, 'FUND_PROXY');
      toast.error(`Need at least ${proxyGas} ${chain.id === 42161 ? 'ETH' : 'MATIC'} to fund your proxy wallet!`);
      return;
    }
    toast.loading(`${t('Proxy approval pending')}...`);
    try {
      await unlockProxyWallet();
      const { abis, proxyGas, addresses, minProxyGas } = getNetwork(chain.id);
      const proxyAddress = getProxyAddress();
      if (
        (proxyAddress.toLowerCase() !== String(liveProxyAddress).toLowerCase() || proxyState === 1) &&
        proxyAddress !== ''
      ) {
        const traderGasData = await publicClient.readContract({
          address: addresses.forwarder as `0x${string}`,
          abi: abis.forwarder,
          functionName: 'userGas',
          args: [userAddress]
        });
        const traderGas = formatEther(traderGasData as bigint);
        const walletClient = await getWalletClient();
        if (walletClient === undefined || walletClient === null) return;
        const hash = await walletClient.writeContract({
          address: addresses.trading as `0x${string}`,
          abi: abis.trading,
          functionName: 'approveProxy',
          args: [proxyAddress],
          value: Number(traderGas) < minProxyGas ? parseEther(proxyGas as `${number}`) : BigInt(0),
          chain
        });
        try {
          await waitForTransaction({ hash });
          toast.dismiss();
          toast.success(t('Successfully approved proxy!'));
        } catch (e: any) {
          toast.dismiss();
          toast.error(t('Proxy approval failed!'));
          LogError(userAddress, e.message, 0, hash, 'APPROVE_PROXY');
        }
      }
      // eslint-disable-next-line
      setTimeout(async () => {
        setProxyActionCounter(proxyActionCounter + 1);
        if (
          getProxyAddress().toLowerCase() === activeProxyAddress.toLowerCase() &&
          Number(await getProxyBalance()) >= minProxyGas
        ) {
          setProxyState(3);
        }
      }, 1000);
    } catch (e: any) {
      console.log(e);
      toast.dismiss();
      toast.error(t('Proxy approval failed!'));
      LogError(userAddress, e.message, 0, 0, 'APPROVE_PROXY');
    }
  }

  async function initiateMarketOrder(islong: boolean) {
    const currentNetwork = getNetwork(chain === undefined ? 0 : chain.id);
    const _margin = margin;

    const _ref = cookies.get('ref') ? cookies.get('ref') : addressZero;

    const _tradeInfo = [
      _margin,
      currentMargin.marginAssetDrop.address,
      currentMargin.marginAssetDrop.stablevault,
      currentReturnMargin.marginAssetDrop.address,
      islong,
      pairIndex,
      duration,
      _ref
    ];

    toast.loading(`${t('Opening market trade')}...`);
    const _oracleData: any = oracleData[pairIndex];

    const spreadPrices = {
      ask: (Number(_oracleData.price) + (Number(_oracleData.price) * Number(_oracleData.spread)) / 1e10) / 1e18,
      bid: (Number(_oracleData.price) - (Number(_oracleData.price) * Number(_oracleData.spread)) / 1e10) / 1e18
    };
    setExecutionPrice(_oracleData.price / 1e18);
    try {
      const optionsABI = currentNetwork.abis.options;
      const chainId = chain?.id;
      const inputDataParams = [_tradeInfo, NO_PERMIT, userAddress, NO_PRICE_DATA];
      const inputData = encodeFunctionData({
        abi: optionsABI,
        functionName: 'openTrade',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'openTrade', currentNetwork.addresses.options, pairIndex);
      setExecutionPrice(0);
    } catch (err: any) {
      setExecutionPrice(0);
      toast.dismiss();
      toast.error(`${t('Opening trade failed')} ${String(err.response.data.reason)}}`);
      console.log(err);
    }
  }

  async function initiateLimitOrder(islong: boolean, price?: string, type?: string) {
    const _margin = margin;
    const openPriceInput = price !== undefined ? parseEther(price) : BigInt(Number(openPrice) * 1e18);
    type === undefined && (type = orderType);

    const _ref = cookies.get('ref') ? cookies.get('ref') : addressZero;

    const _tradeInfo = [
      _margin,
      currentMargin.marginAssetDrop.address,
      currentMargin.marginAssetDrop.stablevault,
      currentReturnMargin.marginAssetDrop.address,
      islong,
      pairIndex,
      duration,
      _ref
    ];

    if (
      islong &&
      type === 'Limit' &&
      parseInt(openPriceInput.toString()) > parseInt((oracleData[pairIndex] as any).price)
    ) {
      toast.warn(t('Order price too high!'));
      return;
    } else if (
      !islong &&
      type === 'Stop' &&
      parseInt(openPriceInput.toString()) > parseInt((oracleData[pairIndex] as any).price)
    ) {
      toast.warn(t('Stop order price too high!'));
      return;
    } else if (
      islong &&
      type === 'Stop' &&
      parseInt(openPriceInput.toString()) < parseInt((oracleData[pairIndex] as any).price)
    ) {
      toast.warn(t('Order price too low!'));
      return;
    } else if (
      !islong &&
      type === 'Limit' &&
      parseInt(openPriceInput.toString()) < parseInt((oracleData[pairIndex] as any).price)
    ) {
      toast.warn(t('Order price too low!'));
      return;
    }

    try {
      toast.loading(`${t('Opening limit position')}...`);
      setExecutionPrice(Number(price !== undefined ? price : openPrice));

      const currentNetwork = getNetwork(chain === undefined ? 0 : chain.id);
      const optionsABI = currentNetwork.abis.options;
      const chainId = chain?.id;
      const inputDataParams = [_tradeInfo, type === 'Limit' ? 1 : 2, parseEther(openPrice), NO_PERMIT, userAddress];
      const inputData = encodeFunctionData({
        abi: optionsABI,
        functionName: 'initiateLimitOrder',
        args: inputDataParams
      });
      await forwarder(chainId, inputData, 'initiateLimitOrder', currentNetwork.addresses.options);
      setExecutionPrice(0);
    } catch (err: any) {
      toast.dismiss();
      toast.error(`${t('Creating limit order failed!')} ${String(err.response.data.reason)}`);
      setExecutionPrice(0);
      console.log(err);
    }
  }
};

const Container = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  minHeight: '560px',
  height: '100%',
  order: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  [theme.breakpoints.down('md')]: {
    gridColumn: '1 / 3'
  }
}));

const FormLabel = styled(Box)(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: '12px',
  lineHeight: '15px',
  letterSpacing: '0.1em',
  fontweight: 400
}));

const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: '#161221',
  marginRight: '8px',
  paddingRight: '20px',
  paddingLeft: '20px',
  paddingBottom: '10px',
  [theme.breakpoints.down(1280)]: {
    marginBottom: '8px'
  }
}));

const FormAction = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '36px',
  marginTop: '17px'
}));

const TradeTypeButton = styled(Button)<{ active: number }>(({ theme, active, name }) => ({
  width: '100%',
  height: '100%',
  borderRadius: name === 'long' ? (active === 1 ? '3px' : '3px 0px 0px 3px') : active === 1 ? '3px' : '0px 3px 3px 0px',
  background: active === 1 ? (name === 'long' ? '#1D3C38' : '#391F31') : '#211E2E',
  color: active === 1 ? (name === 'long' ? '#35DF8D' : '#E22746') : '#777E90',
  fontWeight: '700',
  '&:hover': {
    background: active === 1 ? (name === 'long' ? '#1D3C38' : '#391F31') : '#211E2E'
  }
}));

const OrderTypeButton = styled(Button)(({ theme }) => ({
  width: '50%',
  height: '100%',
  borderRadius: '0px',
  textTransform: 'none'
}));

const FormArea = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, 2fr)',
  gap: '12px',
  paddingTop: '20px'
}));

const AssetBalance = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '12px',
  justifyContent: 'space-between'
}));

const AssetBalanceLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '3px'
}));

interface IApproveButton {
  status: number;
}
const ApproveButton = styled(Button)(({ status }: IApproveButton) => ({
  marginTop: '0px',
  borderRadius: '0px',
  width: '100%',
  textTransform: 'none',
  background: status === 1 ? 'linear-gradient(269deg, #0746DB 0.13%, #8411BF 95.84%)' : '#2F3135',
  '&:hover': {
    background: status === 1 ? 'linear-gradient(269deg, #0746DB 0.13%, #8411BF 95.84%)' : '#2F3135'
  }
}));

const Alert = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginTop: '10px'
}));

const AlertContent = styled(Box)(({ theme }) => ({
  fontSize: '11px',
  lineHeight: '20px',
  color: 'rgba(177, 181, 195, 0.5)'
}));

const FormLabelContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#161221',
  width: '100%',
  height: '50px',
  padding: '0 14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const FormSwitchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '5px',
  alignItems: 'center'
}));

const GasSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#26A69A',
        opacity: 1,
        border: 0
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5
      }
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#26A69A',
      border: '6px solid #fff'
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600]
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3
    }
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1
  }
}));

const OrderDurationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
}));

const OrderDurationLabel = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '20px',
  color: '#B1B5C3'
}));

const OrderDurationInputContainer = styled(Box)(({ theme }) => ({
  background: 'none',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  width: '100%',
  overflow: 'hidden'
}));
