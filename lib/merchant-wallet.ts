// Merchant wallet — pure ethers.js + BIP-32/39/44 for Node.js compatibility.
// WDK uses sodium-native (a Bare runtime addon) which cannot run in Next.js
// (Node.js). The same HD wallet derivation WDK performs is replicated here
// using standard ethers.js primitives so the reference remains fully auditable.

import { HDNodeWallet, JsonRpcProvider, Contract } from 'ethers'
import * as bip39 from 'bip39'
import { CHAINS, type ChainId } from './chains'

// ERC-20 balanceOf ABI fragment
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)']

// BIP-44 derivation path base — same path WDK uses for EVM wallets
const EVM_PATH = "m/44'/60'/0'/0"

function getMasterWallet(): HDNodeWallet {
  const phrase = process.env.MERCHANT_SEED_PHRASE
  if (!phrase) throw new Error('MERCHANT_SEED_PHRASE env var is required')
  if (!bip39.validateMnemonic(phrase)) throw new Error('MERCHANT_SEED_PHRASE is not a valid BIP-39 mnemonic')
  return HDNodeWallet.fromPhrase(phrase, undefined, EVM_PATH)
}

// Derive the receive address for a specific account index.
// Each order gets its own index so addresses are never reused.
export function getReceiveAddress(_chain: ChainId, accountIndex: number): string {
  const master = getMasterWallet()
  const child = master.deriveChild(accountIndex)
  return child.address
}

// Check USDT balance at the derived address using public RPC.
export async function getUsdtBalance(chain: ChainId, accountIndex: number): Promise<bigint> {
  const chainConfig = CHAINS[chain]
  const provider = new JsonRpcProvider(chainConfig.rpcUrl)
  const address = getReceiveAddress(chain, accountIndex)
  const usdt = new Contract(chainConfig.usdtAddress, ERC20_ABI, provider)
  return usdt.balanceOf(address) as Promise<bigint>
}
