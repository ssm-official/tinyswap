'use client';

import { useState, useRef, useEffect } from 'react';
import { useReadContracts } from 'wagmi';
import { erc20Abi, isAddress } from 'viem';
import { Token, saveCustomToken, getCustomTokens } from '@/lib/tokens';

interface TokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
  tokens: Token[];
  chainId: number;
  onTokensChange?: () => void;
}

export function TokenSelector({
  selectedToken,
  onSelect,
  excludeToken,
  tokens,
  chainId,
  onTokensChange,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load custom tokens on mount and chain change
  useEffect(() => {
    setCustomTokens(getCustomTokens(chainId));
  }, [chainId]);

  // Validate address format
  useEffect(() => {
    setIsValidAddress(isAddress(tokenAddress));
  }, [tokenAddress]);

  // Fetch token metadata from blockchain
  const { data: tokenData, isLoading: isFetchingToken } = useReadContracts({
    contracts: isValidAddress ? [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ] : undefined,
    query: {
      enabled: isValidAddress,
    },
  });

  const fetchedToken: Token | null = tokenData && tokenData[0].result && tokenData[1].result && tokenData[2].result
    ? {
        address: tokenAddress,
        name: tokenData[0].result as string,
        symbol: tokenData[1].result as string,
        decimals: tokenData[2].result as number,
        logoURI: `https://ui-avatars.com/api/?name=${tokenData[1].result}&background=random`,
      }
    : null;

  // Check if token already exists in list
  const tokenExists = fetchedToken && [...tokens, ...customTokens].some(
    (t) => t.address.toLowerCase() === fetchedToken.address.toLowerCase()
  );

  const allTokens = [...tokens, ...customTokens];

  const filteredTokens = allTokens.filter((token) => {
    if (excludeToken && token.address.toLowerCase() === excludeToken.address.toLowerCase()) {
      return false;
    }
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower) ||
        token.address.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowAddToken(false);
        setTokenAddress('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToken = () => {
    if (fetchedToken && !tokenExists) {
      saveCustomToken(chainId, fetchedToken);
      setCustomTokens(getCustomTokens(chainId));
      setTokenAddress('');
      setShowAddToken(false);
      onTokensChange?.();
    }
  };

  const isCustomToken = (address: string) => {
    return customTokens.some((t) => t.address.toLowerCase() === address.toLowerCase());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-zinc-800 px-3 py-2 font-medium text-white transition-all hover:bg-zinc-700"
      >
        <img
          src={selectedToken.logoURI}
          alt={selectedToken.symbol}
          className="h-6 w-6 rounded-full"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${selectedToken.symbol}&background=random`;
          }}
        />
        <span>{selectedToken.symbol}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
          {!showAddToken ? (
            <>
              <input
                type="text"
                placeholder="Search name or paste address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-purple-500"
                autoFocus
              />

              <div className="max-h-64 space-y-1 overflow-y-auto">
                {filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      onSelect(token);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-zinc-800 ${
                      selectedToken.address.toLowerCase() === token.address.toLowerCase()
                        ? 'bg-zinc-800'
                        : ''
                    }`}
                  >
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="h-8 w-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random`;
                      }}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{token.symbol}</span>
                        {isCustomToken(token.address) && (
                          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-400">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-zinc-500">{token.name}</div>
                    </div>
                  </button>
                ))}

                {filteredTokens.length === 0 && (
                  <div className="py-4 text-center text-zinc-500">
                    No tokens found
                  </div>
                )}
              </div>

              {/* Add Token Button */}
              <button
                onClick={() => setShowAddToken(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-2.5 text-sm text-zinc-400 transition-colors hover:border-purple-500 hover:text-purple-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Custom Token
              </button>
            </>
          ) : (
            <>
              {/* Add Token View */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => {
                    setShowAddToken(false);
                    setTokenAddress('');
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-medium text-white">Add Custom Token</span>
              </div>

              <input
                type="text"
                placeholder="Token contract address (0x...)"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-purple-500 font-mono"
                autoFocus
              />

              {/* Loading State */}
              {isFetchingToken && isValidAddress && (
                <div className="flex items-center justify-center py-4 text-zinc-400">
                  <svg className="h-5 w-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching token info...
                </div>
              )}

              {/* Invalid Address */}
              {tokenAddress && !isValidAddress && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                  Invalid address format
                </div>
              )}

              {/* Token Preview */}
              {fetchedToken && !isFetchingToken && (
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={fetchedToken.logoURI}
                      alt={fetchedToken.symbol}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-white">{fetchedToken.symbol}</div>
                      <div className="text-sm text-zinc-500">{fetchedToken.name}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono break-all mb-3">
                    {fetchedToken.address}
                  </div>
                  <div className="text-xs text-zinc-500 mb-3">
                    Decimals: {fetchedToken.decimals}
                  </div>

                  {tokenExists ? (
                    <div className="text-sm text-yellow-500">
                      Token already in your list
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToken}
                      className="w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                    >
                      Add Token
                    </button>
                  )}
                </div>
              )}

              {/* No Token Found */}
              {isValidAddress && !isFetchingToken && !fetchedToken && tokenAddress && (
                <div className="rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-400">
                  Could not find token. Make sure you&apos;re on the correct network.
                </div>
              )}

              <div className="mt-3 text-xs text-zinc-500">
                Only add tokens you trust. Anyone can create a token with any name.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
