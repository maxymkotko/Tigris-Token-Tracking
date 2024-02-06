import { usePrepareContractWrite, useContractWrite, useContractReads, useNetwork, useWaitForTransaction } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { toast } from 'react-toastify';
import { AbiItem, parseEther } from 'viem';

export const useCreateBond = (amount: string, days: string) => {
  const { chain } = useNetwork();
  const { abis, addresses, marginAssets } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lock as `0x${string}`,
    abi: abis.lock,
    functionName: 'lock',
    args: [marginAssets[0].address, parseEther(amount as `${number}`), days]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Creating bond...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to create bond!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to create bond!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully created bond!');
    }
  });
  return [write];
};

export const useExtendBond = (id: number, amount: string, days: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lock as `0x${string}`,
    abi: abis.lock,
    functionName: 'extendLock',
    args: [id, parseEther(amount as `${number}`), days]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Extending lock...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to extend lock!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to extend lock!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully extended lock!');
    }
  });
  return [write];
};

export const useReleaseBond = (id: number) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lock as `0x${string}`,
    abi: abis.lock,
    functionName: 'release',
    args: [id]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Releasing lock...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to release lock!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to release lock!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully released lock!');
    }
  });
  return [write];
};

export const useClaim = (id: number) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lock as `0x${string}`,
    abi: abis.lock,
    functionName: 'claim',
    args: [id]
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

export const useClaimAll = () => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lock as `0x${string}`,
    abi: abis.lock,
    functionName: 'claimAll',
    args: []
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

export const useTotalSharesAndStaked = () => {
  const { chain } = useNetwork();
  const { abis, addresses, marginAssets } = getNetwork(chain?.id ?? 42161);
  const bondContract = {
    address: addresses.bond as `0x${string}`,
    abi: abis.bond as AbiItem[]
  };
  const lockContract = {
    address: addresses.lock as `0x${string}`,
    abi: abis.lock as AbiItem[]
  };
  const { data } = useContractReads({
    contracts: [
      {
        ...bondContract,
        functionName: 'totalShares',
        args: [marginAssets[0].address as `0x${string}`]
      },
      {
        ...lockContract,
        functionName: 'totalLocked',
        args: [marginAssets[0].address as `0x${string}`]
      }
    ],
    watch: true,
    allowFailure: false
  });
  if (!data) return [parseEther('0'), parseEther('0')];
  return data;
};
