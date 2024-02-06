/* eslint-disable no-console */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAccount, useNetwork, usePublicClient, useWalletClient } from 'wagmi';
import { initializeWeb3 } from 'src/contracts';

interface Web3ContextProps {
  isConnected: boolean;
  isInitialized: boolean;
}

interface propsType {
  children: React.ReactNode;
}

const Web3Context = createContext<Web3ContextProps | null>(null);

export const Web3Provider = (props: propsType) => {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isPublicClientReady, setIsPublicClientReady] = useState(false);
  const [isWalletClientReady, setIsWalletClientReady] = useState(false);

  const checkProviderAndSigner = useCallback(async () => {
    if (publicClient) {
      setIsPublicClientReady(true);
    }
    if (walletClient) {
      setIsWalletClientReady(true);
    }
  }, [publicClient, walletClient]);

  useEffect(() => {
    checkProviderAndSigner();
  }, [checkProviderAndSigner]);

  const [isInitialized, setInitialized] = useState(false);
  useEffect(() => {
    if (isConnected && isPublicClientReady && isWalletClientReady) {
      (async () => {
        await initializeWeb3(publicClient, walletClient, address, chain).then((res) => {
          setInitialized(res);
        });
      })();
    } else {
      setInitialized(false);
    }
  }, [isConnected, walletClient, isPublicClientReady, isWalletClientReady]);

  return <Web3Context.Provider value={{ isConnected, isInitialized }}>{props.children}</Web3Context.Provider>;
};

export const useWeb3Store = () => {
  const context = useContext(Web3Context);
  if (context === null) {
    throw new Error("can't find context");
  }
  return context;
};
