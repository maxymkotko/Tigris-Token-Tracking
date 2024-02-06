import {
  erc20ABI,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useAccount,
  useWaitForTransaction,
  erc721ABI
} from 'wagmi';

import { toast } from 'react-toastify';
import { getNetwork } from 'src/constants/networks';
const { abis } = getNetwork(0);

export const useApproved = (nftAddress: string, spender: string) => {
  const { address } = useAccount();

  const { data: isData } = useContractRead({
    address: nftAddress as `0x${string}`,
    abi: erc721ABI,
    functionName: 'isApprovedForAll',
    args: [address as `0x${string}`, spender as `0x${string}`],
    watch: true
  });

  return isData;
};

export const usePending = (swapAddress: string) => {
  const { address } = useAccount();

  const { data } = useContractRead({
    address: swapAddress as `0x${string}`,
    abi: abis.swapnft,
    functionName: 'pending',
    args: [address as `0x${string}`],
    watch: true
  });

  return data;
};

export const useUnlock = (swapAddress: string) => {
  const { address } = useAccount();

  const { data } = useContractRead({
    address: swapAddress as `0x${string}`,
    abi: abis.swapnft,
    functionName: 'vestingEnd',
    args: [address as `0x${string}`],
    watch: true
  });

  return data;
};

export const useApproveNFTs = (nftAddress: string, aFor: string) => {

  const { config } = usePrepareContractWrite({
    address: nftAddress as `0x${string}`,
    abi: erc721ABI,
    functionName: 'setApprovalForAll',
    args: [aFor as `0x${string}`, true]
  });

  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Approving NFTs...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to approve NFTs!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to approve NFTs!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully approved NFTs!');
    }
  });
  return [write];
};

export const useSwapNFTs = (swapAddress: string, nftIds: number[]) => {

  const { config } = usePrepareContractWrite({
    address: swapAddress as `0x${string}`,
    abi: abis.swapnft,
    functionName: 'swap',
    args: [nftIds]
  });

  const { write, data } = useContractWrite({
    ...config,
    onSuccess() {
      toast.dismiss();
      toast.loading('Swapping NFTs...');
    },
    onError() {
      toast.dismiss();
      toast.error('Failed to swap NFTs!');
    }
  });
  useWaitForTransaction({
    hash: data?.hash,
    onError() {
      toast.dismiss();
      toast.error('Failed to swap NFTs!');
    },
    onSuccess() {
      toast.dismiss();
      toast.success('Successfully swaped NFTs!');
    }
  });
  return [write];
};

export const useClaimTIG = (swapAddress: string) => {

  const { config } = usePrepareContractWrite({
    address: swapAddress as `0x${string}`,
    abi: abis.swapnft,
    functionName: 'claim',
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
      toast.error('Failed to claim TIG!');
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
