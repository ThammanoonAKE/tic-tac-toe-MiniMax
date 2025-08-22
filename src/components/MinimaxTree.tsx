import { TreeNode, Player } from '@/types/game'
import { useState } from 'react'

interface MinimaxTreeProps {
  tree: TreeNode | null
}

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  isRoot?: boolean
}

const MiniBoard = ({ board }: { board: (Player | null)[] }) => {
  return (
    <div className="grid grid-cols-3 gap-0.5 bg-gray-600 p-1.5 rounded-lg border border-gray-500">
      {board.map((cell, index) => (
        <div
          key={index}
          className="w-5 h-5 bg-gray-700 rounded flex items-center justify-center text-xs font-bold border border-gray-600"
        >
          <span className={
            cell === 'X' ? 'text-blue-300' : 
            cell === 'O' ? 'text-red-300' : 'text-gray-400'
          }>
            {cell}
          </span>
        </div>
      ))}
    </div>
  )
}

const TreeNodeComponent = ({ node, level, isRoot = false }: TreeNodeComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels

  const getNodeColor = () => {
    if (node.isLeaf) {
      switch (node.gameResult) {
        case 'win': return 'bg-green-800 border-green-500 text-green-200'
        case 'lose': return 'bg-red-800 border-red-500 text-red-200'
        case 'draw': return 'bg-yellow-800 border-yellow-500 text-yellow-200'
        default: return 'bg-gray-700 border-gray-500 text-white'
      }
    }
    return node.isMaximizing 
      ? 'bg-blue-800 border-blue-500 text-blue-200'
      : 'bg-purple-800 border-purple-500 text-purple-200'
  }

  const getPlayerSymbol = () => {
    if (isRoot) return 'ROOT'
    return node.isMaximizing ? 'O' : 'X'
  }

  const getMoveText = () => {
    if (node.move === null) return ''
    return `Move: ${node.move + 1}`
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className={`
        rounded-xl border-2 p-4 text-center cursor-pointer min-w-[140px] transition-all duration-300
        ${getNodeColor()}
        ${isExpanded ? 'scale-100 shadow-lg' : 'scale-95'}
        hover:scale-105 hover:shadow-xl
      `}
      onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Player and Move Info */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-bold">
            {getPlayerSymbol()}
          </div>
          {!isRoot && (
            <div className="text-sm opacity-80">
              {getMoveText()}
            </div>
          )}
        </div>
        
        {/* Mini Board */}
        <div className="mb-3 flex justify-center">
          <MiniBoard board={node.board} />
        </div>
        
        {/* Score */}
        <div className="text-xl font-bold mb-2">
          {node.score === Infinity ? '∞' : node.score === -Infinity ? '-∞' : node.score}
        </div>
        
        {/* Game Result */}
        {node.isLeaf && (
          <div className="text-sm mb-2 capitalize opacity-80">
            {node.gameResult}
          </div>
        )}
        
        {/* Expand/Collapse Indicator */}
        {node.children.length > 0 && (
          <div className="text-sm mt-2 opacity-70 flex items-center justify-center gap-1">
            <span>{isExpanded ? '▼' : '▶'}</span>
            <span>({node.children.length})</span>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && node.children.length > 0 && (
        <div className="relative">
          {/* Connection lines container positioned from bottom of parent */}
          <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none" style={{ width: '100%', height: '48px', top: '8px', zIndex: 0 }}>
            <svg width="100%" height="48" className="overflow-visible">
              {node.children.map((child, index) => {
                const totalChildren = node.children.length
                
                // Calculate child positions based on flex layout with gap
                const nodeWidth = 140 // min-w-[140px] from node
                const gap = 40 // gap between nodes
                
                // Parent connection point (bottom center of parent node) - starts from y=0
                const parentX = '50%'
                const parentY = 0
                
                // Child connection points (top center of each child node)
                const childOffsetFromCenter = ((index - (totalChildren - 1) / 2) * (nodeWidth + gap))
                const childX = `calc(50% + ${childOffsetFromCenter}px)`
                const childY = 48 // connects to top of child nodes
                
                // Choose line color based on node types
                const getLineColor = () => {
                  if (node.isMaximizing) return '#60a5fa' // Blue for maximizing parent
                  return '#c084fc' // Purple for minimizing parent
                }
                
                return (
                  <line
                    key={child.id}
                    x1={parentX}
                    y1={parentY}
                    x2={childX}
                    y2={childY}
                    stroke={getLineColor()}
                    strokeWidth="2.5"
                    className="opacity-80"
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                    }}
                  />
                )
              })}
            </svg>
          </div>

          {/* Children nodes positioned with proper spacing */}
          <div className="flex justify-center relative z-10 mt-14" style={{ gap: '40px' }}>
            {node.children.map((child) => (
              <TreeNodeComponent 
                key={child.id}
                node={child} 
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MinimaxTree = ({ tree }: MinimaxTreeProps) => {
  if (!tree) {
    return (
      <div className="text-center text-gray-300 p-8">
        <div className="text-4xl mb-4">🌳</div>
        <div className="text-lg font-medium mb-2">No tree generated yet</div>
        <div className="text-sm opacity-80">AI will create one during next move</div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto">
      <div className="min-w-max p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h4 className="text-white font-bold mb-4 text-lg flex items-center justify-center gap-2">
            🌳 <span>Minimax Search Tree</span>
          </h4>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs mb-4">
            <div className="bg-gray-600 rounded-lg p-2 border border-gray-500 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-blue-800 border border-blue-500 rounded"></div>
                <span className="text-white font-medium">Maximizing (O)</span>
              </div>
              <div className="text-gray-300 text-xs">AI tries to maximize score</div>
            </div>
            
            <div className="bg-gray-600 rounded-lg p-2 border border-gray-500 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-purple-800 border border-purple-500 rounded"></div>
                <span className="text-white font-medium">Minimizing (X)</span>
              </div>
              <div className="text-gray-300 text-xs">Human tries to minimize score</div>
            </div>
          </div>
          
          {/* Terminal states legend */}
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-800 border border-green-500 rounded"></div>
              <span className="text-green-300">Win</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-800 border border-yellow-500 rounded"></div>
              <span className="text-yellow-300">Draw</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-800 border border-red-500 rounded"></div>
              <span className="text-red-300">Lose</span>
            </span>
          </div>
        </div>
        
        {/* Tree */}
        <div className="flex justify-center">
          <TreeNodeComponent node={tree} level={0} isRoot={true} />
        </div>
        
        {/* Instructions */}
        <div className="mt-8 text-center">
          <div className="bg-gray-600 rounded-lg p-3 border border-gray-500 shadow-sm inline-block">
            <div className="text-xs text-gray-200 flex items-center gap-2">
              <span>💡</span>
              <span>Click nodes to expand/collapse • Each node shows board state and score</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MinimaxTree