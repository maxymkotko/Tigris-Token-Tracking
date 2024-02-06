import { OpenInNew } from '@mui/icons-material';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useState } from 'react';
import { useStore } from '../../../src/context/StoreContext';
import { OptionsTable } from '../Table/OptionsTable';
import { useTranslation } from 'react-i18next';

interface TabBarProps {
  active: number;
}

interface IPositionTable {
  setPairIndex: any;
  optionsTradesData: any;
}

export const OptionsTradesTable = ({ setPairIndex, optionsTradesData }: IPositionTable) => {
  const { setMiniPage } = useStore();
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  return (
    <TableContainer>
      <TableWrapper>
        <TableAction>
          <TableTab>
            <TabBar active={tab === 0 ? 1 : 0} onClick={() => setTab(0)}>
              {t('My Open Trades')}
            </TabBar>
            <TabBar active={tab === 1 ? 1 : 0} onClick={() => setTab(1)}>
              {t('My Limit Orders')}
            </TabBar>
            <TabBar active={tab === 2 ? 1 : 0} onClick={() => setTab(2)}>
              {t('Trade History')}
            </TabBar>
          </TableTab>
        </TableAction>
        <OptionsTable tableType={tab} setPairIndex={setPairIndex} positionData={optionsTradesData} />
      </TableWrapper>
      {/* <TableMedia>
        <TableMediaLabel>{t('Performance Chart')}</TableMediaLabel>
        <TableMediaAction
          onClick={() => {
            setMiniPage(1);
            window.scrollTo(0, 0);
          }}
        >
          {t('Advanced Stats')}
          <OpenInNew fontSize="small" />
        </TableMediaAction>
      </TableMedia> */}
    </TableContainer>
  );
};

const TableContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  [theme.breakpoints.down('desktop')]: {
    order: 4,
    gridColumn: '1 / 3',
    marginTop: '8px',
    marginBottom: '8px'
  }
}));

const TableWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#161221',
  width: '100%',
  height: '100%'
}));

const TableAction = styled(Box)(({ theme }) => ({
  padding: '10px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#1F1C2C',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  }
}));

const TableTab = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '22px'
}));

const TabBar = styled(Box)<TabBarProps>(({ theme, active }) => ({
  fontSize: '16px',
  textTransform: 'none',
  color: active === 1 ? '#FFFFFF' : '#777E90',
  cursor: 'pointer',
  [theme.breakpoints.down(480)]: {
    fontSize: '12px'
  }
}));

const TableDropDown = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  span: {
    color: '#777E90',
    fontSize: '12px'
  }
}));

const TableMedia = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  backgroundColor: '#161221',
  padding: '10px 13px',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const TableMediaLabel = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  fontWeight: 700,
  lineHeight: '20px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase'
}));

const TableMediaAction = styled(Box)(({ theme }) => ({
  color: '#3772FF',
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
  cursor: 'pointer'
}));
