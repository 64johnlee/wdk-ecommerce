import type { Product } from './types'

export const PRODUCTS: Product[] = [
  {
    id: 'ebook-local-ai',
    name: 'Local AI Engineering Guide',
    description: 'A practical guide to running LLMs on-device with llama.cpp and QVAC. 200 pages, PDF.',
    priceUsd: 19,
    image: '📖',
  },
  {
    id: 'course-web3-wallet',
    name: 'Build a Web3 Wallet (Video Course)',
    description: 'From seed phrase to dApp integration. 6 hours of video using WDK and ethers.js.',
    priceUsd: 49,
    image: '🎬',
  },
  {
    id: 'template-saas-starter',
    name: 'SaaS Starter + Crypto Payments',
    description: 'Next.js SaaS boilerplate with WDK USDT checkout wired in. MIT licensed.',
    priceUsd: 99,
    image: '🚀',
  },
]
