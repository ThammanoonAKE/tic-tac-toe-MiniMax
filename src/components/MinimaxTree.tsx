import { TreeNode, Player } from '@/types/game'
import { useState, useRef } from 'react'

interface MinimaxTreeProps {
  tree: TreeNode | null
}

interface NodePosition {
  x: number
  y: number
  id: string
  level: number
}

// Complete Minimax Tree Generator - Shows all possible game states to depth 2
const generateCompleteMinimaxTree = (): TreeNode => {
  let nodeCounter = 0
  
  // Check if board has a winner
  const checkWinner = (board: (Player | null)[]): Player | 'draw' | null => {
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
    
    // Check for draw (board full)
    if (board.every(cell => cell !== null)) {
      return 'draw'
    }
    
    return null
  }

  // Evaluate board position
  const evaluateBoard = (board: (Player | null)[], level: number): number => {
    const winner = checkWinner(board)
    
    if (winner === 'X') return 10 - level  // X wins (maximizing player)
    if (winner === 'O') return -(10 - level)  // O wins (minimizing player)  
    if (winner === 'draw') return 0
    
    // Heuristic evaluation for non-terminal positions
    let score = 0
    
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      const line = [board[a], board[b], board[c]]
      const xCount = line.filter(cell => cell === 'X').length
      const oCount = line.filter(cell => cell === 'O').length
      const emptyCount = line.filter(cell => cell === null).length
      
      if (oCount === 0) {
        if (xCount === 2 && emptyCount === 1) score += 5
        else if (xCount === 1 && emptyCount === 2) score += 1
      }
      
      if (xCount === 0) {
        if (oCount === 2 && emptyCount === 1) score -= 5
        else if (oCount === 1 && emptyCount === 2) score -= 1
      }
    }
    
    return score
  }

  // Get all available moves
  const getAvailableMoves = (board: (Player | null)[]): number[] => {
    return board
      .map((cell, index) => cell === null ? index : -1)
      .filter(index => index !== -1)
  }

  // Create node recursively
  const createNode = (
    board: (Player | null)[], 
    level: number, 
    isMaximizing: boolean, 
    move: number | null = null,
    maxDepth: number = 2
  ): TreeNode => {
    const id = `node_${nodeCounter++}`
    const winner = checkWinner(board)
    const isGameOver = winner !== null
    const isMaxDepthReached = level >= maxDepth
    const isLeaf = isGameOver || isMaxDepthReached
    
    let score: number
    let gameResult: 'win' | 'lose' | 'draw' | undefined
    
    if (isGameOver) {
      if (winner === 'X') {
        gameResult = 'win'
        score = 10 - level
      } else if (winner === 'O') {
        gameResult = 'lose' 
        score = -(10 - level)
      } else {
        gameResult = 'draw'
        score = 0
      }
    } else if (isLeaf) {
      // At max depth, use evaluation function
      score = evaluateBoard(board, level)
    } else {
      // Non-leaf nodes - score will be calculated by minimax
      score = isMaximizing ? -Infinity : Infinity
    }

    const node: TreeNode = {
      id,
      board: [...board],
      score,
      isMaximizing,
      isLeaf,
      gameResult,
      move,
      children: []
    }

    // Generate children for non-leaf nodes
    if (!isLeaf) {
      const availableMoves = getAvailableMoves(board)
      const currentPlayer = isMaximizing ? 'X' : 'O'
      
      for (const moveIndex of availableMoves) {
        const newBoard = [...board]
        newBoard[moveIndex] = currentPlayer
        
        const childNode = createNode(
          newBoard,
          level + 1,
          !isMaximizing,
          moveIndex,
          maxDepth
        )
        
        node.children.push(childNode)
      }
      
      // Calculate minimax score for non-leaf nodes
      if (node.children.length > 0) {
        if (isMaximizing) {
          node.score = Math.max(...node.children.map(child => child.score))
        } else {
          node.score = Math.min(...node.children.map(child => child.score))
        }
      }
    }

    return node
  }

  // Start with empty board, X to move (maximizing)
  const emptyBoard = Array(9).fill(null)
  return createNode(emptyBoard, 0, true, null, 2)
}

// Keep the random tree generator for comparison
const generateRandomTree = (depth: number = 3): TreeNode => {
  return generateCompleteMinimaxTree() // For now, use the complete tree
}

const MiniBoard = ({ board, lastMove }: { board: (Player | null)[], lastMove?: number }) => {
  return (
    <div className="grid grid-cols-3 gap-0.5 bg-gray-600 p-1 rounded border border-gray-500">
      {board.map((cell, index) => (
        <div
          key={index}
          className={`w-3 h-3 bg-gray-700 rounded flex items-center justify-center text-xs font-bold ${
            lastMove === index ? 'ring-1 ring-yellow-400' : ''
          }`}
        >
          <span className={
            cell === 'X' ? 'text-blue-300' : 
            cell === 'O' ? 'text-red-300' : 'text-gray-500'
          }>
            {cell}
          </span>
        </div>
      ))}
    </div>
  )
}

const TreeNodeComponent = ({ 
  node, 
  position, 
  onNodeClick, 
  selectedNodeId,
  isRoot = false
}: {
  node: TreeNode
  position: NodePosition
  onNodeClick?: (node: TreeNode) => void
  selectedNodeId?: string
  isRoot?: boolean
}) => {
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
    return node.isMaximizing ? 'MAX' : 'MIN'
  }

  const isSelected = selectedNodeId === node.id

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        zIndex: 10
      }}
      onClick={() => onNodeClick?.(node)}
    >
      <div className={`
        rounded-lg border-2 p-2 text-center min-w-[100px] transition-all duration-300 text-xs
        ${getNodeColor()}
        ${isSelected ? 'ring-2 ring-yellow-400 scale-110' : 'hover:scale-105'}
        hover:shadow-lg
      `}>
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="font-bold text-xs">
            {getPlayerSymbol()}
          </div>
          <div className="text-xs opacity-70">
            L{position.level}
          </div>
        </div>
        
        {/* Mini Board */}
        <div className="mb-2 flex justify-center">
          <MiniBoard board={node.board} lastMove={node.move ?? undefined} />
        </div>
        
        {/* Score */}
        <div className="text-sm font-bold mb-1 text-green-300">
          {node.score === Infinity ? '∞' : node.score === -Infinity ? '-∞' : node.score}
        </div>
        
        {/* Status */}
        <div className="text-xs opacity-80">
          {node.isLeaf ? (
            <span className="capitalize">{node.gameResult || 'Terminal'}</span>
          ) : (
            <span>{node.children.length} children</span>
          )}
        </div>
      </div>
    </div>
  )
}

const ConnectionLines = ({ 
  connections, 
  nodePositions 
}: { 
  connections: Array<{ parentId: string, childId: string, isMaximizing: boolean }>
  nodePositions: Map<string, NodePosition>
}) => {
  return (
    <svg 
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 1 }}
    >
      <defs>
        <marker
          id="arrow-max"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="2"
          orient="auto"
        >
          <polygon
            points="0,0 0,4 4,2"
            fill="#60a5fa"
          />
        </marker>
        <marker
          id="arrow-min"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="2"
          orient="auto"
        >
          <polygon
            points="0,0 0,4 4,2"
            fill="#c084fc"
          />
        </marker>
      </defs>
      
      {connections.map(({ parentId, childId, isMaximizing }) => {
        const parentPos = nodePositions.get(parentId)
        const childPos = nodePositions.get(childId)
        
        if (!parentPos || !childPos) return null
        
        const startX = parentPos.x
        const startY = parentPos.y + 40
        const endX = childPos.x
        const endY = childPos.y - 40
        
        const controlY1 = startY + (endY - startY) * 0.3
        const controlY2 = endY - (endY - startY) * 0.3
        
        const pathData = `M ${startX} ${startY} 
                         C ${startX} ${controlY1}, 
                           ${endX} ${controlY2}, 
                           ${endX} ${endY}`
        
        const color = isMaximizing ? '#60a5fa' : '#c084fc'
        const markerId = isMaximizing ? 'arrow-max' : 'arrow-min'
        
        return (
          <g key={`${parentId}-${childId}`}>
            <path
              d={pathData}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
              opacity="0.8"
            />
            <circle
              cx={startX}
              cy={startY}
              r="2"
              fill={color}
              opacity="0.6"
            />
            <circle
              cx={endX}
              cy={endY}
              r="1.5"
              fill={color}
              opacity="0.4"
            />
          </g>
        )
      })}
    </svg>
  )
}

const calculateTreeLayout = (tree: TreeNode): { 
  positions: Map<string, NodePosition>, 
  connections: Array<{ parentId: string, childId: string, isMaximizing: boolean }> 
} => {
  const positions = new Map<string, NodePosition>()
  const connections: Array<{ parentId: string, childId: string, isMaximizing: boolean }> = []
  
  const config = {
    nodeWidth: 120,
    horizontalGap: 30,
    verticalGap: 140,
    startX: 600,
    startY: 80
  }
  
  // Calculate subtree widths first
  const subtreeWidths = new Map<string, number>()
  
  const calculateSubtreeWidth = (node: TreeNode): number => {
    if (node.children.length === 0) {
      subtreeWidths.set(node.id, config.nodeWidth)
      return config.nodeWidth
    }
    
    const childrenWidths = node.children.map(child => calculateSubtreeWidth(child))
    const totalChildrenWidth = childrenWidths.reduce((sum, width) => sum + width, 0) + 
                              (childrenWidths.length - 1) * config.horizontalGap
    
    const width = Math.max(config.nodeWidth, totalChildrenWidth)
    subtreeWidths.set(node.id, width)
    return width
  }
  
  calculateSubtreeWidth(tree)
  
  // Position nodes using proper tree layout
  const positionNode = (node: TreeNode, x: number, y: number, level: number) => {
    // Position this node
    positions.set(node.id, {
      x,
      y,
      id: node.id,
      level
    })
    
    // Position children
    if (node.children.length > 0) {
      const childY = y + config.verticalGap
      const subtreeWidth = subtreeWidths.get(node.id) || config.nodeWidth
      
      // Calculate starting position for children
      let currentX = x - subtreeWidth / 2
      
      node.children.forEach((child, index) => {
        const childSubtreeWidth = subtreeWidths.get(child.id) || config.nodeWidth
        const childCenterX = currentX + childSubtreeWidth / 2
        
        positionNode(child, childCenterX, childY, level + 1)
        
        currentX += childSubtreeWidth + config.horizontalGap
      })
    }
  }
  
  // Start positioning from root
  positionNode(tree, config.startX, config.startY, 0)
  
  // Create connections
  const createConnections = (node: TreeNode) => {
    node.children.forEach(child => {
      connections.push({
        parentId: node.id,
        childId: child.id,
        isMaximizing: node.isMaximizing
      })
      createConnections(child)
    })
  }
  
  createConnections(tree)
  
  return { positions, connections }
}

const MinimaxTree = ({ tree: originalTree }: MinimaxTreeProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined)
  const [scale, setScale] = useState(0.8)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [useRandomTree, setUseRandomTree] = useState(false)
  const [randomTree, setRandomTree] = useState<TreeNode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  const tree = useRandomTree ? randomTree : originalTree

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNodeId(node.id)
  }

  const handleGenerateCompleteTree = () => {
    const newTree = generateCompleteMinimaxTree()
    setRandomTree(newTree)
    setUseRandomTree(true)
    setSelectedNodeId(undefined)
  }

  const handleUseOriginalTree = () => {
    setUseRandomTree(false)
    setSelectedNodeId(undefined)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 2))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3))
  }

  const handleResetView = () => {
    setScale(0.8)
    setPan({ x: 0, y: 0 })
  }

  if (!tree) {
    return (
      <div className="text-center text-gray-300 p-8">
        <div className="text-4xl mb-4">🌳</div>
        <div className="text-lg font-medium mb-2">No tree available</div>
        <div className="text-sm opacity-80 mb-4">Make a move in the game or generate complete minimax tree</div>
        <button
          onClick={handleGenerateCompleteTree}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          Generate Complete Minimax Tree
        </button>
      </div>
    )
  }

  const { positions, connections } = calculateTreeLayout(tree)
  
  // Build node map for quick lookup
  const nodeMap = new Map<string, TreeNode>()
  const buildNodeMap = (node: TreeNode) => {
    nodeMap.set(node.id, node)
    node.children.forEach(child => buildNodeMap(child))
  }
  buildNodeMap(tree)

  // Count nodes by level
  const levelCounts = new Map<number, number>()
  positions.forEach(pos => {
    const count = levelCounts.get(pos.level) || 0
    levelCounts.set(pos.level, count + 1)
  })

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
        <div className="flex items-center gap-4">
          <h4 className="text-white font-bold text-lg flex items-center gap-2">
            🌳 <span>Minimax Search Tree</span>
          </h4>
          
          {/* Tree Info */}
          <div className="text-xs text-gray-300">
            {useRandomTree ? '🧠 Complete Minimax Tree (Depth 2)' : '🎮 Game Tree'} | 
            Nodes: {positions.size} | 
            Levels: {Array.from(levelCounts.entries()).map(([level, count]) => `L${level}:${count}`).join(', ')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tree Type Controls */}
          <button
            onClick={handleGenerateCompleteTree}
            className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded border border-green-500 transition-colors text-xs"
            title="Generate Complete Minimax Tree"
          >
            🧠 Complete
          </button>
          
          {originalTree && (
            <button
              onClick={handleUseOriginalTree}
              className="px-3 py-1 bg-orange-700 hover:bg-orange-600 text-white rounded border border-orange-500 transition-colors text-xs"
              title="Use Game Tree"
            >
              🎮 Game
            </button>
          )}
          
          {/* Zoom Controls */}
          <div className="border-l border-gray-600 pl-2 ml-2 flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-500 transition-colors"
              title="Zoom Out"
            >
              -
            </button>
            <span className="text-white text-sm min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-500 transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={handleResetView}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded border border-blue-500 transition-colors text-xs"
              title="Reset View"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tree Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden bg-gray-900 relative cursor-move rounded-lg border border-gray-700"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="relative w-full h-full"
          style={{
            transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            minWidth: '1400px',
            minHeight: '800px'
          }}
        >
          {/* Connection Lines */}
          <ConnectionLines connections={connections} nodePositions={positions} />
          
          {/* Tree Nodes */}
          {Array.from(positions.entries()).map(([nodeId, position]) => {
            const node = nodeMap.get(nodeId)
            if (!node) return null
            
            return (
              <TreeNodeComponent
                key={nodeId}
                node={node}
                position={position}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNodeId}
                isRoot={nodeId === tree.id}
              />
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-600 shadow-sm inline-block">
          <div className="text-xs text-gray-200 flex items-center gap-4">
            <span>💡 Generate Complete Minimax Tree • Click nodes to select • Drag to pan • Use +/- to zoom</span>
            {selectedNodeId && (
              <span className="text-yellow-300">• Node selected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MinimaxTree