import {
  usePrepareContractWrite,
  useContractWrite,
  useContractReads,
  useNetwork,
  useWaitForTransaction,
  useAccount
} from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { toast } from 'react-toastify';
import { AbiItem, parseEther } from 'viem';
import { useMemo } from 'react';

export const useStakeLP = (token: string, amount: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lpstaking as `0x${string}`,
    abi: abis.lpstaking,
    functionName: 'stake',
    args: [token, parseEther(amount as `${number}`)]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Depositing...');
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
      toast.success('Successfully deposited!');
    }
  });
  return [write];
};

export const useInitiateWithdrawLP = (token: string, amount: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lpstaking as `0x${string}`,
    abi: abis.lpstaking,
    functionName: 'initiateWithdrawal',
    args: [token, parseEther(amount as `${number}`)]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Initializing withdrawal...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to initialize withdrawal!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to initialize withdrawal!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully initialized withdrawal!');
    }
  });
  return [write];
};

export const useConfirmWithdrawalLP = (token: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lpstaking as `0x${string}`,
    abi: abis.lpstaking,
    functionName: 'confirmWithdrawal',
    args: [token]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Confirming withdrawal...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to confirm withdrawal!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to confirm withdrawal!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully confirmed withdrawal!');
    }
  });
  return [write];
};

export const useEarlyWithdrawalLP = (token: string, amount: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lpstaking as `0x${string}`,
    abi: abis.lpstaking,
    functionName: 'earlyWithdrawal',
    args: [token, parseEther(amount as `${number}`)]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Withdrawing...');
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
      toast.success('Successfully withdrawn!');
    }
  });
  return [write];
};

export const useCancelWithdrawalLP = (token: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lpstaking as `0x${string}`,
    abi: abis.lpstaking,
    functionName: 'cancelWithdrawal',
    args: [token]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Cancelling withdrawal...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to cancel withdrawal!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to cancel withdrawal!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully cancelled withdrawal!');
    }
  });
  return [write];
};

export const useClaimLP = (token: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lpstaking as `0x${string}`,
    abi: abis.lpstaking,
    functionName: 'claim',
    args: [token]
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

export const useSetAutocompoundLP = (token: string, autocompound: boolean) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { config } = usePrepareContractWrite({
    address: addresses.lpstaking as `0x${string}`,
    abi: abis.lpstaking,
    functionName: 'setAutocompounding',
    args: [token, autocompound]
  });
  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Toggling autocompounding...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to toggle autocompounding!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to toggle autocompounding!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully toggled autocompounding!');
    }
  });
  return [write];
};

export const useLPStakingInfo = (token: string) => {
  const { chain } = useNetwork();
  const { abis, addresses } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  const contracts = useMemo(() => {
    const lpstakingContract = {
      address: addresses.lpstaking as `0x${string}`,
      abi: abis.lpstaking as AbiItem[]
    };

    return [
      {
        ...lpstakingContract,
        functionName: 'pending',
        args: [address as string, token]
      },
      {
        ...lpstakingContract,
        functionName: 'userDeposited',
        args: [address as string, token]
      },
      {
        ...lpstakingContract,
        functionName: 'isUserAutocompounding',
        args: [address as string, token]
      },
      {
        ...lpstakingContract,
        functionName: 'totalDeposited',
        args: [token]
      },
      {
        ...lpstakingContract,
        functionName: 'compoundedAssetValue',
        args: [token]
      },
      {
        ...lpstakingContract,
        functionName: 'userPendingWithdrawal',
        args: [address as string, token]
      },
      {
        ...lpstakingContract,
        functionName: 'withdrawTimestamp',
        args: [address as string, token]
      }
    ];
  }, [addresses, address, token]);

  const { data } = useContractReads({
    contracts,
    watch: true,
    allowFailure: false
  });

  if (data === undefined) {
    return data;
  }

  return {
    pending: data[0] as bigint,
    userDeposited: data[1] as bigint,
    isUserAutocompounding: data[2] as boolean,
    totalDeposited: data[3] as bigint,
    compoundedAssetValue: data[4] as bigint,
    userPendingWithdrawal: data[5] as bigint,
    withdrawTimestamp: data[6] as bigint
  };
};
