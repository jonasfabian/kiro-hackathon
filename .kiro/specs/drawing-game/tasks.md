# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create server directory with TypeScript configuration (tsconfig.json)
  - Install server dependencies: ws, express, fast-check, jest, ts-jest, @types packages
  - Set up build and test scripts in package.json
  - Create directory structure: server/src/{models,services,websocket}, server/tests
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Implement shared type definitions
  - Create server/src/models/types.ts with Player, DrawingStroke, Point interfaces
  - Define GameMessage discriminated union types (PlayerJoinedMessage, DrawingEventMessage, etc.)
  - Create GameConfig interface with game parameters
  - Add type guards for message validation
  - _Requirements: 1.1, 3.2, 4.1_

- [ ] 3. Implement core game room logic
  - [x] 3.1 Create GameRoom class in server/src/services/GameRoom.ts
    - Implement constructor with room ID and config
    - Add player management methods: addPlayer, removePlayer
    - Track players with Map<string, Player>
    - Implement room state: currentRound, activeDrawerId, scores, currentPrompt
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 3.2 Write property test for player management
    - **Property 1: Valid connection adds player to room**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 3.3 Implement drawer selection and rotation
    - Create selectNextDrawer method with round-robin algorithm
    - Track drawer history to ensure fair rotation
    - _Requirements: 2.2_
  
  - [ ]* 3.4 Write property test for drawer rotation
    - **Property 6: Fair drawer rotation**
    - **Validates: Requirements 2.2**
  
  - [x] 3.5 Implement round lifecycle methods
    - Create startRound method: select drawer, choose prompt, clear canvas
    - Create endRound method: reveal prompt, calculate scores
    - Implement prompt word selection from config.prompts array
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  
  - [ ]* 3.6 Write property test for round initialization
    - **Property 8: Clean canvas on round start**
    - **Validates: Requirements 2.5**

- [ ] 4. Implement scoring engine
  - [x] 4.1 Create ScoringEngine class in server/src/services/ScoringEngine.ts
    - Implement calculatePoints(guessTime, roundDuration, guessOrder): number
    - Use time-based formula: more points for earlier guesses
    - Implement updateScore(playerId, points) and getScoreboard() methods
    - Implement getFinalRankings() with descending sort by total points
    - _Requirements: 4.2, 4.5, 5.1, 5.3, 5.4_
  
  - [ ]* 4.2 Write property test for point calculation
    - **Property 16: Earlier correct guesses earn more points**
    - **Validates: Requirements 4.5**
  
  - [ ]* 4.3 Write property test for scoreboard sorting
    - **Property 18: Final rankings calculated correctly**
    - **Validates: Requirements 5.3, 5.4**

- [ ] 5. Implement guess processing logic
  - [x] 5.1 Add guess validation to GameRoom
    - Implement processGuess(playerId, guess) method
    - Use case-insensitive comparison: guess.toLowerCase().trim() === prompt.toLowerCase().trim()
    - Return GuessResult with correct/incorrect flag
    - Track guess timestamps and order
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 5.2 Write property test for guess matching
    - **Property 13: Case-insensitive guess matching**
    - **Validates: Requirements 4.1**
  
  - [x] 5.3 Integrate scoring with guess processing
    - Award points using ScoringEngine for correct guesses
    - Track which players have guessed correctly
    - Check if all guessers have guessed correctly (early round end)
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ]* 5.4 Write property test for guess broadcasting
    - **Property 15: All guesses appear in feed**
    - **Validates: Requirements 4.4**

- [ ] 6. Implement room manager
  - [x] 6.1 Create GameRoomManager class in server/src/services/GameRoomManager.ts
    - Store rooms in Map<string, GameRoom>
    - Implement createRoom(roomId, config): GameRoom
    - Implement getRoom(roomId): GameRoom | null
    - Implement deleteRoom(roomId): void
    - Implement getOrCreateRoom(roomId, config): GameRoom
    - Implement listActiveRooms(): RoomInfo[]
    - _Requirements: 1.4, 7.3, 7.5_
  
  - [ ]* 6.2 Write property test for room creation
    - **Property 3: Non-existent room creates new room**
    - **Validates: Requirements 1.4**
  
  - [x] 6.3 Implement room cleanup logic
    - Add isEmpty() method to GameRoom
    - Implement cleanup timer: delete room after 5 minutes of being empty
    - Clear timers on room deletion
    - _Requirements: 7.3_
  
  - [ ]* 6.4 Write property test for room cleanup
    - **Property 26: Empty room cleanup**
    - **Validates: Requirements 7.3**

- [ ] 7. Implement WebSocket server
  - [x] 7.1 Create WebSocketServer class in server/src/websocket/WebSocketServer.ts
    - Initialize ws.Server
    - Track connections: Map<connectionId, {ws: WebSocket, playerId, roomId}>
    - Implement handleConnection(ws: WebSocket) method
    - Implement handleDisconnection(connectionId) method
    - _Requirements: 1.1, 1.5_
  
  - [x] 7.2 Implement message handling and routing
    - Parse incoming JSON messages
    - Validate message structure with type guards
    - Route messages by type: 'join', 'draw', 'guess', 'tool_change', 'clear_canvas'
    - Handle malformed messages: send error response, log warning
    - _Requirements: 1.5, 7.4_
  
  - [ ]* 7.3 Write property test for message routing
    - **Property 27: Message routing correctness**
    - **Validates: Requirements 7.4**
  
  - [x] 7.4 Implement broadcasting methods
    - Create broadcastToRoom(roomId, message, excludeConnectionId?) method
    - Create sendToConnection(connectionId, message) method
    - Ensure messages only go to players in the same room
    - _Requirements: 1.2, 7.1, 7.2_
  
  - [ ]* 7.5 Write property test for room isolation
    - **Property 25: Room isolation**
    - **Validates: Requirements 7.1, 7.2**

- [ ] 8. Implement connection lifecycle handling
  - [x] 8.1 Handle player join messages
    - Parse 'join' message: {type: 'join', roomId, playerName}
    - Validate: roomId and playerName are non-empty strings
    - Get or create room via GameRoomManager
    - Create Player object and add to room
    - Send player_joined message to all players in room
    - Check if game should start (minimum players reached)
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [ ]* 8.2 Write property test for invalid connections
    - **Property 4: Invalid connection data is rejected**
    - **Validates: Requirements 1.5**
  
  - [x] 8.3 Handle player disconnections
    - Listen for WebSocket 'close' event
    - Remove player from room: room.removePlayer(playerId)
    - Broadcast player_left message to remaining players
    - Keep player score in room.scores map (don't delete)
    - If drawer disconnects: end round, select new drawer, start new round
    - _Requirements: 1.3, 5.5_
  
  - [ ]* 8.4 Write property test for disconnection handling
    - **Property 2: Disconnection removes player and notifies others**
    - **Validates: Requirements 1.3**
  
  - [ ]* 8.5 Write property test for score preservation
    - **Property 19: Disconnected player score preservation**
    - **Validates: Requirements 5.5**

- [ ] 9. Implement timer system
  - [x] 9.1 Create Timer class in server/src/services/Timer.ts
    - Constructor: Timer(durationSeconds, onTick, onExpire)
    - Implement start() method using setInterval
    - Implement stop() method to clear interval
    - Call onTick callback every second with remaining time
    - Call onExpire callback when time reaches zero
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 9.2 Integrate timer with GameRoom
    - Add roundTimer: Timer | null property to GameRoom
    - Start timer in startRound(): broadcast timer_update messages
    - On timer expiration: call endRound()
    - Check after each correct guess if all guessers have guessed: end round early
    - _Requirements: 6.2, 6.3, 6.5_
  
  - [ ]* 9.3 Write property test for timer initialization
    - **Property 20: Timer initialization on round start**
    - **Validates: Requirements 6.1**
  
  - [ ]* 9.4 Write property test for early round end
    - **Property 22: All correct guesses end round early**
    - **Validates: Requirements 6.3**
  
  - [x] 9.5 Implement intermission timer
    - After endRound(), start intermission timer (e.g., 5 seconds)
    - Broadcast round_end message with prompt reveal
    - After intermission: call startRound() for next round or end game
    - _Requirements: 6.4_
  
  - [ ]* 9.6 Write property test for intermission
    - **Property 23: Intermission before next round**
    - **Validates: Requirements 6.4**

- [ ] 10. Implement drawing event handling
  - [x] 10.1 Add drawing event handlers to WebSocketServer
    - Handle 'draw' message: {type: 'draw', stroke: DrawingStroke}
    - Handle 'tool_change' message: {type: 'tool_change', color, brushSize}
    - Handle 'clear_canvas' message: {type: 'clear_canvas'}
    - Validate sender is the active drawer for the room
    - If not drawer, send error message and ignore
    - _Requirements: 3.2, 3.4_
  
  - [x] 10.2 Implement drawing event broadcasting
    - Broadcast drawing_event messages to all players in room except drawer
    - Add timestamp to each drawing event
    - Maintain event order (WebSocket guarantees order per connection)
    - _Requirements: 3.2, 3.4, 3.5_
  
  - [ ]* 10.3 Write property test for tool change broadcasting
    - **Property 9: Tool changes broadcast to guessers**
    - **Validates: Requirements 3.2**
  
  - [ ]* 10.4 Write property test for canvas clear
    - **Property 11: Canvas clear synchronization**
    - **Validates: Requirements 3.4**
  
  - [ ]* 10.5 Write property test for event ordering
    - **Property 12: Drawing event sequence preservation**
    - **Validates: Requirements 3.5**

- [ ] 11. Implement game start logic
  - [x] 11.1 Add game start logic to GameRoom
    - Add hasStarted boolean flag to GameRoom
    - In addPlayer: check if players.size >= config.minPlayers and !hasStarted
    - If true: set hasStarted = true, call startRound()
    - _Requirements: 2.1_
  
  - [ ]* 11.2 Write property test for game start
    - **Property 5: Minimum players starts game**
    - **Validates: Requirements 2.1**
  
  - [x] 11.3 Implement prompt distribution in startRound
    - Send round_start message to drawer with prompt: {type: 'round_start', prompt, isDrawer: true}
    - Send round_start message to guessers without prompt: {type: 'round_start', isDrawer: false}
    - Use broadcastToRoom with excludeConnectionId for targeted messages
    - _Requirements: 2.3, 2.4_
  
  - [ ]* 11.4 Write property test for prompt isolation
    - **Property 7: Prompt isolation to drawer**
    - **Validates: Requirements 2.3, 2.4**

- [ ] 12. Create server entry point and configuration
  - [x] 12.1 Create server/src/config.ts
    - Export default GameConfig with minPlayers: 2, maxPlayers: 8, roundDuration: 60
    - Create prompts array with 50+ words/concepts
    - Export server port configuration
    - _Requirements: 2.1, 2.3, 6.1_
  
  - [x] 12.2 Create server/src/index.ts
    - Initialize Express app
    - Create HTTP server
    - Initialize WebSocketServer with HTTP server
    - Initialize GameRoomManager singleton
    - Wire WebSocketServer to GameRoomManager
    - Add health check endpoint: GET /health
    - Start server on configured port
    - Add startup logging
    - _Requirements: 1.1, 7.5_

- [x] 13. Checkpoint - Ensure all server tests pass
  - Run all tests: npm test
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Set up Angular client application
  - [x] 14.1 Create Angular application
    - Run: ng new drawing-game-client --routing --style=scss
    - Install dependencies: npm install rxjs
    - Configure tsconfig to use shared types from server
    - _Requirements: 8.1, 8.2_
  
  - [x] 14.2 Create shared types in client
    - Copy or symlink server/src/models/types.ts to client/src/app/models/
    - Ensure client can import Player, GameMessage, DrawingStroke types
    - _Requirements: 1.1, 3.2_

- [ ] 15. Implement Angular WebSocket service
  - [x] 15.1 Create WebSocketService in client/src/app/services/websocket.service.ts
    - Create messages$ Subject<GameMessage> for incoming messages
    - Create connectionStatus$ BehaviorSubject<'connecting' | 'connected' | 'disconnected'>
    - Implement connect(roomId, playerName) method
    - Implement send(message) method
    - Implement disconnect() method
    - Parse incoming JSON messages and emit to messages$
    - _Requirements: 1.1_
  
  - [x] 15.2 Add connection error handling
    - Handle WebSocket errors and update connectionStatus$
    - Implement reconnection with exponential backoff (1s, 2s, 4s, 8s max)
    - Use RxJS retry operators
    - _Requirements: 1.3_

- [ ] 16. Implement Angular canvas component
  - [x] 16.1 Create CanvasComponent in client/src/app/components/canvas/
    - Use @ViewChild to access HTMLCanvasElement
    - Add @Input() isDrawer: boolean
    - Add @Output() strokeDrawn = new EventEmitter<DrawingStroke>()
    - Add @Output() toolChanged = new EventEmitter<{color, brushSize}>()
    - Add @Output() canvasCleared = new EventEmitter<void>()
    - Implement drawStroke(stroke: DrawingStroke) for rendering
    - Implement clear() to reset canvas
    - _Requirements: 3.3, 3.4_
  
  - [ ]* 16.2 Write property test for rendering consistency
    - **Property 10: Drawing event rendering consistency**
    - **Validates: Requirements 3.3**
  
  - [x] 16.3 Implement drawing input capture
    - Listen to mousedown, mousemove, mouseup events on canvas
    - Track drawing state: isDrawing, lastPoint
    - Convert mouse coordinates to canvas coordinates
    - Create DrawingStroke objects with points array
    - Emit strokeDrawn event
    - Render locally for immediate feedback
    - _Requirements: 3.1, 3.2_
  
  - [x] 16.4 Add drawing tool controls
    - Add color picker input: <input type="color" [(ngModel)]="currentColor">
    - Add brush size slider: <input type="range" min="1" max="20" [(ngModel)]="brushSize">
    - Add clear button: <button (click)="onClearCanvas()">Clear</button>
    - Show/hide controls with *ngIf="isDrawer"
    - Emit toolChanged when color or brush size changes
    - _Requirements: 3.2, 3.4_

- [ ] 17. Implement Angular game state service
  - [x] 17.1 Create GameStateService in client/src/app/services/game-state.service.ts
    - Create BehaviorSubject<Player[]> for players$ (initial: [])
    - Create BehaviorSubject<Map<string, number>> for scores$ (initial: new Map())
    - Create BehaviorSubject<number> for timeRemaining$ (initial: 0)
    - Create BehaviorSubject<string | null> for currentPrompt$ (initial: null)
    - Create BehaviorSubject<Guess[]> for guesses$ (initial: [])
    - Create BehaviorSubject<boolean> for isDrawer$ (initial: false)
    - Implement update methods: updatePlayers, updateScores, updateTimer, setPrompt, addGuess, setIsDrawer
    - _Requirements: 1.2, 5.1, 6.1, 2.3_

- [ ] 18. Implement Angular UI components
  - [x] 18.1 Create PlayerListComponent in client/src/app/components/player-list/
    - Inject GameStateService
    - Subscribe to players$ with async pipe in template
    - Display player names with *ngFor
    - Show active drawer indicator
    - _Requirements: 1.2_
  
  - [x] 18.2 Create ScoreboardComponent in client/src/app/components/scoreboard/
    - Subscribe to scores$ and players$
    - Display player names with scores
    - Sort by score descending
    - _Requirements: 5.1_
  
  - [x] 18.3 Create TimerComponent in client/src/app/components/timer/
    - Subscribe to timeRemaining$
    - Format as MM:SS
    - Add CSS class for low time warning (< 10 seconds)
    - _Requirements: 6.1_
  
  - [x] 18.4 Create GuessFeedComponent in client/src/app/components/guess-feed/
    - Subscribe to guesses$
    - Display with *ngFor
    - Show correct/incorrect with CSS classes
    - Auto-scroll to bottom using ViewChild and ngAfterViewChecked
    - _Requirements: 4.4_
  
  - [x] 18.5 Create GuessInputComponent in client/src/app/components/guess-input/
    - Create form with input field
    - Add @Output() guessSubmitted = new EventEmitter<string>()
    - Subscribe to isDrawer$ to disable input when drawer
    - Clear input after submission
    - _Requirements: 4.1_
  
  - [ ] 18.6 Create RoundEndModalComponent in client/src/app/components/round-end-modal/
    - Add @Input() prompt: string
    - Add @Input() scores: Map<string, number>
    - Show prompt reveal
    - Display round scores
    - Auto-close after 5 seconds
    - _Requirements: 6.2, 5.2_
  
  - [ ] 18.7 Create GameEndModalComponent in client/src/app/components/game-end-modal/
    - Add @Input() finalRankings: PlayerRanking[]
    - Display winner with celebration
    - Show full rankings
    - Add "New Game" button
    - _Requirements: 5.3_

- [ ] 19. Create main GameComponent and wire everything together
  - [x] 19.1 Create GameComponent in client/src/app/components/game/
    - Inject WebSocketService and GameStateService
    - Subscribe to messages$ in ngOnInit
    - Add child component selectors in template: app-canvas, app-player-list, app-scoreboard, app-timer, app-guess-feed, app-guess-input
    - Store current playerId and roomId
    - _Requirements: 1.2, 3.3, 4.4, 5.1, 6.5_
  
  - [x] 19.2 Implement message routing in GameComponent
    - Use switch statement on message.type
    - 'player_joined': call GameStateService.updatePlayers(message.players)
    - 'player_left': call GameStateService.updatePlayers(updated list)
    - 'round_start': call GameStateService.setIsDrawer(message.isDrawer), setPrompt(message.prompt)
    - 'drawing_event': call CanvasComponent.drawStroke(message.stroke)
    - 'guess': call GameStateService.addGuess(message)
    - 'score_update': call GameStateService.updateScores(message.scores)
    - 'timer_update': call GameStateService.updateTimer(message.timeRemaining)
    - 'round_end': show RoundEndModalComponent
    - 'game_end': show GameEndModalComponent
    - _Requirements: 1.2, 3.3, 4.4, 5.1, 6.5_
  
  - [x] 19.3 Wire component outputs to WebSocket
    - Listen to CanvasComponent.strokeDrawn: send {type: 'draw', stroke}
    - Listen to CanvasComponent.toolChanged: send {type: 'tool_change', color, brushSize}
    - Listen to CanvasComponent.canvasCleared: send {type: 'clear_canvas'}
    - Listen to GuessInputComponent.guessSubmitted: send {type: 'guess', guess}
    - _Requirements: 3.2, 4.1_

- [ ] 20. Create RoomJoinComponent and routing
  - [x] 20.1 Create RoomJoinComponent in client/src/app/components/room-join/
    - Create reactive form with FormBuilder
    - Add roomId control with Validators.required
    - Add playerName control with Validators.required, Validators.minLength(2)
    - Inject WebSocketService and Router
    - On submit: call WebSocketService.connect(roomId, playerName)
    - Navigate to /game/:roomId on successful connection
    - Display validation errors
    - _Requirements: 1.1_
  
  - [x] 20.2 Set up Angular routing
    - Configure routes in app-routing.module.ts:
      - '' → RoomJoinComponent
      - 'game/:roomId' → GameComponent
    - Import RouterModule
    - _Requirements: 1.1_

- [ ] 21. Style the application
  - [x] 21.1 Create GameComponent layout
    - Use CSS Grid: canvas (main area), sidebar (player list, scoreboard, timer), bottom (guess feed, guess input)
    - Make responsive for different screen sizes
    - _Requirements: 3.1, 4.4, 5.1, 6.1_
  
  - [x] 21.2 Style individual components
    - CanvasComponent: border, white background, cursor styles
    - PlayerListComponent: list styling, active drawer highlight
    - ScoreboardComponent: table or list with scores
    - TimerComponent: large font, warning color for low time
    - GuessFeedComponent: scrollable list, correct (green) / incorrect (gray) styling
    - GuessInputComponent: input field with submit button
    - RoomJoinComponent: centered form with card styling
    - _Requirements: 1.2, 4.4, 5.1_

- [ ] 22. Implement error handling
  - [x] 22.1 Add server-side error handling
    - Validate drawing events: check sender is active drawer
    - Handle empty/whitespace-only guesses: ignore silently
    - Add rate limiting: max 1 guess per second per player
    - Add try-catch blocks around message parsing
    - Send error messages to clients for invalid actions
    - _Requirements: 1.3, 4.1_
  
  - [x] 22.2 Add client-side error handling
    - Subscribe to connectionStatus$ in GameComponent
    - Show "Connecting..." / "Disconnected" UI based on status
    - Display reconnection attempts
    - Show error toast for invalid actions
    - Handle WebSocket errors gracefully
    - _Requirements: 1.3, 1.5_

- [ ] 23. Add logging
  - [x] 23.1 Add server logging
    - Log server startup with port
    - Log player connections: "Player {name} joined room {roomId}"
    - Log player disconnections
    - Log room creation and deletion
    - Log errors and warnings with stack traces
    - Use console.log for now (can upgrade to winston later)
    - _Requirements: 1.1, 1.3, 7.3_

- [x] 24. Final checkpoint - Test end-to-end
  - Start server: npm start
  - Open multiple browser windows
  - Test complete game flow: join, draw, guess, scoring, round end
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 25. Integration testing
  - [ ]* 25.1 Write integration test for complete game flow
    - Use ws library to simulate multiple clients
    - Connect 2+ clients to same room
    - Simulate drawing events and guesses
    - Verify all players receive correct messages
    - Verify scores calculated correctly
    - _Requirements: 1.1, 2.1, 3.2, 4.2, 5.1_
  
  - [ ]* 25.2 Write integration test for room isolation
    - Create 2 rooms with different players
    - Send messages in each room
    - Verify messages don't cross rooms
    - _Requirements: 7.1, 7.2_
