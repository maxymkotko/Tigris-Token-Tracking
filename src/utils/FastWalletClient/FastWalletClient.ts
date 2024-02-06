import { Address } from "abitype";
import {
    createWalletClient,
    WalletClientConfig,
    Transport,
    Chain,
    Account
} from "viem";
import {writeContractFast, WriteContractParameters} from "../writeContractFast/writeContractFast";

export type FastWalletClient<WalletClient> = WalletClient & {
    writeContractFast: typeof writeContractFast
}

export function createFastWalletClient<
    TTransport extends Transport,
    TChain extends Chain | undefined,
    TAccountOrAddress extends Account | Address | undefined = undefined
>({
      account,
      chain,
      transport,
      key = 'wallet',
      name = 'Wallet Client',
      pollingInterval
  }: WalletClientConfig<TTransport, TChain, TAccountOrAddress>): FastWalletClient<any> {
    const client = createWalletClient({
        account,
        chain,
        key,
        name,
        pollingInterval,
        transport: (opts) => transport({ ...opts, retryCount: 0 })
    });
    // eslint-disable-next-line
    return {
        ...client,
        writeContractFast: async (args: WriteContractParameters) => await writeContractFast(client, args)
    } as FastWalletClient<any>;
}
