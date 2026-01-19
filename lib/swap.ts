import { Token, NATIVE_TOKEN_ADDRESS } from './tokens';

export interface SwapQuote {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  price: string;
  guaranteedPrice: string;
  estimatedPriceImpact: string;
  sources: Array<{ name: string; proportion: string }>;
  gas: string;
  gasPrice: string;
  estimatedGas: string;
}

export interface Permit2Eip712 {
  types: Record<string, Array<{ name: string; type: string }>>;
  domain: {
    name: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  primaryType: string;
  message: Record<string, unknown>;
}

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  price?: string;
  estimatedGas?: string;
  allowanceTarget: string;
  permit2?: {
    eip712: {
      types: Record<string, Array<{ name: string; type: string }>>;
      domain: {
        name: string;
        chainId: number;
        verifyingContract: `0x${string}`;
      };
      primaryType: string;
      message: Record<string, unknown>;
    };
  };
}

interface GetQuoteParams {
  sellToken: Token;
  buyToken: Token;
  sellAmount: string;
  takerAddress?: string;
  chainId?: number;
}

interface GetSwapParams extends GetQuoteParams {
  takerAddress: string;
  slippagePercentage?: number;
  chainId?: number;
}

export async function getSwapQuote({
  sellToken,
  buyToken,
  sellAmount,
  takerAddress,
  chainId = 1,
}: GetQuoteParams): Promise<SwapQuote> {
  const params = new URLSearchParams({
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount: sellAmount,
    chainId: chainId.toString(),
  });

  if (takerAddress) {
    params.append('takerAddress', takerAddress);
  }

  const response = await fetch(`/api/swap/quote?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch quote');
  }

  return response.json();
}

export async function getSwapPrice({
  sellToken,
  buyToken,
  sellAmount,
  chainId = 1,
}: GetQuoteParams): Promise<SwapQuote> {
  const params = new URLSearchParams({
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount: sellAmount,
    chainId: chainId.toString(),
  });

  const response = await fetch(`/api/swap/price?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch price');
  }

  return response.json();
}

export async function getSwapTransaction({
  sellToken,
  buyToken,
  sellAmount,
  takerAddress,
  slippagePercentage = 0.01,
  chainId = 1,
}: GetSwapParams): Promise<SwapTransaction> {
  const params = new URLSearchParams({
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount: sellAmount,
    takerAddress: takerAddress,
    slippagePercentage: slippagePercentage.toString(),
    chainId: chainId.toString(),
  });

  const response = await fetch(`/api/swap/quote?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch swap transaction');
  }

  return response.json();
}

export function formatTokenAmount(amount: string | undefined | null, decimals: number): string {
  if (!amount || amount === '0') return '0';

  try {
    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.slice(0, 6).replace(/0+$/, '');

    if (trimmedFractional === '') {
      return integerPart.toString();
    }

    return `${integerPart}.${trimmedFractional}`;
  } catch {
    return '0';
  }
}

export function parseTokenAmount(amount: string, decimals: number): string {
  if (!amount || amount === '') return '0';

  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const fullNumber = integerPart + paddedFractional;

  // Remove leading zeros
  return fullNumber.replace(/^0+/, '') || '0';
}

export function isNativeEth(address: string): boolean {
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
}
