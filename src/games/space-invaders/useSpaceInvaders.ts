import { useCallback, useEffect, useReducer, useRef } from 'react'
import {
  createInvaders,
  enemyShootRate,
  invaderMoveRate,
  invadersReachedPlayer,
  moveBullets,
  randomEnemyShoot,
  resolveEnemyBullets,
  resolvePlayerBullets,
  stepInvaders,
} from './engine'
import {
  PLAY_W,
  PLAYER_SHOOT_COOLDOWN,
  PLAYER_SPEED,
  PLAYER_W,
  PLAYER_Y,
  type GameState,
} from './types'

const BEST_KEY = 'space-invaders:best'

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function writeBest(n: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(n))
  } catch {}
}

function initialState(best: number): GameState {
  const invaders = createInvaders()
  const aliveCount = invaders.length
  return {
    playerX: PLAY_W / 2 - PLAYER_W / 2,
    invaders,
    bullets: [],
    invaderDir: 1,
    invaderTickLeft: invaderMoveRate(aliveCount),
    score: 0,
    best,
    lives: 3,
    status: 'playing',
    nextId: 1000,
    playerShootCooldown: 0,
    enemyShootCooldown: enemyShootRate(aliveCount),
  }
}

type Keys = { left: boolean; right: boolean; shoot: boolean }

type Action =
  | { type: 'tick'; keys: Keys }
  | { type: 'toggle-pause' }
  | { type: 'restart' }

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'restart') return initialState(state.best)

  if (action.type === 'toggle-pause') {
    if (state.status === 'gameover' || state.status === 'victory') return state
    return { ...state, status: state.status === 'playing' ? 'paused' : 'playing' }
  }

  if (state.status !== 'playing') return state

  const { keys } = action
  let {
    playerX,
    invaders,
    bullets,
    invaderDir,
    invaderTickLeft,
    score,
    lives,
    nextId,
    playerShootCooldown,
    enemyShootCooldown,
  } = state

  // move player
  if (keys.left) playerX = Math.max(0, playerX - PLAYER_SPEED)
  if (keys.right) playerX = Math.min(PLAY_W - PLAYER_W, playerX + PLAYER_SPEED)

  // player shoot
  if (keys.shoot && playerShootCooldown <= 0) {
    bullets = [
      ...bullets,
      { id: nextId++, x: playerX + PLAYER_W / 2, y: PLAYER_Y, fromPlayer: true },
    ]
    playerShootCooldown = PLAYER_SHOOT_COOLDOWN
  } else {
    playerShootCooldown = Math.max(0, playerShootCooldown - 1)
  }

  // move all bullets
  bullets = moveBullets(bullets)

  // enemy shoot on cooldown
  enemyShootCooldown--
  if (enemyShootCooldown <= 0) {
    const newBullet = randomEnemyShoot(invaders, nextId++)
    if (newBullet) bullets = [...bullets, newBullet]
    enemyShootCooldown = enemyShootRate(invaders.filter((i) => i.alive).length)
  }

  // step invader formation on sub-tick
  invaderTickLeft--
  if (invaderTickLeft <= 0) {
    const result = stepInvaders(invaders, invaderDir)
    invaders = result.invaders
    invaderDir = result.dir
    invaderTickLeft = invaderMoveRate(invaders.filter((i) => i.alive).length)
  }

  // resolve collisions
  const playerHits = resolvePlayerBullets(bullets, invaders)
  bullets = playerHits.bullets
  invaders = playerHits.invaders
  score += playerHits.scored

  const enemyHits = resolveEnemyBullets(bullets, playerX)
  bullets = enemyHits.bullets
  if (enemyHits.hit) lives--

  // win / lose
  const aliveCount = invaders.filter((i) => i.alive).length

  if (aliveCount === 0) {
    const best = Math.max(state.best, score)
    if (best > state.best) writeBest(best)
    return { ...state, playerX, invaders, bullets, score, lives, nextId, playerShootCooldown, enemyShootCooldown, invaderDir, invaderTickLeft, status: 'victory', best }
  }

  if (lives <= 0 || invadersReachedPlayer(invaders)) {
    const best = Math.max(state.best, score)
    if (best > state.best) writeBest(best)
    return { ...state, playerX, invaders, bullets, score, lives: Math.max(0, lives), nextId, playerShootCooldown, enemyShootCooldown, invaderDir, invaderTickLeft, status: 'gameover', best }
  }

  return { ...state, playerX, invaders, bullets, score, lives, nextId, playerShootCooldown, enemyShootCooldown, invaderDir, invaderTickLeft }
}

export function useSpaceInvaders() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(readBest()))
  const keysRef = useRef<Keys>({ left: false, right: false, shoot: false })

  useEffect(() => {
    const handle = (e: KeyboardEvent, down: boolean) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          keysRef.current.left = down
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          keysRef.current.right = down
          break
        case ' ':
        case 'ArrowUp':
          e.preventDefault()
          keysRef.current.shoot = down
          break
        case 'p':
        case 'P':
          if (down) dispatch({ type: 'toggle-pause' })
          break
        case 'r':
        case 'R':
          if (down) dispatch({ type: 'restart' })
          break
      }
    }
    const onDown = (e: KeyboardEvent) => handle(e, true)
    const onUp = (e: KeyboardEvent) => handle(e, false)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useEffect(() => {
    if (state.status !== 'playing') return
    const id = window.setInterval(
      () => dispatch({ type: 'tick', keys: { ...keysRef.current } }),
      16,
    )
    return () => window.clearInterval(id)
  }, [state.status])

  const restart = useCallback(() => dispatch({ type: 'restart' }), [])
  const togglePause = useCallback(() => dispatch({ type: 'toggle-pause' }), [])

  return { state, restart, togglePause }
}
