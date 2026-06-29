import { GAMES } from './games/registry'
import { navigate } from './router'

export function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
      <header className="flex flex-col gap-3 mb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">a series of</p>
        <h1 className="text-6xl font-bold tracking-tight">
          🎮{' '}
          <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            games
          </span>
        </h1>
        <p className="text-zinc-400 mt-2 max-w-lg">
          Tiny games built by Moti &amp; Claude. One folder per game, no framework, no fluff.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate(`/${g.id}`)}
            className="group text-left rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-900 p-5 transition"
          >
            <div className={`h-1 rounded-full bg-gradient-to-r ${g.accent} mb-4 opacity-80 group-hover:opacity-100 transition`} />
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{g.emoji}</div>
              <span
                className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                  g.status === 'playable'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-zinc-700/40 text-zinc-400'
                }`}
              >
                {g.status}
              </span>
            </div>
            <h2 className="text-2xl font-semibold mb-1">{g.name}</h2>
            <p className="text-sm text-zinc-400">{g.tagline}</p>
            <div className="mt-4 text-xs text-zinc-500 group-hover:text-zinc-200 transition">
              play →
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-20 text-xs text-zinc-600">
        session 1 · more games dropping soon
      </footer>
    </div>
  )
}
