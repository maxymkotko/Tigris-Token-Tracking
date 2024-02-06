import { Box } from '@mui/material';
import { styled } from '@mui/system';
import './style.css';

export const ThreeDotsLoader = () => {
  return (
    <ThreeDotsLoaderContainer>
      <div className="bouncing-loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </ThreeDotsLoaderContainer>
  );
};

const ThreeDotsLoaderContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));
