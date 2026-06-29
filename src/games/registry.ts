import type { ComponentType } from 'react'
import { Tetris } from './tetris/Tetris'

export type GameStatus = 'playable' | 'wip'

export type Game = {
  id: string
  name: string
  tagline: string
  emoji: string
  accent: string
  status: GameStatus
  component: ComponentType
}

export const GAMES: ReadonlyArray<Game> = [
  {
    id: 'tetris',
    name: 'Tetris',
    tagline: 'Stack blocks, clear lines, accept gravity.',
    emoji: '🧱',
    accent: 'from-cyan-400 to-fuchsia-500',
    status: 'playable',
    component: Tetris,
  },
]

export function findGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id)
}
