import { ToastContainer, Bounce } from 'react-toastify';
import { Header } from './header';
import { Footer } from './footer';
import { styled } from '@mui/system';
import { Box } from '@mui/material';
import './beauty.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <Wrapper>
        {/* <div className={"beauty"}/> */}
        {children}
      </Wrapper>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        pauseOnFocusLoss={false}
        newestOnTop={true}
        closeOnClick
        theme="dark"
        transition={Bounce}
        toastStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      />
      <Footer />
    </>
  );
};

const Wrapper = styled(Box)(({ theme }) => ({
  minHeight: 'calc(100vh - 110px)',
  background: '#0b0611'
}));
