import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Button, Box } from '@mui/material';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 2,
    marginTop: theme.spacing(1),
    backgroundColor: '#222630',
    minWidth: 180,
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0'
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5)
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)
        // backgroundColor: 'none'
      }
    }
  }
}));

interface DropDownMenuProps {
  arrayData: any;
  name: string;
  state: any;
  setState: any;
}

export const IconDropDownMenu = (props: DropDownMenuProps) => {
  const { arrayData, name, state, setState } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClicked = (e: React.MouseEvent<HTMLElement>, item: any) => {
    handleClose();
    setState(name, item);
  };

  //   const handleMenu = (func: () => void) => {
  //     func();
  //     handleClose();
  //   }

  return (
    <>
      <Dropdown
        id="demo-customized-button"
        aria-controls={isOpen ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      >
        <Content>
          <Img src={state.icon} alt="dropdown-icon" />
          <Letter>{state.name}</Letter>
        </Content>
      </Dropdown>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button'
        }}
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {arrayData.map((item: any, index: number) => (
          <CustomMenuItem onClick={(e) => handleMenuClicked(e, item)} key={index}>
            <Content>
              <Img src={item.icon} alt="dropdown-icon" />
              <Letter>{item.name}</Letter>
            </Content>
          </CustomMenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

const Dropdown = styled(Button)({
  background: '#232031',
  borderRadius: '4px',
  fontSize: '12px',
  color: '#FFFFFF',
  textTransform: 'none',
  padding: '10px',
  width: '100%',
  height: '36px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:hover': {
    background: '#232031'
  }
});

const CustomMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '12px',
  width: '100%'
}));

const Content = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '7px'
}));

const Img = styled('img')(({ theme }) => ({
  width: '20px',
  height: '20px'
}));

const Letter = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  color: '#FFF',
  lineHeight: '20px'
}));
