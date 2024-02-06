import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { GovernanceSvg, TradeSvg, VaultSvg, ReferralSvg, Indicator } from '../../config/images';
import { useStore } from '../../context/StoreContext';

export const NavList = () => {
  const { setPage } = useStore();
  const navigate = useNavigate();
  const handleNavbarClick = (value: number) => {
    navigate('/');
    setPage(value);
  };
  return (
    <List component="nav" sx={{ paddingY: '1.5rem' }}>
      <ListItemButton sx={{ paddingX: '1.5rem' }} onClick={() => handleNavbarClick(0)}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Img src={TradeSvg} alt="trade-svg" />
        </ListItemIcon>
        <ListItemText primary={'Trade'} />
      </ListItemButton>
      <ListItemButton sx={{ paddingX: '1.5rem' }} onClick={() => handleNavbarClick(1)}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Img src={TradeSvg} alt="trade-svg" />
        </ListItemIcon>
        <ListItemText primary={'Options'} />
      </ListItemButton>
      <ListItemButton sx={{ paddingX: '1.5rem' }} onClick={() => handleNavbarClick(2)}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Img src={VaultSvg} alt="Vault-svg" />
        </ListItemIcon>
        <ListItemText primary={'Vault'} />
      </ListItemButton>
      <ListItemButton sx={{ paddingX: '1.5rem' }} onClick={() => handleNavbarClick(3)}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Img src={GovernanceSvg} alt="Governance-svg" />
        </ListItemIcon>
        <ListItemText primary={'Governance'} />
      </ListItemButton>
      <ListItemButton sx={{ paddingX: '1.5rem' }} onClick={() => handleNavbarClick(4)}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Img src={ReferralSvg} alt="Referral-svg" />
        </ListItemIcon>
        <ListItemText primary={'Referral'} />
      </ListItemButton>
      <ListItemButton sx={{ paddingX: '1.5rem' }} onClick={() => handleNavbarClick(5)}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Img src={Indicator} alt="xtig-svg" />
        </ListItemIcon>
        <ListItemText primary={'xTIG'} />
      </ListItemButton>
      <ListItemButton sx={{ paddingX: '1.5rem' }} onClick={() => handleNavbarClick(6)}>
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Img src={VaultSvg} alt="Vault-svg" />
        </ListItemIcon>
        <ListItemText primary={'Leaderboard'} />
      </ListItemButton>
    </List>
  );
};

const Img = styled('img')(({ theme }) => ({
  width: '15px',
  height: '15px'
}));
