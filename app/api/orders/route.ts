import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { PRODUCTS } from '@/lib/products'
import { CHAINS, toUsdtBase, type ChainId } from '@/lib/chains'
import { createOrder, getNextAccountIndex } from '@/lib/db'
import { getReceiveAddress } from '@/lib/merchant-wallet'

export async function POST(req: NextRequest) {
  try {
    const { productId, chain } = await req.json() as { productId: string; chain: ChainId }

    const product = PRODUCTS.find(p => p.id === productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    if (!CHAINS[chain]) return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 })

    const accountIndex = getNextAccountIndex(chain)
    const receiveAddress = await getReceiveAddress(chain, accountIndex)
    const amountUsdt = toUsdtBase(product.priceUsd, CHAINS[chain].usdtDecimals)

    const order = {
      id: randomUUID(),
      productId: product.id,
      productName: product.name,
      amountUsd: product.priceUsd,
      amountUsdt,
      chain,
      receiveAddress,
      accountIndex,
      status: 'pending' as const,
      createdAt: Date.now(),
    }

    createOrder(order)

    return NextResponse.json({
      orderId: order.id,
      receiveAddress,
      amountUsdt: amountUsdt.toString(),
      amountUsd: product.priceUsd,
      chain,
      chainName: CHAINS[chain].name,
      usdtAddress: CHAINS[chain].usdtAddress,
    })
  } catch (err) {
    console.error('[POST /api/orders]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
