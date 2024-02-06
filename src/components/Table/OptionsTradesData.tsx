import { useEffect, useState } from 'react';
import socketio from 'socket.io-client';
import { useAccount, useNetwork, usePublicClient } from 'wagmi';
import { getNetwork } from '../../../src/constants/networks';
import { eventSocket, oracleData } from 'src/context/socket';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface SocketEventHandlers {
  [event: string]: (data: any) => void;
}

export const OptionsTradesData = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { assets } = getNetwork(0);

  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [limitOrders, setLimitOrders] = useState<any[]>([]);
  const [allPositions, setAllPositions] = useState<any[]>([]);
  const { t } = useTranslation();

  const publicClient = usePublicClient();

  useEffect(() => {
    getPositionsIndex();
  }, [address, chain]);

  const isGettingPositions = { value: false };
  async function getPositionsIndex() {
    if (chain == null || address == null) return;
    if (isGettingPositions.value) return;
    isGettingPositions.value = true;
    const currentNetwork = getNetwork(chain.id);
    // if (provider === undefined) return;
    // const tradeNFTContract = new ethers.Contract(
    //   currentNetwork.addresses.tradenft,
    //   currentNetwork.abis.tradenft,
    //   provider
    // );

    // const userTrades = await tradeNFTContract.userTrades(address);
    if (currentNetwork.addresses.tradenft === '') return;
    const userTrades: any = await publicClient.readContract({
      abi: currentNetwork.abis.tradenft,
      address: currentNetwork.addresses.tradenft as `0x${string}`,
      functionName: 'userTrades',
      args: [address]
    });
    const loops = parseInt((userTrades.length / 10).toString());
    const remainder = userTrades.length % 10;

    // Get position data
    const openP: any[] = [];
    const limitO: any[] = [];
    for (let x = 0; x <= loops; x++) {
      // const multicall = new Multicall({ ethersProvider: provider, tryAggregate: false });
      const _calls: any[] = [];
      for (let i = 0; i < (x === loops ? remainder : 10); i++) {
        _calls.push(userTrades[x * 10 + i]);
      }
      const results = await publicClient.multicall({
        contracts: _calls.map((params: any) => {
          return {
            address: currentNetwork.addresses.tradenft as `0x${string}`,
            abi: currentNetwork.abis.tradenft as any,
            functionName: 'trades',
            args: [params]
          };
        })
      });

      results.forEach((returnValue: any, index: number) => {
        const pos = {
          trader: returnValue.result.trader,
          collateral: parseInt(returnValue.result.collateral).toString(),
          openPrice: parseInt(returnValue.result.openPrice).toString(),
          orderType: parseInt(returnValue.result.orderType),
          direction: returnValue.result.direction,
          id: parseInt(returnValue.result.id),
          asset: parseInt(returnValue.result.asset),
          duration: parseInt(returnValue.result.duration).toString(),
          expires: parseInt(returnValue.result.expires).toString(),
          isVisible: true
        };
        if (parseInt(returnValue.result.orderType) === 0) {
          openP.push(pos);
        } else {
          limitO.push(pos);
        }
      });
    }
    setOpenPositions(openP);
    setLimitOrders(limitO);
    isGettingPositions.value = false;
  }

  useEffect(() => {
    if (address !== undefined) {
      const handlers: SocketEventHandlers = {
        RelayFailed: (data: any) => {
          if (data.user === address && data.chainId === chain?.id) {
            toast.dismiss();
            toast.error('Transaction failed! ' + String(data.reason));
          }
        },
        TradeOpened: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            toast.dismiss();
            if (data.orderType === 0) {
              toast.success(
                (data.tradeInfo.direction ? 'Longed ' : 'Shorted ') +
                  assets[data.tradeInfo.asset].name +
                  ' @ ' +
                  (parseFloat(data.price) / 1e18).toPrecision(6)
              );
              const openP: any[] = openPositions.slice();
              openP.push({
                trader: data.trader,
                collateral: data.tradeInfo.collateral,
                openPrice: data.price,
                orderType: 0,
                direction: data.tradeInfo.direction,
                id: data.id,
                asset: data.tradeInfo.asset,
                duration: data.tradeInfo.duration,
                expires: new Date().getTime() / 1000 + Number(data.tradeInfo.duration),
                isVisible: true
              });
              setOpenPositions(openP);
              console.log('EVENT: Market Trade Opened');
            } else {
              const limitO: any[] = limitOrders.slice();
              limitO.push({
                trader: data.trader,
                collateral: data.tradeInfo.collateral,
                openPrice: data.price,
                orderType: data.orderType,
                direction: data.tradeInfo.direction,
                id: data.id,
                asset: data.tradeInfo.asset,
                duration: 5 * 60,
                expires: 0,
                isVisible: true
              });
              toast.success(
                (data.tradeInfo.direction
                  ? `${t('orderForm.limit')} ${t('orderForm.long')}`
                  : `${t('orderForm.limit')} ${t('orderForm.long')}`) +
                  assets[data.tradeInfo.asset].name +
                  ' @ ' +
                  (parseFloat(data.price) / 1e18).toPrecision(6)
              );
              setLimitOrders(limitO);
              console.log('EVENT: Limit Order Created');
            }
          }
        },
        TradeClosed: (data: any) => {
          toast.dismiss();
          if (data.trader === address && data.chainId === chain?.id) {
            const openP: any[] = openPositions.slice();
            for (let i = 0; i < openP.length; i++) {
              if (openP[i].id === data.id) {
                if (data.percent === 0) {
                  toast.info(
                    assets[openP[i].asset].name +
                      (openP[i].direction ? ` ${t('orderForm.long')}` : ` ${t('orderForm.short')}`) +
                      ' lost @ ' +
                      (parseFloat(data.closePrice) / 1e18).toPrecision(6)
                  );
                } else {
                  toast.success(
                    assets[openP[i].asset].name +
                      (openP[i].direction ? ` ${t('orderForm.long')}` : ` ${t('orderForm.short')}`) +
                      ' won @ ' +
                      (parseFloat(data.closePrice) / 1e18).toPrecision(6)
                  );
                }

                openP.splice(i, 1);
                break;
              }
            }
            setOpenPositions(openP);
            if (data.trader === data.executor) {
              console.log('EVENT: Position Market Closed');
            } else {
              console.log('EVENT: Position Limit Closed');
            }
          }
        },
        OptionsLimitOrderExecuted: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            const limitO: any[] = limitOrders.slice();
            const openP: any[] = openPositions.slice();
            for (let i = 0; i < limitO.length; i++) {
              if (limitO[i].id === data.id) {
                toast.info(
                  assets[limitO[i].asset].name +
                    (limitO[i].direction ? ` ${t('orderForm.long')}` : ` ${t('orderForm.long')}`) +
                    (limitO[i].orderType === 1 ? `${t('orderForm.limit')}` : `${t('orderForm.stop')}`) +
                    ` ${t('order filled')} @ ` +
                    (parseFloat(data.openPrice) / 1e18).toPrecision(6)
                );
                openP.push({
                  trader: data.trader,
                  collateral: data.collateral,
                  openPrice: data.openPrice,
                  orderType: 0,
                  direction: data.direction,
                  id: data.id,
                  asset: data.asset,
                  duration: data.duration,
                  expires: new Date().getTime() / 1000 + Number(data.duration),
                  isVisible: true
                });
                limitO.splice(i, 1);
                break;
              }
            }
            setLimitOrders(limitO);
            setOpenPositions(openP);
            console.log('EVENT: Limit Order Executed');
          }
        },
        OptionsLimitCancelled: (data: any) => {
          if (data.trader === address && data.chainId === chain?.id) {
            toast.dismiss();
            const limitO: any[] = limitOrders.slice();
            for (let i = 0; i < limitO.length; i++) {
              if (limitO[i].id === data.id) {
                toast.success(
                  assets[limitO[i].asset].name +
                    (limitO[i].direction ? ` ${t('orderForm.long')}` : ` ${t('orderForm.long')}`) +
                    `${t('limit order cancelled')}`
                );
                limitO.splice(i, 1);
                break;
              }
            }
            setLimitOrders(limitO);
            console.log('EVENT: Limit Order Cancelled');
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
  }, [address, chain, openPositions, limitOrders]);

  function setPositionVisible(ids: number[], is: boolean) {
    const openP: any[] = openPositions.slice();
    const limitO: any[] = limitOrders.slice();
    ids.forEach((id) => {
      for (let i = 0; i < openP.length; i++) {
        if (openP[i].id === id) {
          const modP = {
            trader: openP[i].trader,
            collateral: openP[i].collateral,
            openPrice: openP[i].openPrice,
            orderType: 0,
            direction: openP[i].direction,
            id: id,
            asset: openP[i].asset,
            duration: 5 * 60,
            expires: new Date().getTime() / 1000 + 5 * 60,
            isVisible: is
          };
          openP[i] = modP;
          break;
        }
      }
      for (let i = 0; i < limitO.length; i++) {
        if (limitO[i].id === id) {
          const modP = {
            trader: openP[i].trader,
            collateral: openP[i].collateral,
            openPrice: openP[i].openPrice,
            orderType: limitO[i].orderType,
            direction: openP[i].direction,
            id: id,
            asset: openP[i].asset,
            duration: 5 * 60,
            expires: new Date().getTime() / 1000 + 5 * 60,
            isVisible: is
          };
          limitO[i] = modP;
          break;
        }
      }
    });
    setOpenPositions(openP);
    setLimitOrders(limitO);
  }

  const x = async () => {
    try {
      // eslint-disable-next-line
      const allRes = await axios.get(
        `https://leaderboard.tigristrade.info/options_history/${chain?.id ?? 42161}/${address}`
      );
      const allData = allRes.data;

      const all: any[] = allPositions.slice();

      for (let j = 0; j < allData.length; j++) {
        const data = allData[j];

        all.push({
          id: data.nft_id,
          trader: address,
          collateral: data.collateral,
          asset: data.asset,
          openPrice: data.price,
          closePrice: data.close_price,
          expires: data.expires,
          payout: data.payout,
          direction: data.direction,
          isVisible: true
        });
      }
      setAllPositions(all);
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    x();
  }, [chain, address]);

  useEffect(() => {
    setInterval(() => {
      x();
    }, 30 * 1000);
  }, []);

  return {
    optionsTradesData: {
      openPositions: openPositions,
      limitOrders: limitOrders,
      allPositions: allPositions,
      setVisible: setPositionVisible
    }
  };
};
