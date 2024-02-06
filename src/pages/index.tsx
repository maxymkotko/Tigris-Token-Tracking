import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PRIVATE_ROUTES } from 'src/config/routes';
import { TabPanel } from '../components/TabPanel';
import { useStore } from '../context/StoreContext';
import { Referral } from './Referral';
import { Options } from './Options';
import { oracleSocket } from 'src/context/socket';
import { getNetwork } from 'src/constants/networks';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';

export const Home = () => {
  const { page } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cookies = new Cookies();
  const { assets } = getNetwork(0);
  const pageRef = useRef(0);

  useEffect(() => {
    oracleSocket.on('data', (data: any) => {
      const pairIndex = parseInt(
        localStorage.getItem('LastPairSelected') != null ? (localStorage.getItem('LastPairSelected') as string) : '0'
      );
      const pair = assets[pairIndex].name;
      if (pageRef.current === 0 && data[pairIndex]) {
        document.title = pair + ' ' + (parseFloat(data[pairIndex].price) / 1e18).toPrecision(6) + ' | Tigris';
      } else if (pageRef.current === 0) {
        document.title = 'Options Trading | Tigris';
      }
    });
  }, []);

  useEffect(() => {
    const currentUrl = location.search;
    const params = new URLSearchParams(currentUrl);
    const refCode = params.get('ref');
    if (refCode != null) {
      fetch(`${PRIVATE_ROUTES.referral_serverUrl}/${refCode}`).then((response) => {
        response.json().then((data) => {
          navigate('/');
          const ref = data.toString();
          cookies.set('ref', ref);
        });
      });
    }
  }, []);

  useEffect(() => {
    pageRef.current = page;
    if (page === 0) {
      document.title = 'Options Trading | Tigris';
    } else if (page === 1) {
      document.title = 'Referral | Tigris';
    }
    toast.dismiss();
  }, [page]);

  return (
    <>
      <TabPanel value={page} index={0}>
        <Options />
      </TabPanel>
      {/* <TabPanel value={page} index={1}>
        <Referral />
      </TabPanel> */}
    </>
  );
};
