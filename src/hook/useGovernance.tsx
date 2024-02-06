import {
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useAccount,
  useNetwork,
  useWaitForTransaction
} from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { toast } from 'react-toastify';

export const useOldClaim = () => {
  const { chain } = useNetwork();
  const { abis, addresses, marginAssets } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.govnft as `0x${string}`,
    abi: abis.govnft,
    functionName: 'claim',
    args: [marginAssets[0].address]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Claiming rewards...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to claim rewards!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to claim rewards!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully claimed rewards!');
    }
  });
  return [write];
};

export const usePendingRewards = () => {
  const { chain } = useNetwork();
  const { abis, addresses, marginAssets } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  const { data } = useContractRead({
    address: addresses.govnft as `0x${string}`,
    abi: abis.govnft,
    functionName: 'pending',
    args: [address, marginAssets[0].address as `0x${string}`],
    watch: true
  });

  return data;
};
