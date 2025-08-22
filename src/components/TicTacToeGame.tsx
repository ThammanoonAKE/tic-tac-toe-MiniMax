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
    } else {
      score = isMaximizing ? -Infinity : Infinity
    }

    // Create tree node if building tree
    const treeNode: TreeNode | undefined = buildTree ? {
      id: nodeId,
      move: moveIndex,
      score: score,
      depth,
      isMaximizing,
      board: [...board],
      children: [],
      isLeaf: gameResult !== 'ongoing',
      gameResult
    } : undefined

    // Terminal node
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
        'Minimax tree generated'
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="container mx-auto max-w-[1600px] px-4">
        <div className="flex flex-col xl:flex-row gap-10 items-start justify-center">
          {/* Game Section */}
          <div className="flex-shrink-0">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl p-8 w-full max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-8 tracking-wider">
                Tic Tac Toe
              </h1>
            
              <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-8">
                <div>
                  <span className="text-base text-gray-300">Current Player: </span>
                  <span className="font-bold text-xl text-white">
                    {isAiTurn ? 'AI (O)' : gameState.currentPlayer === 'X' ? 'You (X)' : 'AI (O)'}
                  </span>
                </div>
                
                <div className="flex gap-8 text-center">
                  <div>
                    <div className="text-sm text-blue-400 mb-1">Player</div>
                    <div className="font-bold text-2xl text-blue-300">{gameState.playerScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-red-400 mb-1">AI</div>
                    <div className="font-bold text-2xl text-red-300">{gameState.aiScore}</div>
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
                  className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base"
                >
                  🔄 Reset Game
                </button>
                <button
                  onClick={newGame}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base"
                >
                  ✨ New Game
                </button>
              </div>

              <div className="mt-8 text-center">
                <div className="bg-gray-700 rounded-xl px-6 py-4 border border-gray-600 inline-block shadow-sm">
                  <span className="text-white font-semibold text-lg">
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

          {/* AI Thinking Panel */}
          <div className="flex-shrink-0 w-full xl:w-[600px] 2xl:w-[700px]">
            <AIThinkingPanel 
              aiThinking={aiThinking}
              isAiTurn={isAiTurn}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicTacToeGame