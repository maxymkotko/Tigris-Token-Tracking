import {
  erc20ABI,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useAccount,
  useWaitForTransaction
} from 'wagmi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const useTokenAllowance = (tokenAddress: string, spender: string) => {
  const { address } = useAccount();

  const { data } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, spender as `0x${string}`],
    watch: true
  });

  return data;
};

export const useTokenBalance = (tokenAddress: string) => {
  const { address } = useAccount();

  const { data } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    watch: true
  });

  return data;
};

export const useContractTokenBalance = (contractAddress: string, tokenAddress: string) => {
  const { data } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [contractAddress as `0x${string}`],
    watch: true
  });
  return data;
};

export const useTokenSupply = (tokenAddress: string) => {
  const { data } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'totalSupply',
    watch: true
  });
  return data;
};

export const useApproveToken = (tokenAddress: string, approveFor: string) => {
  const { t } = useTranslation();
  const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639934';
  const { config } = usePrepareContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'approve',
    args: [approveFor as `0x${string}`, BigInt(maxUint256)]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading(`${t('Approving token')}...`);
    },
    onError() {
      toast.dismiss();
      toast.error(t('Failed to approve token!'));
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error(t('Failed to approve token!'));
    },
    onSuccess() {
      toast.dismiss();
      toast.success(t('Successfully approved token!'));
    }
  });
  return [write];
};
