import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import { useAccount, useNetwork, useTransaction } from 'wagmi';
import { PRIVATE_ROUTES } from 'src/config/routes';
import axios from 'axios';
import { parseDate } from '../Menu/NotificationMenu';
import { ThreeDotsLoader } from '../ThreeDotsLoader';
import { getNetwork } from 'src/constants/networks';
import { useTranslation } from 'react-i18next';

function createData(
  position: string,
  symbol: string,
  positionSize: number,
  leverage: number,
  entryPrice: number,
  exitPrice: number,
  pnlPro: number,
  pnlDollar: number,
  orderType: string,
  date: string,
  time: string
) {
  return { position, symbol, positionSize, leverage, entryPrice, exitPrice, pnlPro, pnlDollar, orderType, date, time };
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#23262F'
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  },
  '.ActionField': {
    visibility: 'hidden'
  },
  '&:hover': {
    backgroundColor: '#777E90',
    '.MuiTableCell-root': {
      color: '#FFFFFF'
    },
    '.ActionField': {
      visibility: 'visible'
    }
  }
}));

interface LogsTableProps {
  setData: any;
}

interface logDataProps {
  position: string;
  symbol: string;
  positionSize: number;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  pnlPro: number;
  pnlDollar: number;
  orderType: string;
  date: string;
  time: string;
}

export const TradeLogsTable = (props: LogsTableProps) => {
  const { setData } = props;
  const [logData, setLogData] = useState<logDataProps[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { t } = useTranslation();

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const fetchData = async () => {
    if (address !== undefined) {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const result = await axios.get(`${PRIVATE_ROUTES.serverUrl}/tradelogs/${chain?.id}/${address}`);
      const data = result.data;
      const len = data.length;
      const createArr = [];
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          const position = data[i].position === true ? t('orderForm.Long') : t('orderForm.Short');
          const symbol_idx = data[i].symbol;
          const symbol = getNetwork(0).assets[symbol_idx].name;
          const positionSize = data[i].positionSize;
          const leverage = data[i].leverage;
          const entryPrice = data[i].entryPrice;
          const exitPrice = data[i].exitPrice;
          const pnlPro = parseFloat((data[i].pnlpro * 100).toFixed(2));
          const pnlDollar = data[i].pnldollar;
          const orderType =
            data[i].orderType === 0
              ? t('orderForm.market')
              : data[i].orderType === 1
              ? t('orderForm.limit')
              : t('orderForm.stop');
          const date = parseDate(data[i].dateTime);
          const _date = date.split(', ')[0];
          const _dateTime = date.split(', ')[1];
          createArr.push(
            createData(
              position,
              symbol,
              positionSize,
              leverage,
              entryPrice,
              exitPrice,
              pnlPro,
              pnlDollar,
              orderType,
              _date,
              _dateTime
            )
          );
        }
      }
      setLogData(createArr);
      setLoading(false);
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => await fetchData(), 60000);
  };

  useEffect(() => {
    if (isConnected) {
      fetchData();
    } else {
      setLogData([]);
    }
  }, [isConnected, chain]);

  useEffect(() => {
    setData(logData);
  }, [logData]);
  return (
    <TableContainer>
      {isLoading ? (
        <ThreeDotsLoader />
      ) : logData.length === 0 ? (
        <NoDataLabel>{t('There is no log data of trade')}</NoDataLabel>
      ) : (
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>{t('orderForm.Position')}</TableCell>
              <TableCell>{t('Symbol')}</TableCell>
              <TableCell>{t('Position size')}</TableCell>
              <TableCell>{t('orderForm.Leverage')}</TableCell>
              <TableCell>{t('Entry Price')}</TableCell>
              <TableCell>{t('Exit Price')}</TableCell>
              <TableCell>Pnl (%)</TableCell>
              <TableCell>Pnl ($)</TableCell>
              <TableCell>{t('Order type')}</TableCell>
              <TableCell>{t('Date')}</TableCell>
              <TableCell>{t('Time')}</TableCell>
            </TableRow>
          </TableHead>
          <CustomTableBody>
            {logData
              .slice(0)
              .reverse()
              .map((row, index) => (
                <StyledTableRow key={index}>
                  <TableCell>
                    <span style={{ color: row.position === 'Long' ? 'rgb(38, 166, 154)' : 'rgb(239, 83, 80)' }}>
                      {row.position}
                    </span>
                  </TableCell>
                  <TableCell>{row.symbol}</TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>{row.positionSize}</TableCell>
                  <TableCell>{row.leverage}x</TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>{row.entryPrice}</TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>{row.exitPrice}</TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>
                    <span style={{ color: row.pnlPro > 0 ? 'rgb(38, 166, 154)' : 'rgb(239, 83, 80)' }}>
                      {row.pnlPro}
                    </span>
                  </TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>
                    <span style={{ color: row.pnlDollar > 0 ? 'rgb(38, 166, 154)' : 'rgb(239, 83, 80)' }}>
                      {row.pnlDollar}
                    </span>
                  </TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>{row.orderType}</TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>{row.date}</TableCell>
                  <TableCell sx={{ minWidth: '100px' }}>{row.time}</TableCell>
                </StyledTableRow>
              ))}
          </CustomTableBody>
        </Table>
      )}
    </TableContainer>
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

const NoDataLabel = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '15px',
  paddingBottom: '20px',
  color: '#777E90'
}));
