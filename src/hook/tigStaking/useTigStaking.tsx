import { useNetwork, useContractReads, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { AbiItem } from 'viem';

export const useUserStakeData = (address: `0x${string}` | undefined) => {
  const { chain } = useNetwork();
  const { abis, addresses, marginAssets } = getNetwork(chain?.id ?? 42161);

  const contracts = useMemo(
    () => [
      {
        address: addresses.tigstaking as `0x${string}`,
        abi: abis.staking as AbiItem[],
        functionName: 'userStaked',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.tigstaking as `0x${string}`,
        abi: abis.staking as AbiItem[],
        functionName: 'weightedStake',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.tigstaking as `0x${string}`,
        abi: abis.staking as AbiItem[],
        functionName: 'lockEnd',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.tigstaking as `0x${string}`,
        abi: abis.staking as AbiItem[],
        functionName: 'pending',
        args: [address as `0x${string}`, marginAssets[0].address as `0x${string}`]
      },
      {
        address: addresses.tigstaking as `0x${string}`,
        abi: abis.staking as AbiItem[],
        functionName: 'totalStaked',
        args: []
      }
    ],
    [abis, addresses, address]
  );

  const { data } = useContractReads({
    contracts,
    watch: true,
    allowFailure: false
  });

  if (data === undefined) {
    return undefined;
  }

  return {
    userStaked: data[0],
    weightedStake: data[1],
    lockEnd: data[2],
    pendingTigUSD: data[3],
    totalStaked: data[4]
  };
};

export const useStake = (_amount: bigint, duration: number) => {
  const amount = BigInt(_amount.toString());
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.tigstaking as `0x${string}`,
    abi: abis.staking,
    functionName: 'stake',
    args: [amount, duration]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Staking...');
    },
    onError() {
      toast.dismiss();
      toast.error('Transaction cancelled!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to stake!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully staked!');
    }
  });
  return [write];
};

export const useUnstake = (amount: bigint) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.tigstaking as `0x${string}`,
    abi: abis.staking,
    functionName: 'unstake',
    args: [amount]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Unstaking...');
    },
    onError() {
      toast.dismiss();
      toast.error('Transaction cancelled!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to unstake!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully unstaked!');
    }
  });
  return [write];
};

export const useClaimAll = () => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.tigstaking as `0x${string}`,
    abi: abis.staking,
    functionName: 'claim',
    args: []
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Claiming...');
    },
    onError() {
      toast.dismiss();
      toast.error('Transaction cancelled!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to claim!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully claimed!');
    }
  });
  return [write];
};
