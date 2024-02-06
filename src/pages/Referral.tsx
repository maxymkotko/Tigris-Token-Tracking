import { Box, Button, Divider } from '@mui/material';
import { styled } from '@mui/system';
import { useEffect, useState } from 'react';
import { VaultInput } from 'src/components/Input';
import { BiLinkAlt } from 'react-icons/bi';
import { useAccount, useWalletClient, useNetwork } from 'wagmi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PRIVATE_ROUTES } from 'src/config/routes';
import CopyToClipboard from 'src/components/CopyToClipboard';
import { OpenInNew } from '@mui/icons-material';
import { commaSeparators } from 'src/utils/commaSeparators';
import { useTranslation } from 'react-i18next';

export const Referral = () => {
  const [editState, setEditState] = useState({
    refCode: ''
  });

  const [codeData, setCodeData] = useState([]);
  const [referred, setReferred] = useState([]);
  const [earned, setEarned] = useState(0);
  const { t } = useTranslation();

  const { data: walletClient } = useWalletClient();

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();

  const getCreatedLink = async () => {
    if (address) {
      await axios
        .get(`${PRIVATE_ROUTES.referral_serverUrl}/user/${address}`)
        .then((response) => {
          setCodeData(response.data);
        })
        .catch((err) => {
          const error = err.response.data;
          console.log({ error });
        });
    }
  };

  useEffect(() => {
    if (address) {
      getCreatedLink();
    } else {
      setCodeData([]);
    }
  }, [address, chain]);

  const handleEditState = (prop: string, value: string) => {
    const checkedValue = value.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (checkedValue.length > 16) {
      toast.dismiss();
      toast.warn(t('Maximum 16 characters'));
    } else {
      setEditState({ ...editState, [prop]: value.replace(/[^a-zA-Z]/g, '').toLowerCase() });
    }
  };

  const fetchData = async () => {
    const chainId = chain?.id;
    if (address && chainId) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const toFetch = `${PRIVATE_ROUTES.serverUrl}/referrals/${chainId}/${address}`;
      const response = await fetch(toFetch);
      const resData = await response.json();
      setReferred(resData.referred ? resData.referred : []);
      setEarned(resData.earned ? resData.earned.toFixed(2) : '0.00');
    }
  };

  useEffect(() => {
    if (address) {
      fetchData();
    }
  }, [address, chain]);

  const handleCreateLink = async () => {
    if (isConnected) {
      if (editState.refCode === '') {
        toast.warn(t('Referral code is empty'));
      } else {
        const signedMessage = await walletClient?.signMessage({
          message: `${'Register Tigris Trade referral code: ' + editState.refCode}`
        });
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        await axios
          .post(`${PRIVATE_ROUTES.referral_serverUrl}/create-link`, {
            signMessage: signedMessage,
            refCode: editState.refCode
          })
          .then((res) => {
            toast.success(res.data.message);
            getCreatedLink();
          })
          .catch((err) => {
            const error = err.response.data;
            toast.error(error);
          });
      }
    } else {
      toast.error(t('Wallet not connected!'));
    }
  };
  return (
    <ReferralContainer>
      <ReferralLinkContainer>
        <ReferralLinkLabel>{t('Create a New Link')}</ReferralLinkLabel>
        <CreateLinkContainer>
          <VaultInput
            type="text"
            placeholder={t('Referral Code')}
            value={editState.refCode}
            setValue={handleEditState}
            name="refCode"
            component=""
          />
          <CodeLink>
            {PRIVATE_ROUTES.clientUrl}/?ref={editState.refCode}
          </CodeLink>
          <CreateLinkButton
            onClick={() => {
              (async () => {
                await handleCreateLink();
              })();
            }}
          >
            {t('Create Link')}
          </CreateLinkButton>
        </CreateLinkContainer>
        <ReferralLinkLabel sx={{ marginTop: '6px' }}>{t('Your links')}</ReferralLinkLabel>
        <ReferralLinks>
          {codeData.length === 0 ? (
            <LinkText>{t('You have no referral codes')}</LinkText>
          ) : (
            codeData.map((item) => (
              <CopyToClipboard key={item}>
                {({ copy }) => (
                  <ReferralLink
                    onClick={() =>
                      copy(
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        `${PRIVATE_ROUTES.clientUrl}/?ref=${item}`
                      )
                    }
                  >
                    <LinkText>
                      <BiLinkIcon />
                      {PRIVATE_ROUTES.clientUrl}/?ref={item}
                    </LinkText>
                    <Divider />
                  </ReferralLink>
                )}
              </CopyToClipboard>
            ))
          )}
        </ReferralLinks>
        <ReferralLinkLabel sx={{ marginTop: '6px' }}>{t('Referred Addresses')}</ReferralLinkLabel>
        {referred.length === 0 ? (
          <ReferredAddresses>{t('No addresses yet')}</ReferredAddresses>
        ) : (
          <ReferralLinks>
            {referred.length === 0
              ? t('No addresses yet')
              : referred.map((referral, index) => (
                  <ReferralLink key={index}>
                    <LinkText>
                      <LinkButton />
                      {referral}
                    </LinkText>
                    <Divider />
                  </ReferralLink>
                ))}
          </ReferralLinks>
        )}
      </ReferralLinkContainer>
      <ReferralCardContainer>
        <ReferralCard value={referred.length.toString()} name={t('Referred Traders')} />
        <ReferralCard value={`$${commaSeparators(earned)}`} name={t('Fees Earned')} />
        <ReferralCard value={codeData.length.toString()} name={t('Links Created')} />
      </ReferralCardContainer>
    </ReferralContainer>
  );
};

interface ReferralCardProps {
  value: string;
  name: string;
}

const ReferralCard = (props: ReferralCardProps) => {
  const { value, name } = props;
  return (
    <ReferralCardWrapper>
      <ReferralCardValue>{value}</ReferralCardValue>
      <ReferralCardName>{name}</ReferralCardName>
    </ReferralCardWrapper>
  );
};

const ReferralCardWrapper = styled(Box)(({ theme }) => ({
  padding: '27px 0 27px 49px',
  width: '268px',
  backgroundColor: '#161221',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
    padding: '27px 0 27px 30px'
  }
}));

const ReferralCardValue = styled(Box)(({ theme }) => ({
  fontSize: '25px',
  lineHeight: '33px',
  fontWeight: '500',
  [theme.breakpoints.down('lg')]: {
    fontSize: '20px',
    lineHeight: '26px'
  }
}));

const ReferralCardName = styled(Box)(({ theme }) => ({
  fontSize: '15px',
  lineHeight: '20px',
  fontWeight: '500',
  color: '#B1B5C3',
  marginTop: '10px',
  [theme.breakpoints.down('lg')]: {
    fontSize: '13px',
    lineHeight: '17px'
  }
}));

const ReferralContainer = styled(Box)(({ theme }) => ({
  padding: '70px',
  display: 'flex',
  justifyContent: 'center',
  gap: '13px',
  [theme.breakpoints.down('lg')]: {
    display: 'flex',
    flexDirection: 'column-reverse'
  },
  [theme.breakpoints.down(768)]: {
    padding: '70px 17px'
  }
}));

const ReferralLinkContainer = styled(Box)(({ theme }) => ({
  width: '590px',
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  [theme.breakpoints.down('lg')]: {
    width: '100%'
  }
}));

const ReferralLinkLabel = styled(Box)(({ theme }) => ({
  padding: '15px 27px',
  width: '100%',
  height: '50px',
  backgroundColor: '#161221',
  fontSize: '12px',
  lineHeight: '20px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: '400'
}));

const LinkButton = styled(OpenInNew)(({ theme }) => ({
  width: '20px',
  height: '20px',
  minWidth: '20px',
  minHeight: '20px',
  color: '#3772FF'
}));

const CreateLinkContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '20px 27px',
  backgroundColor: '#161221',
  fontSize: '12px',
  lineHeight: '20px',
  fontWeight: '400'
}));

const CodeLink = styled(Box)(({ theme }) => ({
  padding: '12px',
  color: '#B1B5C3'
}));

const CreateLinkButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#3772FF',
  width: '100%',
  height: '40px',
  textTransform: 'none',
  borderRadius: '4px',
  fontSize: '14px',
  lineHeight: '24px',
  fontWeight: '400',
  marginTop: '15px',
  '&: hover': {
    backgroundColor: '#3772FF'
  }
}));

const ReferralLinks = styled(Box)(({ theme }) => ({
  padding: '16px',
  backgroundColor: '#161221',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '13px'
}));

const LinkText = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '7px',
  fontSize: '12px',
  lineHeight: '20px',
  fontWeight: '400',
  color: '#B1B5C3'
}));

const ReferredAddresses = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '90px',
  fontSize: '12px',
  lineHeight: '20px',
  fontWeight: '400',
  color: '#B1B5C3',
  backgroundColor: '#161221'
}));

const ReferralCardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '13px',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'row',
    width: '100%'
  },
  [theme.breakpoints.down(768)]: {
    display: 'grid',
    '&>*:nth-of-type(3)': {
      gridColumn: '1 / 3'
    }
  },
  [theme.breakpoints.down(390)]: {
    display: 'flex',
    flexDirection: 'column'
  }
}));

const BiLinkIcon = styled(BiLinkAlt)(({ theme }) => ({
  width: '20px',
  height: '20px',
  minWidth: '20px',
  minHeight: '20px',
  color: '#3772FF'
}));

const ReferralLink = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
}));
