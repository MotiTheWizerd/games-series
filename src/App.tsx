import { Home } from './Home'
import { findGame } from './games/registry'
import { navigate, useHashRoute } from './router'

export function App() {
  const route = useHashRoute()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <RouteView route={route} />
    </div>
  )
}

function RouteView({ route }: { route: string }) {
  if (route === '/' || route === '') return <Home />

  const id = route.replace(/^\//, '')
  const game = findGame(id)

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-24 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-zinc-400">No game called "{id}" — yet.</p>
        <button
          onClick={() => navigate('/')}
          className="self-start text-sm text-fuchsia-400 hover:text-fuchsia-300 transition"
        >
          ← all games
        </button>
      </div>
    )
  }

  const GameComponent = game.component
  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          ← all games
        </button>
        <div className="text-sm text-zinc-300">{game.name}</div>
        <div className="w-20" />
      </header>
      <main className="flex justify-center">
        <GameComponent />
      </main>
    </>
  )
}
