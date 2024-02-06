import React from 'react';
import { Box, List, ListItemButton } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { styled } from '@mui/system';

export const CurrencyList = () => {
  const [isCurrencyOpen, setCurrencyOpen] = React.useState(false);
  return (
    <List component="nav" disablePadding>
      <ListItemButton
        sx={{ display: 'flex', justifyContent: 'space-between', paddingX: '1.5rem' }}
        onClick={() => setCurrencyOpen(!isCurrencyOpen)}
      >
        <PrimaryText>Currency</PrimaryText>
        <SecondaryText>
          USD {isCurrencyOpen ? <NavigateNext sx={{ transform: 'rotate(90deg)' }} /> : <NavigateNext />}
        </SecondaryText>
      </ListItemButton>
    </List>
  );
};

const PrimaryText = styled(Box)(({ theme }) => ({
  fontSize: '15px',
  lineHeight: '16px'
}));

const SecondaryText = styled(Box)(({ theme }) => ({
  fontSize: '15px',
  color: '#777E90',
  display: 'flex',
  alignItems: 'center',
  gap: 3
}));
