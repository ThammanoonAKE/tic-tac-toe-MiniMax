export type Player = 'X' | 'O'

export interface GameState {
  board: (Player | null)[]
  currentPlayer: Player
  winner: Player | null
  isGameOver: boolean
  playerScore: number
  aiScore: number
}

export interface MinimaxResult {
  score: number
  bestMove: number
  tree?: TreeNode
}

export interface TreeNode {
  id: string
  move: number | null
  score: number
  depth: number
  isMaximizing: boolean
  board: (Player | null)[]
  children: TreeNode[]
  isLeaf: boolean
  gameResult: 'win' | 'lose' | 'draw' | 'ongoing'
}

export interface AIThinking {
  depth: number
  nodesEvaluated: number
  bestScore: number
  evaluations: (number | null)[]
  thinkingLog: string[]
  searchTree: TreeNode | null
}