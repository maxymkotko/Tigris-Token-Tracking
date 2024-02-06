/* eslint-disable @typescript-eslint/restrict-plus-operands */
import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import { Close, Edit } from '@mui/icons-material';
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';
import { EditModal } from '../Modal/EditModal';
import { useAccount, useFeeData, useNetwork, useWalletClient } from 'wagmi';
import { getNetwork } from '../../constants/networks';
import { forwarder } from '../../proxy_wallet';
import { oracleData, oracleSocket } from 'src/context/socket';
import { toast } from 'react-toastify';
import socketio from 'socket.io-client';
import { TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTokenDetailsData } from '../../hook/tokenDetails/useTokenDetailsData';
import { useLiqPrice } from '../../hook/useTradeInfo';
import { encodeFunctionData, parseEther } from 'viem';
import { ChartMechanicsContext } from '../../context/ChartMechanics';
import { LogError } from '../../context/ErrorLogs';
import { NO_PRICE_DATA } from '../../constants/EmptyDataStructs';
import { useTranslation } from 'react-i18next';

declare global {
  interface String {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    formatPriceString(): string;
  }
  interface Number {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    formatPriceString(): string;
  }
}

// eslint-disable-next-line no-extend-native
Number.prototype.formatPriceString = function () {
  return this.toString().replace(/\.00$/, '');
};

// eslint-disable-next-line no-extend-native
String.prototype.formatPriceString = function () {
  return this.replace(/\.00$/, '');
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  height: 32,
  '&:nth-of-type(odd)': {
    backgroundColor: '#23262F'
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  },
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#777E90',
    '.MuiTableCell-root': {
      color: '#FFFFFF'
    }
  }
}));

interface IPositionTable {
  tableType: number; // 0 is your market, 1 is your limit, 2 is all
  setPairIndex: any;
  positionData: any;
  isAfterOpeningFees: boolean;
  isAfterClosingFees: boolean;
}

interface oracleDataProps {
  asset: number;
  is_closed: boolean;
  price: any;
  provider: string;
  signature: string;
  timestamp: string;
}

const DEFAULT_ORDER = 'desc';
const DEFAULT_ORDER_BY = 'size';

export const PositionTable = ({
  tableType,
  setPairIndex,
  positionData,
  isAfterOpeningFees,
  isAfterClosingFees
}: IPositionTable) => {
  const currentTableType = useRef(0);

  const { openPositions, limitOrders } = positionData;

  const [arrayOpenPosition, setArrayOpenPosition] = useState<any[] | null>();
  const [arrayLimitPosition, setArrayLimitPosition] = useState<any[] | null>();
  const [arrayAllPosition, setArrayAllPosition] = useState<any[]>([]);
  const allPositionsLoaded = useRef(false);
  const { data: walletClient } = useWalletClient();
  const { data: feeData } = useFeeData({ watch: true });
  const { setExecutionPrice, tradingStatus } = useContext(ChartMechanicsContext);

  useEffect(() => {
    setVisibleRows(null);
    currentTableType.current = tableType;
    const positions = tableType === 0 ? arrayOpenPosition : tableType === 1 ? arrayLimitPosition : arrayAllPosition;
    if (positions !== undefined && positions !== null) {
      const sortedRows = stableSort(positions, getComparator(order, orderBy));
      setVisibleRows(sortedRows);
    }
  }, [tableType, arrayOpenPosition, arrayLimitPosition, arrayAllPosition]);

  const [orcData, setOrcData] = useState<any>(oracleData);

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { assets } = getNetwork(0);

  const [forceRerender, setForceRerender] = useState(0);

  const [order, setOrder] = useState<Order>(DEFAULT_ORDER);
  const [orderBy, setOrderBy] = useState(DEFAULT_ORDER_BY);
  const [clickedPosition, setClickedPosition] = useState<any>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState<any[] | null>(null);

  const [isPositionVisible, setPositionVisible] = useState<any>({});
  const [isAllVisible, setAllVisible] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    oracleSocket.on('data', (data: any) => {
      setOrcData(data);
    });
  }, []);

  const getCPrice = (asset: any) => {
    const orcData: oracleDataProps | null = oracleData[asset] as unknown as oracleDataProps | null;
    const cPrice = orcData?.price / 1e18;
    return cPrice;
  };

  const initializePositionData = () => {
    createSortHandler(DEFAULT_ORDER_BY);
    setArrayOpenPosition(null);
    setArrayLimitPosition(null);
    const _openPositions: any = [];
    const _limitOrders: any = [];

    openPositions?.map((position: any) =>
      _openPositions.push({
        ...position,
        size: parseFloat(((position.margin / 1e18) * (position.leverage / 1e18)).toFixed(2)),
        margin: parseFloat((position.margin / 1e18).toFixed(2)),
        leverage: parseFloat((position.leverage / 1e18).toFixed(2)),
        price: parseFloat((position.price / 1e18).toPrecision(7)),
        tpPrice: parseFloat((position.tpPrice / 1e18).toPrecision(7)),
        accInterest: parseFloat((position.accInterest / 1e18).toFixed(2)),
        slPrice: parseFloat((position.slPrice / 1e18).toPrecision(7)),
        liqPrice: parseFloat((position.liqPrice / 1e18).toPrecision(7)),
        payoutAfterFee: getPnlPercent(
          position.accInterest / 1e18,
          position.leverage / 1e18,
          position.margin / 1e18,
          position.margin / 1e18,
          position.price / 1e18,
          position.direction,
          getCPrice(position.asset),
          false,
          isAfterClosingFees,
          getNetwork(0).assets[position.asset].fee
        ).payoutAfterFee
      })
    );

    const sortedRows1 = stableSort(_openPositions, getComparator(order, orderBy));
    setArrayOpenPosition(sortedRows1);

    limitOrders?.map((position: any) =>
      _limitOrders.push({
        ...position,
        size: parseFloat(((position.margin / 1e18) * (position.leverage / 1e18)).toFixed(2)),
        margin: parseFloat((position.margin / 1e18).toFixed(2)),
        leverage: parseFloat((position.leverage / 1e18).toFixed(2)),
        price: parseFloat((position.price / 1e18).toPrecision(7)),
        tpPrice: parseFloat((position.tpPrice / 1e18).toPrecision(7)),
        accInterest: parseFloat((position.accInterest / 1e18).toFixed(2)),
        slPrice: parseFloat((position.slPrice / 1e18).toPrecision(7)),
        liqPrice: parseFloat((position.liqPrice / 1e18).toPrecision(7))
      })
    );

    const sortedRows2 = stableSort(_limitOrders, getComparator(order, orderBy));
    setArrayLimitPosition(sortedRows2);
  };

  useEffect(() => {
    initializePositionData();
  }, [positionData, tableType]);

  useEffect(() => {
    const socket = socketio('https://global.tigristrade.info', { transports: ['websocket'] });
    socket.on('data', (socketData: any) => {
      if (currentTableType.current !== 2 && allPositionsLoaded.current) return;
      allPositionsLoaded.current = true;
      setArrayAllPosition([]);
      const _allPosition: any = [];
      socketData?.map((position: any) =>
        _allPosition.push({
          ...position,
          size: parseFloat(((position.margin / 1e18) * (position.leverage / 1e18)).toFixed(2)),
          margin: parseFloat((position.margin / 1e18).toFixed(2)),
          leverage: parseFloat((position.leverage / 1e18).toFixed(2)),
          price: parseFloat((position.price / 1e18).toPrecision(7)),
          tpPrice: parseFloat((position.tpPrice / 1e18).toPrecision(7)),
          accInterest: parseFloat((position.accInterest / 1e18).toFixed(2)),
          slPrice: parseFloat((position.slPrice / 1e18).toPrecision(7)),
          payoutAfterFee: getPnlPercent(
            position.accInterest / 1e18,
            position.leverage / 1e18,
            position.margin / 1e18,
            position.margin / 1e18,
            position.price / 1e18,
            position.direction,
            getCPrice(position.asset),
            false,
            isAfterClosingFees,
            0.001
          ).payoutAfterFee
        })
      );
      const sortedRows = stableSort(_allPosition, getComparator(order, orderBy));
      setArrayAllPosition(sortedRows);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setVisibleRows(null);
    const positions = tableType === 0 ? arrayOpenPosition : tableType === 1 ? arrayLimitPosition : arrayAllPosition;
    if (positions !== undefined && positions !== null) {
      const sortedRows = stableSort(positions, getComparator(order, orderBy));
      setVisibleRows(sortedRows);
    }
  }, [openPositions, limitOrders, arrayAllPosition, tableType]);

  useEffect(() => {
    setForceRerender(forceRerender + 1);
  }, [visibleRows]);

  const handleClickEditOpen = (position: any) => {
    setClickedPosition(position);
    setEditModalOpen(true);
  };

  function handleClosePositionClick(position: any) {
    closePosition(position);
  }
  async function closePosition(position: any) {
    try {
      if (address === undefined || chain === undefined) {
        toast.error(t('Wallet not connected!'));
        return;
      }
      if (chain.id !== 42161 && chain.id !== 137 && chain.id !== 82) {
        toast.error('Wrong network!');
        return;
      }
      const currentNetwork = getNetwork(chain.id);
      const _oracleData: any = oracleData[position.asset];

      if (_oracleData === undefined || _oracleData.is_closed) {
        toast.dismiss();
        toast.warning(t('Market is closed!'));
        return;
      }
      if (
        tradingStatus === 'APPROVE PROXY' ||
        tradingStatus === 'FUND PROXY' ||
        tradingStatus === 'UNLOCK PROXY' ||
        tradingStatus === 'MIGRATE PROXY'
      ) {
        const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
        toast.warn(message);
        return;
      }
      try {
        setExecutionPrice(_oracleData.price / 1e18);
        toast.loading(`${t('Closing position')}...`);
        const tradingABI = currentNetwork.abis.trading;
        const chainId = chain?.id;
        const inputDataParams = [
          position.id,
          10000000000,
          currentNetwork.marginAssets[0].stablevault,
          currentNetwork.marginAssets[0].address,
          address,
          NO_PRICE_DATA
        ];
        const inputData = encodeFunctionData({
          abi: tradingABI,
          functionName: 'marketClose',
          args: inputDataParams
        });
        await forwarder(chainId, inputData, 'marketClose', undefined, position.asset);
        setExecutionPrice(0);
      } catch (err: any) {
        setExecutionPrice(0);
        toast.dismiss();
        toast.error(`${t('Closing position failed')} ${String(err.response.data.reason)}`);
        LogError(address, err.response.data.reason, 0, 0, 'CLOSE_TRADE');
        console.log(err);
      }
    } catch (err) {
      setExecutionPrice(0);
      console.log(err);
    }
  }

  function handleCancelOrderClick(id: number) {
    cancelOrder(id);
  }
  async function cancelOrder(id: number) {
    if (address === undefined || chain === undefined) {
      toast.error(t('Wallet not connected!'));
      return;
    }
    if (chain.id !== 42161 && chain.id !== 137 && chain.id !== 82) {
      toast.error(t('Wrong network!'));
      return;
    }
    if (
      tradingStatus === 'APPROVE PROXY' ||
      tradingStatus === 'FUND PROXY' ||
      tradingStatus === 'UNLOCK PROXY' ||
      tradingStatus === 'MIGRATE PROXY'
    ) {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      return;
    }
    try {
      const currentNetwork = getNetwork(chain.id);
      try {
        toast.loading(`${t('Cancelling limit order')}...`);
        const tradingABI = currentNetwork.abis.trading;
        const chainId = chain.id;
        const inputDataParams = [id, address];
        const inputData = encodeFunctionData({
          abi: tradingABI,
          functionName: 'cancelLimitOrder',
          args: inputDataParams
        });
        await forwarder(chainId, inputData, 'cancelLimitOrder');
      } catch (err: any) {
        toast.dismiss();
        LogError(address, err.response.data.reason, 0, 0, 'CANCEL_LIMIT');
        toast.error(`${t('Cancelling limit order failed')} ${String(err.response.data.reason)}`);
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function handleUpdateTPSLChange(position: any, isTP: boolean, limitPrice: string) {
    updateTPSL(position, isTP, limitPrice);
  }
  async function updateTPSL(position: any, isTP: boolean, limitPrice: string) {
    if (address === undefined || chain === undefined) {
      toast.error(t('Wallet not connected!'));
      return;
    }
    if (chain.id !== 42161 && chain.id !== 137 && chain.id !== 82) {
      toast.error(t('Wrong network!'));
      return;
    }
    if (
      tradingStatus === 'APPROVE PROXY' ||
      tradingStatus === 'FUND PROXY' ||
      tradingStatus === 'UNLOCK PROXY' ||
      tradingStatus === 'MIGRATE PROXY'
    ) {
      const message = tradingStatus.charAt(0) + tradingStatus.substring(1).toLowerCase() + '!';
      toast.warn(message);
      setForceRerender(forceRerender + 1);
      return;
    }
    try {
      const currentNetwork = getNetwork(chain.id);
      const price = parseEther(`${parseFloat(limitPrice)}`);
      const _oracleData: any = oracleData[position.asset];

      if (_oracleData.is_closed) {
        toast.dismiss();
        toast.warning(t('Market is closed!'));
        setForceRerender(forceRerender + 1);
        return;
      }
      if (isTP) {
        if (position.direction) {
          if (parseFloat(price.toString()) < parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.dismiss();
            toast.warning(t('Take profit too low'));
            setForceRerender(forceRerender + 1);
            return;
          }
        } else {
          if (parseFloat(price.toString()) > parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.dismiss();
            toast.warning(t('Take profit too high'));
            setForceRerender(forceRerender + 1);
            return;
          }
        }
      } else {
        if (position.direction) {
          if (parseFloat(price.toString()) > parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.dismiss();
            toast.warning(t('Stop loss too high'));
            setForceRerender(forceRerender + 1);
            return;
          }
          if (parseFloat(limitPrice) < parseFloat(position.liqPrice) && parseFloat(price.toString()) !== 0) {
            toast.dismiss();
            toast.warning(t('Stop loss past liquidation price'));
            setForceRerender(forceRerender + 1);
            return;
          }
        } else {
          if (parseFloat(price.toString()) < parseFloat(_oracleData.price) && parseFloat(price.toString()) !== 0) {
            toast.dismiss();
            toast.warning(t('Stop loss too low'));
            setForceRerender(forceRerender + 1);
            return;
          }
          if (parseFloat(limitPrice) > parseFloat(position.liqPrice) && parseFloat(price.toString()) !== 0) {
            console.log(parseFloat(price.toString()), parseFloat(position.liqPrice));
            toast.dismiss();
            toast.warning(t('Stop loss past liquidation price'));
            setForceRerender(forceRerender + 1);
            return;
          }
        }
      }
      try {
        setExecutionPrice(Number(limitPrice));
        toast.loading(isTP ? `${t('Updating take profit')}...` : `${t('Updating stop loss')}...`);
        const tradingABI = currentNetwork.abis.trading;
        const chainId = chain.id;
        const inputDataParams = [isTP, position.id, price, address, NO_PRICE_DATA];
        const inputData = encodeFunctionData({
          abi: tradingABI,
          functionName: 'updateTpSl',
          args: inputDataParams
        });
        await forwarder(chainId, inputData, 'updateTpSl', undefined, position.asset);
        setExecutionPrice(0);
      } catch (err: any) {
        setExecutionPrice(0);
        toast.dismiss();
        LogError(address, err.response.data.reason, 0, err.response.data.receipt.hash, 'UPDATE_TPSL');
        toast.error(
          isTP
            ? `${t('Updating take profit failed')} `
            : `${t('Updating stop loss failed')} ` + String(err.response.data.reason)
        );
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function handleEyeClick(e: any, id: number, is: boolean) {
    const prevVisible = isPositionVisible;
    prevVisible[id] = is;
    setPositionVisible(prevVisible);
    positionData.setVisible([id], is);
    e.stopPropagation();
  }

  function handleAllEyeClick(e: any) {
    const isSetVisible = !isAllVisible;
    setAllVisible(isSetVisible);
    const prevVisible = isPositionVisible;
    const ids = [];
    if (arrayOpenPosition !== undefined && arrayOpenPosition !== null) {
      for (let i = 0; i < arrayOpenPosition?.length; i++) {
        prevVisible[arrayOpenPosition[i]?.id] = isSetVisible;
        ids.push(arrayOpenPosition[i]?.id);
      }
    }
    if (arrayLimitPosition !== undefined && arrayLimitPosition !== null) {
      for (let i = 0; i < arrayLimitPosition?.length; i++) {
        prevVisible[arrayLimitPosition[i]?.id] = isSetVisible;
        ids.push(arrayLimitPosition[i]?.id);
      }
    }
    setPositionVisible(prevVisible);
    positionData.setVisible(ids, isSetVisible);
    e.stopPropagation();
  }

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  type Order = 'asc' | 'desc';

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array?.map((el, index) => [el, index] as [T, number]);
    stabilizedThis?.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis?.map((el) => el[0]);
  }

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: string) => {
      const isAsc = orderBy === newOrderBy && order === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';
      setOrder(toggledOrder);
      setOrderBy(newOrderBy);

      const positions = tableType === 0 ? arrayOpenPosition : tableType === 1 ? arrayLimitPosition : arrayAllPosition;
      if (positions !== undefined && positions !== null) {
        const sortedRows = stableSort(positions, getComparator(toggledOrder, newOrderBy));
        setVisibleRows(sortedRows);
      }
    },
    [order, orderBy, tableType]
  );

  const createSortHandler = (newOrderBy: string) => (event: React.MouseEvent<unknown>) => {
    // console.log({ event, newOrderBy });
    handleRequestSort(event, newOrderBy);
  };

  return (
    <TableContainer>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {tableType !== 2 ? (
              <TableCell>
                <TableCellContainer>
                  <VisibilityBox>
                    {isAllVisible ? (
                      <BsEyeFill
                        style={{ cursor: 'pointer', fontSize: '12px', marginLeft: '0.5px' }}
                        onClick={(e) => handleAllEyeClick(e)}
                      />
                    ) : (
                      <BsEyeSlashFill
                        style={{ cursor: 'pointer', fontSize: '12px', marginLeft: '0.5px' }}
                        onClick={(e) => handleAllEyeClick(e)}
                      />
                    )}
                  </VisibilityBox>
                </TableCellContainer>
              </TableCell>
            ) : (
              <TableCell>{t('Network')}</TableCell>
            )}
            <TableCell>{t('User')}</TableCell>
            <TableCell>L/S</TableCell>
            {tableType === 1 ? <TableCell>{t('Type')}</TableCell> : <></>}
            <TableCell>{t('Pair')}</TableCell>
            <TableCell sortDirection={orderBy === 'size' ? order : false}>
              <TableSortLabel
                active={orderBy === 'size'}
                direction={orderBy === 'size' ? order : 'asc'}
                onClick={createSortHandler('size')}
              >
                {t('Size')}
                {orderBy === 'size' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'size' ? order : false}>
              <TableSortLabel
                active={orderBy === 'margin'}
                direction={orderBy === 'margin' ? order : 'asc'}
                onClick={createSortHandler('margin')}
              >
                {t('orderForm.margin')}
                {orderBy === 'margin' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={orderBy === 'leverage' ? order : false}>
              <TableSortLabel
                active={orderBy === 'leverage'}
                direction={orderBy === 'leverage' ? order : 'asc'}
                onClick={createSortHandler('leverage')}
              >
                {t('orderForm.leverage')}
                {orderBy === 'leverage' ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
            <TableCell>{t('orderForm.price')}</TableCell>
            {tableType === 0 || tableType === 2 ? (
              <TableCell sortDirection={orderBy === 'payoutAfterFee' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'payoutAfterFee'}
                  direction={orderBy === 'payoutAfterFee' ? order : 'asc'}
                  onClick={createSortHandler('payoutAfterFee')}
                >
                  Pnl
                  {orderBy === 'payoutAfterFee' ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ) : (
              <></>
            )}
            <TableCell>{t('orderForm.takeProfit')}</TableCell>
            <TableCell>{t('orderForm.stopLoss')}</TableCell>
            <TableCell>{t('orderForm.liqPrice')}</TableCell>
            {tableType !== 2 && <TableCell>{t('Action')}</TableCell>}
          </TableRow>
        </TableHead>
        <CustomTableBody key={forceRerender}>
          {visibleRows?.map((position: any) => (
            <StyledTableRow key={position.id} onClick={() => setPairIndex(position.asset)}>
              {tableType !== 2 ? (
                <TableCell>
                  <TableCellContainer>
                    <VisibilityBox>
                      {isPositionVisible[position.id] === true || isPositionVisible[position.id] === undefined ? (
                        <BsEyeFill
                          style={{ fontSize: '12px', marginLeft: '0.5px' }}
                          onClick={(e) => {
                            handleEyeClick(e, position.id, false);
                          }}
                        />
                      ) : (
                        <BsEyeSlashFill
                          style={{ fontSize: '12px', marginLeft: '0.5px' }}
                          onClick={(e) => {
                            handleEyeClick(e, position.id, true);
                          }}
                        />
                      )}
                    </VisibilityBox>
                  </TableCellContainer>
                </TableCell>
              ) : (
                <TableCell>
                  <img
                    style={{ marginBottom: '-4px', maxWidth: '18px', maxHeight: '18px' }}
                    src={getNetwork(parseInt(position.chain)).icon}
                    alt={'net'}
                  />
                </TableCell>
              )}
              <TableCell>{position.trader.slice(0, 6)}</TableCell>
              <TableCell style={{ color: position.direction ? '#26a69a' : '#EF5350' }}>
                {position.direction ? t('orderForm.long') : t('orderForm.short')}
              </TableCell>
              {tableType === 1 ? (
                <TableCell>{position.orderType === 1 ? t('orderForm.limit') : t('orderForm.stop')}</TableCell>
              ) : (
                <></>
              )}
              <TableCell>{assets[position.asset].name}</TableCell>
              <TableCell><MarginCell position={position} getSize={true} tableType={tableType}/></TableCell>
              <TableCell><MarginCell position={position} getSize={false} tableType={tableType}/></TableCell>
              <TableCell>{position.leverage}x</TableCell>
              <TableCell>{position.price.formatPriceString()}</TableCell>
              {tableType === 0 ? (
                <PnLCell
                  position={position}
                  price={!orcData[position.asset]?.price ? position.price * 1e18 : orcData[position.asset].price}
                  isAfterOpeningFees={isAfterOpeningFees}
                  isAfterClosingFees={isAfterClosingFees}
                />
              ) : tableType === 2 ? (
                <TableCell style={{ width: '150px' }}>
                  {pnlPercent(
                    position,
                    !orcData[position.asset]?.price ? position.price : orcData[position.asset].price / 1e18,
                    isAfterOpeningFees,
                    isAfterClosingFees,
                    position.margin / (1 - position.leverage * getNetwork(0).assets[position.asset].fee),
                    getNetwork(0).assets[position.asset].fee
                  )}
                </TableCell>
              ) : (
                <></>
              )}
              <TableCell>
                {tableType === 1 || tableType === 2 ? (
                  position.tpPrice?.toPrecision(7).replace('0.000000', t('None')).formatPriceString()
                ) : (
                  <InputStore handleUpdateTPSLChange={handleUpdateTPSLChange} position={position} isTP={true} />
                )}
              </TableCell>
              <TableCell>
                {tableType === 1 || tableType === 2 ? (
                  position.slPrice?.toPrecision(7).replace('0.000000', t('None')).formatPriceString()
                ) : (
                  <InputStore handleUpdateTPSLChange={handleUpdateTPSLChange} position={position} isTP={false} />
                )}
              </TableCell>
              {tableType !== 2 ? (
                <LiqCell position={position} />
              ) : (
                <TableCell>
                  {position.direction
                    ? (
                        parseFloat(position.price) -
                        (parseFloat(position.price) *
                          (parseFloat(position.margin) * 0.9 + parseFloat(position.accInterest))) /
                          parseFloat(position.margin) /
                          parseFloat(position.leverage)
                      )
                        .toPrecision(6)
                        .formatPriceString()
                    : (
                        parseFloat(position.price) +
                        (parseFloat(position.price) *
                          (parseFloat(position.margin) * 0.9 + parseFloat(position.accInterest))) /
                          parseFloat(position.margin) /
                          parseFloat(position.leverage)
                      )
                        .toPrecision(6)
                        .formatPriceString()}
                </TableCell>
              )}
              {tableType !== 2 && (
                <TableCell>
                  <ActionContainer className="ActionField">
                    {tableType === 0 ? (
                      <EditButton
                        onClick={(e) => {
                          handleClickEditOpen(position);
                          e.stopPropagation();
                        }}
                      >
                        <SmallText>Edit</SmallText>
                        <Edit sx={{ fontSize: '18px' }} />
                      </EditButton>
                    ) : (
                      <></>
                    )}
                    <CloseButton
                      onClick={(e) => {
                        tableType === 0 ? handleClosePositionClick(position) : handleCancelOrderClick(position.id);
                        e.stopPropagation();
                      }}
                    >
                      {tableType === 0 ? 'Close' : 'Cancel'}
                      <Close sx={{ fontSize: '18px' }} />
                    </CloseButton>
                  </ActionContainer>
                </TableCell>
              )}
            </StyledTableRow>
          ))}
          {/* No Trading Data */}
        </CustomTableBody>
      </Table>
      {isEditModalOpen && (
        <EditModal isState={isEditModalOpen} setState={setEditModalOpen} position={clickedPosition} />
      )}
    </TableContainer>
  );
};

const getPnlPercent = (
  interest: any,
  leverage: any,
  marginBeforeFees: any,
  margin: any,
  openPrice: any,
  direction: boolean,
  cPrice: any,
  isAfterOpeningFees: boolean,
  isAfterClosingFees: boolean,
  fees: number
) => {
  const closingFeePercent = isAfterClosingFees ? fees : 0;

  const closingFeePaid: number = direction
    ? (cPrice / openPrice) * leverage * margin * closingFeePercent
    : (openPrice / cPrice) * leverage * margin * closingFeePercent;

  let payoutAfterClosingFee: number = direction
    ? margin + (cPrice / openPrice - 1) * leverage * margin + interest - closingFeePaid
    : margin + (1 - cPrice / openPrice) * leverage * margin + interest - closingFeePaid;

  let pnlPercent = (payoutAfterClosingFee / (isAfterOpeningFees ? marginBeforeFees : margin) - 1) * 100;
  if (pnlPercent > 500) {
    pnlPercent = 500;
    payoutAfterClosingFee = margin * 5;
  }
  return { payoutAfterFee: payoutAfterClosingFee - (isAfterOpeningFees ? marginBeforeFees : margin), pnlPercent };
};

function pnlPercent(
  position: any,
  cPrice: any,
  isAfterClosingFees: boolean,
  isAfterOpeningFees: boolean,
  marginBeforeFees: number,
  fees: number
) {
  const { payoutAfterFee, pnlPercent } = getPnlPercent(
    position.accInterest,
    position.leverage,
    marginBeforeFees,
    position.margin,
    position.price,
    position.direction,
    cPrice,
    isAfterOpeningFees,
    isAfterClosingFees,
    fees
  );

  return (
    <div style={{ color: pnlPercent >= 0 ? '#26a69a' : '#EF5350' }}>
      {(pnlPercent >= 0 ? '+' : '') +
        payoutAfterFee.toFixed(2) +
        ' (' +
        (pnlPercent >= 0 ? '+' : '') +
        pnlPercent.toFixed(2) +
        '%)'}
    </div>
  );
}

interface IMarginCell {
  position: any;
  getSize: boolean;
  tableType: number;
}
const MarginCell = ({ position, getSize, tableType }: IMarginCell) => {
  const [fees, setFees] = useState(getNetwork(0).assets[position.asset].fee);
  const [marginBeforeFees, setMarginBeforeFees] = useState(position.margin / (1 - position.leverage * fees));
  const addressZero = '0x0000000000000000000000000000000000000000';
  const [isMarginLoading, setIsMarginLoading] = useState(true);
  const [isFeesLoading, setIsFeesLoading] = useState(true);

  const liveTokenDetailsData = useTokenDetailsData(position.asset);
  useEffect(() => {
    if (liveTokenDetailsData) {
      const pairData: any = liveTokenDetailsData.pairData;
      const referral: any = liveTokenDetailsData.referral;
      const closeFees: any = liveTokenDetailsData.closeFees;
      const _fees =
          ((Number(closeFees[0]) + Number(closeFees[1]) - Number(referral !== addressZero ? closeFees[2] : 0)) *
              (Number(pairData?.feeMultiplier) / 1e10)) /
          1e10;
      if (_fees !== fees) {
        setFees(_fees);
      }
      setIsFeesLoading(false);
    }
  }, [liveTokenDetailsData]);
  console.log(fees);

  useEffect(() => {
    const x = async () => {
      try {
        const res = await fetch(`https://tigristrade.info/margin/${String(position.chain)}/${String(position.id)}`);
        const data = await res.json();
        setMarginBeforeFees(data);
      } catch {
        console.log('Fallback to old margin calculation');
        const marginBeforeOpenFee = position.margin / (1 - position.leverage * fees);
        setMarginBeforeFees(marginBeforeOpenFee);
      }
    };
    if (tableType !== 2) {
      x().then(() => setIsMarginLoading(false));
    }
  }, [position, fees]);

  return (
      <TableCell>
        {(isFeesLoading || isMarginLoading) && tableType === 0 ? "Loading..." : (tableType !== 1 ? (marginBeforeFees * (getSize ? position.leverage : 1)) : (position.margin * (getSize ? position.leverage : 1))).toFixed(getSize ? 0 : 2)}
      </TableCell>
  );
};

interface IPnLCell {
  position: any;
  price: any;
  isAfterOpeningFees: boolean;
  isAfterClosingFees: boolean;
}
const PnLCell = ({ position, price, isAfterOpeningFees, isAfterClosingFees }: IPnLCell) => {
  const [fees, setFees] = useState(getNetwork(0).assets[position.asset].fee);
  const [marginBeforeFees, setMarginBeforeFees] = useState(position.margin / (1 - position.leverage * fees));
  const addressZero = '0x0000000000000000000000000000000000000000';

  const liveTokenDetailsData = useTokenDetailsData(position.asset);
  useEffect(() => {
    if (liveTokenDetailsData) {
      const pairData: any = liveTokenDetailsData.pairData;
      const referral: any = liveTokenDetailsData.referral;
      const closeFees: any = liveTokenDetailsData.closeFees;
      const _fees =
        ((Number(closeFees[0]) + Number(closeFees[1]) - Number(referral !== addressZero ? closeFees[2] : 0)) *
          (Number(pairData?.feeMultiplier) / 1e10)) /
        1e10;
      if (_fees !== fees) {
        setFees(_fees);
      }
    }
  }, [liveTokenDetailsData]);

  useEffect(() => {
    const x = async () => {
      try {
        const res = await fetch(`https://tigristrade.info/margin/${String(position.chain)}/${String(position.id)}`);
        const data = await res.json();
        setMarginBeforeFees(data);
      } catch {
        console.log('Fallback to old margin calculation');
        const marginBeforeOpenFee = position.margin / (1 - position.leverage * fees);
        setMarginBeforeFees(marginBeforeOpenFee);
      }
    };
    x();
  }, [position, isAfterOpeningFees, fees]);

  return (
    <TableCell style={{ width: '150px' }}>
      {price
        ? pnlPercent(position, price / 1e18, isAfterClosingFees, isAfterOpeningFees, marginBeforeFees, fees)
        : 'Loading...'}
    </TableCell>
  );
};

interface ILiqCell {
  position: any;
}
const LiqCell = ({ position }: ILiqCell) => {
  const [liqPrice, setLiqPrice] = useState(
    position.direction
      ? (
          position.price -
          (position.price / position.leverage) * ((position.margin + position.accInterest) / position.margin) * 0.9
        )
          .toPrecision(6)
          .formatPriceString()
      : (
          position.price +
          (position.price / position.leverage) * ((position.margin + position.accInterest) / position.margin) * 0.9
        )
          .toPrecision(6)
          .formatPriceString()
  );

  const liveLiqPrice = useLiqPrice(position.id);
  useEffect(() => {
    if (liveLiqPrice !== undefined) {
      const _liqPrice = (Number(liveLiqPrice) / 1e18).toPrecision(6).formatPriceString();
      if (liqPrice !== _liqPrice) {
        setLiqPrice(_liqPrice);
      }
    }
  }, [liveLiqPrice, liqPrice]);

  return <TableCell style={{ width: '150px' }}>{liqPrice}</TableCell>;
};

interface IInputStore {
  handleUpdateTPSLChange: any;
  position: any;
  isTP: boolean;
}
const InputStore = ({ handleUpdateTPSLChange, position, isTP }: IInputStore) => {
  const { setExpectingClick } = useContext(ChartMechanicsContext);
  const [tpsl, setTpsl] = useState(initTpsl(isTP, position));
  function initTpsl(isTP: boolean, position: any) {
    if (isTP) {
      return position.tpPrice === 0 ? '' : position.tpPrice?.toPrecision(7).formatPriceString();
    } else {
      return position.slPrice === 0 ? '' : position.slPrice?.toPrecision(7).formatPriceString();
    }
  }

  return (
    <Input
      sx={{
        fontSize: '12px',
        width: '60px',
        color: 'inherit'
      }}
      type="text"
      disableUnderline={true}
      placeholder={'None'}
      value={tpsl}
      onChange={(e: any) => {
        setTpsl(
          e.currentTarget.value
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*?)\..*/g, '$1')
            .replace(/^0[^.]/, '0')
        );
      }}
      onKeyDown={(event) => {
        if (
          (event.keyCode === 13 || event.code === 'Enter' || event.code === 'NumpadEnter') &&
          (isTP ? position.tpPrice : position.slPrice) !== tpsl
        ) {
          handleUpdateTPSLChange(position, isTP, tpsl === '' ? '0' : tpsl);
        }
      }}
      onClick={() => {
        console.log('Updating TPSL');
        setExpectingClick(true, 'updatetpsl', (price) => handleUpdateTPSLChange(position, isTP, price));
      }}
    />
  );
};

const TableContainer = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  overflowX: 'auto',
  '.MuiTableCell-root': {
    fontSize: '12px',
    padding: '2.5px 10px !important'
  }
}));

const CustomTableBody = styled(TableBody)(({ theme }) => ({
  '.MuiTableCell-root': {
    color: '#B1B5C3'
  }
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px'
}));

const EditButton = styled(Box)(({ theme }) => ({
  background: 'transparent',
  color: '#FFF',
  textTransform: 'none',
  cursor: 'pointer',
  display: 'flex',
  gap: '6px',
  alignItems: 'center'
}));

const SmallText = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

const CloseButton = styled(Box)(({ theme }) => ({
  color: '#FA6060',
  background: 'transparent',
  textTransform: 'none',
  cursor: 'pointer',
  display: 'flex',
  gap: '6px',
  alignItems: 'center'
}));

const VisibilityBox = styled(Box)(({ theme }) => ({
  minWidth: '14px',
  maxWidth: '14px',
  minHeight: '14px',
  maxHeight: '14px',
  backgroundColor: 'rgba(225, 225, 225, 0.18)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));

const TableCellContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px'
}));
