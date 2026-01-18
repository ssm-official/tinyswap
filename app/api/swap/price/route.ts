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

  const params = new URLSearchParams({
    chainId: '1', // Ethereum mainnet
    sellToken,
    buyToken,
    sellAmount,
  });

  // Add integrator fee if configured
  const feeRecipient = process.env.FEE_RECIPIENT;
  const feeBps = process.env.FEE_BPS;
  if (feeRecipient && feeBps) {
    params.append('swapFeeRecipient', feeRecipient);
    params.append('swapFeeBps', feeBps);
    params.append('swapFeeToken', buyToken); // Take fee in the output token
  }

  const apiKey = process.env.ZEROX_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: '0x API key not configured' },
      { status: 500 }
    );
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    '0x-api-key': apiKey,
    '0x-version': 'v2',
  };

  try {
    const response = await fetch(
      `${ZEROX_API_URL}/swap/permit2/price?${params.toString()}`,
      { headers }
    );

    const data = await response.json();
    console.log('0x API raw response:', JSON.stringify(data, null, 2).slice(0, 1000));

    if (!response.ok) {
      console.error('0x API error:', data);
      return NextResponse.json(
        { error: data.reason || data.message || 'Failed to fetch price' },
        { status: response.status }
      );
    }

    // Transform v2 response to match expected format
    const transformedData = {
      sellToken: data.sellToken,
      buyToken: data.buyToken,
      sellAmount: data.sellAmount,
      buyAmount: data.buyAmount,
      price: data.buyAmount && data.sellAmount
        ? (parseFloat(data.buyAmount) / parseFloat(data.sellAmount)).toString()
        : '0',
      estimatedGas: data.gas || '0',
      gasPrice: data.gasPrice || '0',
      sources: data.route?.fills?.map((f: { source: string; proportionBps: string }) => ({
        name: f.source,
        proportion: (parseInt(f.proportionBps) / 10000).toString(),
      })) || [],
    };

    console.log('Transformed response:', transformedData);
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}
