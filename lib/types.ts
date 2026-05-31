import type { ChainId } from './chains'

export interface Product {
  id: string
  name: string
  description: string
  priceUsd: number
  image: string
}

export type OrderStatus = 'pending' | 'paid' | 'expired'

export interface Order {
  id: string
  productId: string
  productName: string
  amountUsd: number
  amountUsdt: bigint
  chain: ChainId
  receiveAddress: string
  accountIndex: number
  status: OrderStatus
  createdAt: number
  paidAt?: number
}
