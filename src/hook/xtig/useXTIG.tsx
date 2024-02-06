import { useMemo } from 'react';
import {
  useContractReads,
  useAccount,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead
} from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { toast } from 'react-toastify';
import { AbiItem } from 'viem';
const { abis } = getNetwork(0);

export const useClaimTig = () => {
  const { chain } = useNetwork();
  const { addresses } = getNetwork(chain?.id ?? 42161);

  const { config } = usePrepareContractWrite({
    address: addresses.xtig as `0x${string}`,
    abi: abis.xtig,
    functionName: 'claimTig',
    args: []
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Claiming TIG...');
    },
    onError() {
      toast.dismiss();
      toast.error('Cancelled transaction!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to claim TIG!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully claimed TIG!');
    }
  });
  return [write];
};

export const useClaimTigEarly = () => {
  const { chain } = useNetwork();
  const { addresses } = getNetwork(chain?.id ?? 42161);

  const { config } = usePrepareContractWrite({
    address: addresses.xtig as `0x${string}`,
    abi: abis.xtig,
    functionName: 'earlyClaimTig',
    args: []
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Claiming TIG early...');
    },
    onError() {
      toast.dismiss();
      toast.error('Cancelled transaction!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to claim TIG early!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully claimed TIG early!');
    }
  });
  return [write];
};

export const useClaimXTIG = () => {
  const { chain } = useNetwork();
  const { addresses } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  const r = useContractRead({
    address: addresses.xtig as `0x${string}`,
    abi: abis.xtig,
    functionName: 'lastClaimedEpoch',
    args: [address as `0x${string}`],
    watch: true
  });

  const { config } = usePrepareContractWrite({
    address: addresses.xtig as `0x${string}`,
    abi: abis.xtig,
    functionName: 'createVest',
    args: [r.data]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Claiming xTIG...');
    },
    onError() {
      toast.dismiss();
      toast.error('Cancelled transaction!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to claim xTIG!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully claimed xTIG!');
    }
  });
  return [write];
};

export const useClaimFees = () => {
  const { chain } = useNetwork();
  const { addresses } = getNetwork(chain?.id ?? 42161);

  const { config } = usePrepareContractWrite({
    address: addresses.xtig as `0x${string}`,
    abi: abis.xtig,
    functionName: 'claimFees',
    args: []
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Claiming fees...');
    },
    onError() {
      toast.dismiss();
      toast.error('Cancelled transaction!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to claim fees!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully claimed fees!');
    }
  });
  return [write];
};

export const useXTIGData = (epoch: number) => {
  const { chain } = useNetwork();
  const { addresses, marginAssets } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  const callInfo = useMemo(
    () => [
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'pendingTig',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'pendingEarlyTig',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'upcomingXTig',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'claimableXTig',
        args: [address as `0x${string}`, 0]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'stakedTigBalance'
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'userRewardBatches',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'epochFeesGenerated',
        args: [epoch]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'feesGenerated',
        args: [epoch, address as `0x${string}`]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'epochAllocation',
        args: [epoch]
      },
      // Token rewards
      {
        address: addresses.xtig as `0x${string}`,
        abi: abis.xtig as AbiItem[],
        functionName: 'pending',
        args: [address as `0x${string}`, marginAssets[0].address as `0x${string}`]
      }
    ],
    [addresses, address]
  );

  const { data } = useContractReads({
    contracts: callInfo,
    watch: true,
    allowFailure: false
  });

  if (data === undefined) {
    return data;
  }
  return {
    pendingTig: data[0],
    pendingEarlyTig: data[1],
    upcomingXTig: data[2],
    claimableXTig: data[3],
    stakedTigBalance: data[4],
    userRewardBatches: data[5],
    epochFeesGenerated: data[6],
    feesGenerated: data[7],
    balanceOf: data[8],
    epochAllocation: data[9],
    pendingTigUSD: data[10]
  };
};
