import {
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useAccount,
  useNetwork,
  useWaitForTransaction,
  useBalance
} from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { toast } from 'react-toastify';
import { parseEther } from 'viem';
import { getProxyAddress } from 'src/proxy_wallet';

export const useApproveProxy = (setProxyState: any) => {
  const { chain } = useNetwork();
  const { abis, proxyGas, addresses, minProxyGas } = getNetwork(chain?.id ?? 42161);
  const proxyAddress = getProxyAddress();
  const { data: balanceData } = useBalance({ address: proxyAddress as `0x${string}` });
  const shellBalance = Number(balanceData?.formatted);
  const { config } = usePrepareContractWrite({
    address: addresses.trading as `0x${string}`,
    abi: abis.trading,
    functionName: 'approveProxy',
    args: [proxyAddress],
    value: Number(shellBalance) < minProxyGas ? parseEther(proxyGas as `${number}`) : BigInt(0)
  });

  // , { value: parseEther(proxyGas as `${number}`) }
  const { write, data } = useContractWrite({
    ...config,
    onError() {
      toast.dismiss();
      toast.error('Proxy approval failed!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Proxy approval failed!');
    },
    onSuccess() {
      setProxyState(3);
      toast.dismiss();
      toast.success('Successfully approved proxy!');
    }
  });
  return [write];
};

export const useProxyApproval = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { data } = useContractRead({
    address: addresses.trading as `0x${string}`,
    abi: abis.trading,
    functionName: 'proxyApprovals',
    args: [address as `0x${string}`],
    watch: true
  });

  return data;
};
