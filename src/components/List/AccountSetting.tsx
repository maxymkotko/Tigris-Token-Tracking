import React from 'react';
import { Settings } from '@mui/icons-material';
import { Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { CopySvg, ExpandSvg, MetamaskSvg } from '../../../src/config/images';
import { styled } from '@mui/system';
import { useAccount } from 'wagmi';

export const AccountSetting = () => {
  const [isOpen, setOpen] = React.useState(false);
  const { address, isConnected } = useAccount();
  return (
    <List sx={{ paddingY: '1.5rem' }}>
      <ListItemButton onClick={() => setOpen(!isOpen)} sx={{ paddingX: '1.5rem' }}>
        <ListItemIcon sx={{ minWidth: 35 }}>
          <Settings sx={{ color: '#58BD7D' }} />
        </ListItemIcon>
        <ListItemText primary={'Account settings'} />
      </ListItemButton>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        {isConnected ? (
          <>
            <List component="div" disablePadding>
              <ListItem sx={{ paddingX: '1.5rem' }}>
                <ListItemText primary="Connected with MetaMask" sx={{ color: '#777E90', fontSize: '12px' }} />
              </ListItem>
            </List>
            <List component="div" disablePadding>
              <ListItem sx={{ paddingX: '1.5rem' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Img src={MetamaskSvg} alt="metamask-svg" />
                </ListItemIcon>
                <ListItemText sx={{ color: '#777E90', fontSize: '12px' }}>
                  {address?.slice(0, 4)}...{address?.slice(-13)}
                </ListItemText>
              </ListItem>
            </List>
            <List component="div" disablePadding>
              <ListItemButton sx={{ paddingX: '1.5rem' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Img src={CopySvg} alt="copy-svg" />
                </ListItemIcon>
                <ListItemText sx={{ color: '#777E90', fontSize: '12px' }}>Copy Link</ListItemText>
              </ListItemButton>
              <ListItemButton sx={{ paddingX: '1.5rem' }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Img src={ExpandSvg} alt="metamask-svg" />
                </ListItemIcon>
                <ListItemText sx={{ color: '#777E90', fontSize: '12px' }}>View on Explorer</ListItemText>
              </ListItemButton>
            </List>
          </>
        ) : (
          <List component="div" disablePadding>
            <ListItem sx={{ paddingX: '1.5rem' }}>
              <ListItemText primary="Please connect the wallet" sx={{ color: '#777E90', fontSize: '12px' }} />
            </ListItem>
          </List>
        )}
      </Collapse>
    </List>
  );
};

const Img = styled('img')(({ theme }) => ({
  width: '25px',
  height: '25px'
}));
