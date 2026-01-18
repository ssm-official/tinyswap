import { ConnectButton } from '@/components/ConnectButton';
import { SwapCard } from '@/components/SwapCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">SilverTable</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">
              Swap Tokens
            </h1>
            <p className="text-zinc-400">
              Get the best rates across decentralized exchanges
            </p>
          </div>
          <SwapCard />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-4">
          <p className="text-sm text-zinc-500">
            Powered by 0x Protocol
          </p>
        </div>
      </footer>
    </div>
  );
}
