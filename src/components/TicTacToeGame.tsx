'use client'

import { useState, useEffect, useCallback } from 'react'
import GameBoard from './GameBoard'
import AIThinkingPanel from './AIThinkingPanel'
import { GameState, Player, MinimaxResult, TreeNode, AIThinking } from '@/types/game'

const TicTacToeGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    isGameOver: false,
    playerScore: 0,
    aiScore: 0
  })

  const [aiThinking, setAiThinking] = useState<AIThinking>({
    depth: 0,
    nodesEvaluated: 0,
    bestScore: 0,
    evaluations: Array(9).fill(null),
    thinkingLog: ['Ready to play!'],
    searchTree: null
  })

  const [isAiTurn, setIsAiTurn] = useState(false)

  const checkWinner = useCallback((board: (Player | null)[]): Player | null => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }

    return null
  }, [])

  const isGameComplete = useCallback((board: (Player | null)[]): boolean => {
    return checkWinner(board) !== null || board.every(cell => cell !== null)
  }, [checkWinner])

  const evaluatePosition = useCallback((board: (Player | null)[]): number => {
    let score = 0
    
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      const line = [board[a], board[b], board[c]]
      const oCount = line.filter(cell => cell === 'O').length
      const xCount = line.filter(cell => cell === 'X').length
      const emptyCount = line.filter(cell => cell === null).length
      
      // O advantages (AI maximizing)
      if (xCount === 0) {
        if (oCount === 2 && emptyCount === 1) score += 5
        else if (oCount === 1 && emptyCount === 2) score += 1
      }
      
      // X advantages (human minimizing)
      if (oCount === 0) {
        if (xCount === 2 && emptyCount === 1) score -= 5
        else if (xCount === 1 && emptyCount === 2) score -= 1
      }
    }
    
    return score
  }, [])

  const minimax = useCallback((board: (Player | null)[], depth: number, isMaximizing: boolean, alpha: number = -Infinity, beta: number = Infinity, moveIndex: number | null = null, buildTree: boolean = false): MinimaxResult => {
    const winner = checkWinner(board)
    const nodeId = `${depth}-${moveIndex !== null ? moveIndex : 'root'}-${isMaximizing ? 'max' : 'min'}`
    
    // Update thinking state
    setAiThinking(prev => ({
      ...prev,
      depth: Math.max(prev.depth, depth),
      nodesEvaluated: prev.nodesEvaluated + 1
    }))

    // Determine game result
    let gameResult: 'win' | 'lose' | 'draw' | 'ongoing' = 'ongoing'
    let score: number
    
    if (winner === 'O') {
      score = 10 - depth
      gameResult = 'win'
    } else if (winner === 'X') {
      score = depth - 10
      gameResult = 'lose'
    } else if (board.every(cell => cell !== null)) {
      score = 0
      gameResult = 'draw'
    } else if (depth >= 2) {
      // Limit depth to 2 levels - use heuristic evaluation
      score = evaluatePosition(board)
      gameResult = 'draw' // Mark as terminal to prevent further recursion
    } else {
      score = isMaximizing ? -Infinity : Infinity
    }

    // Create tree node if building tree
    const treeNode: TreeNode | undefined = buildTree ? {
      id: nodeId,
      move: moveIndex,
      score: score,
      isMaximizing,
      board: [...board],
      children: [],
      isLeaf: gameResult !== 'ongoing',
      gameResult: gameResult !== 'ongoing' ? gameResult as 'win' | 'lose' | 'draw' : undefined
    } : undefined

    // Terminal node (includes depth limit)
    if (gameResult !== 'ongoing') {
      return { score, bestMove: -1, tree: treeNode }
    }

    let bestMove = -1
    const children: TreeNode[] = []

    if (isMaximizing) {
      let maxEval = -Infinity

      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O'
          const evaluation = minimax(board, depth + 1, false, alpha, beta, i, buildTree)
          board[i] = null

          if (buildTree && evaluation.tree) {
            children.push(evaluation.tree)
          }

          if (evaluation.score > maxEval) {
            maxEval = evaluation.score
            bestMove = i
          }

          alpha = Math.max(alpha, evaluation.score)
          if (beta <= alpha) break // Alpha-beta pruning
        }
      }

      if (treeNode) {
        treeNode.score = maxEval
        treeNode.children = children
      }

      return { score: maxEval, bestMove, tree: treeNode }
    } else {
      let minEval = Infinity

      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X'
          const evaluation = minimax(board, depth + 1, true, alpha, beta, i, buildTree)
          board[i] = null

          if (buildTree && evaluation.tree) {
            children.push(evaluation.tree)
          }

          if (evaluation.score < minEval) {
            minEval = evaluation.score
            bestMove = i
          }

          beta = Math.min(beta, evaluation.score)
          if (beta <= alpha) break // Alpha-beta pruning
        }
      }

      if (treeNode) {
        treeNode.score = minEval
        treeNode.children = children
      }

      return { score: minEval, bestMove, tree: treeNode }
    }
  }, [checkWinner])

  const evaluateAllMoves = useCallback((board: (Player | null)[]): (number | null)[] => {
    const evaluations = Array(9).fill(null)
    
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O'
        const result = minimax([...board], 0, false)
        evaluations[i] = result.score
        board[i] = null
      }
    }
    
    return evaluations
  }, [minimax])

  const makeAiMove = useCallback(async () => {
    if (gameState.isGameOver || gameState.currentPlayer !== 'O') return

    setIsAiTurn(true)
    
    // Reset AI thinking state
    setAiThinking({
      depth: 0,
      nodesEvaluated: 0,
      bestScore: 0,
      evaluations: Array(9).fill(null),
      thinkingLog: ['AI is thinking...'],
      searchTree: null
    })

    // Add delay to show thinking process
    await new Promise(resolve => setTimeout(resolve, 500))

    const boardCopy = [...gameState.board]
    
    // Evaluate all possible moves
    const evaluations = evaluateAllMoves(boardCopy)
    
    // Get the best move with tree building
    const result = minimax(boardCopy, 0, true, -Infinity, Infinity, null, true)
    
    setAiThinking(prev => ({
      ...prev,
      bestScore: result.score,
      evaluations,
      searchTree: result.tree || null,
      thinkingLog: [
        ...prev.thinkingLog,
        `Evaluated ${prev.nodesEvaluated} nodes`,
        `Best move: position ${result.bestMove + 1}`,
        `Expected score: ${result.score}`,
        'Analysis complete'
      ]
    }))

    // Make the move
    const newBoard = [...gameState.board]
    newBoard[result.bestMove] = 'O'
    
    const winner = checkWinner(newBoard)
    const isComplete = isGameComplete(newBoard)
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: 'X',
      winner,
      isGameOver: isComplete,
      aiScore: winner === 'O' ? prev.aiScore + 1 : prev.aiScore
    }))

    setIsAiTurn(false)
  }, [gameState.isGameOver, gameState.currentPlayer, gameState.board, evaluateAllMoves, isGameComplete, minimax, checkWinner])

  // Auto-trigger AI moves
  useEffect(() => {
    if (gameState.currentPlayer === 'O' && !gameState.isGameOver && !isAiTurn) {
      const timer = setTimeout(() => {
        makeAiMove()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [gameState.currentPlayer, gameState.isGameOver, isAiTurn, makeAiMove])

  const handleCellClick = (index: number) => {
    if (gameState.board[index] || gameState.isGameOver || isAiTurn || gameState.currentPlayer !== 'X') {
      return
    }

    const newBoard = [...gameState.board]
    newBoard[index] = 'X'
    
    const winner = checkWinner(newBoard)
    const isComplete = isGameComplete(newBoard)
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: 'O',
      winner,
      isGameOver: isComplete,
      playerScore: winner === 'X' ? prev.playerScore + 1 : prev.playerScore
    }))

    // AI move will be triggered by useEffect
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false
    }))
    
    setAiThinking({
      depth: 0,
      nodesEvaluated: 0,
      bestScore: 0,
      evaluations: Array(9).fill(null),
      thinkingLog: ['Ready to play!'],
      searchTree: null
    })
    
    setIsAiTurn(false)
  }

  const newGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
      playerScore: 0,
      aiScore: 0
    })
    
    setAiThinking({
      depth: 0,
      nodesEvaluated: 0,
      bestScore: 0,
      evaluations: Array(9).fill(null),
      thinkingLog: ['Ready to play!'],
      searchTree: null
    })
    
    setIsAiTurn(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div 
        className="absolute inset-0 animate-pulse opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="container mx-auto max-w-[1600px]">
          <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
            {/* Game Section */}
            <div className="flex-shrink-0 relative animate-slide-in-left">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-purple-500/20 p-20 w-full max-w-7xl relative overflow-hidden hover-lift">
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black gradient-text text-center mb-12 tracking-tight drop-shadow-2xl animate-float">
                    Tic Tac Toe
                  </h1>
            
              <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-8">
                <div className="animate-scale-in">
                  <span className="text-base text-white/80 font-medium">Current Player: </span>
                  <span className="font-black text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {isAiTurn ? '🤖 AI (O)' : gameState.currentPlayer === 'X' ? '👤 You (X)' : '🤖 AI (O)'}
                  </span>
                </div>
                
                <div className="flex gap-4 text-center">
                  <div className="animate-stagger-1 animate-scale-in">
                    <div className="text-sm text-cyan-300 mb-2 font-semibold">👤 Player</div>
                    <div className="font-black text-3xl text-cyan-400 tabular-nums">{gameState.playerScore}</div>
                  </div>
                  <div className="animate-stagger-2 animate-scale-in">
                    <div className="text-sm text-pink-300 mb-2 font-semibold">🤖 AI</div>
                    <div className="font-black text-3xl text-pink-400 tabular-nums">{gameState.aiScore}</div>
                  </div>
                </div>
              </div>

            <GameBoard 
              board={gameState.board}
              onCellClick={handleCellClick}
              winner={gameState.winner}
              isGameOver={gameState.isGameOver}
              disabled={isAiTurn}
            />

              <div className="flex gap-4 mt-12 justify-center">
                <button
                  onClick={resetGame}
                  className="group bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl shadow-purple-500/25 backdrop-blur-sm border border-white/10 relative overflow-hidden morph-button hover-lift animate-stagger-3 animate-scale-in"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></span>
                  <span className="relative flex items-center gap-2 text-lg">🔄 Reset Game</span>
                </button>
                <button
                  onClick={newGame}
                  className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl shadow-emerald-500/25 backdrop-blur-sm border border-white/10 relative overflow-hidden morph-button hover-lift animate-stagger-4 animate-scale-in"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></span>
                  <span className="relative flex items-center gap-2 text-lg">✨ New Game</span>
                </button>
              </div>

              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20 inline-block shadow-xl relative overflow-hidden">
                  {isAiTurn && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
                  )}
                  <span className="relative text-white font-bold text-xl bg-gradient-to-r from-white to-white/80 bg-clip-text">
                    {gameState.isGameOver 
                      ? gameState.winner 
                        ? `${gameState.winner === 'X' ? '🎉 You Win!' : '🤖 AI Wins!'}`
                        : "🤝 It's a Draw!"
                      : isAiTurn 
                        ? '🤔 AI is thinking...'
                        : gameState.currentPlayer === 'X' 
                          ? '🎯 Your turn!'
                          : '🤖 AI turn!'
                    }
                  </span>
                </div>
              </div>
                </div>
              </div>
            </div>

            {/* AI Thinking Panel */}
            <div className="flex-shrink-0 w-full xl:w-[600px] 2xl:w-[700px] animate-slide-in-right animate-stagger-5">
              <AIThinkingPanel 
                aiThinking={aiThinking}
                isAiTurn={isAiTurn}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicTacToeGame