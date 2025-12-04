# Drawing Game

A real-time multiplayer drawing and guessing game built with WebSockets, similar to Gartic Phone/Skribbl.io.

## Features

- Real-time multiplayer gameplay via WebSockets
- Automatic game start when minimum players join
- Fair drawer rotation system
- Time-based scoring (earlier correct guesses earn more points)
- Room-based isolation (multiple games can run simultaneously)
- Automatic room cleanup when empty

## Architecture

### Server (Node.js + TypeScript)
- **WebSocket Server**: Handles real-time bidirectional communication
- **Game Room Manager**: Manages multiple concurrent game rooms
- **Game Room**: Handles game state, rounds, and player management
- **Scoring Engine**: Calculates points based on guess timing
- **Timer**: Manages round and intermission timers

### Client (Angular + TypeScript + Tailwind CSS)
- Angular 17 standalone components
- **Modern UI with Tailwind CSS** - Gradients, icons, no overflow scrolling
- HTML5 Canvas for drawing with mouse input
- Real-time updates via WebSocket connection
- Reactive state management with RxJS
- Responsive layout with Flexbox (no overflow)

## Getting Started

### Prerequisites
- Node.js 20+ (use nvm: `nvm use 20`)
- npm

### Installation

```bash
cd server
npm install
```

### Running the Server

```bash
cd server

# Development mode (with auto-reload)
./test-server.sh

# Or with npm
npm run dev

# Production mode
npm run build
npm start
```

The server will start on port 3000 by default.

### Running the Client

```bash
cd drawing-game-client

# Development mode
./start-client.sh

# Or with npm
npm start
```

The client will start on port 4200. Open http://localhost:4200 in your browser.

### Testing the Server

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Test with the included WebSocket client:
```bash
node test-client.js
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /rooms` - List active game rooms
- `ws://localhost:3000` - WebSocket endpoint for game connections

## WebSocket Protocol

### Client → Server Messages

**Join Room:**
```json
{
  "type": "join",
  "roomId": "room-123",
  "playerName": "Alice"
}
```

**Draw Stroke:**
```json
{
  "type": "draw",
  "stroke": {
    "type": "line",
    "points": [{"x": 10, "y": 20}, {"x": 15, "y": 25}],
    "color": "#000000",
    "brushSize": 5,
    "timestamp": 1234567890
  }
}
```

**Submit Guess:**
```json
{
  "type": "guess",
  "guess": "elephant"
}
```

**Tool Change:**
```json
{
  "type": "tool_change",
  "color": "#FF0000",
  "brushSize": 10
}
```

**Clear Canvas:**
```json
{
  "type": "clear_canvas"
}
```

### Server → Client Messages

**Player Joined:**
```json
{
  "type": "player_joined",
  "player": {...},
  "players": [...],
  "timestamp": 1234567890
}
```

**Round Start:**
```json
{
  "type": "round_start",
  "roundNumber": 1,
  "isDrawer": true,
  "prompt": "elephant",
  "drawerId": "player-id",
  "timestamp": 1234567890
}
```

**Guess:**
```json
{
  "type": "guess",
  "playerId": "player-id",
  "playerName": "Alice",
  "guess": "elephant",
  "timestamp": 1234567890
}
```

**Score Update:**
```json
{
  "type": "score_update",
  "scores": {
    "player-id-1": 1500,
    "player-id-2": 800
  },
  "timestamp": 1234567890
}
```

## Game Configuration

Default configuration (in `server/src/config.ts`):
- Minimum players: 2
- Maximum players: 8
- Round duration: 60 seconds
- Intermission duration: 5 seconds
- Total rounds: 3
- 60+ prompt words

## Project Structure

```
server/
├── src/
│   ├── models/
│   │   └── types.ts          # TypeScript interfaces and types
│   ├── services/
│   │   ├── GameRoom.ts       # Game room logic
│   │   ├── GameRoomManager.ts # Room management
│   │   ├── ScoringEngine.ts  # Scoring calculations
│   │   └── Timer.ts          # Timer implementation
│   ├── websocket/
│   │   └── WebSocketServer.ts # WebSocket server
│   ├── config.ts             # Game configuration
│   └── index.ts              # Server entry point
├── tests/                    # Test files
└── package.json
```

## Development Status

✅ **Completed:**
- ✅ Server infrastructure and WebSocket handling
- ✅ Game room management and player lifecycle
- ✅ Round management and drawer rotation
- ✅ Guess processing and scoring
- ✅ Drawing event broadcasting
- ✅ Room isolation and cleanup
- ✅ Error handling and logging
- ✅ Angular client application
- ✅ Canvas drawing interface with mouse input
- ✅ All UI components (player list, scoreboard, timer, guess feed)
- ✅ Real-time game synchronization
- ✅ Responsive layout

## How to Play

1. **Start the server** (in one terminal):
   ```bash
   cd server
   ./test-server.sh
   ```

2. **Start the client** (in another terminal):
   ```bash
   cd drawing-game-client
   ./start-client.sh
   ```

3. **Open your browser** to http://localhost:4200

4. **Join a room**:
   - Enter a Room ID (e.g., "room1")
   - Enter your name
   - Click "Join Game"

5. **Play**:
   - When it's your turn to draw, you'll see the word to draw
   - Use the canvas tools to draw
   - Other players will guess what you're drawing
   - When you're guessing, type your guess in the input box
   - Points are awarded for correct guesses (earlier = more points!)

6. **Invite friends**:
   - Share the same Room ID with friends
   - Game starts automatically when 2+ players join

## Next Steps

1. Add property-based tests for core game logic
2. Add round end and game end modals
3. Add sound effects and animations
4. Implement touch support for mobile devices
5. Add more drawing tools (eraser, shapes, fill)
6. Deploy to production

## License

MIT