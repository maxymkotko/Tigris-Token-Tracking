import { Box, Button } from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { styled } from '@mui/system';
import '../../Rainbowkit.css';
import { HiChevronDown } from 'react-icons/hi';
// import { BugReportTwoTone } from '@mui/icons-material';

export const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const isReady = mounted && authenticationStatus !== 'loading';
        const hasConnected =
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          isReady &&
          account != null &&
          chain != null &&
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <Box
            {...(!isReady && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none'
              }
            })}
          >
            {(() => {
              if (!hasConnected) {
                return (
                  <CustomButton onClick={openConnectModal} type="button">
                    Connect Wallet
                  </CustomButton>
                );
              }
              if (chain.unsupported ?? false) {
                return (
                  <CustomButton onClick={openChainModal} type="button">
                    Wrong network
                  </CustomButton>
                );
              }
              return (
                <Box style={{ display: 'flex', gap: 12 }}>
                  <CustomButton
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <Box
                        style={{
                          //   width: 12,
                          //   height: 12,
                          //   borderRadius: 999,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                          //   marginRight: 4
                        }}
                      >
                        {chain.iconUrl != null && (
                          <>
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: '20px', height: 'auto' }}
                            />
                            {/* <HiChevronDown style={{ width: '20px', height: 'auto' }} /> */}
                            <svg fill="none" height="7" width="14" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                xmlns="http://www.w3.org/2000/svg"
                              ></path>
                            </svg>
                          </>
                        )}
                      </Box>
                    )}
                    {/* {chain.name} */}
                  </CustomButton>
                  <CustomButton onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance != null ? ` (${account.displayBalance})` : ''}
                  </CustomButton>
                </Box>
              );
            })()}
          </Box>
        );
      }}
    </ConnectButton.Custom>
  );
};

const CustomButton = styled(Button)(({ theme }) => ({
  border: '1px solid #ffffff',
  borderRadius: '0px',
  color: '#ffffff',
  textTransform: 'none',
  padding: '6px 8px'
}));
