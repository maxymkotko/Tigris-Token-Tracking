import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useState } from 'react';
import { TradeLogsTable } from '../Table/TradeLogsTable';
import { Download } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TigrisDateRangePicker } from '../DateRangePicker';
import { ReactDatePickerProps } from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';

export const TradingLogsBoard = () => {
  const [exportData, setExportData] = useState([]);
  const { t } = useTranslation();

  const popperPlacement: ReactDatePickerProps['popperPlacement'] = 'bottom-start';

  const exportPDF = () => {
    const unit = 'pt';
    const size = 'A4'; // Use A1, A2, A3 or A4
    const orientation = 'portrait'; // portrait or landscape
    const title = 'LOG OF TRADES';

    const marginLeft = 40;
    // eslint-disable-next-line new-cap
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const headers = [
      [
        'Position',
        'Symbol',
        'Position Size',
        'Lev',
        'Entry Price',
        'Exit price',
        'Pnl (%)',
        'PnL ($)',
        'Order type',
        'Date',
        'Time'
      ]
    ];

    const data = exportData.map((elt: any) => [
      elt.position,
      elt.symbol,
      elt.positionSize,
      elt.leverage,
      elt.entryPrice,
      elt.exitPrice,
      elt.pnlPro,
      elt.pnlDollar,
      elt.orderType,
      elt.date,
      elt.time
    ]);

    const content = {
      startY: 50,
      head: headers,
      body: data
    };

    doc.text(title, marginLeft, 40);
    autoTable(doc, content);
    doc.save('report.pdf');
  };

  return (
    <TableContainer>
      <TableWrapper>
        <TableTopBar>
          <TableTitle>{t('Log of trades')}</TableTitle>
          <TableAction>
            {/* <TigrisDateRangePicker value={dateRange} setValue={setDateRange} /> */}
            <TigrisDateRangePicker popperPlacement={popperPlacement} />
            <TableDownloadButton onClick={exportPDF}>
              <Download />
              {t('Download as PDF')}
            </TableDownloadButton>
          </TableAction>
        </TableTopBar>
        <TradeLogsTable setData={setExportData} />
      </TableWrapper>
    </TableContainer>
  );
};

const TableContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minWidth: '1082px',
  width: '100%',
  [theme.breakpoints.down(1440)]: {
    minWidth: 'auto'
  },
  [theme.breakpoints.down('desktop')]: {
    order: 4,
    gridColumn: '1 / 3'
  }
}));

const TableWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#161221',
  width: '100%'
}));

const TableTopBar = styled(Box)(({ theme }) => ({
  padding: '19px 17px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  }
}));

const TableTitle = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  lineHeight: '20px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase'
}));

const TableAction = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '33.3px'
}));

const TableDownloadButton = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  lineHeight: '21px',
  color: '#3772FF',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer'
}));
