import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/system';
import { Box, ListItemText } from '@mui/material';
import { useAccount } from 'wagmi';
import { useStore } from 'src/context/StoreContext';
import { useTranslation } from 'react-i18next';
import { GB, CN, JP } from 'country-flag-icons/react/3x2';

interface CountryProps {
  id: number;
  name: string;
  flag: JSX.Element;
}

interface TranslateMenuProps {
  state: null | HTMLElement;
  setState: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setCountry: React.Dispatch<React.SetStateAction<CountryProps>>;
  countryList: CountryProps[];
}

export default function TranslateMenu(props: TranslateMenuProps) {
  const { state, setState, setCountry, countryList } = props;
  const { t, i18n } = useTranslation();
  const isOpen = Boolean(state);
  const { lang, setLang } = useStore();
  const handleClose = () => {
    setState(null);
  };

  const handleMenuClick = (value: string) => {
    handleClose();
    let language = value;
    switch (language) {
      case 'English':
        language = 'English';
        setCountry(countryList[0]);
        break;
      case '中文':
        language = 'Chinese';
        setCountry(countryList[1]);
        break;
      case '日本語':
        language = 'Japanese';
        setCountry(countryList[2]);
        break;
      default:
        break;
    }
    i18n.changeLanguage(language);
    setLang(value);
  };

  return (
    <React.Fragment>
      <Menu
        anchorEl={state}
        id="account-menu"
        open={isOpen}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleMenuClick('English')}>
          <ListItemText>
            <FlagName>
              <GB width={20} height={20} />
              EN
            </FlagName>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('中文')}>
          <ListItemText>
            <FlagName>
              <CN width={20} height={20} />
              中文
            </FlagName>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('日本語')}>
          <ListItemText>
            <FlagName>
              <JP width={20} height={20} />
              日本語
            </FlagName>
          </ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}

const FlagName = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));
