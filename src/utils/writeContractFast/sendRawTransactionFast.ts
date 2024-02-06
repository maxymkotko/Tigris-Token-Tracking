import {
    Account,
    BaseError,
    Chain,
    FormattedTransactionRequest, formatTransactionRequest,
    Hash, TransactionRequest, TransactionSerializable,
    Transport,
    WalletClient
} from "viem"
import {IsUndefined} from "./types/utils/isUndefined";
import {GetAccountParameter} from "./types/accounts"
import {GetChain} from "viem/dist/types/types/chain";
import {parseAccount} from "viem/accounts";
import {extract, getTransactionError} from "viem/utils";
import {prepareRequestFast} from "./prepareRequestFast";

export type SendTransactionParameters<
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
    TChainOverride extends Chain | undefined = Chain,
> = Omit<
    FormattedTransactionRequest<
        IsUndefined<TChain> extends true ? TChainOverride : TChain
    >,
    'from'
> &
    GetAccountParameter<TAccount> &
    GetChain<TChain, TChainOverride>

export type SendTransactionReturnType = Hash

export async function sendRawTransactionFast<
    TChain extends Chain | undefined,
    TAccount extends Account | undefined,
    TChainOverride extends Chain | undefined,
>(
    client: WalletClient<Transport, TChain, TAccount>,
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>
): Promise<SendTransactionReturnType> {
    const {
        account: account_ = client.account,
        chain = client.chain,
        accessList,
        data,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value,
        ...rest
    } = args

    if (!account_)
        throw new Error('Account is required');
    if (!chain) {
        throw new Error('Chain is required')
    }
    const account = parseAccount(account_)

    try {
        const chainId = chain.id

        if (account.type === 'local') {
            // Prepare the request for signing (assign appropriate fees, etc.)
            const request = await prepareRequestFast(client, {
                account,
                accessList,
                chain,
                data,
                gas,
                gasPrice,
                maxFeePerGas,
                maxPriorityFeePerGas,
                nonce,
                to,
                value,
                ...rest
            })

            const serializer = chain?.serializers?.transaction
            const signedRequest = await account.signTransaction(
                // eslint-disable-next-line
                {
                    ...request,
                    chainId
                } as TransactionSerializable,
                { serializer }
            )
            return await client.request({
                method: 'eth_sendRawTransaction',
                params: [signedRequest]
            })
        }

        const format =
            chain?.formatters?.transactionRequest?.format ?? formatTransactionRequest
        // eslint-disable-next-line
        const request = format({
            // Pick out extra data that might exist on the chain's transaction request type.
            ...extract(rest, { format }),
            accessList,
            data,
            from: account.address,
            gas,
            gasPrice,
            maxFeePerGas,
            maxPriorityFeePerGas,
            nonce,
            to,
            value
        } as TransactionRequest)
        return await client.request({
            method: 'eth_sendTransaction',
            params: [request]
        })
    } catch (err) {
        throw getTransactionError(err as BaseError, {
            ...args,
            account,
            chain: args.chain ?? undefined
        })
    }
}