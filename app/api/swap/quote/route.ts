import { NextRequest, NextResponse } from 'next/server';

const ZEROX_API_KEY = process.env.ZEROX_API_KEY || '';
const FEE_RECIPIENT = process.env.FEE_RECIPIENT || '';
const FEE_BPS = process.env.FEE_BPS || '0';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sellToken = searchParams.get('sellToken');
  const buyToken = searchParams.get('buyToken');
  const sellAmount = searchParams.get('sellAmount');
  const takerAddress = searchParams.get('takerAddress');
  const slippagePercentage = searchParams.get('slippagePercentage') || '0.01';
  const chainId = searchParams.get('chainId') || '1';

  if (!sellToken || !buyToken || !sellAmount) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Convert slippage: 0.01 = 1% = 100 bps
    // 0x API requires integer bps, minimum 1 bps (0.01%)
    const slippageBps = Math.max(1, Math.round(parseFloat(slippagePercentage) * 10000));

    const params = new URLSearchParams({
      chainId,
      sellToken,
      buyToken,
      sellAmount,
      slippageBps: slippageBps.toString(),
    });

    if (takerAddress) {
      params.append('taker', takerAddress);
    }

    // Add fee parameters if configured
    if (FEE_RECIPIENT && FEE_BPS && parseInt(FEE_BPS) > 0) {
      params.append('swapFeeRecipient', FEE_RECIPIENT);
      params.append('swapFeeBps', FEE_BPS);
      params.append('swapFeeToken', buyToken); // Take fee from output token
    }

    const response = await fetch(
      `https://api.0x.org/swap/permit2/quote?${params.toString()}`,
      {
        headers: {
          '0x-api-key': ZEROX_API_KEY,
          '0x-version': 'v2',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('0x quote error:', data);
      return NextResponse.json(
        { error: data.reason || data.message || 'Failed to fetch quote' },
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
      gas: data.gas,
      gasPrice: data.gasPrice,
      to: data.transaction?.to,
      data: data.transaction?.data,
      value: data.transaction?.value || '0',
      allowanceTarget: data.allowanceTarget,
      // Permit2 signature data (only present for ERC-20 sells)
      permit2: data.permit2,
    });
  } catch (error) {
    console.error('0x quote error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
