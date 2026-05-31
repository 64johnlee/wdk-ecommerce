# WDK eCommerce

A reference implementation showing how to accept USDT payments in an ecommerce checkout using [Tether's Wallet Development Kit (WDK)](https://docs.wdk.tether.io).

**Chains supported:** Ethereum (ERC-20), Polygon, TRON (TRC-20)

Built for the [Tether Developer Grants Program](https://tether.dev/grants/bounties/2800541093/).

## How it works

```
Customer selects product + chain
        ↓
POST /api/orders  →  WDK derives a unique receive address
        ↓               (account index per order, from merchant seed)
Checkout page shows address + amount
        ↓
Customer sends USDT to address
        ↓
GET /api/orders/[id]/status (SSE)  →  WDK polls getTokenBalance()
        ↓
Balance ≥ amount  →  order marked paid  →  customer redirected
```

The merchant holds a single BIP-39 seed phrase. WDK derives a fresh HD wallet address for each order — no address reuse, no manual key management.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set MERCHANT_SEED_PHRASE to a fresh 12-word phrase

# 3. Run the dev server
npm run dev

# 4. Open http://localhost:3000
```

## Architecture

| File | Purpose |
|---|---|
| `lib/merchant-wallet.ts` | WDK singleton — EVM + TRON wallets from one seed |
| `lib/db.ts` | SQLite order store (better-sqlite3) |
| `lib/chains.ts` | Chain config: USDT addresses, RPC endpoints, decimals |
| `app/api/orders/route.ts` | `POST /api/orders` — create order, derive address |
| `app/api/orders/[id]/status/route.ts` | SSE payment monitor — polls WDK every 10s |
| `app/page.tsx` | Storefront |
| `app/checkout/[orderId]/page.tsx` | Payment page with real-time status |
| `app/success/page.tsx` | Order confirmation |

## License

MIT
