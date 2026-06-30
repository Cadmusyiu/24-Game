# 24 Game

> 🎮 **Play live**: https://cadmusyiu.github.io/24-Game/

A three-level arithmetic challenge: combine dealt cards with `+ − × ÷` to reach **24**. Every deal is guaranteed solvable — a built-in recursive solver (`canMake24`) validates each randomly generated hand.

## Features

- **3 progressive levels** — 2 cards → 3 cards → 4 cards, unlocked as you clear each stage
- **Always-solvable deals** — `canMake24` checks every random hand; a preset fallback covers the rare miss
- **Timed challenges** — Level 1 (10 in 60s), Level 2 (10 in 240s); Level 3 is untimed
- **Leaderboard** — Level 3 runs are ranked by score then time, persisted in `localStorage`
- **No double-scoring** — input is locked during the success animation
- **÷0-safe** — division guards against zeros produced by `|a − b|`
- Fully client-side, no build step

## How to run

Open `index.html` in any modern browser, or play the [live demo](https://cadmusyiu.github.io/24-Game/).

## Tech

React 18 + Babel Standalone + Tailwind (via CDN), compiled in-browser — no dependencies to install, no build step.

## Tests

The pure `canMake24` solver is extracted straight from `index.html` and unit-tested:

```bash
node test-solver.js
```

Covers: classic solvable hands (`1 3 4 6`, `3 3 8 8`, …), known unsolvable hands, zero/÷0 handling, fallback-preset validation, and a 2000-trial smoke pass.

## License

[MIT](./LICENSE)
