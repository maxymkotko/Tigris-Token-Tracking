/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { useEffect, useRef, useState } from 'react';
import { useAccount, useNetwork, usePublicClient } from 'wagmi';
import { getNetwork } from '../../constants/networks';
import { toast } from 'react-toastify';
import { eventSocket } from '../../context/socket';
import { useTranslation } from 'react-i18next';

interface SocketEventHandlers {
  [event: string]: (data: any) => void;
}

export const PositionData = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { assets } = getNetwork(0);

  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [limitOrders, setLimitOrders] = useState<any[]>([]);
  const publicClient = usePublicClient();
  const { t } = useTranslation();

  const openPositionsRef = useRef(openPositions);
  const limitOrdersRef = useRef(limitOrders);

  useEffect(() => {
    getPositionsIndex();
  }, [address, chain]);

  const isGettingPositions = { value: false };
  const getPositionsIndex = async () => {
    if (!chain || !address) return;
    if (isGettingPositions.value) return;
    isGettingPositions.value = true;
    const currentNetwork = getNetwork(chain.id);
    if (publicClient === undefined) return;

    if (currentNetwork.addresses.positions === '') return;
    const userTrades: any = await publicClient.readContract({
      abi: currentNetwork.abis.positions,
      address: currentNetwork.addresses.positions as `0x${string}`,
      functionName: 'userTrades',
      args: [address]
    });
    console.log({ userTrades });

    if (currentNetwork.addresses.tradinglibrary === '') return;
    // Get liq prices
    const liqPrices: any[] = [];
    let results: any[] = await publicClient.multicall({
      contracts: userTrades.map((id: any) => {
        return {
          abi: currentNetwork.abis.tradinglibrary as any,
          address: currentNetwork.addresses.tradinglibrary as `0x${string}`,
          functionName: 'getLiqPrice',
          args: [currentNetwork.addresses.positions, id.toString(), 9000000000]
        };
      })
    });
    console.log({ results });
    results.forEach((returnValue: any) => {
      liqPrices.push(parseInt(returnValue.result).toString());
    });

    // Get position data
    const openP: any[] = [];
    const limitO: any[] = [];
    if (currentNetwork.addresses.positions === '') return;
    results = await publicClient.multicall({
      contracts: userTrades.map((id: bigint) => {
        return {
          abi: currentNetwork.abis.positions as any,
          address: currentNetwork.addresses.positions as `0x${string}`,
          functionName: 'trades',
          args: [id]
        };
      })
    });
    console.log({ results });
    results.forEach((returnValue: any, index: number) => {
      const pos = {
        trader: returnValue.result.trader,
        margin: parseInt(returnValue.result.margin).toString(),
        leverage: parseInt(returnValue.result.leverage).toString(),
        price: parseInt(returnValue.result.price).toString(),
        tpPrice: parseInt(returnValue.result.tpPrice).toString(),
        slPrice: parseInt(returnValue.result.slPrice).toString(),
        orderType: parseInt(returnValue.result.orderType),
        direction: returnValue.result.direction,
        id: parseInt(returnValue.result.id),
        asset: parseInt(returnValue.result.asset),
        accInterest: parseInt(returnValue.result.accInterest).toString(),
        liqPrice: liqPrices[index],
        chain: chain.id,
        isVisible: true
      };
      console.log(pos);
      if (parseInt(returnValue.result.orderType) === 0) {
        openP.push(pos);
      } else {
        limitO.push(pos);
      }
      openPositionsRef.current = openP;
      limitOrdersRef.current = limitO;
      setOpenPositions(openP);
      setLimitOrders(limitO);
      isGettingPositions.value = false;
    });
  };

  useEffect(() => {
    if (address !== undefined) {
      const handlers: SocketEventHandlers = {
        RelayFailed: (data: any) => {
          if (data.user === address && data.chainId === chain?.id) {
            toast.dismiss();
            toast.error('Transaction failed! ' + String(data.reason));
          }
        },
        PositionOpened: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            if (data.orderType === 0) {
              const openP: any[] = openPositionsRef.current.slice();
              // If openP already has this position, return
              if (openP.find((pos) => pos.id === data.id)) return;
              toast.dismiss();
              toast.success(
                (data.tradeInfo.direction ? 'Longed ' : 'Shorted ') +
                  (parseFloat(data.tradeInfo.leverage) / 1e18).toFixed(1) +
                  'x ' +
                  assets[data.tradeInfo.asset].name +
                  ' @ ' +
                  (parseFloat(data.price) / 1e18).toPrecision(6)
              );
              openP.push({
                trader: data.trader,
                margin: data.marginAfterFees,
                leverage: data.tradeInfo.leverage,
                price: data.price,
                tpPrice: data.tradeInfo.tpPrice,
                slPrice: data.tradeInfo.slPrice,
                orderType: 0,
                direction: data.tradeInfo.direction,
                id: data.id,
                asset: data.tradeInfo.asset,
                accInterest: 0,
                liqPrice: data.tradeInfo.direction
                  ? (
                      parseInt(data.price) -
                      (parseInt(data.price) * 0.9) / (parseInt(data.tradeInfo.leverage) / 1e18)
                    ).toString()
                  : (
                      parseInt(data.price) +
                      (parseInt(data.price) * 0.9) / (parseInt(data.tradeInfo.leverage) / 1e18)
                    ).toString(),
                chain: data.chainId,
                isVisible: true
              });
              openPositionsRef.current = openP;
              setOpenPositions(openP);
              console.log('EVENT: Market Trade Opened');
            } else {
              const limitO: any[] = limitOrdersRef.current.slice();
              // If limitO already has this position, return
              if (limitO.find((pos) => pos.id === data.id)) return;
              limitO.push({
                trader: data.trader,
                margin: data.tradeInfo.margin,
                leverage: data.tradeInfo.leverage,
                orderType: data.orderType,
                price: data.price,
                tpPrice: data.tradeInfo.tpPrice,
                slPrice: data.tradeInfo.slPrice,
                direction: data.tradeInfo.direction,
                id: data.id,
                asset: data.tradeInfo.asset,
                accInterest: 0,
                liqPrice: data.tradeInfo.direction
                  ? (
                      parseInt(data.price) -
                      (parseInt(data.price) * 0.9) / (parseInt(data.tradeInfo.leverage) / 1e18)
                    ).toString()
                  : (
                      parseInt(data.price) +
                      (parseInt(data.price) * 0.9) / (parseInt(data.tradeInfo.leverage) / 1e18)
                    ).toString(),
                chain: data.chainId,
                isVisible: true
              });
              toast.dismiss();
              toast.success(
                (data.tradeInfo.direction
                  ? `${t('orderForm.limit')} ${t('orderForm.long')} `
                  : `${t('orderForm.limit')} ${t('orderForm.short')} `) +
                  (parseFloat(data.tradeInfo.leverage) / 1e18).toFixed(1) +
                  'x ' +
                  assets[data.tradeInfo.asset].name +
                  ' @ ' +
                  (parseFloat(data.price) / 1e18).toPrecision(6)
              );
              limitOrdersRef.current = limitO;
              setLimitOrders(limitO);
              console.log('EVENT: Limit Order Created');
            }
          }
        },
        PositionLiquidated: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const openP: any[] = openPositionsRef.current.slice();
            for (let i = 0; i < openP.length; i++) {
              if (openP[i].id === data.id) {
                toast.dismiss();
                toast.info(
                  (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                    'x ' +
                    assets[openP[i].asset].name +
                    (openP[i].direction ? ` ${t('orderForm.long')} ` : ` ${t('orderForm.short')} `) +
                    'liquidated @ ' +
                    (data.liqPrice / 1e18).toPrecision(6)
                );
                openP.splice(i, 1);
                break;
              }
            }
            openPositionsRef.current = openP;
            setOpenPositions(openP);
            console.log('EVENT: Position Liquidated');
          }
        },
        PositionClosed: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const openP: any[] = openPositionsRef.current.slice();
            for (let i = 0; i < openP.length; i++) {
              if (openP[i].id === data.id) {
                if (data.percent === 10000000000) {
                  toast.dismiss();
                  toast.success(
                    (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                      'x ' +
                      assets[openP[i].asset].name +
                      (openP[i].direction ? ` ${t('orderForm.long')} ` : ` ${t('orderForm.short')} `) +
                      'closed @ ' +
                      (parseFloat(data.closePrice) / 1e18).toPrecision(6)
                  );
                  openP.splice(i, 1);
                  break;
                } else {
                  const modP = {
                    trader: openP[i].trader,
                    margin: ((parseFloat(openP[i].margin) * (1e10 - data.percent)) / 1e10).toString(),
                    leverage: openP[i].leverage,
                    price: openP[i].price,
                    tpPrice: openP[i].tpPrice,
                    slPrice: openP[i].slPrice,
                    orderType: 0,
                    direction: openP[i].direction,
                    id: data.id,
                    asset: openP[i].asset,
                    accInterest: openP[i].accInterest,
                    liqPrice: openP[i].liqPrice,
                    chain: openP[i].chain,
                    isVisible: openP[i].isVisible
                  };
                  toast.dismiss();
                  toast.success(
                    (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                      'x ' +
                      assets[openP[i].asset].name +
                      (openP[i].direction ? ` ${t('orderForm.long')} ` : ` ${t('orderForm.short')} `) +
                      (data.percent / 1e8).toFixed(2) +
                      '% closed @ ' +
                      (parseFloat(data.closePrice) / 1e18).toPrecision(6)
                  );
                  openP[i] = modP;
                  break;
                }
              }
            }
            openPositionsRef.current = openP;
            setOpenPositions(openP);
            if (data.trader === data.executor) {
              console.log('EVENT: Position Market Closed');
            } else {
              console.log('EVENT: Position Limit Closed');
            }
          }
        },
        LimitOrderExecuted: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const limitO: any[] = limitOrdersRef.current.slice();
            const openP: any[] = openPositionsRef.current.slice();
            for (let i = 0; i < limitO.length; i++) {
              if (limitO[i].id === data.id) {
                toast.dismiss();
                toast.info(
                  (parseFloat(limitO[i].leverage) / 1e18).toFixed(1) +
                    'x ' +
                    assets[limitO[i].asset].name +
                    (limitO[i].direction ? ` ${t('orderForm.long')} ` : ` ${t('orderForm.short')} `) +
                    (limitO[i].orderType === 1 ? ` ${t('orderForm.limit')} ` : ` ${t('orderForm.stop')} `) +
                    ' order filled @ ' +
                    (parseFloat(data.openPrice) / 1e18).toPrecision(6)
                );
                openP.push({
                  trader: data.trader,
                  margin: data.margin,
                  leverage: limitO[i].leverage,
                  price: data.openPrice,
                  tpPrice: limitO[i].tpPrice,
                  slPrice: limitO[i].slPrice,
                  orderType: 0,
                  direction: limitO[i].direction,
                  id: data.id,
                  asset: limitO[i].asset,
                  accInterest: 0,
                  liqPrice: limitO[i].liqPrice,
                  chain: limitO[i].chain,
                  isVisible: true
                });
                limitO.splice(i, 1);
                break;
              }
            }
            openPositionsRef.current = openP;
            limitOrdersRef.current = limitO;
            setLimitOrders(limitO);
            setOpenPositions(openP);
            console.log('EVENT: Limit Order Executed');
          }
        },
        LimitCancelled: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const limitO: any[] = limitOrdersRef.current.slice();
            for (let i = 0; i < limitO.length; i++) {
              if (limitO[i].id === data.id) {
                toast.dismiss();
                toast.success(
                  (parseFloat(limitO[i].leverage) / 1e18).toFixed(1) +
                    'x ' +
                    assets[limitO[i].asset].name +
                    (limitO[i].direction ? ` ${t('orderForm.long')} ` : ` ${t('orderForm.short')} `) +
                    t('limit order cancelled')
                );
                limitO.splice(i, 1);
                break;
              }
            }
            limitOrdersRef.current = limitO;
            setLimitOrders(limitO);
            console.log('EVENT: Limit Order Cancelled');
          }
        },
        MarginModified: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const openP: any[] = openPositionsRef.current.slice();
            for (let i = 0; i < openP.length; i++) {
              if (openP[i].id === data.id) {
                const modP = {
                  trader: openP[i].trader,
                  margin: data.newMargin,
                  leverage: data.newLeverage,
                  price: openP[i].price,
                  tpPrice: openP[i].tpPrice,
                  slPrice: openP[i].slPrice,
                  orderType: 0,
                  direction: openP[i].direction,
                  id: data.id,
                  asset: openP[i].asset,
                  accInterest: openP[i].accInterest,
                  liqPrice: openP[i].direction
                    ? (
                        parseFloat(openP[i].price) -
                        (parseFloat(openP[i].price) *
                          1e18 *
                          (parseFloat(data.newMargin) * 0.9 + parseFloat(openP[i].accInterest))) /
                          parseFloat(data.newMargin) /
                          parseFloat(data.newLeverage)
                      ).toString()
                    : (
                        parseFloat(openP[i].price) +
                        (parseFloat(openP[i].price) *
                          1e18 *
                          (parseFloat(data.newMargin) * 0.9 + parseFloat(openP[i].accInterest))) /
                          parseFloat(data.newMargin) /
                          parseFloat(data.newLeverage)
                      ).toString(),
                  chain: openP[i].chain,
                  isVisible: openP[i].isVisible
                };
                if (data.isMarginAdded) {
                  toast.dismiss();
                  toast.success(
                    `${t('Successfully added')} ` +
                      ((parseFloat(data.newMargin) - parseFloat(openP[i].margin)) / 1e18).toFixed(2) +
                      ' margin to ' +
                      (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                      'x ' +
                      assets[openP[i].asset].name +
                      (openP[i].direction ? ` ${t('orderForm.long')}` : ` ${t('orderForm.short')}`)
                  );
                } else {
                  toast.dismiss();
                  toast.success(
                    `${t('Successfully removed')} ` +
                      ((parseFloat(openP[i].margin) - parseFloat(data.newMargin)) / 1e18).toFixed(2) +
                      ' margin from ' +
                      (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                      'x ' +
                      assets[openP[i].asset].name +
                      (openP[i].direction ? ` ${t('orderForm.long')}` : ` ${t('orderForm.short')}`)
                  );
                }
                openP[i] = modP;
                break;
              }
            }
            openPositionsRef.current = openP;
            setOpenPositions(openP);
            console.log('EVENT: Margin Modified');
          }
        },
        AddToPosition: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const openP: any[] = openPositionsRef.current.slice();
            for (let i = 0; i < openP.length; i++) {
              if (openP[i].id === data.id) {
                const modP = {
                  trader: openP[i].trader,
                  margin: data.newMargin,
                  leverage: openP[i].leverage,
                  price: data.newPrice,
                  tpPrice: openP[i].tpPrice,
                  slPrice: openP[i].slPrice,
                  orderType: 0,
                  direction: openP[i].direction,
                  id: data.id,
                  asset: openP[i].asset,
                  accInterest: openP[i].accInterest,
                  liqPrice: openP[i].direction
                    ? (
                        parseFloat(data.newPrice) -
                        (parseFloat(data.newPrice) *
                          1e18 *
                          (parseFloat(data.newMargin) * 0.9 + parseFloat(openP[i].accInterest))) /
                          parseFloat(data.newMargin) /
                          parseFloat(openP[i].leverage)
                      ).toString()
                    : (
                        parseFloat(data.newPrice) +
                        (parseFloat(data.newPrice) *
                          1e18 *
                          (parseFloat(data.newMargin) * 0.9 + parseFloat(openP[i].accInterest))) /
                          parseFloat(data.newMargin) /
                          parseFloat(openP[i].leverage)
                      ).toString(),
                  chain: openP[i].chain,
                  isVisible: openP[i].isVisible
                };
                toast.dismiss();
                toast.success(
                  'Successfully opened ' +
                    (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                    'x ' +
                    ((parseFloat(data.newMargin) - parseFloat(openP[i].margin)) / 1e18).toFixed(2) +
                    ' position on ' +
                    assets[openP[i].asset].name +
                    (openP[i].direction ? ` ${t('orderForm.long')}` : ` ${t('orderForm.short')}`)
                );
                openP[i] = modP;
                break;
              }
            }
            openPositionsRef.current = openP;
            setOpenPositions(openP);
            console.log('EVENT: Added To Position');
          }
        },
        UpdateTPSL: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const openP: any[] = openPositionsRef.current.slice();
            for (let i = 0; i < openP.length; i++) {
              if (openP[i].id === data.id) {
                if (data.isTp) {
                  const modP = {
                    trader: openP[i].trader,
                    margin: openP[i].margin,
                    leverage: openP[i].leverage,
                    price: openP[i].price,
                    tpPrice: data.price,
                    slPrice: openP[i].slPrice,
                    orderType: 0,
                    direction: openP[i].direction,
                    id: data.id,
                    asset: openP[i].asset,
                    accInterest: openP[i].accInterest,
                    liqPrice: openP[i].liqPrice,
                    chain: openP[i].chain,
                    isVisible: openP[i].isVisible
                  };
                  if (parseFloat(data.price) === 0) {
                    toast.dismiss();
                    toast.success(
                      `${t('Successfully removed TP from')} ` +
                        (openP[i].direction ? `${t('orderForm.long')} ` : `${t('orderForm.short')} `) +
                        (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                        'x ' +
                        assets[openP[i].asset].name
                    );
                  } else {
                    toast.dismiss();
                    toast.success(
                      `${t('Successfully set')} ` +
                        (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                        'x ' +
                        assets[openP[i].asset].name +
                        (openP[i].direction ? ` ${t('long TP to')} ` : ` ${t('short TP to')} `) +
                        (parseFloat(data.price) / 1e18).toPrecision(7)
                    );
                  }
                  openP[i] = modP;
                  console.log('EVENT: TP Updated');
                } else {
                  const modP = {
                    trader: openP[i].trader,
                    margin: openP[i].margin,
                    leverage: openP[i].leverage,
                    price: openP[i].price,
                    tpPrice: openP[i].tpPrice,
                    slPrice: data.price,
                    orderType: 0,
                    direction: openP[i].direction,
                    id: data.id,
                    asset: openP[i].asset,
                    accInterest: openP[i].accInterest,
                    liqPrice: openP[i].liqPrice,
                    chain: openP[i].chain,
                    isVisible: openP[i].isVisible
                  };
                  if (parseFloat(data.price) === 0) {
                    toast.dismiss();
                    toast.success(
                      `${t('Successfully removed SL from')} ` +
                        (openP[i].direction ? `${t('orderForm.long')} ` : `${t('orderForm.short')} `) +
                        (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                        'x ' +
                        assets[openP[i].asset].name
                    );
                  } else {
                    toast.dismiss();
                    toast.success(
                      `${t('Successfully set')} ` +
                        (parseFloat(openP[i].leverage) / 1e18).toFixed(1) +
                        'x ' +
                        assets[openP[i].asset].name +
                        (openP[i].direction ? ` ${t('long SL to')} ` : ` ${t('short SL to')} `) +
                        (parseFloat(data.price) / 1e18).toPrecision(7)
                    );
                  }
                  openP[i] = modP;
                  console.log('EVENT: SL Updated');
                }
                break;
              }
            }
            openPositionsRef.current = openP;
            setOpenPositions(openP);
          }
        }
      };

      Object.keys(handlers).forEach((event) => {
        eventSocket.on(event, handlers[event]);
      });

      return () => {
        Object.keys(handlers).forEach((event) => {
          eventSocket.off(event, handlers[event]);
        });
      };
    }
  }, [address, chain]);

  const setPositionVisible = (ids: number[], is: boolean) => {
    const openP: any[] = openPositionsRef.current.slice();
    const limitO: any[] = limitOrdersRef.current.slice();
    ids.forEach((id) => {
      for (let i = 0; i < openP.length; i++) {
        if (openP[i].id === id) {
          const modP = {
            trader: openP[i].trader,
            margin: openP[i].margin,
            leverage: openP[i].leverage,
            price: openP[i].price,
            tpPrice: openP[i].tpPrice,
            slPrice: openP[i].slPrice,
            orderType: 0,
            direction: openP[i].direction,
            id: id,
            asset: openP[i].asset,
            accInterest: openP[i].accInterest,
            liqPrice: openP[i].liqPrice,
            chain: openP[i].chain,
            isVisible: is
          };
          openP[i] = modP;
          break;
        }
      }
      for (let i = 0; i < limitO.length; i++) {
        if (limitO[i].id === id) {
          const modP = {
            trader: limitO[i].trader,
            margin: limitO[i].margin,
            leverage: limitO[i].leverage,
            price: limitO[i].price,
            tpPrice: limitO[i].tpPrice,
            slPrice: limitO[i].slPrice,
            orderType: limitO[i].orderType,
            direction: limitO[i].direction,
            id: id,
            asset: limitO[i].asset,
            accInterest: limitO[i].accInterest,
            liqPrice: limitO[i].liqPrice,
            chain: limitO[i].chain,
            isVisible: is
          };
          limitO[i] = modP;
          break;
        }
      }
    });
    openPositionsRef.current = openP;
    limitOrdersRef.current = limitO;
    setOpenPositions(openP);
    setLimitOrders(limitO);
  };

  return {
    positionData: {
      openPositions: openPositions,
      limitOrders: limitOrders,
      setVisible: setPositionVisible
    }
  };
};
