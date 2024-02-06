import { useContext, useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';
import { useAccount, useFeeData, useNetwork, useWalletClient } from 'wagmi';
import { Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getNetwork } from '../../../src/constants/networks';
import { oracleData, oracleSocket } from 'src/context/socket';
import { waitForTransaction } from '@wagmi/core';
import { forwarder, getProxyWalletClients } from 'src/proxy_wallet';
import { LogError } from 'src/context/ErrorLogs';
import { ChartMechanicsContext } from 'src/context/ChartMechanics';
import { encodeFunctionData, parseEther } from 'viem';
import { useStore } from '../../context/StoreContext';
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
}

export const OptionsTable = ({ tableType, setPairIndex, positionData }: IPositionTable) => {
  const [data, setData] = useState<any>(oracleData);
  useEffect(() => {
    oracleSocket.on('data', (data: any) => {
      setData(data);
    });
  }, []);

  const openPositions = positionData.openPositions;
  const limitOrders = positionData.limitOrders;
  const allPositions = positionData.allPositions;

  const { assets } = getNetwork(0);

  const [forceRerender, setForceRerender] = useState(Math.random());

  const [clickedPosition, setClickedPosition] = useState<any>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const handleClickEditOpen = (position: any) => {
    setClickedPosition(position);
    setEditModalOpen(true);
  };

  const [isPositionVisible, setPositionVisible] = useState<any>({});
  const { t } = useTranslation();

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { setExecutionPrice, tradingStatus } = useContext(ChartMechanicsContext);
  const { data: feeData } = useFeeData({ watch: true });
  const { data: walletClient } = useWalletClient();

  function handleEyeClick(e: any, id: number, is: boolean) {
    const prevVisible = isPositionVisible;
    prevVisible[id] = is;
    setPositionVisible(prevVisible);
    positionData.setVisible([id], is);
    e.stopPropagation();
  }

  const [isAllVisible, setAllVisible] = useState(true);
  const [dec, setDec] = useState([
    2, 2, 2, 4, 3, 5, 5, 6, 5, 5, 5, 6, 5, 3, 5, 4, 6, 6, 4, 7, 4, 3, 3, 3, 3, 8, 4, 4, 7, 4, 5, 3, 4, 8, 8, 4, 8, 4, 6,
    5, 5, 5
  ]);

  function handleAllEyeClick(e: any) {
    const isSetVisible = !isAllVisible;
    setAllVisible(isSetVisible);
    const prevVisible = isPositionVisible;
    const ids = [];
    for (let i = 0; i < openPositions.length; i++) {
      prevVisible[openPositions[i].id] = isSetVisible;
      ids.push(openPositions[i].id);
    }
    for (let i = 0; i < limitOrders.length; i++) {
      prevVisible[limitOrders[i].id] = isSetVisible;
      ids.push(limitOrders[i].id);
    }
    setPositionVisible(prevVisible);
    positionData.setVisible(ids, isSetVisible);
    e.stopPropagation();
  }

  function handleDate(t: any) {
    const mtxt = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    const x = new Date(t);
    const day = x.getDate();
    const mm = x.getMonth();
    // eslint-disable-next-line
    return day + ' ' + mtxt[mm] + ' ' + x.toLocaleTimeString();
  }

  function calculateTimeLeft(difference: any) {
    let final = 'Processing';

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24)).toString();
      let hours = Math.floor((difference / (1000 * 60 * 60)) % 24).toString();
      let minutes = Math.floor((difference / 1000 / 60) % 60).toString();
      let seconds = Math.floor((difference / 1000) % 60).toString();

      if (parseFloat(seconds) > 0) {
        if (seconds.toString().length === 1) seconds = '0' + seconds;
        final = seconds;
      } else {
        final = '00';
      }

      if (parseInt(minutes) > 0) {
        if (minutes.toString().length === 1) minutes = '0' + minutes;
        final = minutes + ':' + final;
      } else {
        if (parseInt(hours) > 0 || parseInt(days) > 0) {
          final = '00:' + final;
        }
      }

      if (parseInt(hours) > 0) {
        if (hours.toString().length === 1) hours = '0' + hours;
        final = hours + ':' + final;
      } else {
        if (parseInt(days) > 0) {
          final = '00:' + final;
        }
      }

      if (parseInt(days) > 0) {
        final = days + ':' + final;
      }
    }

    return final;
  }

  function calculatePercentage(openPrice: any, duration: any, expires: any, cprice: any, isLong: any) {
    const now = new Date().getTime() / 1000;
    const start = expires - duration;
    let t = (duration - (now - start)) / duration;
    if (t <= 0) t = 0.001;

    const y = (openPrice / 1e18) * 0.01 * t;
    const x = (cprice - openPrice) / 1e18;

    let p: any = ((x + y) / (2 * y)) * 100;
    if (!isLong) p = 100 - p;

    if (p > 100) p = '99.99';
    else if (p < 0) p = '00.01';
    else p = p.toFixed(2);

    return p;
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
      try {
        toast.loading('Cancelling limit order...');
        const currentNetwork = getNetwork(chain.id);
        const optionsABI = currentNetwork.abis.options;
        const chainId = chain?.id;
        const inputDataParams = [id, address];
        const inputData = encodeFunctionData({
          abi: optionsABI,
          functionName: 'cancelLimitOrder',
          args: inputDataParams
        });
        await forwarder(chainId, inputData, 'cancelLimitOrder', currentNetwork.addresses.options);
      } catch (err: any) {
        toast.dismiss();
        toast.error('Cancelling limit order failed! ' + String(err.response.data.reason));
        LogError(address, err.response.data.reason, 0, 0, 'OPTIONS_CANCEL_LIMIT');
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <TableContainer>
      <Table size="small" aria-label="a dense table">
        <TableHead sx={{ '& .MuiTableCell-root': { color: '#547E8C', fontSize: '14px' }, textTransform: 'uppercase' }}>
          <TableRow>
            {tableType === 0 ? (
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
              <></>
            )}

            {tableType === 2 ? <TableCell>{t('Trade ID')}</TableCell> : <TableCell>{t('User')}</TableCell>}
            <TableCell>
              {t('orderForm.long')}/{t('orderForm.short')}
            </TableCell>
            {tableType === 1 ? <TableCell>{t('Type')}</TableCell> : <></>}
            <TableCell>{t('Pair')}</TableCell>
            <TableCell>{t('Collateral')}</TableCell>
            {tableType === 2 ? (
              <>
                <TableCell>{t('Open Price')}</TableCell>
                <TableCell>{t('Close Price')}</TableCell>
              </>
            ) : (
              <>
                <TableCell>{t('Strike Price')}</TableCell>
                <TableCell>{t('Current Price')}</TableCell>
              </>
            )}

            {tableType === 0 ? (
              <>
                <TableCell>{t('Open Time')}</TableCell>
                <TableCell>{t('Close Time')}</TableCell>
                <TableCell>{t('Expires in')}</TableCell>
                <TableCell>{t('Win Probability')}</TableCell>
              </>
            ) : tableType === 2 ? (
              <>
                <TableCell>{t('Close Time')}</TableCell>
                <TableCell>{t('header.Payout')}</TableCell>
              </>
            ) : (
              <>
                <TableCell>{t('Duration')}</TableCell>
                <TableCell>{t('Action')}</TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <CustomTableBody key={forceRerender}>
          {(tableType === 0 ? openPositions : tableType === 2 ? allPositions : limitOrders).map((position: any) => (
            <StyledTableRow key={position.id} onClick={() => setPairIndex(position.asset)}>
              {tableType === 0 ? (
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
                <></>
              )}
              {tableType === 2 ? (
                <TableCell>#{position.id}</TableCell>
              ) : (
                <TableCell>{position.trader.slice(0, 6)}</TableCell>
              )}
              <TableCell style={{ color: position.direction ? '#26a69a' : '#EF5350' }}>
                {position.direction ? 'Long' : 'Short'}
              </TableCell>
              {tableType === 1 ? <TableCell>{position.orderType === 1 ? 'Limit' : 'Stop'}</TableCell> : <></>}
              <TableCell>{assets[position.asset].name}</TableCell>
              {tableType === 2 ? (
                <TableCell>{(position.collateral / 1).toFixed(2)}</TableCell>
              ) : (
                <TableCell>{(position.collateral / 1e18).toFixed(2)}</TableCell>
              )}
              <TableCell>{(position.openPrice / 1e18).formatPriceString()}</TableCell>
              {tableType === 2 ? (
                <TableCell>{(position.closePrice / 1e18).formatPriceString()}</TableCell>
              ) : (
                <TableCell
                  style={{
                    color:
                      (position.direction &&
                        (!data[position.asset]?.price ? 0 : data[position.asset].price / 1e18) >
                          position.openPrice / 1e18) ||
                      (!position.direction &&
                        (!data[position.asset]?.price ? 0 : data[position.asset].price / 1e18) <
                          position.openPrice / 1e18)
                        ? '#26a69a'
                        : '#EF5350'
                  }}
                >
                  {parseFloat(
                    (!data[position.asset]?.price ? 0 : data[position.asset].price / 1e18).formatPriceString()
                  ).toFixed(dec[position.asset])}
                </TableCell>
              )}

              {tableType === 2 ? (
                <>
                  <TableCell>{handleDate(parseInt(position.expires) * 1000)}</TableCell>
                  <TableCell style={{ color: position.payout / 1 > 0 ? '#26a69a' : '#EF5350' }}>
                    {(position.payout / 1e18).toFixed(2)}
                  </TableCell>
                </>
              ) : tableType === 1 ? (
                <>
                  <TableCell>
                    {parseInt(position.duration) / 60} {t('Min')}
                  </TableCell>
                  <TableCell>
                    <ActionContainer className="ActionField">
                      <CloseButton
                        onClick={(e) => {
                          handleCancelOrderClick(position.id);
                          e.stopPropagation();
                        }}
                      >
                        {t('Cancel')}
                        <Close sx={{ fontSize: '18px' }} />
                      </CloseButton>
                    </ActionContainer>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{handleDate((parseInt(position.expires) - parseInt(position.duration)) * 1000)}</TableCell>
                  <TableCell>{handleDate(parseInt(position.expires) * 1000)}</TableCell>
                  <TableCell>{calculateTimeLeft(parseInt(position.expires) * 1000 - new Date().getTime())}</TableCell>
                  <TableCell
                    style={{
                      color:
                        parseFloat(
                          calculatePercentage(
                            position.openPrice,
                            position.duration,
                            position.expires,
                            !data[position.asset]?.price ? 0 : data[position.asset].price,
                            position.direction
                          )
                        ) < 50
                          ? '#EF5350'
                          : '#26a69a'
                    }}
                  >
                    {calculatePercentage(
                      position.openPrice,
                      position.duration,
                      position.expires,
                      !data[position.asset]?.price ? 0 : data[position.asset].price,
                      position.direction
                    )}
                    %
                  </TableCell>
                </>
              )}
            </StyledTableRow>
          ))}
          {/* No Trading Data */}
        </CustomTableBody>
      </Table>
    </TableContainer>
  );
};

const TableContainer = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  overflowX: 'auto',
  '.MuiTableCell-root': {
    fontSize: '14px',
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
