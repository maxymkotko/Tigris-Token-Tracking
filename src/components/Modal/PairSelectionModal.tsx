import { Modal, Box, Menu, Popper, Grow, ClickAwayListener, Paper } from '@mui/material';
import { styled } from '@mui/system';
import { PairSelectionTable } from '../PairSelectionTable';

interface PairModalProps {
  // isModalOpen: boolean;
  // setModalOpen: (value: boolean) => void;
  state: null | HTMLElement;
  setState: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  pairIndex: number;
  setPairIndex: (value: number) => void;
}

export const PairSelectionModal = (props: PairModalProps) => {
  const { state, setState, setPairIndex } = props;
  const isOpen = Boolean(state);
  console.log({ isOpen });
  const style = { outline: '0' };
  const handleClose = () => {
    setState(null);
  };
  return (
    <Popper
      anchorEl={state}
      id="account-menu"
      open={isOpen}
      transition
      disablePortal
      placement="bottom-start"
      sx={{
        zIndex: 1,
        '& .MuiPopper-root': {
          backgroundColor: '#16121F !important'
        }
      }}
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom'
          }}
        >
          <Paper sx={{ backgroundColor: '#16121F !important' }}>
            <ClickAwayListener onClickAway={handleClose}>
              <PairTableContainer sx={style}>
                <PairSelectionTable isMobile={false} onClose={handleClose} setPairIndex={setPairIndex} />
              </PairTableContainer>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};

const PairTableContainer = styled(Box)(({ theme }) => ({
  width: '440px',
  minHeight: '560px',
  overflowY: 'auto',
  [theme.breakpoints.down(450)]: {
    minHeight: '100%',
    width: '320px'
  }
}));
