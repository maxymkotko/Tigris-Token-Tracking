/* eslint-disable @typescript-eslint/restrict-plus-operands */
import Wallet from 'ethereumjs-wallet';
import { getAddress, getChain, getChainById, getPublicClient, getWalletClient } from 'src/contracts';
import { getNetwork } from 'src/constants/networks';
import axios from 'axios';
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  keccak256,
  pad,
  parseEther,
  toHex,
  getAddress as checksum
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createFastWalletClient } from '../utils/FastWalletClient/FastWalletClient';
import { waitForTransaction } from '@wagmi/core';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';
import { browserName } from 'react-device-detect';
import { LogError } from '../context/ErrorLogs';
import { RelayNode } from '../context/RelayNode';
// eslint-disable-next-line
const encryptpwd = require('encrypt-with-password');
const cookies = new Cookies();

let proxy_public = '';
let proxy_private = '';

const sig_salt = 'TIGRIS_SALT';

let isGenerating = false;
export const generateProxyWallet = async () => {
  if (isGenerating) {
    console.log('Proxy gen in process');
    return;
  }
  isGenerating = true;
  const publicClient = getPublicClient();
  if (publicClient === undefined) {
    isGenerating = false;
    return;
  }
  const walletClient = getWalletClient();
  const walletAddress = getAddress();

  let signature;
  try {
    if (walletClient === undefined) {
      isGenerating = false;
      return;
    }
    signature = (
      await walletClient.signMessage({
        message:
          'ONLY SIGN THIS MESSAGE ON\nhttps://app.tigris.trade!\n\nSign to unlock proxy wallet for\n' + walletAddress
      })
    ).toString();
    localStorage.setItem(walletAddress + '_proxy_sig', signature);
    try {
      if (localStorage.getItem(walletAddress + '_e_private_key')) {
        if (cookies.get(walletAddress + '_k') !== undefined) {
          const old_proxy_key = encryptpwd.decrypt(
            localStorage.getItem(walletAddress + '_e_private_key'),
            cookies.get(walletAddress + '_k')
          );
          // Send gas to new proxy wallet on both polygon and arbitrum
          const account = privateKeyToAccount(old_proxy_key as `0x${string}`);
          // Arbitrum
          try {
            setTimeout(() => {
              toast.loading('Sending gas back from old proxy...');
            }, 500);
            {
              const chain = getChainById(42161);
              const publicClient = createPublicClient({
                chain,
                transport: http(chain?.rpcUrls.public.http[0]) ?? http()
              });
              const transport = http(chain?.rpcUrls.public.http[0]) ?? http();
              const oldProxyClient = createWalletClient({
                account,
                chain,
                transport
              });
              const gasPriceEstimate = (await publicClient.getGasPrice()) * BigInt(3);
              const balance = await publicClient.getBalance({ address: account.address });
              let gasLimitEstimate = BigInt(0);
              try {
                gasLimitEstimate = await publicClient.estimateGas({
                  account,
                  to: walletAddress as `0x${string}`,
                  value: BigInt(0)
                });
                const value = balance - gasPriceEstimate * gasLimitEstimate * BigInt(2);
                console.log(value);
                if (value > 0) {
                  await oldProxyClient.sendTransaction({
                    to: walletAddress as `0x${string}`,
                    value,
                    chain,
                    gas: gasLimitEstimate,
                    maxFeePerGas: gasPriceEstimate,
                    maxPriorityFeePerGas: gasPriceEstimate
                  });
                }
              } catch (err) {
                console.log(err);
              }
            }
            // Polygon
            {
              const chain = getChainById(137);
              const publicClient = createPublicClient({
                chain,
                transport: http(chain?.rpcUrls.public.http[0]) ?? http()
              });
              const transport = http(chain?.rpcUrls.public.http[0]) ?? http();
              const oldProxyClient = createWalletClient({
                account,
                chain,
                transport
              });
              const gasPriceEstimate = (await publicClient.getGasPrice()) * BigInt(3);
              const balance = await publicClient.getBalance({ address: account.address });
              let gasLimitEstimate = BigInt(0);
              try {
                gasLimitEstimate = await publicClient.estimateGas({
                  account,
                  to: walletAddress as `0x${string}`,
                  value: BigInt(0)
                });
                const value = balance - gasPriceEstimate * gasLimitEstimate * BigInt(2);
                console.log(value);
                if (value > 0) {
                  await oldProxyClient.sendTransaction({
                    to: walletAddress as `0x${string}`,
                    value,
                    chain,
                    gas: gasLimitEstimate,
                    maxFeePerGas: gasPriceEstimate,
                    maxPriorityFeePerGas: gasPriceEstimate
                  });
                }
              } catch (err) {
                console.log(err);
              }
            }
          } catch (err) {
            console.log(err);
          }
        }
        toast.dismiss();
        toast.info('Sent gas back from old proxy wallet!');
        setTimeout(() => {
          toast.info('Backing up old proxy wallet...');
        }, 250);
        const element = document.createElement('a');
        const file = new Blob(
          [
            'OLD PROXY WALLET\nProxy wallet address: ' +
              String(localStorage.getItem(String(walletAddress) + '_public_key')) +
              '\n' +
              'Proxy wallet encrypted private key: ' +
              String(localStorage.getItem(String(walletAddress) + '_e_private_key'))
          ],
          { type: 'text/plain' }
        );
        element.href = URL.createObjectURL(file);
        element.download = String(browserName) + '_' + String(walletAddress) + '_old_proxy_backup.txt';
        document.body.appendChild(element);
        element.click();
      }
      localStorage.removeItem(walletAddress + '_e_private_key');
      localStorage.removeItem(walletAddress + '_public_key');
      cookies.remove(walletAddress + '_k');
    } catch (err) {
      console.log(err);
    }
  } catch (err: any) {
    console.log(err);
    toast.dismiss();
    toast.error('Proxy wallet creation failed!');
    isGenerating = false;
    LogError(walletAddress, err.message, false, '', 'Migrating proxy');
    return;
  }
  const stringToHash = sig_salt + signature;
  const privateKey = keccak256(toHex(stringToHash));
  const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey.slice(2), 'hex'));
  proxy_public = checksum(wallet.getAddressString());
  // checksum address
  proxy_private = privateKey;
  isGenerating = false;
  toast.dismiss();
  toast.success('Proxy wallet connected!');
};

export const checkProxyWallet = async (address: string) => {
  try {
    if (localStorage.getItem(address + '_proxy_sig')) {
      const stringToHash = sig_salt + localStorage.getItem(address + '_proxy_sig');
      const privateKey = keccak256(toHex(stringToHash));
      const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey.slice(2), 'hex'));
      proxy_public = checksum(wallet.getAddressString());
      proxy_private = privateKey;
    } else {
      proxy_public = '';
      proxy_private = '';
    }
  } catch {}
};

export const unlockProxyWallet = async () => {
  const walletAddress = getAddress();
  if (!walletAddress || walletAddress === '') {
    toast.error('Wallet not connected!');
    return;
  }
  const proxy_sig = localStorage.getItem(walletAddress + '_proxy_sig');
  if (proxy_sig === null) {
    await generateProxyWallet();
  } else {
    const stringToHash = sig_salt + proxy_sig;
    const privateKey = keccak256(toHex(stringToHash));
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey.slice(2), 'hex'));
    proxy_public = checksum(wallet.getAddressString());
    proxy_private = privateKey;
  }
};

export const getProxyAddress = () => {
  return proxy_public;
};

export const getProxyBalance = async () => {
  if (!proxy_public) return '0';

  const publicClient = getPublicClient();
  if (publicClient === undefined) return;
  const balance = await publicClient.getBalance({ address: proxy_public as `0x${string}` });

  return formatEther(balance);
};

export const getProxyWalletClientPrivate = async () => {
  if (!proxy_private || proxy_private === '') {
    await unlockProxyWallet();
  }
  const chain = getChain();
  const account = privateKeyToAccount(proxy_private as `0x${string}`);
  const transport = http(chain?.rpcUrls.private.http[0]) ?? http();
  return createFastWalletClient({
    account,
    chain,
    transport
  });
};

export const getProxyWalletClientPublic = async () => {
  if (!proxy_private || proxy_private === '') {
    await unlockProxyWallet();
  }
  const chain = getChain();
  const account = privateKeyToAccount(proxy_private as `0x${string}`);
  const transport = http(chain?.rpcUrls.public.http[0]) ?? http();
  return createFastWalletClient({
    account,
    chain,
    transport
  });
};

export const getProxyWalletClients = async () => {
  if (!proxy_private || proxy_private === '') {
    await unlockProxyWallet();
  }
  const chain = getChain();
  const account = privateKeyToAccount(proxy_private as `0x${string}`);
  const transportPublic = http(chain?.rpcUrls.public.http[0]) ?? http();
  const transportPrivate = http(chain?.rpcUrls.private.http[0]) ?? http();
  return [
    createFastWalletClient({
      account,
      chain,
      transport: transportPrivate
    }),
    createFastWalletClient({
      account,
      chain,
      transport: transportPublic
    })
  ];
};

export const sendGasBack = async (wallet: `0x${string}`) => {
  const proxyClient = await getProxyWalletClientPrivate();
  const publicClient = getPublicClient();
  const chain = getChain();
  if (chain === undefined || chain === null) return;
  if (publicClient === undefined) return;
  const gasPriceEstimate = await publicClient.getGasPrice();
  const balance_ = await getProxyBalance();
  if (balance_ === undefined) return;
  const balance = parseEther(balance_ as `${number}`);
  const gasLimitEstimate = await publicClient.estimateGas({
    account: proxyClient.account,
    to: wallet,
    value: BigInt(0)
  });
  const value = balance - gasPriceEstimate * gasLimitEstimate * BigInt(3);
  console.log(balance, gasPriceEstimate, gasLimitEstimate, value, gasPriceEstimate * gasLimitEstimate * BigInt(3));
  if (value < 0) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw 'Not enough balance to send back!';
  } else {
    const hash = await proxyClient.sendTransaction({
      to: wallet,
      value,
      chain,
      gas: gasLimitEstimate,
      maxFeePerGas: gasPriceEstimate,
      maxPriorityFeePerGas: gasPriceEstimate
    });
    const tx = await waitForTransaction({ hash });
    if (tx.status === 'reverted') {
      toast.dismiss();
      toast.error('Sending gas back!');
    }
  }
};

export const forwarder = async (
  id: number | undefined,
  inputData: string,
  orderType: string,
  target?: string,
  pairId?: number
) => {
  const verifyAddress = getNetwork(id).addresses.forwarder;
  const toContract = target ?? getNetwork(id).addresses.trading;
  const salt = pad(toHex(Math.floor(Math.random() * 100000)));
  const deadline = Math.floor(Date.now() / 1000) + 60; // Valid for 1 minute

  // Remove price data
  if (orderType !== 'createLimitOrder' && orderType !== 'initiateLimitOrder' && orderType !== 'cancelLimitOrder') {
    inputData = inputData.substring(0, inputData.length - 768);
  }

  const domain = {
    name: 'PermissionedForwarder',
    version: '1',
    chainId: id,
    verifyingContract: verifyAddress
  };
  const types = {
    ForwardRequest: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'deadline', type: 'uint256' },
      { name: 'data', type: 'bytes' }
    ]
  };

  const value = {
    from: proxy_public,
    to: toContract,
    salt,
    deadline,
    data: inputData
  };

  const proxyClient = await getProxyWalletClientPublic();

  // const signature = await user._signTypedData(domain, types, value);
  const signature = await proxyClient.signTypedData({
    primaryType: 'ForwardRequest',
    domain,
    types,
    message: value
  });

  const forwarderData = {
    from: proxy_public,
    to: toContract,
    salt,
    deadline,
    data: inputData,
    signature,
    orderType,
    chainId: id,
    pairId
  };

  try {
    await axios.post(RelayNode + '/execute', forwarderData);
    console.log('Successfully sent transaction to relay node.');
  } catch (err: any) {
    console.log(err);
    throw err;
  }
};
