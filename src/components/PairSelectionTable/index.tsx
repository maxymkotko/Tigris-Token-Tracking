import React from 'react';
import { Box, Tab, Tabs, IconButton, Button } from '@mui/material';
import { styled } from '@mui/system';
import { SearchBar } from '../SearchBar';
import { a11yProps, TabPanel } from '../TabPanel';
import { Star, StarBorder } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { USDPairsTable } from './USDPairsTable';
import { BTCPairsTable } from './BTCPairsTable';
import { ForexPairsTable } from './ForexPairsTable';
import { CommodityPairsTable } from './CommodityPairsTable';
import { FavPairsTable } from './FavPairsTable';
import { localStorageGet, localStorageSet } from '../../utils/localStorage';
import { useTranslation } from 'react-i18next';

interface PairSelectionTableProps {
  isMobile: boolean;
  setPairIndex: any;
  onClose?: () => void;
}

export const PairSelectionTable = ({ setPairIndex, isMobile, onClose }: PairSelectionTableProps) => {
  const [value, setValue] = React.useState(localStorageGet('lastCategoryTab', undefined) || 0);
  const { t } = useTranslation();
  const handleChange = (newValue: number) => {
    setSearchQuery('');
    setValue(newValue);
    localStorageSet('lastCategoryTab', newValue);
  };

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (event: any) => {
    setSearchQuery(event.target.value.toUpperCase());
  };

  return (
    <TradingDetailContainer>
      <SearchContainer>
        <Box sx={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <SearchBar onChange={handleSearch} />
          {isMobile && (
            <Box sx={{ cursor: 'pointer', marginBottom: '-6px' }} onClick={onClose}>
              <CloseIcon sx={{ color: '#777E90' }} />
            </Box>
          )}
        </Box>
        <CategoryButtonContainer>
          <CategoryButton
            onClick={() => handleChange(4)}
            startIcon={<StarBorder sx={{ color: '#FABE3C', width: '20px', height: '20px' }} />}
          >
            Favorites
          </CategoryButton>
          <CategoryButton onClick={() => handleChange(0)}>USDT Pairs</CategoryButton>
          <CategoryButton onClick={() => handleChange(1)}>{`BTC ${t('Pair')}`}</CategoryButton>
          <CategoryButton onClick={() => handleChange(2)}>{t('Forex')}</CategoryButton>
          <CategoryButton onClick={() => handleChange(3)}>{t('Commodities')}</CategoryButton>
        </CategoryButtonContainer>
        {value === 0 && <USDPairsTable setPairIndex={setPairIndex} searchQuery={searchQuery} onClose={onClose} />}
        {value === 1 && <BTCPairsTable setPairIndex={setPairIndex} searchQuery={searchQuery} onClose={onClose} />}
        {value === 2 && <ForexPairsTable setPairIndex={setPairIndex} searchQuery={searchQuery} onClose={onClose} />}
        {value === 3 && <CommodityPairsTable setPairIndex={setPairIndex} searchQuery={searchQuery} onClose={onClose} />}
        {value === 4 && <FavPairsTable setPairIndex={setPairIndex} searchQuery={searchQuery} onClose={onClose} />}
      </SearchContainer>
    </TradingDetailContainer>
  );
};

const TradingDetailContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: '12px'
}));

const SearchContainer = styled(Box)({
  // padding: '15px 9px'
  // maxHeight: '560px'
});

const TabsContainer = styled(Box)({
  borderBottom: '1px solid gray',
  display: 'flex',
  alignItems: 'center',
  marginTop: '15px',
  padding: '0 9px'
});

const CustomTab = styled(Tab)({
  color: '#777E90',
  padding: 0,
  fontSize: '12px',
  height: '30px'
});

const CategoryButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  padding: '24px 0px'
}));

const CategoryButton = styled(Button)(({ theme }) => ({
  padding: '6px 8px',
  borderRadius: '4px',
  background: '#23202F',
  color: '#9497A9',
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'none'
}));
