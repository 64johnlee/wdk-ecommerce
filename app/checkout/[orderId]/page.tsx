'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CHAINS } from '@/lib/chains'
import type { ChainId } from '@/lib/chains'

interface OrderDetail {
  orderId: string
  productName: string
  amountUsd: number
  amountUsdt: string
  chain: ChainId
  chainName: string
  receiveAddress: string
  usdtAddress: string
}

type PaymentStatus = 'loading' | 'pending' | 'paid' | 'expired' | 'error'

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [status, setStatus] = useState<PaymentStatus>('loading')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then((data: OrderDetail & { receiveAddress: string }) => {
        setOrder({
          orderId,
          productName: data.productName,
          amountUsd: data.amountUsd,
          amountUsdt: data.amountUsdt,
          chain: data.chain,
          chainName: CHAINS[data.chain]?.name ?? data.chain,
          receiveAddress: data.receiveAddress,
          usdtAddress: CHAINS[data.chain]?.usdtAddress ?? '',
        })
        setStatus('pending')
      })
      .catch(() => setStatus('error'))
  }, [orderId])

  useEffect(() => {
    if (!order) return
    const es = new EventSource(`/api/orders/${orderId}/status`)
    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as { status: PaymentStatus }
      setStatus(data.status)
      if (data.status === 'paid') {
        es.close()
        setTimeout(() => router.push(`/success?orderId=${orderId}`), 1500)
      }
      if (data.status === 'expired') es.close()
    }
    es.onerror = () => setStatus('error')
    return () => es.close()
  }, [order, orderId, router])

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading order…</div>
  if (status === 'error') return <div className="min-h-screen flex items-center justify-center text-red-500">Order not found.</div>
  if (!order) return null

  const base = BigInt(order.amountUsdt)
  const usdt = (base / BigInt(1_000_000)).toString() + '.' +
    (Number(base % BigInt(1_000_000))).toString().padStart(6, '0').replace(/0+$/, '0')

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-5">
            <h1 className="text-xl font-bold">Complete Your Payment</h1>
            <p className="text-blue-100 text-sm mt-1">{order.productName}</p>
          </div>

          <div className="p-6 space-y-5">
            {status === 'paid' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">✅</div>
                <div className="font-semibold text-green-800">Payment confirmed! Redirecting…</div>
              </div>
            )}

            {status === 'expired' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-red-700 font-semibold">Order expired. Please start again.</div>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-gray-900">{usdt} USDT (${order.amountUsd})</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network</span>
              <span className="font-semibold text-gray-900">{order.chainName}</span>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Send exactly <strong>{usdt} USDT</strong> to:</div>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm break-all text-gray-900 border border-gray-200">
                {order.receiveAddress}
              </div>
              <button
                onClick={() => copy(order.receiveAddress)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {copied ? '✓ Copied!' : 'Copy address'}
              </button>
            </div>

            <div className="border-t pt-4">
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Only send USDT on <strong>{order.chainName}</strong></p>
                <p>• USDT contract: <span className="font-mono">{order.usdtAddress.slice(0, 12)}…</span></p>
                <p>• Payment is detected automatically (~10 second confirmation)</p>
                <p>• Order expires in 30 minutes</p>
              </div>
            </div>

            {status === 'pending' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                Waiting for payment…
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <a href="https://docs.wdk.tether.io" className="underline" target="_blank">Tether WDK</a>
        </p>
      </div>
    </main>
  )
}
