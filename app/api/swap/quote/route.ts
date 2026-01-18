import { NextRequest, NextResponse } from 'next/server';

const ZEROX_API_URL = 'https://api.0x.org';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sellToken = searchParams.get('sellToken');
  const buyToken = searchParams.get('buyToken');
  const sellAmount = searchParams.get('sellAmount');
  const takerAddress = searchParams.get('takerAddress');
  const slippagePercentage = searchParams.get('slippagePercentage') || '0.01';

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

  // Use 0x API v1 (simpler approval flow, no permit2 signatures needed)
  const params = new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount,
    slippagePercentage,
  });

  if (takerAddress) {
    params.append('takerAddress', takerAddress);
  }

  // Add integrator fee if configured
  const feeRecipient = process.env.FEE_RECIPIENT;
  const feeBps = process.env.FEE_BPS;
  if (feeRecipient && feeBps) {
    params.append('feeRecipient', feeRecipient);
    params.append('buyTokenPercentageFee', (parseInt(feeBps) / 10000).toString());
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    '0x-api-key': apiKey,
  };

  try {
    const response = await fetch(
      `${ZEROX_API_URL}/swap/v1/quote?${params.toString()}`,
      { headers }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.reason || data.validationErrors?.[0]?.reason || 'Failed to fetch quote' },
        { status: response.status }
      );
    }

    // v1 response format - direct transaction data
    return NextResponse.json({
      sellToken: data.sellTokenAddress,
      buyToken: data.buyTokenAddress,
      sellAmount: data.sellAmount,
      buyAmount: data.buyAmount,
      price: data.price,
      estimatedGas: data.estimatedGas,
      gas: data.gas,
      gasPrice: data.gasPrice,
      to: data.to,
      data: data.data,
      value: data.value,
      allowanceTarget: data.allowanceTarget,
      sources: data.sources,
    });
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
