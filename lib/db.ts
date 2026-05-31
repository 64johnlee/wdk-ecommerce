import Database from 'better-sqlite3'
import path from 'path'
import type { Order, OrderStatus } from './types'

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'orders.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        amount_usd REAL NOT NULL,
        amount_usdt TEXT NOT NULL,
        chain TEXT NOT NULL,
        receive_address TEXT NOT NULL,
        account_index INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        paid_at INTEGER
      )
    `)
  }
  return _db
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    productName: row.product_name as string,
    amountUsd: row.amount_usd as number,
    amountUsdt: BigInt(row.amount_usdt as string),
    chain: row.chain as Order['chain'],
    receiveAddress: row.receive_address as string,
    accountIndex: row.account_index as number,
    status: row.status as OrderStatus,
    createdAt: row.created_at as number,
    paidAt: row.paid_at as number | undefined,
  }
}

export function createOrder(order: Order): void {
  getDb().prepare(`
    INSERT INTO orders
      (id, product_id, product_name, amount_usd, amount_usdt, chain,
       receive_address, account_index, status, created_at)
    VALUES
      (@id, @productId, @productName, @amountUsd, @amountUsdt, @chain,
       @receiveAddress, @accountIndex, @status, @createdAt)
  `).run({ ...order, amountUsdt: order.amountUsdt.toString() })
}

export function getOrder(id: string): Order | null {
  const row = getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id)
  return row ? rowToOrder(row as Record<string, unknown>) : null
}

export function markOrderPaid(id: string): void {
  getDb().prepare(
    "UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ?"
  ).run(Date.now(), id)
}

export function getNextAccountIndex(chain: string): number {
  const row = getDb().prepare(
    'SELECT MAX(account_index) as max_idx FROM orders WHERE chain = ?'
  ).get(chain) as { max_idx: number | null }
  return (row.max_idx ?? -1) + 1
}
