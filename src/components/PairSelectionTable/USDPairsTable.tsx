import { Star, StarBorder } from '@mui/icons-material';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { useEffect, useState, useContext } from 'react';
import { FavPairsContext } from 'src/context/FavPairs';
import {
  adaLogo,
  algoLogo,
  arbLogo,
  atomLogo,
  avaxLogo,
  bchLogo,
  btcLogo,
  bnbLogo,
  dogeLogo,
  dotLogo,
  ethLogo,
  gmxLogo,
  linkLogo,
  ltcLogo,
  maticLogo,
  nearLogo,
  pepeLogo,
  solLogo,
  uniLogo,
  xmrLogo,
  xrpLogo
} from '../../config/images';
import { oracleSocket, oracleData, priceChangeData, priceChangeSocket } from '../../../src/context/socket';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { useTranslation } from 'react-i18next';

function createData(pair: React.ReactElement, pairIndex: number) {
  return {
    pair,
    pairIndex
  };
}

interface PairFieldProps {
  icon: string;
  name: string;
}
const PairField = ({ icon, name }: PairFieldProps) => {
  const { favPairs, changeFavPair } = useContext(FavPairsContext);
  function handleStarClick(event: React.MouseEvent, setFav: boolean) {
    console.log({ name, setFav });
    changeFavPair(name, setFav);
    event.stopPropagation();
  }

  return (
    <PairFieldContainer>
      {favPairs.includes(name) ? (
        <IconButton
          onClick={(e) => {
            handleStarClick(e, false);
          }}
          sx={{ padding: '0px' }}
        >
          <Star sx={{ color: '#FABE3C', width: '20px', height: '20px' }} />
        </IconButton>
      ) : (
        <IconButton
          onClick={(e) => {
            handleStarClick(e, true);
          }}
          sx={{ padding: '0px' }}
        >
          <StarBorder sx={{ width: '20px', height: '20px' }} />
        </IconButton>
      )}
      <img src={icon} style={{ maxHeight: '24px' }} />
      <CoinName>{name}</CoinName>
    </PairFieldContainer>
  );
};

interface BenefitProps {
  percent: string;
  value: string;
}

const Benefit = ({ percent, value }: BenefitProps) => {
  return (
    <BenefitContainer sx={{ color: Number(value) > 0 ? '#26A69A' : Number(value) < 0 ? '#EF534F' : '#B1B5C3' }}>
      {Number(percent) > 0 ? `+${percent}%` : `${percent}%`.replace('NaN', '0')}
      {/* <p>{(Number(value) > 0 ? '+' : '') + value.replace('NaN', '0')}</p> */}
    </BenefitContainer>
  );
};

interface Props {
  setPairIndex: any;
  searchQuery: any;
  onClose: any;
}

interface PriceCellProps {
  setPairIndex: any;
  pairIndex: any;
}

export const PriceCell = ({ setPairIndex, pairIndex }: PriceCellProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    oracleSocket.on('data', (data: any) => {
      if (data[pairIndex] && data[pairIndex].price !== oraclePrice) {
        setOraclePrice(data[pairIndex].price);
      }
    });
  }, [pairIndex]);

  const [oraclePrice, setOraclePrice] = useState(
    oracleData === 'Loading...'
      ? 'Loading...'
      : !oracleData[pairIndex]
      ? 'Coming Soon...'
      : (oracleData[pairIndex] as any).price
  );

  return (
    <>
      <TableCell align="center" sx={{ width: '125px' }} onClick={() => setPairIndex(pairIndex)}>
        {oraclePrice === 'Loading...'
          ? 'Loading...'
          : oraclePrice === 'Coming Soon...'
          ? 'Coming Soon...'
          : (oraclePrice / 1e18).toPrecision(6)}
      </TableCell>
    </>
  );
};

export const ChangeCell = ({ setPairIndex, pairIndex }: PriceCellProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    priceChangeSocket.on('data', (data: any) => {
      if (data.priceChange) {
        setPriceChange({
          priceChange: data.priceChange[pairIndex],
          priceChangePercent: data.priceChangePercent[pairIndex]
        });
      }
    });
  }, [pairIndex]);

  const [priceChange, setPriceChange] = useState(
    priceChangeData === 'Loading...'
      ? 'Loading...'
      : {
          priceChange: (priceChangeData as any).priceChange[pairIndex] as number,
          priceChangePercent: (priceChangeData as any).priceChangePercent[pairIndex] as number
        }
  );

  return (
    <>
      <TableCell align="center" sx={{ width: '100px' }} onClick={() => setPairIndex(pairIndex)}>
        <Benefit
          value={priceChange === 'Loading...' ? 'Loading...' : Number((priceChange as any).priceChange).toPrecision(4)}
          percent={
            priceChange === 'Loading...' ? 'Loading...' : Number((priceChange as any).priceChangePercent).toFixed(2)
          }
        />
      </TableCell>
    </>
  );
};

export const USDPairsTable = ({ setPairIndex, searchQuery, onClose }: Props) => {
  const [rows, setRows] = useState(createRows());
  const [sortBy, setSortBy] = useState('desc');
  const { t } = useTranslation();

  useEffect(() => {
    if (priceChangeData === 'Loading...' || sortBy === 'none') setRows(createRows());
    else {
      setRows(createSortedRows());
    }
  }, [searchQuery, sortBy]);

  function createSortedRows() {
    const _rows = createRows();
    const sortedRows = _rows.sort((a: any, b: any) => {
      if (sortBy === 'asc') {
        return (
          Number((priceChangeData as any).priceChangePercent[a.pairIndex]) -
          Number((priceChangeData as any).priceChangePercent[b.pairIndex])
        );
      } else {
        return (
          Number((priceChangeData as any).priceChangePercent[b.pairIndex]) -
          Number((priceChangeData as any).priceChangePercent[a.pairIndex])
        );
      }
    });
    return sortedRows;
  }

  function createRows() {
    return [
      createData(<PairField icon={adaLogo} name={'ADA/USD'} />, 14),
      createData(<PairField icon={algoLogo} name={'ALGO/USD'} />, 30),
      createData(<PairField icon={arbLogo} name={'ARB/USD'} />, 35),
      createData(<PairField icon={atomLogo} name={'ATOM/USD'} />, 15),
      createData(<PairField icon={avaxLogo} name={'AVAX/USD'} />, 26),
      createData(<PairField icon={bchLogo} name={'BCH/USD'} />, 21),
      createData(<PairField icon={bnbLogo} name={'BNB/USD'} />, 13),
      createData(<PairField icon={btcLogo} name={'BTC/USD'} />, 0),
      createData(<PairField icon={dogeLogo} name={'DOGE/USD'} />, 19),
      createData(<PairField icon={dotLogo} name={'DOT/USD'} />, 23),
      createData(<PairField icon={ethLogo} name={'ETH/USD'} />, 1),
      createData(<PairField icon={gmxLogo} name={'GMX/USD'} />, 37),
      createData(<PairField icon={linkLogo} name={'LINK/USD'} />, 4),
      createData(<PairField icon={ltcLogo} name={'LTC/USD'} />, 20),
      createData(<PairField icon={maticLogo} name={'MATIC/USD'} />, 3),
      createData(<PairField icon={nearLogo} name={'NEAR/USD'} />, 29),
      createData(<PairField icon={pepeLogo} name={'PEPE/USD'} />, 36),
      createData(<PairField icon={solLogo} name={'SOL/USD'} />, 18),
      createData(<PairField icon={uniLogo} name={'UNI/USD'} />, 27),
      createData(<PairField icon={xmrLogo} name={'XMR/USD'} />, 24),
      createData(<PairField icon={xrpLogo} name={'XRP/USD'} />, 38)
    ].filter((pair) => pair.pair.props.name.includes(searchQuery));
  }

  return (
    <>
      <TbodyContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#777E90', width: '150px', textWrap: 'nowrap' }}>MARKET</TableCell>
              <TableCell sx={{ color: '#777E90', width: '125px', textWrap: 'nowrap' }}>CURRENT PRICE</TableCell>
              <TableCell
                align="center"
                sx={{
                  color: '#777E90',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textWrap: 'nowrap'
                }}
                onClick={() => setSortBy((value) => (value === 'desc' ? 'asc' : value === 'asc' ? 'none' : 'desc'))}
              >
                24H CHANGE
                <SwapVertIcon sx={{ color: '#777E90' }} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody key={rows.length}>
            {rows.map((row, index) => (
              <CustomTableRow
                key={index}
                onClick={() => {
                  setPairIndex(row.pairIndex);
                  onClose();
                }}
              >
                <TableCell sx={{ width: '150px' }}>{row.pair}</TableCell>
                <PriceCell setPairIndex={setPairIndex} pairIndex={row.pairIndex} />
                <ChangeCell setPairIndex={setPairIndex} pairIndex={row.pairIndex} />
              </CustomTableRow>
            ))}
          </TableBody>
        </Table>
      </TbodyContainer>
    </>
  );
};

const PairFieldContainer = styled(Box)({
  display: 'flex',
  gap: '10px',
  alignItems: 'center'
});

const CoinName = styled(Box)({
  fontweight: 400,
  fontSize: '12px',
  letterSpacing: '1.25px',
  border: '10px solid rgba(0, 0, 0, 0)',
  marginLeft: '-10px'
});

const BenefitContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  fontSize: '12px',
  fontWeight: 400
});

const CustomTableRow = styled(TableRow)({
  '&:hover': { backgroundColor: '#1E1F25', cursor: 'pointer' }
});

const TbodyContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  overflowY: 'auto',
  [theme.breakpoints.down('desktop')]: {
    height: '500px'
  }
}));
