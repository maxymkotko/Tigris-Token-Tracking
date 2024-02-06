import { Box, Button } from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { styled } from '@mui/system';
import { ExpandMore } from '@mui/icons-material';

export const CustomConnectButton = () => {
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
                  <ChainChooseButton onClick={openChainModal} type="button">
                    {chain.hasIcon && (
                      <Box
                        style={{
                          background: chain.iconBackground,
                          width: 27,
                          height: 27,
                          borderRadius: 999
                        }}
                      >
                        {chain.iconUrl != null && <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} />}
                      </Box>
                    )}
                    <ExpandMore />
                  </ChainChooseButton>
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
  borderRadius: '4px',
  background: '#232031',
  color: '#ffffff',
  textTransform: 'none',
  padding: '5px 20px 5px 20px'
}));

const ChainChooseButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  background: '#232031',
  color: '#ffffff',
  textTransform: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2px'
}));
