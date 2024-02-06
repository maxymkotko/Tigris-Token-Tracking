import { useMemo } from 'react';
import { useContractReads, useAccount, useNetwork, erc20ABI } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
import { AbiItem } from 'viem';
const { abis } = getNetwork(0);

export const useOrderFormData = (pairIndex: number, tokenAddress: string, spender: string) => {
  const { chain } = useNetwork();
  const { addresses, marginAssets } = getNetwork(chain?.id ?? 42161);
  const { address } = useAccount();

  const contracts = useMemo(() => {
    const pairContract = {
      address: addresses.pairscontract as `0x${string}`,
      abi: abis.pairscontract as AbiItem[]
    };

    return [
      {
        ...pairContract,
        functionName: 'idToOi',
        args: [pairIndex, marginAssets[0].address as `0x${string}`]
      },
      {
        ...pairContract,
        functionName: 'idToAsset',
        args: [pairIndex]
      },
      {
        ...pairContract,
        functionName: 'allowedAsset',
        args: [pairIndex]
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, spender as `0x${string}`]
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      }
    ];
  }, [addresses, pairIndex, address, tokenAddress, spender]);

  const { data } = useContractReads({
    contracts,
    watch: true,
    allowFailure: false
  });

  if (data === undefined) {
    return data;
  }

  return {
    idToOi: data[0],
    idToAsset: data[1],
    allowedAsset: data[2],
    allowance: data[3],
    balanceOf: data[4]
  };
};
