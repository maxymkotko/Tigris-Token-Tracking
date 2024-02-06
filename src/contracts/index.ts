import { Chain, PublicClient, WalletClient } from "wagmi";
import { polygon, arbitrum } from "../index";

let walletClient: WalletClient;
let publicClient: PublicClient;
let address: string | undefined;
let chain: Chain | undefined;

export const initializeWeb3 = async (publicClient_: any, walletClient_: any, address_: string | undefined, chain_: Chain | undefined) => {
    publicClient = publicClient_;
    walletClient = walletClient_;
    address = address_;
    chain = chain_;
    return true;
};

export const getWalletClient = () => {
    if(walletClient !== null && walletClient !== undefined) {
        return walletClient;
    }
}

export const getPublicClient = () => {
    if(publicClient !== null && publicClient !== undefined) {
        return publicClient;
    }
}

export const getAddress = () => {
    if(walletClient !== null && walletClient !== undefined) {
        return address;
    }
}

export const getChain = () => {
    if(chain !== undefined && chain !== null)
    return chain
}

export const getChainById = (id: number) => {
    // eslint-disable-next-line default-case
    switch (id) {
        case 137:
            return polygon;
        case 42161:
            return arbitrum;
    }
}