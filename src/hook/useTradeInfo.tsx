import { useContractRead, useNetwork } from 'wagmi';
import { getNetwork } from 'src/constants/networks';
const { abis } = getNetwork(0);

export const useLiqPrice = (positionId: number) => {
  const { chain } = useNetwork();
  const { addresses } = getNetwork(chain?.id ?? 42161);
  const { data } = useContractRead({
    address: addresses.tradinglibrary as `0x${string}`,
    abi: abis.tradinglibrary,
    functionName: 'getLiqPrice',
    args: [addresses.positions, positionId, 9e9],
    watch: true
  });
  return data;
};
