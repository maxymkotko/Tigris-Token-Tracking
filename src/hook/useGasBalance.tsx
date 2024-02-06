import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';
import { getNetwork } from '../constants/networks';
import { toast } from 'react-toastify';
import { parseEther } from 'viem';

export const useGasBalance = () => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  const { data } = useContractRead({
    address: addresses.forwarder as `0x${string}`,
    abi: abis.forwarder,
    functionName: 'userGas',
    args: [address],
    watch: true
  });

  return data;
};

export const useWithdrawGas = () => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);

  const { config } = usePrepareContractWrite({
    address: addresses.forwarder as `0x${string}`,
    abi: abis.forwarder,
    functionName: 'withdrawAll',
    args: []
  });

  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Withdrawing gas...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to withdraw gas!');
    }
  });

  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to withdraw gas!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully withdrew gas!');
    }
  });

  return [write];
};

export const useFundGas = (amount: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);

  const { config } = usePrepareContractWrite({
    address: addresses.forwarder as `0x${string}`,
    abi: abis.forwarder,
    functionName: 'fund',
    args: [],
    value: parseEther(amount.toString())
  });

  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Funding gas...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to fund gas!');
    }
  });

  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to fund gas!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully funded gas!');
    }
  });

  return [write];
};
