import { Player } from '@/types/game'

interface GameBoardProps {
  board: (Player | null)[]
  onCellClick: (index: number) => void
  winner: Player | null
  isGameOver: boolean
  disabled: boolean
}

const GameBoard = ({ board, onCellClick, winner, isGameOver, disabled }: GameBoardProps) => {
  const getWinningPattern = (): number[] => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return pattern
      }
    }

    return []
  }

  const winningPattern = winner ? getWinningPattern() : []

  return (
    <div className="grid grid-cols-3 gap-6 w-fit mx-auto mb-12 px-8 bg-transparent">
      {board.map((cell, index) => {
        const isWinningCell = winningPattern.includes(index)
        
        return (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={disabled || cell !== null || isGameOver}
            className={`
              w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gray-700 hover:bg-gray-600 
              rounded-xl border-2 border-gray-600 hover:border-gray-500
              text-3xl sm:text-4xl lg:text-5xl font-bold
              transition-all duration-300 transform hover:scale-105 active:scale-95
              disabled:hover:scale-100 disabled:cursor-not-allowed
              flex items-center justify-center
              shadow-lg hover:shadow-xl
              ${isWinningCell ? 'bg-green-800 border-green-500 shadow-green-900/50' : ''}
              ${cell === 'X' ? 'text-blue-300' : cell === 'O' ? 'text-red-300' : 'text-gray-500'}
            `}
          >
            {cell}
          </button>
        )
      })}
    </div>
  )
}

export default GameBoard