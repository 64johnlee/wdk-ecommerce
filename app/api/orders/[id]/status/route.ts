import { NextRequest } from 'next/server'
import { getOrder, markOrderPaid } from '@/lib/db'
import { getUsdtBalance } from '@/lib/merchant-wallet'

const POLL_INTERVAL = 10_000  // 10 seconds
const ORDER_TTL = 30 * 60_000 // 30 minutes

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const encoder = new TextEncoder()

  function send(data: object) {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const order = getOrder(id)
      if (!order) {
        controller.enqueue(send({ status: 'error', message: 'Order not found' }))
        controller.close()
        return
      }

      if (order.status === 'paid') {
        controller.enqueue(send({ status: 'paid' }))
        controller.close()
        return
      }

      controller.enqueue(send({ status: 'pending', address: order.receiveAddress }))

      const interval = setInterval(async () => {
        try {
          const freshOrder = getOrder(id)
          if (!freshOrder) { clearInterval(interval); controller.close(); return }

          if (freshOrder.status === 'paid') {
            controller.enqueue(send({ status: 'paid' }))
            clearInterval(interval)
            controller.close()
            return
          }

          if (Date.now() - freshOrder.createdAt > ORDER_TTL) {
            controller.enqueue(send({ status: 'expired' }))
            clearInterval(interval)
            controller.close()
            return
          }

          const balance = await getUsdtBalance(freshOrder.chain, freshOrder.accountIndex)
          controller.enqueue(send({ status: 'pending', balance: balance.toString() }))

          if (balance >= freshOrder.amountUsdt) {
            markOrderPaid(id)
            controller.enqueue(send({ status: 'paid' }))
            clearInterval(interval)
            controller.close()
          }
        } catch (err) {
          console.error('[SSE poll error]', err)
        }
      }, POLL_INTERVAL)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
