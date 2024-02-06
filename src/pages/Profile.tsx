import { useState, useEffect } from 'react';
import { Box, Divider, Avatar, Badge } from '@mui/material';
import { styled } from '@mui/system';
import { Container } from 'src/components/Container';
import './css/profile.css';
import './css/loading.css';
import { TraderProfile, getProfileData } from 'src/context/profile';
import { useAccount, useNetwork } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { PRIVATE_ROUTES } from 'src/config/routes';

interface tradeDataProps {
  totalPnlDollar: number;
  totalPnlPro: number;
  totalNumberTrade: number;
  totalVolumeTrade: number;
  longestWinStreak: number;
  biggestWin: number;
  biggestLoss: number;
  mostTradedPair: number;
}

export const Profile = () => {
  const [avatar, setAvatar] = useState(TraderProfile().profilePicture);
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { assets } = getNetwork(0);
  const [tradeData, setTradeData] = useState<tradeDataProps>();

  const handleChange = (event: any) => {
    if (event.target.files.length > 0) {
      const choosenImg = URL.createObjectURL(event.target.files[0]);
      setAvatar(choosenImg);
    }
  };

  const [isLoading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const x = async () => {
      let _profile = await getProfileData();
      if (_profile === 'NoProfile') {
        _profile = TraderProfile();
      }
      setProfile(_profile);
      setLoading(false);
    };
    x();
    fetchData();
  }, []);

  const fetchData = async () => {
    const chainId = chain?.id;
    if (address && chainId) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const toFetch = `${PRIVATE_ROUTES.serverUrl}/profileStats/${chainId}/${address}`;
      const response = await fetch(toFetch);
      const resData = await response.json();
      console.log(resData.mostTradedPair);
      setTradeData(resData);
    }
  };

  useEffect(() => {
    console.log(tradeData);
  }, [tradeData]);

  return (
    <>
      {isLoading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <div className="loading-background"></div>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(#1f2067, #630780)', height: '100vh' }}>
          <Container>
            <ProfileContainer>
              <Wrapper>
                <ProfileSection>
                  <SectionContent>
                    <AvatarUpload>
                      <label htmlFor="upload">
                        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                          <Avatar
                            id="avatar"
                            src={avatar}
                            style={{
                              width: '150px',
                              height: '150px'
                            }}
                          />
                        </Badge>
                      </label>
                      <label htmlFor="avatar" />
                    </AvatarUpload>
                    <UserDetail>
                      <UserName>{profile.username}</UserName>
                      <UserDescription>{profile.description}</UserDescription>
                    </UserDetail>
                  </SectionContent>
                </ProfileSection>
                <OverviewSection>
                  <OverviewWrapper>
                    <OverviewContent>
                      <OverviewSeparator>
                        <OverviewItem
                          title={'Total PnL ($)'}
                          value={tradeData?.totalPnlDollar != null ? tradeData?.totalPnlDollar.toFixed(2) : `-`}
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                        <OverviewItem
                          title={'Total PnL (%)'}
                          value={tradeData?.totalPnlPro != null ? `${(tradeData?.totalPnlPro * 100).toFixed(2)}%` : `-`}
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                        <OverviewItem
                          title={'Total number of trades'}
                          value={tradeData?.totalNumberTrade != null ? tradeData?.totalNumberTrade : `-`}
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                        <OverviewItem
                          title={'Total volume traded'}
                          value={tradeData?.totalVolumeTrade != null ? tradeData?.totalVolumeTrade.toFixed(2) : `-`}
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                      </OverviewSeparator>
                      <ResponsiveDevider1 />
                      <ResponsiveDevider2 />
                      <OverviewSeparator>
                        <OverviewItem
                          title={'Longest win streak'}
                          value={tradeData?.longestWinStreak != null ? tradeData?.longestWinStreak : `-`}
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                        <OverviewItem
                          title={'Biggest win'}
                          value={tradeData?.biggestWin != null ? tradeData?.biggestWin.toFixed(2) : `-`}
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                        <OverviewItem
                          title={'Biggest loss'}
                          value={tradeData?.biggestLoss != null ? tradeData?.biggestLoss.toFixed(2) : `-`}
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                        <OverviewItem
                          title={'Most traded pair'}
                          value={
                            tradeData?.mostTradedPair != null
                              ? assets[tradeData?.mostTradedPair].name
                              : `-`
                          }
                          colorValue="rgba(255, 255, 255, 1)"
                        />
                      </OverviewSeparator>
                    </OverviewContent>
                  </OverviewWrapper>
                </OverviewSection>
              </Wrapper>
            </ProfileContainer>
          </Container>
        </div>
      )}
    </>
  );
};

const ProfileContainer = styled(Box)(({ theme }) => ({
  padding: '70px 0',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center'
}));

const Wrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  gap: '12px',
  maxWidth: '960px'
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}));

const OverviewSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
}));

const SectionContent = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '22px 27px',
  background: 'rgba(0, 0, 0, 0.25)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  borderRadius: '10px'
}));

const AvatarUpload = styled(Box)(({ theme }) => ({}));

const UserDetail = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

const UserName = styled(Box)(({ theme }) => ({
  fontSize: '30px'
}));

const UserDescription = styled(Box)(({ theme }) => ({
  fontSize: '13px'
}));

const ItemTitle = styled(Box)(({ theme }) => ({
  color: '#FFFFFF',
  fontSize: '12px',
  lineHeight: '20px'
}));

const ItemValue = styled(Box)(({ theme }) => ({
  fontSize: '12px',
  lineHeight: '20px'
}));

interface OverviewItemProps {
  title: string;
  value: string | number;
  colorValue: string;
}

const OverviewItem = (props: OverviewItemProps) => {
  const { title, value, colorValue } = props;
  return (
    <OverviewItemContainer>
      <ItemTitle>{title}</ItemTitle>
      <ItemValue sx={{ color: colorValue }}>{value}</ItemValue>
    </OverviewItemContainer>
  );
};

const OverviewItemContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const OverviewWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: '310px'
}));

const OverviewContent = styled(Box)(({ theme }) => ({
  padding: '22px 27px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.25)',
  [theme.breakpoints.down(1440)]: {
    flexDirection: 'row'
  },
  [theme.breakpoints.down(768)]: {
    flexDirection: 'column'
  },
  borderRadius: '10px'
}));

const OverviewSeparator = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%'
}));

const ResponsiveDevider1 = styled(Box)(({ theme }) => ({
  width: '1px',
  backgroundColor: '#343538',
  [theme.breakpoints.down(768)]: {
    display: 'none'
  }
}));

const ResponsiveDevider2 = styled(Divider)(({ theme }) => ({
  [theme.breakpoints.down(1440)]: {
    display: 'none'
  }
}));
