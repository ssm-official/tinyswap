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

  // Convert slippage from decimal (0.01) to bps (100)
  const slippageBps = Math.round(parseFloat(slippagePercentage) * 10000).toString();

  const params = new URLSearchParams({
    chainId: '1', // Ethereum mainnet
    sellToken,
    buyToken,
    sellAmount,
    slippageBps,
  });

  if (takerAddress) {
    params.append('taker', takerAddress);
  }

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
      `${ZEROX_API_URL}/swap/permit2/quote?${params.toString()}`,
      { headers }
    );

    const data = await response.json();

    // Debug logging
    console.log('0x API response keys:', Object.keys(data));
    console.log('permit2 data:', JSON.stringify(data.permit2, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.reason || data.message || 'Failed to fetch quote' },
        { status: response.status }
      );
    }

    // Transform v2 response to include transaction data
    const transformedData = {
      sellToken: data.sellToken,
      buyToken: data.buyToken,
      sellAmount: data.sellAmount,
      buyAmount: data.buyAmount,
      minBuyAmount: data.minBuyAmount,
      price: (parseFloat(data.buyAmount) / parseFloat(data.sellAmount)).toString(),
      estimatedGas: data.gas,
      gas: data.gas,
      gasPrice: data.gasPrice,
      to: data.transaction?.to,
      data: data.transaction?.data,
      value: data.transaction?.value,
      allowanceTarget: data.allowanceTarget,
      permit2: data.permit2,
      sources: data.route?.fills?.map((f: { source: string; proportionBps: string }) => ({
        name: f.source,
        proportion: (parseInt(f.proportionBps) / 10000).toString(),
      })) || [],
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
