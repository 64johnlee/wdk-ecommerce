'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('orderId')
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Your USDT payment was received on-chain. Thank you for your purchase.
        </p>
        {orderId && (
          <p className="text-xs text-gray-400 mb-6 font-mono">Order: {orderId}</p>
        )}
        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Back to Store
        </Link>
        <p className="text-xs text-gray-400 mt-8">
          Powered by <a href="https://docs.wdk.tether.io" className="underline" target="_blank">Tether WDK</a>
        </p>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
