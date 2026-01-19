import { NextRequest, NextResponse } from 'next/server';

const ZEROX_API_KEY = process.env.ZEROX_API_KEY || '';

// 0x API requires chain-specific base URLs
const CHAIN_API_URLS: Record<string, string> = {
  '1': 'https://api.0x.org',
  '137': 'https://polygon.api.0x.org',
  '42161': 'https://arbitrum.api.0x.org',
  '10': 'https://optimism.api.0x.org',
  '8453': 'https://base.api.0x.org',
  '56': 'https://bsc.api.0x.org',
  '43114': 'https://avalanche.api.0x.org',
  '59144': 'https://linea.api.0x.org',
  '534352': 'https://scroll.api.0x.org',
  '81457': 'https://blast.api.0x.org',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sellToken = searchParams.get('sellToken');
  const buyToken = searchParams.get('buyToken');
  const sellAmount = searchParams.get('sellAmount');
  const chainId = searchParams.get('chainId') || '1';

  if (!sellToken || !buyToken || !sellAmount) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      chainId,
      sellToken,
      buyToken,
      sellAmount,
    });

    const baseUrl = CHAIN_API_URLS[chainId] || CHAIN_API_URLS['1'];

    const response = await fetch(
      `${baseUrl}/swap/permit2/price?${params.toString()}`,
      {
        headers: {
          '0x-api-key': ZEROX_API_KEY,
          '0x-version': 'v2',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('0x price error:', data);
      return NextResponse.json(
        { error: data.reason || data.message || 'Failed to fetch price' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      sellToken: data.sellToken,
      buyToken: data.buyToken,
      sellAmount: data.sellAmount,
      buyAmount: data.buyAmount,
      price: (parseFloat(data.buyAmount) / parseFloat(data.sellAmount)).toString(),
      estimatedGas: data.gas || '250000',
    });
  } catch (error) {
    console.error('0x price error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
