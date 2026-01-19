'use client';

import { useState, useRef, useEffect } from 'react';
import { Token } from '@/lib/tokens';

interface TokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
  tokens: Token[];
}

export function TokenSelector({
  selectedToken,
  onSelect,
  excludeToken,
  tokens,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTokens = tokens.filter((token) => {
    if (excludeToken && token.address === excludeToken.address) {
      return false;
    }
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower)
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
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
          <input
            type="text"
            placeholder="Search tokens..."
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
                  selectedToken.address === token.address
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
                <div className="text-left">
                  <div className="font-medium text-white">{token.symbol}</div>
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
        </div>
      )}
    </div>
  );
}
