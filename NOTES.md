# Design Notes for Tether Reviewers

## Why the server wallet uses ethers.js instead of WDK directly

WDK's wallet packages (`@tetherto/wdk-wallet-evm`, `@tetherto/wdk-wallet-tron`) depend on
`sodium-universal` → `sodium-native`, which is a Bare runtime native addon. It loads via
`require.addon()` — a Bare-specific API not available in Node.js. This means WDK wallet
packages cannot be imported in a Next.js (Node.js) server context without a custom loader.

The server-side merchant wallet in this reference therefore uses:
- **`ethers.js` `HDNodeWallet.fromPhrase()`** for BIP-39 seed → BIP-44 HD address derivation
- **`ethers.js` `Contract.balanceOf()`** for USDT balance polling via public JSON-RPC

This is identical to what WDK does internally — the derivation path is `m/44'/60'/0'/0/{index}`,
the same path `@tetherto/wdk-wallet-evm` uses. Addresses derived here will match those derived
by a WDK EVM wallet initialised with the same seed phrase.

## Where WDK belongs in this architecture

WDK is the correct tool for the **customer-side browser wallet** — when the customer has the WDK
browser extension installed, they can connect it to the checkout page (via EIP-1193 / EIP-6963)
and approve the USDT transfer directly. This pattern is already demonstrated by the existing
[wdk-starter-browser-extension](https://github.com/base58-io/wdk-starter-browser-extension).

A production integration would combine both:
1. **Server (this reference):** merchant address derivation + payment monitoring via ethers.js
2. **Client (browser extension):** customer approves the USDT transfer via WDK wallet

## TRON exclusion

`@tetherto/wdk-wallet-tron` brings in `tronweb` which also transitively depends on
`sodium-native`. TRON support can be added once WDK ships a Node.js-compatible build or
exposes a pure-JS fallback for address derivation.

## Suggested WDK improvement

Publishing a lightweight `@tetherto/wdk-address` or `@tetherto/wdk-wallet-evm-node` package
that handles BIP-44 address derivation without sodium-native would make server-side merchant
integrations straightforward — no ethers.js workaround needed.
