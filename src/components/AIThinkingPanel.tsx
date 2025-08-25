import { AIThinking } from '@/types/game'
import { useEffect, useRef, useState } from 'react'

interface AIThinkingPanelProps {
  aiThinking: AIThinking
  isAiTurn: boolean
}

const AIThinkingPanel = ({ aiThinking, isAiTurn }: AIThinkingPanelProps) => {
  const logRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'details'>('details')

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [aiThinking.thinkingLog])

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400'
    if (score > 0) return 'text-green-400'
    if (score < 0) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getScoreText = (score: number | null) => {
    if (score === null) return '-'
    return score.toString()
  }

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-purple-500/20 p-6 sm:p-8 h-fit relative overflow-hidden">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 rounded-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-center mb-8 tracking-tight">
            🧠 AI Thinking Process
          </h2>
        
        <div>
            {/* Algorithm Info */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                <h3 className="relative text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  Minimax Algorithm
                </h3>
            
            <div className="relative space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <span className="text-white/80 text-base font-medium flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  Max Depth:
                </span>
                <span className="text-white font-black text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent px-3 py-2 bg-white/10 rounded-lg border border-cyan-400/30">
                  {aiThinking.depth}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <span className="text-white/80 text-base font-medium flex items-center gap-2">
                  <span className="text-lg">🔢</span>
                  Nodes Evaluated:
                </span>
                <span className="text-white font-black text-lg bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent px-3 py-2 bg-white/10 rounded-lg border border-purple-400/30">
                  {aiThinking.nodesEvaluated.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <span className="text-white/80 text-base font-medium flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Best Score:
                </span>
                <span className={`font-black text-lg px-3 py-2 rounded-lg border ${
                  aiThinking.bestScore > 0 ? 
                    'bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent bg-emerald-400/10 border-emerald-400/30' :
                  aiThinking.bestScore < 0 ? 
                    'bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent bg-red-400/10 border-red-400/30' :
                    'bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent bg-yellow-400/10 border-yellow-400/30'
                }`}>
                  {aiThinking.bestScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Move Evaluation Grid */}
        <div className="mb-6 sm:mb-8">
          <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            Move Evaluation
          </h4>
          <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            {Array.from({ length: 9 }).map((_, index) => {
              const score = aiThinking.evaluations[index]
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm border border-white/20 rounded-xl p-3 sm:p-4 text-center min-h-[60px] sm:min-h-[70px] flex flex-col justify-center relative overflow-hidden group hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="relative z-10">
                    <div className="text-sm text-white/60 mb-2 font-medium">
                      {index + 1}
                    </div>
                    <div className={`font-black text-base sm:text-lg ${
                      score === null ? 'text-white/40' :
                      score > 0 ? 'text-transparent bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text' :
                      score < 0 ? 'text-transparent bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text' :
                      'text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text'
                    }`}>
                      {getScoreText(score)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 text-center">
            <div className="flex justify-center gap-4 sm:gap-6 flex-wrap bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
                <span className="text-sm font-medium text-white/80">Win</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-yellow-500/30"></div>
                <span className="text-sm font-medium text-white/80">Draw</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-lg shadow-red-500/30"></div>
                <span className="text-sm font-medium text-white/80">Lose</span>
              </span>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className="mb-6 sm:mb-8">
          <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            AI Status
            {isAiTurn && (
              <div className="flex gap-2 ml-auto">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </h4>
          
          <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
            <div className="relative text-center">
              {isAiTurn ? (
                <div className="text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text font-bold text-lg flex items-center justify-center gap-3">
                  <span className="text-2xl animate-spin">🔄</span>
                  Analyzing possible moves...
                </div>
              ) : (
                <div className="text-transparent bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text font-bold text-lg flex items-center justify-center gap-3">
                  <span className="text-2xl">✅</span>
                  Ready for next move
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Thinking Log */}
        <div>
          <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3">
            <span className="text-2xl">📝</span>
            AI Thinking Log
          </h4>
          <div 
            ref={logRef}
            className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg h-40 sm:h-48 overflow-y-auto space-y-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
            <div className="relative space-y-2">
              {aiThinking.thinkingLog.map((log, index) => (
                <div 
                  key={index} 
                  className="text-white/90 text-sm sm:text-base font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 animate-fade-in relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    <span className="text-cyan-400 font-mono text-xs bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">{log}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIThinkingPanel