import { NextRequest, NextResponse } from 'next/server';

const ZEROX_API_URL = 'https://api.0x.org';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sellToken = searchParams.get('sellToken');
  const buyToken = searchParams.get('buyToken');
  const sellAmount = searchParams.get('sellAmount');

  if (!sellToken || !buyToken || !sellAmount) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const apiKey = process.env.ZEROX_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: '0x API key not configured' },
      { status: 500 }
    );
  }

  // Use 0x API v1 for price quotes
  const params = new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount,
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    '0x-api-key': apiKey,
  };

  try {
    const response = await fetch(
      `${ZEROX_API_URL}/swap/v1/price?${params.toString()}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.reason || data.validationErrors?.[0]?.reason || 'Failed to fetch price' },
        { status: response.status }
      );
    }

    // v1 response format
    return NextResponse.json({
      sellToken: data.sellTokenAddress,
      buyToken: data.buyTokenAddress,
      sellAmount: data.sellAmount,
      buyAmount: data.buyAmount,
      price: data.price,
      estimatedGas: data.estimatedGas,
      sources: data.sources,
    });
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
