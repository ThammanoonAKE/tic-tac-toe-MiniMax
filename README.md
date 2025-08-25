# Tic-Tac-Toe with Minimax AI

A sophisticated Tic-Tac-Toe game built with Next.js 15 and React, featuring an unbeatable AI opponent powered by the Minimax algorithm with alpha-beta pruning. The game includes real-time AI thinking visualization, showing the decision-making process behind each move.

## 🎮 Features

- **Unbeatable AI**: Powered by the Minimax algorithm with alpha-beta pruning optimization
- **AI Thinking Visualization**: Watch the AI's decision-making process in real-time
- **Score Tracking**: Persistent score tracking across multiple games
- **Modern UI**: Beautiful glassmorphic design with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Win Detection**: Automatic win pattern highlighting
- **Game Analytics**: View AI performance metrics including depth and nodes evaluated

## 🤖 AI Algorithm

The AI uses the **Minimax algorithm** with the following optimizations:

- **Alpha-beta pruning** for improved performance
- **Depth-aware scoring** (prefers earlier wins and later losses)
- **Real-time metrics collection** for visualization
- **Complete game tree exploration** ensuring optimal moves

### Algorithm Metrics Displayed:
- Current thinking depth
- Total nodes evaluated
- Best score for current position
- Move evaluation grid showing scores for all positions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tic-tac-toe-minimax.git
cd tic-tac-toe-minimax
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play!

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── TicTacToeGame.tsx    # Main game logic and Minimax implementation
│   ├── GameBoard.tsx        # Game board rendering
│   └── AIThinkingPanel.tsx  # AI visualization panel
└── types/
    └── game.ts          # TypeScript type definitions
```

## 🧠 How the AI Works

The AI evaluates every possible game state using the Minimax algorithm:

1. **Game Tree Generation**: Creates a tree of all possible future game states
2. **Position Evaluation**: Scores each position (+10 for AI win, -10 for human win, 0 for draw)
3. **Minimax Decision**: Chooses the move that maximizes AI's minimum guaranteed score
4. **Alpha-Beta Pruning**: Eliminates branches that won't affect the final decision
5. **Depth Preference**: Prefers quicker wins and slower losses

## 🎯 Game Rules

- **Human Player**: X (goes first)
- **AI Player**: O (moves automatically after human)
- **Winning**: Get three in a row (horizontally, vertically, or diagonally)
- **Draw**: When the board is full with no winner

## 🎨 UI Features

- **Glassmorphic Design**: Modern translucent card-based interface
- **Smooth Animations**: Engaging transitions and hover effects
- **Win Highlighting**: Visual emphasis on winning patterns
- **Real-time Updates**: AI thinking process shown live
- **Score Persistence**: Scores maintained across game rounds

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Other Platforms

This Next.js application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Digital Ocean
- AWS
- Google Cloud Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Minimax algorithm implementation with alpha-beta pruning
- Inspired by classic game theory and artificial intelligence concepts
