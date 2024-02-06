import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { toast } from 'react-toastify';
const { abis } = getNetwork(0);

export const useVaultDeposit = (vaultAddress: string, tokenAddress: string, amount: any) => {
  const { config } = usePrepareContractWrite({
    address: vaultAddress as `0x${string}`,
    abi: abis.tigusdvault,
    functionName: 'deposit',
    args: [tokenAddress, amount]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Depositing into vault...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to deposit!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to deposit!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully deposited into vault!');
    }
  });
  return [write];
};

export const useVaultWithdraw = (vaultAddress: string, tokenAddress: string, amount: any) => {
  const { config } = usePrepareContractWrite({
    address: vaultAddress as `0x${string}`,
    abi: abis.tigusdvault,
    functionName: 'withdraw',
    args: [tokenAddress, amount]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Withdrawing from vault...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to withdraw!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to withdraw!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully withdrew from vault!');
    }
  });
  return [write];
};
