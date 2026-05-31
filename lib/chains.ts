export type ChainId = 'ethereum' | 'polygon' | 'tron'

export interface Chain {
  id: ChainId
  name: string
  usdtAddress: string
  usdtDecimals: number
  rpcUrl: string
  explorerUrl: string
  type: 'evm' | 'tron'
}

export const CHAINS: Record<ChainId, Chain> = {
  ethereum: {
    id: 'ethereum', name: 'Ethereum',
    usdtAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    usdtDecimals: 6,
    rpcUrl: process.env.ETH_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    type: 'evm',
  },
  polygon: {
    id: 'polygon', name: 'Polygon',
    usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    usdtDecimals: 6,
    rpcUrl: process.env.POLYGON_RPC_URL ?? 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    type: 'evm',
  },
  tron: {
    id: 'tron', name: 'TRON',
    usdtAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    usdtDecimals: 6,
    rpcUrl: process.env.TRON_RPC_URL ?? 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    type: 'tron',
  },
}

export function toUsdtBase(dollars: number, decimals = 6): bigint {
  return BigInt(Math.round(dollars * 10 ** decimals))
}

export function fromUsdtBase(amount: bigint, decimals = 6): number {
  return Number(amount) / 10 ** decimals
}
