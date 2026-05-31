// Merchant wallet powered by WDK.
// Derives unique per-order receive addresses from a single seed phrase so
// the merchant never needs to manage multiple private keys.

import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import WalletManagerTron from '@tetherto/wdk-wallet-tron'
import { CHAINS, type ChainId } from './chains'

let _wdk: WDK | null = null

function getMerchantSeed(): string {
  const seed = process.env.MERCHANT_SEED_PHRASE
  if (!seed) throw new Error('MERCHANT_SEED_PHRASE env var is required')
  return seed
}

export function getMerchantWallet(): WDK {
  if (_wdk) return _wdk

  const seed = getMerchantSeed()
  _wdk = new WDK(seed)

  // Register EVM wallet — used for Ethereum and Polygon USDT
  _wdk.registerWallet('evm', WalletManagerEvm as any, {
    provider: CHAINS.ethereum.rpcUrl,
  })

  // Register TRON wallet — used for TRC20 USDT
  _wdk.registerWallet('tron', WalletManagerTron as any, {
    fullNode: CHAINS.tron.rpcUrl,
    solidityNode: CHAINS.tron.rpcUrl,
    eventServer: CHAINS.tron.rpcUrl,
  })

  return _wdk
}

// Get the receive address for a specific order (derived by account index)
export async function getReceiveAddress(chain: ChainId, accountIndex: number): Promise<string> {
  const wdk = getMerchantWallet()
  const walletChain = CHAINS[chain].type === 'evm' ? 'evm' : 'tron'
  const account = await wdk.getAccount(walletChain, accountIndex)
  return account.getAddress()
}

// Check current USDT balance at a receive address
export async function getUsdtBalance(chain: ChainId, accountIndex: number): Promise<bigint> {
  const wdk = getMerchantWallet()
  const chainConfig = CHAINS[chain]
  const walletChain = chainConfig.type === 'evm' ? 'evm' : 'tron'
  const account = await wdk.getAccount(walletChain, accountIndex)

  if (chainConfig.type === 'evm') {
    return account.getTokenBalance(chainConfig.usdtAddress)
  } else {
    // TRON: getTokenBalance for TRC20
    return account.getTokenBalance(chainConfig.usdtAddress)
  }
}
