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
    <div className="flex justify-center items-center">
      {/* Game Board Grid */}
      <div className="grid grid-cols-3 gap-4 mb-12 relative">
        
        {board.map((cell, index) => {
          const isWinningCell = winningPattern.includes(index)
          
          return (
            <button
              key={index}
              onClick={() => onCellClick(index)}
              disabled={disabled || cell !== null || isGameOver}
              className={`
                relative group w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 
                bg-gradient-to-br from-white/10 via-white/5 to-transparent 
                hover:from-white/20 hover:via-white/10 hover:to-white/5
                backdrop-blur-sm rounded-2xl border-2 border-white/20 
                hover:border-white/40 transition-all duration-300 
                transform hover:scale-110 active:scale-95 hover:-translate-y-1
                disabled:hover:scale-100 disabled:hover:translate-y-0 
                disabled:cursor-not-allowed flex items-center justify-center
                shadow-lg hover:shadow-2xl relative overflow-hidden
                ${isWinningCell ? 
                  'bg-gradient-to-br from-emerald-400/20 via-green-400/20 to-emerald-600/20 border-emerald-400/50 shadow-emerald-500/50 animate-pulse' : 
                  ''
                }
              `}
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              
              {/* Cell content */}
              <span className={`
                relative z-10 text-4xl sm:text-5xl lg:text-6xl font-black 
                transition-all duration-300 transform group-hover:scale-110
                ${cell === 'X' ? 
                  'text-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 bg-clip-text drop-shadow-lg' : 
                  cell === 'O' ? 
                    'text-transparent bg-gradient-to-br from-pink-400 via-red-500 to-pink-600 bg-clip-text drop-shadow-lg' : 
                    'text-white/30'
                }
                ${isWinningCell ? 'animate-bounce' : ''}
              `}>
                {cell || ''}
              </span>
              
              {/* Winning cell sparkle effect */}
              {isWinningCell && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400/20 via-transparent to-emerald-400/20 rounded-2xl animate-ping"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default GameBoard