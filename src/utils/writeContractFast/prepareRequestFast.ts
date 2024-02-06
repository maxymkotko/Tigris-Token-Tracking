import { Address } from "abitype";
import {GetAccountParameter} from "./types/accounts";
import {
    Account,
    BaseError,
    Chain,
    PublicClient,
    SendTransactionParameters,
    Transport,
    WalletClient
} from "viem";
import {parseAccount} from "viem/accounts";

export type PrepareRequestParameters<
    TAccount extends Account | undefined = undefined,
> = GetAccountParameter<TAccount> & {
    gas?: SendTransactionParameters['gas']
    gasPrice?: SendTransactionParameters['gasPrice']
    maxFeePerGas?: SendTransactionParameters['maxFeePerGas']
    maxPriorityFeePerGas?: SendTransactionParameters['maxPriorityFeePerGas']
    nonce?: SendTransactionParameters['nonce']
}

export type PrepareRequestReturnType<
    TAccount extends Account | undefined = undefined,
    TParameters extends PrepareRequestParameters<TAccount> = PrepareRequestParameters<TAccount>,
> = TParameters & {
    from: Address
    gas: SendTransactionParameters['gas']
    gasPrice?: SendTransactionParameters['gasPrice']
    maxFeePerGas?: SendTransactionParameters['maxFeePerGas']
    maxPriorityFeePerGas?: SendTransactionParameters['maxPriorityFeePerGas']
    nonce: SendTransactionParameters['nonce']
}

export async function prepareRequestFast<
    TChain extends Chain | undefined,
    TAccount extends Account | undefined,
    TParameters extends PrepareRequestParameters<TAccount>,
>(
    client:
        | WalletClient<Transport, TChain, TAccount>
        | PublicClient<Transport, TChain>,
    args: TParameters
): Promise<PrepareRequestReturnType<TAccount, TParameters>> {
    const {
        account: account_,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce
    } = args
    if (!account_) throw new Error('Account not found')
    const account = parseAccount(account_)

    const request = { ...args, from: account.address }

    if (typeof nonce === 'undefined')
        {
            throw new Error('Nonce is required')
        }

    if (!gasPrice) {
        if (typeof maxFeePerGas === 'undefined' || typeof maxPriorityFeePerGas === 'undefined') {
            throw new BaseError('maxFeePerGas and maxPriorityFeePerGas must be defined.')
        }
    } else {
        if (
            typeof maxFeePerGas !== 'undefined' ||
            typeof maxPriorityFeePerGas !== 'undefined'
        )
            throw new BaseError('If using legacy gas fees then EIP-1559 fees cannot be defined.')
    }

    if (typeof gas === 'undefined') {
        throw new Error('Gas limit is required')
    }

    return request as PrepareRequestReturnType<TAccount, TParameters>
}