import type { Address } from 'abitype'
import { Account, JsonRpcAccount } from 'viem'
import {IsUndefined} from "./utils/isUndefined";

export type GetAccountParameter<
    TAccount extends Account | undefined = Account | undefined,
> = IsUndefined<TAccount> extends true
    ? { account: Account | Address }
    : { account?: Account | Address }

export type ParseAccount<TAccount extends Account | Address | undefined> =
    | (TAccount extends Account ? TAccount : never)
    | (TAccount extends Address ? JsonRpcAccount : never)
    | (TAccount extends undefined ? undefined : never)