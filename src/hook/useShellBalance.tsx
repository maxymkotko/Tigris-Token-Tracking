import { getProxyAddress } from 'src/proxy_wallet';
import { useBalance } from 'wagmi';

export const useShellBalance = () => {
  const proxyAddress = getProxyAddress();
  const { data } = useBalance({
    address: proxyAddress as `0x${string}`,
    watch: true
  });
  const formattedBalance = Number(data?.formatted ?? '0');
  return formattedBalance;
};
