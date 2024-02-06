/* eslint-disable */

import { subscribeOnStream, unsubscribeFromStream } from './src/streaming.js';
import { getNetwork } from '../../../constants/networks/index.tsx';
import {localStorageSet} from "../../../utils/localStorage";

const lastBarsCache = new Map();

const configurationData = {
  supported_resolutions: ["1","3","5","15","30","60","120","240","360","480","720","960","D"],
  exchanges: [],
  symbols_types: []
};

async function getAllSymbols() {
  const { assets } = getNetwork(0);
  let TradingAssets = [];
  for (let i = 0; i < assets.length; i++) {
    TradingAssets.push({
      symbol: assets[i].name,
      full_name: assets[i].name,
      description: assets[i].name,
      exchange: 'Tigris',
      type: 'crypto',
      id: i,
      pricescale: 10 ** assets[i].decimals
    });
  }
  return TradingAssets;
}

export default {
  onReady: (callback) => {
    console.log('[onReady]: Method call');
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
    onResultReadyCallback([]);
  },

  resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    console.log('[resolveSymbol]: Method call', symbolName);
    const symbols = await getAllSymbols();
    const symbolItem = symbols.find(({ full_name }) => full_name === symbolName);
    if (!symbolItem) {
      console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
      onResolveErrorCallback('cannot resolve symbol');
      return;
    }
    const symbolInfo = {
      id: symbolItem.id,
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: symbolItem.pricescale,
      has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: 'streaming',
      has_intraday: true
    };

    console.log('[resolveSymbol]: Symbol resolved', symbolName);
    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { from, to, firstDataRequest } = periodParams;
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
    try {
      resolution === "1D" ? resolution = "D" : null;
      let rawData;
        try {
          rawData = await fetch(`https://chart.tigristrade.info/history?symbol=${symbolInfo.ticker}&from=${from-1}&to=${to}&resolution=${resolution}`);
        } catch {
          try {
            rawData = await fetch(`https://chart.tigristrade.info/history?symbol=${symbolInfo.ticker}&from=${from-1}&to=${to}&resolution=${resolution}`);
          } catch {
            console.log("CHARTS DIDNT WORK");
          }
        }
      const data = await (rawData).json();
      if ((data.s && data.s != 'ok') || data.time.length === 0) {
        // "noData" should be set if there is no data in the requested period.
        onHistoryCallback([], {
          noData: true
        });
        return;
      }
      let bars = [];
      bars.push({
        time: data.time[0] * 1000,
        low: data.low[0],
        high: data.high[0],
        open: data.open[0],
        close: data.close[0]          
      })
      for(var i=1; i<data.time.length; i++) {
        bars.push({
          time: data.time[i] * 1000,
          low: data.low[i],
          high: data.high[i],
          open: data.close[i-1],
          close: data.close[i]          
        })
      }
      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, {
          ...bars[bars.length - 1]
        });
      }
      localStorageSet('lastResolution', resolution);
      console.log(`[getBars]: returned ${bars.length} bar(s)`);
      onHistoryCallback(bars, {
        noData: false
      });
    } catch (error) {
      console.log('[getBars]: Get error', error);
      onErrorCallback(error);
    }
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
    console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
      subscribeOnStream(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
        onResetCacheNeededCallback,
        lastBarsCache.get(symbolInfo.full_name),
        symbolInfo.id
      );
  },

  unsubscribeBars: (subscriberUID) => {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
    // unsubscribeFromStream(subscriberUID);
  }
};
