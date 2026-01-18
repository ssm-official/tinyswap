# TinySwap

A minimal, open-source token swap interface for Ethereum. Get the best rates across decentralized exchanges powered by 0x Protocol.

## Features

- **Wallet Connection** - Connect with MetaMask, Coinbase Wallet, WalletConnect, and more via RainbowKit
- **Best Rates** - 0x aggregates liquidity from Uniswap, SushiSwap, Curve, and 100+ DEXs
- **Token Support** - Swap ETH, WETH, USDC, USDT, DAI, WBTC (easily extensible)
- **Real-time Quotes** - Live price updates as you type
- **Fee Support** - Optional integrator fees for monetization

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [viem](https://viem.sh/) - TypeScript Ethereum library
- [0x Swap API](https://0x.org/) - DEX aggregation

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/ssm-official/TinySwap.git
cd TinySwap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Required - Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Required - Get FREE from https://dashboard.0x.org/
ZEROX_API_KEY=your_0x_api_key

# Optional - Your wallet to receive swap fees
FEE_RECIPIENT=0xYourWalletAddress
FEE_BPS=50  # 0.5% fee (50 basis points)
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ssm-official/TinySwap&env=NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,ZEROX_API_KEY,FEE_RECIPIENT,FEE_BPS)

Or deploy manually:

```bash
npm install -g vercel
vercel --prod
```

Don't forget to add your environment variables in the Vercel dashboard.

## Adding More Tokens

Edit `lib/tokens.ts` to add more tokens:

```typescript
{
  address: '0x...', // Token contract address
  symbol: 'TOKEN',
  name: 'Token Name',
  decimals: 18,
  logoURI: 'https://...',
}
```

## License

Apache License 2.0 

## Acknowledgments

- [0x Protocol](https://0x.org/) for the swap aggregation API
- [RainbowKit](https://www.rainbowkit.com/) for the wallet connection UI
