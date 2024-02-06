import React from 'react';
import { NavigateNext, Check } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemText, Box } from '@mui/material';
import { styled } from '@mui/system';

export const LanguageList = () => {
  const [isLangOpen, setLangOpen] = React.useState(false);
  const [isLang, setLang] = React.useState('English');
  return (
    <List component="nav" disablePadding>
      <ListItemButton
        sx={{ display: 'flex', justifyContent: 'space-between', paddingX: '1.5rem' }}
        onClick={() => setLangOpen(!isLangOpen)}
      >
        <PrimaryText>Language</PrimaryText>
        <SecondaryText>
          {isLang} {isLangOpen ? <NavigateNext sx={{ transform: 'rotate(90deg)' }} /> : <NavigateNext />}
        </SecondaryText>
      </ListItemButton>
      <Collapse in={isLangOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4, py: 0 }} onClick={() => setLang('English')}>
            <Box sx={{ width: '40px', height: '24px' }}>
              <Check sx={{ color: '#6FCF97', display: isLang === 'English' ? 'block' : 'none' }} />
            </Box>
            <ListItemText
              primary="English"
              sx={{ color: isLang === 'English' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.56)' }}
            />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4, py: 0 }} onClick={() => setLang('英语')}>
            <Box sx={{ width: '40px', height: '24px' }}>
              <Check sx={{ color: '#6FCF97', display: isLang === '英语' ? 'block' : 'none' }} />
            </Box>
            <ListItemText
              primary="英语"
              sx={{ color: isLang === '英语' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.56)' }}
            />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4, py: 0 }} onClick={() => setLang('Polski')}>
            <Box sx={{ width: '40px', height: '24px' }}>
              <Check sx={{ color: '#6FCF97', display: isLang === 'Polski' ? 'block' : 'none' }} />
            </Box>
            <ListItemText
              primary="Polski"
              sx={{ color: isLang === 'Polski' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.56)' }}
            />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4, py: 0 }} onClick={() => setLang('en Inglés')}>
            <Box sx={{ width: '40px', height: '24px' }}>
              <Check sx={{ color: '#6FCF97', display: isLang === 'en Inglés' ? 'block' : 'none' }} />
            </Box>
            <ListItemText
              primary="en Inglés"
              sx={{ color: isLang === 'en Inglés' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.56)' }}
            />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4, py: 0 }} onClick={() => setLang('Rus')}>
            <Box sx={{ width: '40px', height: '24px' }}>
              <Check sx={{ color: '#6FCF97', display: isLang === 'Rus' ? 'block' : 'none' }} />
            </Box>
            <ListItemText
              primary="Rus"
              sx={{ color: isLang === 'Rus' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.56)' }}
            />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4, py: 0 }} onClick={() => setLang('Ukrainian')}>
            <Box sx={{ width: '40px', height: '24px' }}>
              <Check sx={{ color: '#6FCF97', display: isLang === 'Ukrainian' ? 'block' : 'none' }} />
            </Box>
            <ListItemText
              primary="Ukrainian"
              sx={{ color: isLang === 'Ukrainian' ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.56)' }}
            />
          </ListItemButton>
        </List>
      </Collapse>
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
