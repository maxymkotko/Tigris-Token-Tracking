import { useContractReads, useAccount, useNetwork } from 'wagmi';
import { REF_ABI } from '../../constants/abis';
import { getNetwork } from '../../constants/networks';
import { useMemo } from 'react';
import { AbiItem } from 'viem';

export const useReferralData = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { addresses } = getNetwork(chain?.id ?? 42161);

  const callInfo = useMemo(
    () => [
      {
        address: addresses.referrals as `0x${string}`,
        abi: REF_ABI as AbiItem[],
        functionName: 'refTier',
        args: [address as `0x${string}`]
      },
      {
        address: addresses.referrals as `0x${string}`,
        abi: REF_ABI as AbiItem[],
        functionName: 'totalFees',
        args: [address as `0x${string}`]
      }
    ],
    [addresses.referrals, address]
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
    refTier: data[0],
    totalFees: data[1]
  };
};
