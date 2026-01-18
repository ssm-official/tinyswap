export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

// Native ETH uses a special address in 0x API
export const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const TOKENS: Token[] = [
  {
    address: NATIVE_ETH_ADDRESS,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoURI: 'https://token-icons.s3.amazonaws.com/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: 'https://token-icons.s3.amazonaws.com/0x6b175474e89094c44da98b954eedeac495271d0f.png',
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    logoURI: 'https://token-icons.s3.amazonaws.com/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
  },
];

export function getTokenBySymbol(symbol: string): Token | undefined {
  return TOKENS.find((token) => token.symbol === symbol);
}

export function getTokenByAddress(address: string): Token | undefined {
  return TOKENS.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
}
