# Design Document

## Overview

The Drawing Game System is a real-time multiplayer web application that enables players to participate in drawing and guessing games similar to Gartic Phone/Montagsmaler. The system uses WebSocket connections for bidirectional real-time communication between clients and server, ensuring low-latency transmission of drawing events and game state updates.

The application follows a client-server architecture where:
- The server manages game state, validates guesses, calculates scores, and broadcasts updates
- Clients render the drawing canvas, capture user input, and display game state
- WebSocket connections provide the real-time communication layer

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Canvas     │  │    Game UI   │  │   WebSocket  │      │
│  │   Renderer   │  │  Components  │  │    Client    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    WebSocket Connection
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Server Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   WebSocket  │  │  Game Room   │  │    Scoring   │      │
│  │    Server    │  │   Manager    │  │    Engine    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Server:**
- Node.js with TypeScript for type safety
- ws library for WebSocket server implementation
- Express.js for HTTP endpoints (room listing, health checks)

**Client:**
- Angular 17+ framework for component-based UI
- HTML5 Canvas API for drawing
- RxJS for reactive WebSocket communication
- Angular services for state management and WebSocket handling
- TypeScript for type-safe client code

### Component Architecture

The system is organized into three main layers:

1. **Transport Layer**: WebSocket connection management, message serialization/deserialization
2. **Game Logic Layer**: Room management, round progression, scoring, validation
3. **Presentation Layer**: Canvas rendering, UI updates, user input handling

## Components and Interfaces

### Server Components

#### WebSocketServer
Manages WebSocket connections and message routing.

```typescript
interface WebSocketServer {
  start(port: number): void;
  onConnection(handler: (client: WebSocketClient) => void): void;
  broadcast(roomId: string, message: GameMessage): void;
  sendToClient(clientId: string, message: GameMessage): void;
}
```

#### GameRoomManager
Manages multiple game rooms and their lifecycle.

```typescript
interface GameRoomManager {
  createRoom(roomId: string): GameRoom;
  getRoom(roomId: string): GameRoom | null;
  deleteRoom(roomId: string): void;
  addPlayerToRoom(roomId: string, player: Player): void;
  removePlayerFromRoom(roomId: string, playerId: string): void;
  listActiveRooms(): RoomInfo[];
}
```

#### GameRoom
Represents a single game session with its state and players.

```typescript
interface GameRoom {
  id: string;
  players: Map<string, Player>;
  currentRound: number;
  maxRounds: number;
  activeDrawerId: string | null;
  currentPrompt: string | null;
  roundTimer: Timer | null;
  scores: Map<string, number>;
  
  startGame(): void;
  startRound(): void;
  endRound(): void;
  processGuess(playerId: string, guess: string): GuessResult;
  selectNextDrawer(): string;
  broadcastToAll(message: GameMessage): void;
  broadcastToGuessers(message: GameMessage): void;
}
```

#### ScoringEngine
Calculates points based on guess timing and correctness.

```typescript
interface ScoringEngine {
  calculatePoints(guessTime: number, roundDuration: number, guessOrder: number): number;
  updateScore(playerId: string, points: number): void;
  getScoreboard(): Scoreboard;
  getFinalRankings(): PlayerRanking[];
}
```

### Client Components (Angular)

#### WebSocketService (Angular Service)
Manages client-side WebSocket connection using RxJS observables.

```typescript
@Injectable({ providedIn: 'root' })
class WebSocketService {
  messages$: Observable<GameMessage>;
  connectionStatus$: Observable<ConnectionStatus>;
  
  connect(url: string, roomId: string, playerName: string): void;
  disconnect(): void;
  send(message: GameMessage): void;
}
```

#### CanvasComponent (Angular Component)
Handles drawing on the HTML5 canvas with Angular lifecycle hooks.

```typescript
@Component({ selector: 'app-canvas' })
class CanvasComponent {
  @Input() isDrawer: boolean;
  @Output() strokeDrawn = new EventEmitter<DrawingStroke>();
  
  drawStroke(stroke: DrawingStroke): void;
  changeColor(color: string): void;
  changeBrushSize(size: number): void;
  clear(): void;
}
```

#### GameStateService (Angular Service)
Manages game state using RxJS BehaviorSubjects for reactive updates.

```typescript
@Injectable({ providedIn: 'root' })
class GameStateService {
  players$: Observable<Player[]>;
  scores$: Observable<Scoreboard>;
  timeRemaining$: Observable<number>;
  currentPrompt$: Observable<string | null>;
  guesses$: Observable<Guess[]>;
  isDrawer$: Observable<boolean>;
  
  updatePlayers(players: Player[]): void;
  updateScores(scores: Scoreboard): void;
  updateTimer(time: number): void;
  addGuess(guess: Guess): void;
}
```

#### GameComponent (Angular Component)
Main game component that orchestrates all child components.

```typescript
@Component({ selector: 'app-game' })
class GameComponent {
  // Subscribes to GameStateService observables
  // Coordinates CanvasComponent, PlayerListComponent, ScoreboardComponent, etc.
}
```

#### Additional Angular Components
- **PlayerListComponent**: Displays connected players
- **ScoreboardComponent**: Shows current scores
- **GuessFeedComponent**: Displays guess history
- **GuessInputComponent**: Text input for submitting guesses
- **TimerComponent**: Countdown timer display
- **RoomJoinComponent**: Room selection and player name entry

## Data Models

### Player
```typescript
interface Player {
  id: string;
  name: string;
  connectionId: string;
  score: number;
  isConnected: boolean;
}
```

### DrawingStroke
```typescript
interface DrawingStroke {
  type: 'line' | 'clear';
  points: Point[];
  color: string;
  brushSize: number;
  timestamp: number;
}

interface Point {
  x: number;
  y: number;
}
```

### GameMessage
All WebSocket messages follow a common structure:

```typescript
type GameMessage = 
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | RoundStartMessage
  | DrawingEventMessage
  | GuessMessage
  | GuessResultMessage
  | ScoreUpdateMessage
  | TimerUpdateMessage
  | RoundEndMessage
  | GameEndMessage;

interface BaseMessage {
  type: string;
  timestamp: number;
}

interface PlayerJoinedMessage extends BaseMessage {
  type: 'player_joined';
  player: Player;
  players: Player[];
}

interface DrawingEventMessage extends BaseMessage {
  type: 'drawing_event';
  stroke: DrawingStroke;
}

interface GuessMessage extends BaseMessage {
  type: 'guess';
  playerId: string;
  playerName: string;
  guess: string;
}

interface GuessResultMessage extends BaseMessage {
  type: 'guess_result';
  playerId: string;
  correct: boolean;
  pointsAwarded: number;
}
```

### GameConfig
```typescript
interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  roundDuration: number; // seconds
  intermissionDuration: number; // seconds
  totalRounds: number;
  prompts: string[];
}
```

## Cor
rectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Connection and Room Management Properties

Property 1: Valid connection adds player to room
*For any* valid room identifier and player data, when a connection is established, the player should appear in the room's player list and all existing players should receive the updated player list.
**Validates: Requirements 1.1, 1.2**

Property 2: Disconnection removes player and notifies others
*For any* game room with multiple players, when one player disconnects, that player should be removed from the room's player list and all remaining players should receive a notification.
**Validates: Requirements 1.3**

Property 3: Non-existent room creates new room
*For any* room identifier that doesn't currently exist, when a player attempts to connect, a new room with that identifier should be created and the player should be added to it.
**Validates: Requirements 1.4**

Property 4: Invalid connection data is rejected
*For any* malformed or invalid connection data, the connection attempt should be rejected and an error message should be returned.
**Validates: Requirements 1.5**

### Game Round Properties

Property 5: Minimum players starts game
*For any* game room, when the number of players reaches the configured minimum, the first game round should automatically start.
**Validates: Requirements 2.1**

Property 6: Fair drawer rotation
*For any* game with N players over N rounds, each player should be selected as the active drawer exactly once.
**Validates: Requirements 2.2**

Property 7: Prompt isolation to drawer
*For any* round start, only the active drawer should receive the prompt word, and all guessers should not receive it.
**Validates: Requirements 2.3, 2.4**

Property 8: Clean canvas on round start
*For any* round start, all players should receive a canvas clear event regardless of previous canvas state.
**Validates: Requirements 2.5**

### Drawing Transmission Properties

Property 9: Tool changes broadcast to guessers
*For any* tool or color change by the active drawer, all guessers should receive the corresponding drawing event.
**Validates: Requirements 3.2**

Property 10: Drawing event rendering consistency
*For any* drawing event sent by the active drawer, when rendered on guesser canvases, the position, color, and brush size should match the original exactly.
**Validates: Requirements 3.3**

Property 11: Canvas clear synchronization
*For any* canvas clear action by the active drawer, all guesser canvases should be reset to empty state.
**Validates: Requirements 3.4**

Property 12: Drawing event sequence preservation
*For any* sequence of drawing events, all guessers should receive the events in the same order they were sent.
**Validates: Requirements 3.5**

### Guessing and Scoring Properties

Property 13: Case-insensitive guess matching
*For any* guess and prompt word, the matching should be case-insensitive (e.g., "APPLE", "apple", "Apple" should all match "apple").
**Validates: Requirements 4.1**

Property 14: Correct guess awards points and broadcasts
*For any* correct guess, the guesser should receive points and all players should receive a broadcast notification of the correct guess.
**Validates: Requirements 4.2**

Property 15: All guesses appear in feed
*For any* guess submission (correct or incorrect), the guess should appear in the shared guess feed visible to all players.
**Validates: Requirements 4.4**

Property 16: Earlier correct guesses earn more points
*For any* set of correct guesses in a round, guesses with earlier timestamps should receive more points than guesses with later timestamps.
**Validates: Requirements 4.5**

Property 17: Score updates broadcast to all players
*For any* point-earning event, the updated scoreboard should be broadcast to all players in the room.
**Validates: Requirements 5.1, 5.2**

Property 18: Final rankings calculated correctly
*For any* completed game, the final rankings should list players in descending order by total points accumulated across all rounds.
**Validates: Requirements 5.3, 5.4**

Property 19: Disconnected player score preservation
*For any* player who disconnects during a game, their score should remain unchanged in the game state for the duration of the session.
**Validates: Requirements 5.5**

### Timer Properties

Property 20: Timer initialization on round start
*For any* round start, all players should receive a timer initialization message with the round duration.
**Validates: Requirements 6.1**

Property 21: Timer expiration ends round
*For any* round where the timer reaches zero, the round should end and the prompt word should be revealed to all players.
**Validates: Requirements 6.2**

Property 22: All correct guesses end round early
*For any* round where all guessers submit correct guesses before timer expiration, the round should end immediately.
**Validates: Requirements 6.3**

Property 23: Intermission before next round
*For any* round end, the next round should start after the configured intermission duration.
**Validates: Requirements 6.4**

Property 24: Timer updates broadcast periodically
*For any* active round timer, time remaining updates should be broadcast to all players at regular intervals.
**Validates: Requirements 6.5**

### Multi-Room Properties

Property 25: Room isolation
*For any* two different game rooms, game state, player lists, and messages in one room should never affect or be visible to players in the other room.
**Validates: Requirements 7.1, 7.2**

Property 26: Empty room cleanup
*For any* game room that becomes empty, the room resources should be cleaned up after the configured timeout period.
**Validates: Requirements 7.3**

Property 27: Message routing correctness
*For any* WebSocket message from a player, the message should be routed only to the game room associated with that player's room identifier.
**Validates: Requirements 7.4**

Property 28: Active room query accuracy
*For any* query for active rooms, the returned list should include all non-empty rooms with accurate current player counts.
**Validates: Requirements 7.5**

## Error Handling

### Connection Errors
- **Invalid room ID format**: Return error message, reject connection
- **Server capacity exceeded**: Return error message indicating server is full
- **Duplicate player name in room**: Return error message, suggest alternative name
- **WebSocket protocol errors**: Log error, close connection gracefully

### Game State Errors
- **Drawer disconnects mid-round**: End round immediately, select new drawer, start new round
- **All players disconnect**: Clean up room immediately
- **Invalid drawing event data**: Log warning, ignore malformed event, continue game
- **Timer synchronization issues**: Use server-side timer as source of truth, resync clients

### Guess Processing Errors
- **Empty guess submission**: Ignore, do not broadcast
- **Guess after round ended**: Ignore, inform player round has ended
- **Rapid guess spam**: Rate limit guesses (e.g., max 1 per second per player)

### Room Management Errors
- **Room creation failure**: Return error, suggest retry
- **Room not found during message routing**: Log error, disconnect player with error message
- **Concurrent room modifications**: Use locking or atomic operations to prevent race conditions

## Testing Strategy

### Unit Testing

The system will use **Jest** as the testing framework for both server and client code.

Unit tests will cover:
- **Game logic functions**: Scoring calculations, drawer selection, guess validation
- **Message serialization/deserialization**: Ensure all message types can be correctly encoded and decoded
- **Room management operations**: Creating, deleting, and querying rooms
- **Canvas rendering functions**: Individual drawing operations (lines, clears, color changes)
- **Edge cases**: Empty rooms, single player, maximum players, timer edge cases

Example unit tests:
- Scoring calculation with various guess times
- Drawer rotation with different player counts
- Case-insensitive guess matching with various inputs
- Room cleanup after timeout

### Property-Based Testing

The system will use **fast-check** for property-based testing in TypeScript.

Property-based tests will:
- Run a minimum of 100 iterations per property
- Generate random game states, player configurations, and message sequences
- Verify that correctness properties hold across all generated inputs
- Each property-based test will be tagged with a comment referencing the design document property

Example property-based tests:
- Property 6 (Fair drawer rotation): Generate random player lists, run N rounds, verify each player selected once
- Property 13 (Case-insensitive matching): Generate random strings with various casings, verify matching works
- Property 25 (Room isolation): Generate multiple rooms with random messages, verify no cross-contamination

**Test Tagging Format:**
Each property-based test must include a comment in this exact format:
```typescript
// Feature: drawing-game, Property 6: Fair drawer rotation
```

### Integration Testing

Integration tests will verify:
- End-to-end WebSocket communication flow
- Multiple clients connecting and interacting simultaneously
- Complete game rounds from start to finish
- Room isolation with concurrent games

### Test Environment

- **Mock WebSocket connections** for unit testing game logic without network
- **In-memory room storage** for fast test execution
- **Deterministic random number generation** for reproducible property tests
- **Time mocking** for timer-related tests

## Implementation Notes

### WebSocket Message Protocol

All messages will be JSON-encoded with a common structure:
```json
{
  "type": "message_type",
  "timestamp": 1234567890,
  "payload": { }
}
```

### Drawing Event Optimization

To minimize bandwidth:
- Batch multiple drawing points into single messages when possible
- Use delta encoding for consecutive points
- Compress color values to hex strings
- Limit drawing event rate (e.g., max 60 events per second)

### Scalability Considerations

- Use room-based message broadcasting to avoid O(n) broadcasts to all connected clients
- Implement connection pooling and rate limiting
- Consider Redis for room state if scaling beyond single server
- Use WebSocket compression for reduced bandwidth

### Security Considerations

- Validate all client input (room IDs, player names, guesses, drawing events)
- Implement rate limiting on connections and messages
- Sanitize player names to prevent XSS
- Use HTTPS/WSS in production
- Implement room passwords or access codes if needed

## Future Enhancements

- Custom word lists and categories
- Drawing tools: eraser, fill bucket, shapes
- Replay functionality to review drawings
- Spectator mode for non-playing viewers
- Mobile-responsive canvas controls
- Persistent user accounts and statistics
- Multiple game modes (e.g., team play, elimination rounds)
