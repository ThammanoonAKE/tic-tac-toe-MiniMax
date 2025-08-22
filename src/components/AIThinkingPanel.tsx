import { AIThinking } from '@/types/game'
import { useEffect, useRef, useState } from 'react'
import MinimaxTree from './MinimaxTree'

interface AIThinkingPanelProps {
  aiThinking: AIThinking
  isAiTurn: boolean
}

const AIThinkingPanel = ({ aiThinking, isAiTurn }: AIThinkingPanelProps) => {
  const logRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'tree' | 'details'>('tree')

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
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl p-6 sm:p-8 h-fit">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          🧠 AI Thinking Process
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex-1 py-3 px-6 text-base font-semibold rounded-l-xl transition-all duration-300 ${
              activeTab === 'tree' 
                ? 'bg-gray-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🌳 Search Tree
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 px-6 text-base font-semibold rounded-r-xl transition-all duration-300 ${
              activeTab === 'details' 
                ? 'bg-gray-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📊 Details
          </button>
        </div>
        
        {activeTab === 'tree' ? (
          /* Tree Visualization */
          <div className="bg-gray-700 rounded-xl border border-gray-600 h-[600px] lg:h-[700px] xl:h-[800px] overflow-auto">
            <MinimaxTree tree={aiThinking.searchTree} />
          </div>
        ) : (
          /* Details View */
          <div>
            {/* Algorithm Info */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-700 rounded-xl p-3 sm:p-4 border border-gray-600">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Minimax Algorithm</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Max Depth:</span>
                <span className="text-white font-mono text-sm bg-gray-600 px-2 py-1 rounded border border-gray-500">
                  {aiThinking.depth}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Nodes Evaluated:</span>
                <span className="text-white font-mono text-sm bg-gray-600 px-2 py-1 rounded border border-gray-500">
                  {aiThinking.nodesEvaluated}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Best Score:</span>
                <span className={`font-mono text-sm px-2 py-1 rounded ${
                  aiThinking.bestScore > 0 ? 'text-green-400 bg-green-400/10' :
                  aiThinking.bestScore < 0 ? 'text-red-400 bg-red-400/10' :
                  'text-yellow-400 bg-yellow-400/10'
                }`}>
                  {aiThinking.bestScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Move Evaluation Grid */}
        <div className="mb-4 sm:mb-6">
          <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Move Evaluation</h4>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, index) => {
              const score = aiThinking.evaluations[index]
              return (
                <div
                  key={index}
                  className="bg-gray-600 border border-gray-500 rounded-lg p-2 sm:p-3 text-center min-h-[50px] sm:min-h-[60px] flex flex-col justify-center"
                >
                  <div className="text-xs text-gray-300 mb-1">
                    {index + 1}
                  </div>
                  <div className={`font-mono text-xs sm:text-sm ${getScoreColor(score)}`}>
                    {getScoreText(score)}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-2 sm:mt-3 text-xs text-gray-300 text-center">
            <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs">Win</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs">Draw</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-xs">Lose</span>
              </span>
            </div>
          </div>
        </div>

        {/* Thinking Process Visualization */}
        <div className="mb-4 sm:mb-6">
          <h4 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            AI Status
            {isAiTurn && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </h4>
          
          <div className="bg-gray-600 rounded-xl p-3 sm:p-4 border border-gray-500">
            <div className="text-center">
              {isAiTurn ? (
                <div className="text-blue-300 font-medium">
                  🤔 Analyzing possible moves...
                </div>
              ) : (
                <div className="text-green-300 font-medium">
                  ✅ Ready for next move
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thinking Log */}
        <div>
          <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">AI Thinking Log</h4>
          <div 
            ref={logRef}
            className="bg-gray-600 rounded-xl p-3 sm:p-4 border border-gray-500 h-32 sm:h-40 overflow-y-auto space-y-1"
          >
            {aiThinking.thinkingLog.map((log, index) => (
              <div 
                key={index} 
                className="text-gray-200 text-xs sm:text-sm font-mono bg-gray-700 px-2 py-1 rounded animate-fade-in"
              >
                <span className="text-gray-400">[{String(index + 1).padStart(2, '0')}]</span> {log}
              </div>
            ))}
          </div>
        </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIThinkingPanel