export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

// Native token address used by 0x API
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// Chain configurations
export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  { id: 137, name: 'Polygon', nativeSymbol: 'MATIC', nativeName: 'Polygon' },
  { id: 42161, name: 'Arbitrum', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  { id: 10, name: 'Optimism', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  { id: 8453, name: 'Base', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  { id: 56, name: 'BNB Chain', nativeSymbol: 'BNB', nativeName: 'BNB' },
  { id: 43114, name: 'Avalanche', nativeSymbol: 'AVAX', nativeName: 'Avalanche' },
  { id: 59144, name: 'Linea', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  { id: 534352, name: 'Scroll', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
  { id: 81457, name: 'Blast', nativeSymbol: 'ETH', nativeName: 'Ethereum' },
] as const;

// Tokens by chain ID
export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  // Ethereum Mainnet
  1: [
    {
      address: NATIVE_TOKEN_ADDRESS,
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
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
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
  ],

  // Polygon
  137: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
    },
    {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      symbol: 'WMATIC',
      name: 'Wrapped Matic',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
    },
    {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
    {
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
    },
  ],

  // Arbitrum
  42161: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    },
    {
      address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
    },
  ],

  // Optimism
  10: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    },
    {
      address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
    },
  ],

  // Base
  8453: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x6b175474e89094c44da98b954eedeac495271d0f.png',
    },
  ],

  // BNB Chain
  56: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'BNB',
      name: 'BNB',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xb8c77482e45f1f44de1745f52c74426c631bdd52.png',
    },
    {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      symbol: 'WBNB',
      name: 'Wrapped BNB',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xb8c77482e45f1f44de1745f52c74426c631bdd52.png',
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
    {
      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      symbol: 'BTCB',
      name: 'Bitcoin BEP2',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
    },
  ],

  // Avalanche
  43114: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'AVAX',
      name: 'Avalanche',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x85f138bfee4ef8e540890cfb48f620571d67eda3.png',
    },
    {
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      symbol: 'WAVAX',
      name: 'Wrapped AVAX',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x85f138bfee4ef8e540890cfb48f620571d67eda3.png',
    },
    {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
    {
      address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      logoURI: 'https://token-icons.s3.amazonaws.com/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
    },
  ],

  // Linea
  59144: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
  ],

  // Scroll
  534352: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x5300000000000000000000000000000000000004',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
    {
      address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
  ],

  // Blast
  81457: [
    {
      address: NATIVE_TOKEN_ADDRESS,
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x4300000000000000000000000000000000000004',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/eth.png',
    },
    {
      address: '0x4300000000000000000000000000000000000003',
      symbol: 'USDB',
      name: 'USDB',
      decimals: 18,
      logoURI: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
    },
  ],
};

// Default to Ethereum tokens for backwards compatibility
export const TOKENS = TOKENS_BY_CHAIN[1];
export const NATIVE_ETH_ADDRESS = NATIVE_TOKEN_ADDRESS;

export function getTokensByChain(chainId: number): Token[] {
  return TOKENS_BY_CHAIN[chainId] || TOKENS_BY_CHAIN[1];
}

export function getTokenBySymbol(symbol: string, chainId: number = 1): Token | undefined {
  const tokens = getTokensByChain(chainId);
  return tokens.find((token) => token.symbol === symbol);
}

export function getTokenByAddress(address: string, chainId: number = 1): Token | undefined {
  const tokens = getTokensByChain(chainId);
  return tokens.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
}

export function isNativeToken(address: string): boolean {
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
}
