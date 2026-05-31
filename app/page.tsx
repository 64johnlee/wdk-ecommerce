'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRODUCTS } from '@/lib/products'

const CHAINS = [
  { id: 'ethereum', name: 'Ethereum (USDT ERC-20)' },
  { id: 'polygon',  name: 'Polygon (USDT)' },
  
]

export default function StorePage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [chain, setChain] = useState('polygon')
  const [loading, setLoading] = useState(false)

  async function checkout() {
    if (!selectedProduct) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, chain }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/checkout/${data.orderId}`)
    } catch (err) {
      alert('Failed to create order: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">WDK eCommerce Demo</h1>
          <p className="mt-2 text-gray-500">
            Pay with USDT on Ethereum, Polygon, or TRON — powered by{' '}
            <a href="https://docs.wdk.tether.io" className="text-blue-600 underline" target="_blank">
              Tether WDK
            </a>
          </p>
        </header>

        <div className="grid gap-4 mb-8">
          {PRODUCTS.map(product => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                selectedProduct === product.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{product.image}</span>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                </div>
                <span className="text-xl font-bold text-gray-900">${product.priceUsd}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pay with USDT on</label>
          <select
            value={chain}
            onChange={e => setChain(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CHAINS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={checkout}
          disabled={!selectedProduct || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Creating order…' : 'Pay with USDT →'}
        </button>
      </div>
    </main>
  )
}
