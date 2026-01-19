import { NextRequest, NextResponse } from 'next/server';

const ZEROX_API_KEY = process.env.ZEROX_API_KEY || '';

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

    const response = await fetch(
      `https://api.0x.org/swap/permit2/price?${params.toString()}`,
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
