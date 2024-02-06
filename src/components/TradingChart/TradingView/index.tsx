import { useContext, useEffect, useRef, useState } from 'react';
import './src/index.css';
import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  IChartWidgetApi,
  IOrderLineAdapter,
  LanguageCode,
  ResolutionString,
  widget
} from '../../../charting_library';
import Datafeed from './datafeed';
import { getNetwork } from '../../../constants/networks';
import { oracleSocket } from '../../../context/socket';
import { toast } from 'react-toastify';
import { forwarder, getProxyWalletClients } from '../../../proxy_wallet';
import { oracleData } from 'src/context/socket';
import { useAccount, useFeeData, useNetwork, useWalletClient } from 'wagmi';
import { Timezone } from 'src/charting_library/datafeed-api';
import { encodeFunctionData, parseEther } from 'viem';
import { waitForTransaction } from '@wagmi/core';
import { ChartMechanicsContext } from '../../../context/ChartMechanics';
import { localStorageGet } from '../../../utils/localStorage';
import { useTokenBalance } from '../../../hook/useToken';
import { getMarginAndLeverageFromLiqPrice } from '../../../utils/getMarginAndLeverageFromLiqPrice';
import { NO_PERMIT, NO_PRICE_DATA } from '../../../constants/EmptyDataStructs';

export interface ChartContainerProps {
  asset: any;
  positionData: any;
  showBidAsk: boolean;
  onWidgetCreated: (widget: IChartingLibraryWidget) => void;
}

function getLanguageFromURL(): LanguageCode | null {
  const regex = /[?&]lang=([^&#]*)/;
  const results = regex.exec(location.search);
  return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode);
}

export const TVChartContainer = ({ asset, positionData, showBidAsk, onWidgetCreated }: ChartContainerProps) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { assets } = getNetwork(0);
  const { data: walletClient } = useWalletClient();
  const { executionPrice } = useContext(ChartMechanicsContext);
  const { data: feeData } = useFeeData();

  const posData = positionData;

  const widgetOptions: ChartingLibraryWidgetOptions = {
    symbol: assets[asset].name,
    // tslint:disable-next-line:no-any
    datafeed: Datafeed,
    interval: String(localStorageGet('lastResolution', 1)) as ResolutionString,
    container: 'tv_chart_container',
    library_path: '/charting_library/' as string,
    locale: getLanguageFromURL() ?? 'en',
    disabled_features: [
      'header_symbol_search',
      'save_chart_properties_to_local_storage',
      'use_localstorage_for_settings',
      'header_compare',
      'header_settings'
    ],
    enabled_features: ['study_template'],
    charts_storage_api_version: '1.1',
    client_id: 'tradingview.com',
    user_id: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studies_overrides: {},
    theme: 'Dark',
    overrides: {
      'paneProperties.background': '#161221',
      'paneProperties.backgroundType': 'solid',
      'scalesProperties.showSymbolLabels': false,
      rightOffset: 10
    },
    custom_css_url: 'css/style.css',
    toolbar_bg: '#161221',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
    loading_screen: { backgroundColor: '#161221' },
    drawings_access: {
      type: 'black',
      tools: [
        {
          name: 'Font Icons',
          grayed: false
        }
      ]
    },
    saved_data: localStorageGet('chart-data', undefined),
    auto_save_delay: 0.5
  };
  const tvWidget = useRef<any>(null);

  useEffect(() => {
    currentAsset.current = asset;
    localStorage.setItem('LastPairSelected', asset);
    try {
      try {
        AskLine.current.remove();
        BidLine.current.remove();
      } catch {}
      tvWidget.current.setSymbol(
        assets[asset].name,
        tvWidget.current.symbolInterval().interval as ResolutionString,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {}
      );
    } catch {
      // eslint-disable-next-line new-cap
      tvWidget.current = new widget(widgetOptions);
      tvWidget.current.onChartReady(() => {
        onWidgetCreated(tvWidget.current);
      });
    }
  }, [asset]);

  const liveTigUSDBalance = useTokenBalance(getNetwork(chain?.id ?? 42161).marginAssets[0].address);
  const balanceRef = useRef(BigInt(0));
  useEffect(() => {
    if (liveTigUSDBalance) {
      balanceRef.current = liveTigUSDBalance;
    }
  }, [liveTigUSDBalance]);

  const BidLine = useRef<any>(null);
  const AskLine = useRef<any>(null);
  const currentAsset = useRef<any>(null);
  const assetChanged = useRef<any>(false);
  useEffect(() => {
    assetChanged.current = true;
  }, [asset]);

  useEffect(() => {
    tvWidget.current?.onChartReady(() => {
      tvWidget.current?.subscribe('onAutoSaveNeeded', () => {
        try {
          tvWidget.current.save((chartData: any) => {
            localStorage.setItem('chart-data', JSON.stringify(chartData));
          });
        } catch (err) {
          console.log('Failed to save chart data to localStorage:', err);
        }
      });
    });
  }, []);

  useEffect(() => {
    tvWidget.current?.onChartReady(() => {
      [oracleSocket].forEach((socket) => {
        socket.on('data', (data: any) => {
          if (!data[currentAsset.current] || !showBidAsk) return;
          const spreadPrices = {
            ask:
              (Number(data[currentAsset.current].price) +
                (Number(data[currentAsset.current].price) * Number(data[currentAsset.current].spread)) / 1e10) /
              1e18,
            bid:
              (Number(data[currentAsset.current].price) -
                (Number(data[currentAsset.current].price) * Number(data[currentAsset.current].spread)) / 1e10) /
              1e18
          };
          try {
            try {
              if (assetChanged.current) throw new Error('Asset changed');
              BidLine.current.setPrice(spreadPrices.bid);
            } catch {
              BidLine.current = (tvWidget.current.activeChart() as IChartWidgetApi)
                .createPositionLine({
                  disableUndo: true
                })
                .setText('BID')
                .setPrice(spreadPrices.bid)
                .setQuantity('')
                .setLineStyle(1)
                .setLineColor('#EF534F')
                .setBodyBorderColor('rgba(0,0,0,0)')
                .setBodyBackgroundColor('rgba(0,0,0,0)')
                .setQuantityBorderColor('rgba(0,0,0,0)')
                .setQuantityBackgroundColor('rgba(0,0,0,0)')
                .setBodyTextColor('#EF534F')
                .setBodyFont('400 10pt DM Sans');
            }
            try {
              if (assetChanged.current) {
                assetChanged.current = false;
                throw new Error('Asset changed');
              }
              AskLine.current.setPrice(spreadPrices.ask);
            } catch {
              AskLine.current = (tvWidget.current.activeChart() as IChartWidgetApi)
                .createPositionLine({
                  disableUndo: true
                })
                .setText('ASK')
                .setPrice(spreadPrices.ask)
                .setQuantity('')
                .setLineStyle(1)
                .setLineColor('#26A69A')
                .setBodyBorderColor('rgba(0,0,0,0)')
                .setBodyBackgroundColor('rgba(0,0,0,0)')
                .setQuantityBorderColor('rgba(0,0,0,0)')
                .setQuantityBackgroundColor('rgba(0,0,0,0)')
                .setBodyTextColor('#26A69A')
                .setBodyFont('400 10pt DM Sans');
            }
          } catch (err) {}
        });
      });
    });
  }, []);

  const posLines = useRef<any[]>([]);
  useEffect(() => {
    tvWidget.current?.onChartReady(() => {
      posLines.current.forEach((line) => {
        try {
          line.remove();
          posLines.current = [];
        } catch (err) {
          console.log(err);
        }
      });
      if (executionPrice !== 0) {
        posLines.current.push(
          (tvWidget.current.chart() as IChartWidgetApi).createOrderLine({
            disableUndo: true
          })
        );
        posLines.current[0]
          .setText('')
          .setPrice(executionPrice)
          .setQuantity('')
          .setLineStyle(0)
          .setEditable(false)
          .setLineColor('#3772FF')
          .setBodyBorderColor('rgba(0,0,0,0)')
          .setBodyBackgroundColor('rgba(0,0,0,0)')
          .setBodyTextColor('#3772FF');
      }
      const data = positionData.openPositions.concat(positionData.limitOrders);
      for (let i = 0; i < data.length; i++) {
        if (data[i].asset === asset && data[i].isVisible) {
          try {
            if (parseFloat(data[i].price) !== 0) {
              let line;

              if (data[i].openPrice) {
                line = (tvWidget.current.chart() as IChartWidgetApi)
                  .createOrderLine({
                    disableUndo: true
                  })
                  .setText(data[i].direction ? 'LONG' : 'SHORT')
                  .setPrice(parseFloat(data[i].openPrice) / 1e18)
                  .setQuantity('')
                  .setLineStyle(0)
                  .setEditable(false)
                  .setLineColor(data[i].direction ? '#25A296' : '#EF534F')
                  .setBodyBorderColor('rgba(0,0,0,0)')
                  .setBodyBackgroundColor('rgba(0,0,0,0)')
                  .setQuantityBorderColor('rgba(0,0,0,0)')
                  .setQuantityBackgroundColor('rgba(0,0,0,0)')
                  .setCancelButtonBorderColor('rgba(0,0,0,0)')
                  .setCancelButtonBackgroundColor('rgba(0,0,0,0)')
                  .setBodyTextColor(data[i].direction ? '#25A296' : '#EF534F')
                  .setQuantityTextColor('#FFFFFF')
                  .setCancelButtonIconColor('rgba(0,0,0,0)')
                  .setQuantityFont('400 13pt DM Sans')
                  .setBodyFont('400 13pt DM Sans');
              } else {
                line = (tvWidget.current.chart() as IChartWidgetApi)
                  .createOrderLine({
                    disableUndo: true
                  })
                  .setText(
                    (parseFloat(data[i].leverage) / 1e18).toFixed(0) +
                      'X' +
                      (data[i].orderType === 0 ? '' : data[i].orderType === 1 ? ' LIMIT' : ' STOP') +
                      (data[i].direction ? ' LONG' : ' SHORT')
                  )
                  .setPrice(parseFloat(data[i].price) / 1e18)
                  .setQuantity('')
                  .setLineStyle(0)
                  .setEditable(false)
                  .setLineColor(data[i].orderType === 0 ? '#FFFFFF' : '#3772FF')
                  .setBodyBorderColor('rgba(0,0,0,0)')
                  .setBodyBackgroundColor('rgba(0,0,0,0)')
                  .setQuantityBorderColor('rgba(0,0,0,0)')
                  .setQuantityBackgroundColor('rgba(0,0,0,0)')
                  .setCancelButtonBorderColor('rgba(0,0,0,0)')
                  .setCancelButtonBackgroundColor('rgba(0,0,0,0)')
                  .setBodyTextColor(data[i].orderType === 0 ? '#FFFFFF' : '#3772FF')
                  .setQuantityTextColor('#FFFFFF')
                  .setCancelButtonIconColor('rgba(0,0,0,0)')
                  .setQuantityFont('400 13pt DM Sans')
                  .setBodyFont('400 13pt DM Sans');
              }

              posLines.current.push(line);
            }
            if (!showBidAsk || !data[i].leverage) continue;
            if (parseFloat(data[i].slPrice) !== 0) {
              const line = (tvWidget.current.chart() as IChartWidgetApi)
                .createOrderLine({
                  disableUndo: true
                })
                .onMove(() => {
                  updateTPSL(data[i], false, line);
                })
                .setText(
                  (parseFloat(data[i].leverage) / 1e18).toFixed(0) +
                    'X' +
                    (data[i].orderType === 0 ? '' : data[i].orderType === 1 ? ' LIMIT' : ' STOP') +
                    (data[i].direction ? ' LONG ' : ' SHORT') +
                    ' STOP LOSS'
                )
                .setPrice(parseFloat(data[i].slPrice) / 1e18)
                .setQuantity('')
                .setLineStyle(0)
                .setEditable(data[i].orderType === 0)
                .setLineColor('#EF534F')
                .setBodyBorderColor('rgba(0,0,0,0)')
                .setBodyBackgroundColor('rgba(0,0,0,0)')
                .setQuantityBorderColor('rgba(0,0,0,0)')
                .setQuantityBackgroundColor('rgba(0,0,0,0)')
                .setCancelButtonBorderColor('rgba(0,0,0,0)')
                .setCancelButtonBackgroundColor('rgba(0,0,0,0)')
                .setBodyTextColor('#EF534F')
                .setTooltip(data[i].orderType === 0 ? 'Drag to edit stop loss' : '')
                .setQuantityTextColor('#EF534F')
                .setCancelButtonIconColor('rgba(0,0,0,0)')
                .setQuantityFont('400 13pt DM Sans')
                .setBodyFont('400 13pt DM Sans');
              posLines.current.push(line);
            }
            if (parseFloat(data[i].tpPrice) !== 0) {
              const line = (tvWidget.current.chart() as IChartWidgetApi)
                .createOrderLine({
                  disableUndo: true
                })
                .onMove(() => {
                  updateTPSL(data[i], true, line);
                })
                .setText(
                  (parseFloat(data[i].leverage) / 1e18).toFixed(0) +
                    'X' +
                    (data[i].orderType === 0 ? '' : data[i].orderType === 1 ? ' LIMIT' : ' STOP') +
                    (data[i].direction ? ' LONG ' : ' SHORT') +
                    ' TAKE PROFIT'
                )
                .setPrice(parseFloat(data[i].tpPrice) / 1e18)
                .setQuantity('')
                .setLineStyle(0)
                .setEditable(data[i].orderType === 0)
                .setLineColor('#26A69A')
                .setBodyBorderColor('rgba(0,0,0,0)')
                .setBodyBackgroundColor('rgba(0,0,0,0)')
                .setQuantityBorderColor('rgba(0,0,0,0)')
                .setQuantityBackgroundColor('rgba(0,0,0,0)')
                .setCancelButtonBorderColor('rgba(0,0,0,0)')
                .setCancelButtonBackgroundColor('rgba(0,0,0,0)')
                .setBodyTextColor('#26A69A')
                .setTooltip(data[i].orderType === 0 ? 'Drag to edit take profit' : '')
                .setQuantityTextColor('#26A69A')
                .setCancelButtonIconColor('rgba(0,0,0,0)')
                .setQuantityFont('400 13pt DM Sans')
                .setBodyFont('400 13pt DM Sans');
              posLines.current.push(line);
            }
            if (parseFloat(data[i].liqPrice) !== 0) {
              const line = (tvWidget.current.chart() as IChartWidgetApi)
                .createOrderLine({
                  disableUndo: true
                })
                .onMove(() => {
                  modifyMargin(data[i], line);
                })
                .setText(
                  (parseFloat(data[i].leverage) / 1e18).toFixed(0) +
                    'X' +
                    (data[i].orderType === 0 ? '' : data[i].orderType === 1 ? ' LIMIT' : ' STOP') +
                    (data[i].direction ? ' LONG ' : ' SHORT') +
                    ' LIQUIDATION'
                )
                .setPrice(parseFloat(data[i].liqPrice) / 1e18)
                .setQuantity('')
                .setLineStyle(0)
                .setEditable(data[i].orderType === 0)
                .setLineColor('#FFFF00')
                .setBodyBorderColor('rgba(0,0,0,0)')
                .setBodyBackgroundColor('rgba(0,0,0,0)')
                .setQuantityBorderColor('rgba(0,0,0,0)')
                .setQuantityBackgroundColor('rgba(0,0,0,0)')
                .setCancelButtonBorderColor('rgba(0,0,0,0)')
                .setCancelButtonBackgroundColor('rgba(0,0,0,0)')
                .setBodyTextColor('#FFFF00')
                .setTooltip(data[i].orderType === 0 ? 'Drag to add/remove margin' : '')
                .setQuantityTextColor('#FFFF00')
                .setCancelButtonIconColor('rgba(0,0,0,0)')
                .setQuantityFont('400 13pt DM Sans')
                .setBodyFont('400 13pt DM Sans');
              posLines.current.push(line);
            }
          } catch {}
        }
      }
    });
  }, [posData, asset, executionPrice]);

  // Trade functions
  async function updateTPSL(position: any, isTP: boolean, line: IOrderLineAdapter) {
    if (address === undefined) return;
    try {
      const currentNetwork = getNetwork(chain?.id ?? 42161);
      const _oracleData: any = oracleData[asset];
      const price = parseEther(`${line.getPrice()}`);

      if (isTP) {
        if (position.direction) {
          if (parseFloat(price.toString()) < parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.warning('Take profit too low');
            line.setPrice(parseFloat(position.tpPrice) / 1e18);
            return;
          }
        } else {
          if (parseFloat(price.toString()) > parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.warning('Take profit too high');
            line.setPrice(parseFloat(position.tpPrice) / 1e18);
            return;
          }
        }
      } else {
        if (position.direction) {
          if (parseFloat(price.toString()) > parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.warning('Stop loss too high');
            line.setPrice(parseFloat(position.slPrice) / 1e18);
            return;
          }
          if (parseFloat(price.toString()) < parseFloat(position.liqPrice) && parseFloat(price.toString()) !== 0) {
            toast.warning('Stop loss past liquidation price!');
            line.setPrice(parseFloat(position.slPrice) / 1e18);
            return;
          }
        } else {
          if (parseFloat(price.toString()) < parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.warning('Stop loss too low!');
            line.setPrice(parseFloat(position.slPrice) / 1e18);
            return;
          }
          if (parseFloat(price.toString()) > parseFloat(position.liqPrice) && parseFloat(price.toString()) !== 0) {
            toast.warning('Stop loss past liquidation price!');
            line.setPrice(parseFloat(position.slPrice) / 1e18);
            return;
          }
        }
      }
      try {
        toast.loading(isTP ? 'Updating take profit...' : 'Updating stop loss...');
        const tradingABI = currentNetwork.abis.trading;
        const inputDataParams = [isTP, position.id, price, address, NO_PRICE_DATA];
        const chainId = chain?.id;
        const inputData = encodeFunctionData({
          abi: tradingABI,
          functionName: 'updateTpSl',
          args: inputDataParams
        });
        await forwarder(chainId, inputData, 'updateTpSl', undefined, currentAsset.current);
      } catch (err: any) {
        isTP ? line.setPrice(parseFloat(position.tpPrice) / 1e18) : line.setPrice(parseFloat(position.slPrice) / 1e18);
        toast.dismiss();
        toast.error(
          (isTP ? 'Updating take profit failed! ' : 'Updating stop loss failed!') + String(err.response.data.reason)
        );
        console.log(err);
      }
    } catch (err) {
      isTP ? line.setPrice(parseFloat(position.tpPrice) / 1e18) : line.setPrice(parseFloat(position.slPrice) / 1e18);
      console.log(err);
    }
  }
  async function modifyMargin(position: any, line: IOrderLineAdapter) {
    const currentNetwork = getNetwork(chain?.id ?? 42161);
    const currentLiq = parseFloat(position.liqPrice) / 1e18;
    const newLiqPrice = line.getPrice();
    const _oracleData: any = oracleData[asset];

    const _price = Number(position.price) / 1e18;
    const _margin = Number(position.margin) / 1e18;
    const _leverage = Number(position.leverage) / 1e18;
    const _accInterest = Number(position.accInterest) / 1e18;
    const isLong: boolean = position.direction;

    const { newLeverage, newMargin } = getMarginAndLeverageFromLiqPrice(
      isLong,
      _price,
      _margin,
      _leverage,
      _accInterest,
      newLiqPrice
    );

    if (isLong) {
      if (newLiqPrice < currentLiq) {
        if (newLeverage < getNetwork(0).assets[position.asset].minLev) {
          toast.warning('Leverage too low!');
          line.setPrice(currentLiq);
          return;
        }
        const toAdd = newMargin - _margin;
        const toAddBigInt = parseEther(`${Number(toAdd.toFixed(18))}`);
        if (toAddBigInt > balanceRef.current) {
          toast.warning(`Insufficient balance to add ${toAdd.toFixed(2)} to margin!`);
          line.setPrice(currentLiq);
          return;
        }

        try {
          toast.loading('Adding margin...');
          if (address === undefined) return;
          const tradingABI = currentNetwork.abis.trading;
          const inputDataParams = [
            position.id,
            currentNetwork.marginAssets[0].stablevault,
            currentNetwork.marginAssets[0].address,
            toAddBigInt,
            NO_PERMIT,
            address,
            NO_PRICE_DATA
          ];
          const chainId = chain?.id;
          const inputData = encodeFunctionData({
            abi: tradingABI,
            functionName: 'addMargin',
            args: inputDataParams
          });
          await forwarder(chainId, inputData, 'addMargin', undefined, currentAsset.current);
        } catch (err: any) {
          line.setPrice(currentLiq);
          toast.dismiss();
          toast.error('Adding margin failed! ' + String(err.response.data.reason));
          console.log(err);
        }
      } else if (newLiqPrice > currentLiq) {
        if (newLiqPrice >= _oracleData.price / 1e18) {
          toast.warning('Too close to liquidation!');
          line.setPrice(currentLiq);
          return;
        }
        if (newLeverage > getNetwork(0).assets[position.asset].maxLev) {
          toast.warning('Leverage too high!');
          line.setPrice(currentLiq);
          return;
        }

        const toRemove = _margin - newMargin;
        try {
          if (address === undefined) return;
          toast.loading('Removing margin...');
          const tradingABI = currentNetwork.abis.trading;
          const inputDataParams = [
            position.id,
            currentNetwork.marginAssets[0].stablevault,
            currentNetwork.marginAssets[0].address,
            parseEther(`${Number(toRemove.toFixed(18))}`),
            address,
            NO_PRICE_DATA
          ];
          const chainId = chain?.id;
          const inputData = encodeFunctionData({
            abi: tradingABI,
            functionName: 'removeMargin',
            args: inputDataParams
          });
          await forwarder(chainId, inputData, 'removeMargin', undefined, currentAsset.current);
        } catch (err: any) {
          line.setPrice(currentLiq);
          toast.dismiss();
          toast.error('Removing margin failed! ' + String(err.response.data.reason));
          console.log(err);
        }
      }
    } else {
      if (newLiqPrice > currentLiq) {
        if (newLeverage < getNetwork(0).assets[position.asset].minLev) {
          toast.warning('Leverage too low!');
          line.setPrice(currentLiq);
          return;
        }
        const toAdd = newMargin - _margin;
        const toAddBigInt = parseEther(`${Number(toAdd.toFixed(18))}`);
        if (toAddBigInt > balanceRef.current) {
          toast.warning(`Insufficient balance to add ${toAdd.toFixed(2)} to margin!`);
          line.setPrice(currentLiq);
          return;
        }

        try {
          if (address === undefined) return;
          toast.loading('Adding margin...');
          const tradingABI = currentNetwork.abis.trading;
          const inputDataParams = [
            position.id,
            currentNetwork.marginAssets[0].stablevault,
            currentNetwork.marginAssets[0].address,
            toAddBigInt,
            NO_PERMIT,
            address,
            NO_PRICE_DATA
          ];
          const chainId = chain?.id;
          const inputData = encodeFunctionData({
            abi: tradingABI,
            functionName: 'addMargin',
            args: inputDataParams
          });
          await forwarder(chainId, inputData, 'addMargin', undefined, currentAsset.current);
        } catch (err: any) {
          line.setPrice(currentLiq);
          toast.dismiss();
          toast.error('Adding margin failed! ' + String(err.response.data.reason));
          console.log(err);
        }
      } else if (newLiqPrice < currentLiq) {
        if (newLiqPrice <= _oracleData.price / 1e18) {
          toast.warning('Too close to liquidation!');
          line.setPrice(currentLiq);
          return;
        }
        if (newLeverage > getNetwork(0).assets[position.asset].maxLev) {
          toast.warning('Leverage too high!');
          line.setPrice(currentLiq);
          return;
        }
        const toRemove = _margin - newMargin;
        try {
          if (address === undefined) return;
          toast.loading('Removing margin...');
          const tradingABI = currentNetwork.abis.trading;
          const inputDataParams = [
            position.id,
            currentNetwork.marginAssets[0].stablevault,
            currentNetwork.marginAssets[0].address,
            parseEther(`${Number(toRemove.toFixed(18))}`),
            address,
            NO_PRICE_DATA
          ];
          const chainId = chain?.id;
          const inputData = encodeFunctionData({
            abi: tradingABI,
            functionName: 'removeMargin',
            args: inputDataParams
          });
          await forwarder(chainId, inputData, 'removeMargin', undefined, currentAsset.current);
        } catch (err: any) {
          line.setPrice(currentLiq);
          toast.dismiss();
          toast.error('Removing margin failed! ' + String(err.response.data.reason));
          console.log(err);
        }
      }
    }
  }

  // Return chart
  return <div className={'TVChartContainer'} id={'tv_chart_container'} />;
};

export default TVChartContainer;
