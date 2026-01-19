'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt, useReadContract, useWriteContract, useSignTypedData, useChainId } from 'wagmi';
import { erc20Abi, concat, numberToHex, size } from 'viem';
import { Token, getTokensByChain } from '@/lib/tokens';
import { getSwapPrice, getSwapTransaction, formatTokenAmount, parseTokenAmount, isNativeEth } from '@/lib/swap';
import { TokenSelector } from './TokenSelector';
import { ConnectButton } from './ConnectButton';

// Permit2 contract for 0x v2 approvals
const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3' as `0x${string}`;

const SLIPPAGE_PRESETS = [0.5, 1, 3];

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const tokens = getTokensByChain(chainId);
  const [sellToken, setSellToken] = useState<Token>(tokens[0]);
  const [buyToken, setBuyToken] = useState<Token>(tokens[1] || tokens[0]);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [quote, setQuote] = useState<{ price: string; estimatedGas: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(0.5); // Default 0.5%
  const [customSlippage, setCustomSlippage] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [isUsdMode, setIsUsdMode] = useState(false);
  const [usdAmount, setUsdAmount] = useState('');

  // Reset tokens when chain changes
  useEffect(() => {
    const newTokens = getTokensByChain(chainId);
    setSellToken(newTokens[0]);
    setBuyToken(newTokens[1] || newTokens[0]);
    setSellAmount('');
    setBuyAmount('');
    setQuote(null);
    setError(null);
  }, [chainId]);

  // Fetch ETH price for USD conversions
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const res = await fetch('/api/swap/price?sellToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&buyToken=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&sellAmount=1000000000000000000');
        const data = await res.json();
        if (data.buyAmount) {
          setEthPrice(parseFloat(data.buyAmount) / 1e6);
        }
      } catch {
        setEthPrice(3300);
      }
    };
    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: sellTokenBalance } = useBalance({
    address: address,
    token: isNativeEth(sellToken.address) ? undefined : sellToken.address as `0x${string}`,
  });

  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Check token allowance for Permit2 contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: isNativeEth(sellToken.address) ? undefined : sellToken.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, PERMIT2_ADDRESS] : undefined,
  });

  const { writeContractAsync: approveToken, isPending: isApproving } = useWriteContract();
  const { sendTransactionAsync, data: txHash } = useSendTransaction();
  const { signTypedDataAsync } = useSignTypedData();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (txHash) {
      setIsSwapping(false);
    }
  }, [txHash]);

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
        chainId,
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

  // Check if approval is needed
  const needsApproval = useCallback(() => {
    if (isNativeEth(sellToken.address)) return false;
    if (!sellAmount || parseFloat(sellAmount) === 0) return false;
    if (allowance === undefined) return false;

    const sellAmountWei = BigInt(parseTokenAmount(sellAmount, sellToken.decimals));
    return allowance < sellAmountWei;
  }, [sellToken.address, sellAmount, sellToken.decimals, allowance]);

  const getUsdValue = useCallback((amount: string, token: Token): string => {
    if (!amount || parseFloat(amount) === 0 || !ethPrice) return '';

    const numAmount = parseFloat(amount);
    let usdValue = 0;

    if (isNativeEth(token.address) || token.symbol === 'WETH') {
      usdValue = numAmount * ethPrice;
    } else if (token.symbol === 'USDC' || token.symbol === 'USDT' || token.symbol === 'DAI') {
      usdValue = numAmount;
    } else if (token.symbol === 'WBTC') {
      usdValue = numAmount * ethPrice * 20;
    } else {
      return '';
    }

    return usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }, [ethPrice]);

  // Convert USD amount to token amount
  const getTokenFromUsd = useCallback((usdValue: string, token: Token): string => {
    if (!usdValue || parseFloat(usdValue) === 0 || !ethPrice) return '';

    const usd = parseFloat(usdValue);
    let tokenAmount = 0;

    if (isNativeEth(token.address) || token.symbol === 'WETH') {
      tokenAmount = usd / ethPrice;
    } else if (token.symbol === 'USDC' || token.symbol === 'USDT' || token.symbol === 'DAI') {
      tokenAmount = usd;
    } else if (token.symbol === 'WBTC') {
      tokenAmount = usd / (ethPrice * 20);
    } else {
      return '';
    }

    return tokenAmount.toString();
  }, [ethPrice]);

  // Handle USD input changes
  const handleUsdChange = useCallback((value: string) => {
    setUsdAmount(value);
    const tokenValue = getTokenFromUsd(value, sellToken);
    if (tokenValue) {
      setSellAmount(tokenValue);
    } else {
      setSellAmount('');
    }
  }, [getTokenFromUsd, sellToken]);

  const estimatedGasCostUsd = useCallback((): string => {
    const approvalGas = 50000;
    const gasPrice = 30;
    const ethCost = (approvalGas * gasPrice) / 1e9;
    const usdCost = ethCost * ethPrice;
    return usdCost.toFixed(2);
  }, [ethPrice]);

  const handleApprove = async () => {
    if (!address) return;

    if (!sellTokenBalance?.value || sellTokenBalance.value === BigInt(0)) {
      setError(`You don't have any ${sellToken.symbol} to swap`);
      return;
    }

    if (!ethBalance?.value || ethBalance.value === BigInt(0)) {
      setError(`You need ETH to pay for gas (~$${estimatedGasCostUsd()}). Send some ETH to your wallet first.`);
      return;
    }

    setIsSwapping(true);
    setError(null);

    try {
      const approvalAmount = BigInt('0xffffffffffffffffffffffffffffffff');

      await approveToken({
        address: sellToken.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [PERMIT2_ADDRESS, approvalAmount],
      });

      setTimeout(() => refetchAllowance(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      setError(message);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwap = async () => {
    if (!address || !sellAmount || parseFloat(sellAmount) === 0) return;

    if (!ethBalance?.value || ethBalance.value === BigInt(0)) {
      setError(`You need ETH to pay for gas (~$${estimatedGasCostUsd()}). Send some ETH to your wallet first.`);
      return;
    }

    if (needsApproval()) {
      await handleApprove();
      return;
    }

    setIsSwapping(true);
    setError(null);

    try {
      const sellAmountWei = parseTokenAmount(sellAmount, sellToken.decimals);

      // Ensure minimum slippage of 0.01% (1 bps) - 0x API requirement
      const effectiveSlippage = Math.max(0.01, slippage);

      const swapTx = await getSwapTransaction({
        sellToken,
        buyToken,
        sellAmount: sellAmountWei,
        takerAddress: address,
        slippagePercentage: effectiveSlippage / 100, // Convert percentage to decimal
        chainId,
      });

      if (!swapTx.to || !swapTx.data) {
        throw new Error('Invalid transaction data from API');
      }

      let txData = swapTx.data as `0x${string}`;

      // For ERC-20 sells, we need to sign permit2 data and append signature
      if (!isNativeEth(sellToken.address) && swapTx.permit2?.eip712) {
        const permit2Data = swapTx.permit2.eip712;

        // Sign the permit2 typed data
        const signature = await signTypedDataAsync({
          types: permit2Data.types,
          primaryType: permit2Data.primaryType,
          domain: permit2Data.domain,
          message: permit2Data.message,
        });

        // Append signature length and signature to transaction data
        const signatureLength = numberToHex(size(signature), { size: 32 });
        txData = concat([txData, signatureLength, signature]);
      }

      await sendTransactionAsync({
        to: swapTx.to as `0x${string}`,
        data: txData,
        value: BigInt(swapTx.value || '0'),
        gas: swapTx.gas ? BigInt(swapTx.gas) : undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Swap failed';
      setError(message);
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

  const hasInsufficientBalance = useCallback(() => {
    if (!sellAmount || parseFloat(sellAmount) === 0) return false;
    if (!sellTokenBalance?.value) return false;
    const sellAmountWei = BigInt(parseTokenAmount(sellAmount, sellToken.decimals));
    return sellTokenBalance.value < sellAmountWei;
  }, [sellAmount, sellToken.decimals, sellTokenBalance?.value]);

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (isApproving) return 'Approving...';
    if (isSwapping) return 'Confirm in Wallet...';
    if (isConfirming) return 'Swapping...';
    if (isLoading) return 'Fetching Quote...';
    if (!sellAmount || parseFloat(sellAmount) === 0) return 'Enter Amount';
    if (hasInsufficientBalance()) return `Insufficient ${sellToken.symbol}`;
    if (needsApproval()) return `Approve ${sellToken.symbol}`;
    if (error) return 'Swap Anyway';
    return 'Swap';
  };

  const isButtonDisabled = () => {
    if (!isConnected) return false;
    if (isSwapping || isConfirming || isLoading || isApproving) return true;
    if (!sellAmount || parseFloat(sellAmount) === 0) return true;
    if (hasInsufficientBalance()) return true;
    return false;
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Swap</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${showSettings ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
        >
          <span>{slippage === 0.5 ? 'Auto' : ''} {slippage}%</span>
          <svg className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Slippage Settings */}
      {showSettings && (
        <div className="mb-4 rounded-xl bg-zinc-800/50 p-4">
          <div className="mb-3 text-sm font-medium text-zinc-300">Slippage Tolerance</div>
          <div className="flex items-center gap-2">
            {SLIPPAGE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setSlippage(preset);
                  setCustomSlippage('');
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  slippage === preset && !customSlippage
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                {preset}%
              </button>
            ))}
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Custom"
                value={customSlippage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                    setCustomSlippage(value);
                    const num = parseFloat(value);
                    if (!isNaN(num) && num > 0 && num <= 50) {
                      setSlippage(num);
                    }
                  }
                }}
                className="w-full rounded-lg bg-zinc-700 px-3 py-1.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-purple-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">%</span>
            </div>
          </div>
          {slippage > 5 && (
            <div className="mt-2 text-xs text-yellow-500">
              High slippage may result in unfavorable trades
            </div>
          )}
          {slippage < 0.01 && (
            <div className="mt-2 text-xs text-zinc-500">
              Minimum slippage is 0.01% (1 basis point)
            </div>
          )}
        </div>
      )}

      {/* Sell Section */}
      <div className="rounded-xl bg-zinc-800/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-400">You pay</span>
          <div className="flex items-center gap-2">
            {isConnected && sellTokenBalance?.value !== undefined && (
              <button
                onClick={handleMaxClick}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Balance: {formatTokenAmount(sellTokenBalance.value.toString(), sellToken.decimals)} {sellToken.symbol}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {isUsdMode ? (
              <>
                <div className="flex items-center">
                  <span className="text-3xl font-medium text-zinc-500">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={usdAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                        handleUsdChange(value);
                      }
                    }}
                    className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder:text-zinc-600"
                  />
                </div>
                {sellAmount && parseFloat(sellAmount) > 0 && (
                  <div className="mt-1 text-sm text-zinc-500">
                    {parseFloat(sellAmount).toFixed(6)} {sellToken.symbol}
                  </div>
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={sellAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                      setSellAmount(value);
                      setUsdAmount('');
                    }
                  }}
                  className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder:text-zinc-600"
                />
                {sellAmount && parseFloat(sellAmount) > 0 && (
                  <div className="mt-1 text-sm text-zinc-500">
                    {getUsdValue(sellAmount, sellToken)}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <TokenSelector
              selectedToken={sellToken}
              onSelect={(token) => {
                setSellToken(token);
                if (isUsdMode && usdAmount) {
                  handleUsdChange(usdAmount);
                }
              }}
              excludeToken={buyToken}
              tokens={tokens}
            />
            <button
              onClick={() => {
                setIsUsdMode(!isUsdMode);
                if (!isUsdMode && sellAmount) {
                  // Switching to USD mode - calculate USD value
                  const usdVal = getUsdValue(sellAmount, sellToken);
                  const numericUsd = usdVal.replace(/[^0-9.]/g, '');
                  setUsdAmount(numericUsd);
                } else if (isUsdMode) {
                  // Switching to token mode - clear USD amount
                  setUsdAmount('');
                }
              }}
              className="rounded-lg bg-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-600 hover:text-white transition-colors"
            >
              {isUsdMode ? sellToken.symbol : 'USD'}
            </button>
          </div>
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
          <div className="flex-1">
            <input
              type="text"
              placeholder="0"
              value={buyAmount}
              readOnly
              className="w-full bg-transparent text-3xl font-medium text-white outline-none placeholder:text-zinc-600"
            />
            {buyAmount && parseFloat(buyAmount) > 0 && (
              <div className="mt-1 text-sm text-zinc-500">
                {getUsdValue(buyAmount, buyToken)}
              </div>
            )}
          </div>
          <TokenSelector
            selectedToken={buyToken}
            onSelect={setBuyToken}
            excludeToken={sellToken}
            tokens={tokens}
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
