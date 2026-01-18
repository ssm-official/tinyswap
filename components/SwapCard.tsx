'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Token, TOKENS, NATIVE_ETH_ADDRESS } from '@/lib/tokens';
import { getSwapPrice, getSwapTransaction, formatTokenAmount, parseTokenAmount, isNativeEth } from '@/lib/swap';
import { TokenSelector } from './TokenSelector';
import { ConnectButton } from './ConnectButton';

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const [sellToken, setSellToken] = useState<Token>(TOKENS[0]); // ETH
  const [buyToken, setBuyToken] = useState<Token>(TOKENS[2]); // USDC
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [quote, setQuote] = useState<{ price: string; estimatedGas: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const { data: sellTokenBalance } = useBalance({
    address: address,
    token: isNativeEth(sellToken.address) ? undefined : sellToken.address as `0x${string}`,
  });

  const { sendTransaction, data: txHash } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch quote when sell amount changes
  const fetchQuote = useCallback(async () => {
    if (!sellAmount || parseFloat(sellAmount) === 0) {
      setBuyAmount('');
      setQuote(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sellAmountWei = parseTokenAmount(sellAmount, sellToken.decimals);

      const quoteData = await getSwapPrice({
        sellToken,
        buyToken,
        sellAmount: sellAmountWei,
        takerAddress: address,
      });

      if (!quoteData.buyAmount) {
        throw new Error('No quote available for this pair');
      }

      setBuyAmount(formatTokenAmount(quoteData.buyAmount, buyToken.decimals));
      setQuote({
        price: quoteData.price || '0',
        estimatedGas: quoteData.estimatedGas || '0',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch quote';
      setError(message);
      setBuyAmount('');
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [sellAmount, sellToken, buyToken, address]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchQuote]);

  const handleSwapTokens = () => {
    const tempToken = sellToken;
    const tempAmount = sellAmount;
    setSellToken(buyToken);
    setBuyToken(tempToken);
    setSellAmount(buyAmount);
    setBuyAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!address || !sellAmount || parseFloat(sellAmount) === 0) return;

    setIsSwapping(true);
    setError(null);

    try {
      const sellAmountWei = parseTokenAmount(sellAmount, sellToken.decimals);

      const swapTx = await getSwapTransaction({
        sellToken,
        buyToken,
        sellAmount: sellAmountWei,
        takerAddress: address,
        slippagePercentage: 0.01,
      });

      sendTransaction({
        to: swapTx.to as `0x${string}`,
        data: swapTx.data as `0x${string}`,
        value: isNativeEth(sellToken.address) ? BigInt(swapTx.value || '0') : BigInt(0),
        gas: swapTx.gas ? BigInt(swapTx.gas) : undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Swap failed';
      setError(message);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleMaxClick = () => {
    if (sellTokenBalance?.value !== undefined) {
      const maxAmount = formatTokenAmount(
        sellTokenBalance.value.toString(),
        sellToken.decimals
      );
      setSellAmount(maxAmount);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isSwapping || isConfirming) return 'Swapping...';
    if (isLoading) return 'Fetching Quote...';
    if (!sellAmount || parseFloat(sellAmount) === 0) return 'Enter Amount';
    if (error) return 'Swap Anyway';
    return 'Swap';
  };

  const isButtonDisabled = () => {
    if (!isConnected) return false;
    if (isSwapping || isConfirming || isLoading) return true;
    if (!sellAmount || parseFloat(sellAmount) === 0) return true;
    return false;
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Swap</h2>
        <button className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Sell Section */}
      <div className="rounded-xl bg-zinc-800/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-400">You pay</span>
          {isConnected && sellTokenBalance?.value !== undefined && (
            <button
              onClick={handleMaxClick}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Balance: {formatTokenAmount(sellTokenBalance.value.toString(), sellToken.decimals)} {sellToken.symbol}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={sellAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                setSellAmount(value);
              }
            }}
            className="flex-1 bg-transparent text-3xl font-medium text-white outline-none placeholder:text-zinc-600"
          />
          <TokenSelector
            selectedToken={sellToken}
            onSelect={setSellToken}
            excludeToken={buyToken}
          />
        </div>
      </div>

      {/* Swap Direction Button */}
      <div className="relative z-10 -my-3 flex justify-center">
        <button
          onClick={handleSwapTokens}
          className="rounded-xl border-4 border-zinc-900 bg-zinc-800 p-2 text-zinc-400 transition-all hover:bg-zinc-700 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>
      </div>

      {/* Buy Section */}
      <div className="rounded-xl bg-zinc-800/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-400">You receive</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="0"
            value={buyAmount}
            readOnly
            className="flex-1 bg-transparent text-3xl font-medium text-white outline-none placeholder:text-zinc-600"
          />
          <TokenSelector
            selectedToken={buyToken}
            onSelect={setBuyToken}
            excludeToken={sellToken}
          />
        </div>
      </div>

      {/* Quote Info */}
      {quote && sellAmount && parseFloat(sellAmount) > 0 && (
        <div className="mt-4 space-y-2 rounded-xl bg-zinc-800/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Rate</span>
            <span className="text-white">
              1 {sellToken.symbol} = {parseFloat(quote.price || '0').toFixed(6)} {buyToken.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Est. Gas</span>
            <span className="text-white">{parseInt(quote.estimatedGas || '0').toLocaleString()} units</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Success Message */}
      {isConfirmed && (
        <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-sm text-green-400">
          Swap successful! Transaction confirmed.
        </div>
      )}

      {/* Swap Button */}
      <div className="mt-4">
        {!isConnected ? (
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        ) : (
          <button
            onClick={handleSwap}
            disabled={isButtonDisabled()}
            className={`w-full rounded-xl py-4 text-lg font-semibold transition-all ${
              isButtonDisabled()
                ? 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  );
}
