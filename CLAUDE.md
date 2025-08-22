# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 React application implementing a Tic-Tac-Toe game with AI using the Minimax algorithm. The game features:
- Human vs AI gameplay where the human plays as 'X' and AI plays as 'O'
- Visual AI thinking process showing algorithm decisions
- Score tracking and game state management
- Modern glassmorphic UI with Tailwind CSS

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Testing
No test framework is currently configured in this project.

## Code Architecture

### Core Components
- **TicTacToeGame** (`src/components/TicTacToeGame.tsx`) - Main game logic component containing:
  - Game state management (board, current player, scores)
  - Minimax algorithm implementation with alpha-beta pruning
  - AI move calculation and human move handling
  - Game flow control (win detection, game reset)

- **GameBoard** (`src/components/GameBoard.tsx`) - Renders the 3x3 game grid with:
  - Interactive cell buttons
  - Win pattern highlighting
  - Cell state visualization

- **AIThinkingPanel** (`src/components/AIThinkingPanel.tsx`) - Shows AI decision process:
  - Algorithm metrics (depth, nodes evaluated, best score)
  - Move evaluation grid showing scores for all positions
  - Real-time thinking log with animation

### Type Definitions
- **Game Types** (`src/types/game.ts`) - Core interfaces:
  - `GameState` - Complete game state including board, player, winner, scores
  - `MinimaxResult` - Algorithm output with score and best move
  - `AIThinking` - AI visualization state and metrics

### Algorithm Implementation
The Minimax algorithm in `TicTacToeGame.tsx:50-107` implements:
- Recursive game tree exploration
- Alpha-beta pruning optimization
- Depth-aware scoring (earlier wins/losses preferred)
- Real-time metrics collection for visualization

### UI Architecture
- Uses Next.js App Router structure
- Tailwind CSS with glassmorphic design system
- Custom animations and transitions
- Responsive layout with side-by-side game and AI panels

## Key Features to Understand

1. **AI Decision Process**: The AI evaluates all possible moves and shows the decision-making process in real-time
2. **Game State Flow**: Human moves trigger AI moves automatically after a short delay
3. **Score Persistence**: Scores persist across game resets but reset with "New Game"
4. **Visual Feedback**: Win patterns are highlighted and AI thinking is animated