import { useMemo } from 'react';
import { useContractReads, useAccount, useNetwork, useContractRead } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { Abi, AbiItem } from 'viem';
const { abis } = getNetwork(0);

export const useTokenDetailsData = (pairIndex: number) => {
  const { chain } = useNetwork();
  const { addresses, marginAssets } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  const openInterest = useContractRead({
    address: addresses.pairscontract as `0x${string}`,
    abi: abis.pairscontract as Abi,
    functionName: 'idToOi',
    args: [pairIndex, marginAssets[0].address as `0x${string}`]
  });

  const pairData = useContractRead({
    address: addresses.pairscontract as `0x${string}`,
    abi: abis.pairscontract as Abi,
    functionName: 'idToAsset',
    args: [pairIndex]
  });

  const openFees = useContractRead({
    address: addresses.trading as `0x${string}`,
    abi: abis.trading as Abi,
    functionName: 'openFees'
  });

  const closeFees = useContractRead({
    address: addresses.trading as `0x${string}`,
    abi: abis.trading as Abi,
    functionName: 'closeFees'
  });

  const vaultFunding = useContractRead({
    address: addresses.trading as `0x${string}`,
    abi: abis.trading as Abi,
    functionName: 'vaultFundingPercent'
  });

  const referral = useContractRead({
    address: addresses.referrals as `0x${string}`,
    abi: abis.referrals as Abi,
    functionName: 'referral',
    args: [address as `0x${string}`]
  });

  return {
    openInterest: openInterest.data,
    pairData: pairData.data,
    openFees: openFees.data,
    closeFees: closeFees.data,
    vaultFunding: vaultFunding.data,
    referral: referral.data
  };
};

export const useTokenDetailsDataOptions = (pairIndex: number) => {
  const { chain } = useNetwork();
  const { addresses } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  // const callInfo = useMemo(
  //   () => [
  //     {
  //       address: addresses.options as `0x${string}`,
  //       abi: abis.options as AbiItem[],
  //       functionName: 'tradedAssets',
  //       args: [pairIndex]
  //     },
  //     {
  //       address: addresses.referrals as `0x${string}`,
  //       abi: abis.referrals as AbiItem[],
  //       functionName: 'referral',
  //       args: [address as `0x${string}`]
  //     }
  //   ],
  //   [addresses, pairIndex, address]
  // );

  // const { data } = useContractReads({
  //   contracts: callInfo,
  //   watch: true,
  //   allowFailure: false
  // });

  // if (data === undefined) {
  //   return data;
  // }
  const pairData = useContractRead({
    address: addresses.options as `0x${string}`,
    abi: abis.options,
    functionName: 'tradedAssets',
    args: [pairIndex]
  });

  const referral = useContractRead({
    address: addresses.referrals as `0x${string}`,
    abi: abis.referrals,
    functionName: 'referral',
    args: [address as `0x${string}`]
  });
  return {
    pairData: pairData.data,
    referral: referral.data
  };
};
