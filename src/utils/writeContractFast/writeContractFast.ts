import type { Abi } from 'abitype'

import {
    type SendTransactionParameters,
    type SendTransactionReturnType,
    sendRawTransactionFast
} from './sendRawTransactionFast'
import {
    Account,
    Chain,
    ContractFunctionConfig,
    encodeFunctionData,
    EncodeFunctionDataParameters,
    GetValue,
    Hex
} from "viem";
import {GetChain} from "viem/dist/types/types/chain";
import {FastWalletClient} from "../FastWalletClient/FastWalletClient";

export type WriteContractParameters<
    TAbi extends Abi | readonly unknown[] = Abi,
    TFunctionName extends string = string,
    TChain extends Chain | undefined = Chain,
    TAccount extends Account | undefined = undefined,
    TChainOverride extends Chain | undefined = undefined,
> = ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
    Omit<
        SendTransactionParameters<TChain, TAccount, TChainOverride>,
        'chain' | 'to' | 'data' | 'value'
    > &
    GetChain<TChain, TChainOverride> &
    GetValue<
        TAbi,
        TFunctionName,
        SendTransactionParameters<
            TChain,
            TAccount,
            TChainOverride
        > extends SendTransactionParameters
            ? SendTransactionParameters<TChain, TAccount, TChainOverride>['value']
            : SendTransactionParameters['value']
    > & {
    /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
    dataSuffix?: Hex
}

export type WriteContractReturnType = SendTransactionReturnType

export async function writeContractFast<
    TChain extends Chain | undefined,
    TAccount extends Account | undefined,
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain | undefined = undefined
>(
    client: FastWalletClient<any>,
    {
        abi,
        address,
        args,
        dataSuffix,
        functionName,
        ...request
    }: WriteContractParameters<
        TAbi,
        TFunctionName,
        TChain,
        TAccount,
        TChainOverride
    >
): Promise<WriteContractReturnType> {
    const data = encodeFunctionData({
        abi,
        args,
        functionName
    } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)
    const hash = await sendRawTransactionFast(client, {
        data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
        to: address,
        ...request
    } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>)
    return hash
}