# Implementation Plan

- [ ] 1. Set up project structure and dependencies
  - Create server directory with TypeScript configuration
  - Create Angular client application using Angular CLI (ng new)
  - Install server dependencies: ws, express, fast-check, jest, @types packages
  - Set up build scripts and test scripts in package.json for server
  - Create basic directory structure: server/src, shared/types
  - Configure Angular to use shared types from server
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 2. Implement shared type definitions
  - Create shared TypeScript interfaces for Player, GameMessage types, DrawingStroke, Point, GameConfig
  - Define all message type discriminated unions (PlayerJoinedMessage, DrawingEventMessage, etc.)
  - Create type guards for message validation
  - _Requirements: 1.1, 3.2, 4.1_

- [ ] 3. Implement core game room logic
  - [ ] 3.1 Create GameRoom class with player management
    - Implement player add/remove methods
    - Implement player list tracking with Map<string, Player>
    - Implement room state management (currentRound, activeDrawerId, scores)
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 3.2 Write property test for player management
    - **Property 1: Valid connection adds player to room**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ] 3.3 Implement drawer selection and rotation
    - Create selectNextDrawer method with fair rotation algorithm
    - Track drawer history to ensure each player draws once per cycle
    - _Requirements: 2.2_
  
  - [ ]* 3.4 Write property test for drawer rotation
    - **Property 6: Fair drawer rotation**
    - **Validates: Requirements 2.2**
  
  - [ ] 3.5 Implement round lifecycle methods
    - Create startRound, endRound methods
    - Implement prompt word selection from config
    - Handle round state transitions
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  
  - [ ]* 3.6 Write property test for round initialization
    - **Property 8: Clean canvas on round start**
    - **Validates: Requirements 2.5**

- [ ] 4. Implement scoring engine
  - [ ] 4.1 Create ScoringEngine class
    - Implement calculatePoints method with time-based scoring
    - Implement updateScore and getScoreboard methods
    - Implement getFinalRankings with descending sort
    - _Requirements: 4.2, 4.5, 5.1, 5.3, 5.4_
  
  - [ ]* 4.2 Write property test for point calculation
    - **Property 16: Earlier correct guesses earn more points**
    - **Validates: Requirements 4.5**
  
  - [ ]* 4.3 Write property test for scoreboard sorting
    - **Property 18: Final rankings calculated correctly**
    - **Validates: Requirements 5.3, 5.4**

- [ ] 5. Implement guess processing logic
  - [ ] 5.1 Create guess validation and matching
    - Implement case-insensitive string comparison
    - Handle whitespace trimming
    - Create GuessResult type and processing logic
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 5.2 Write property test for guess matching
    - **Property 13: Case-insensitive guess matching**
    - **Validates: Requirements 4.1**
  
  - [ ] 5.3 Integrate guess processing with GameRoom
    - Implement processGuess method in GameRoom
    - Award points for correct guesses
    - Track guess order and timestamps
    - Broadcast guess results
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ]* 5.4 Write property test for guess broadcasting
    - **Property 15: All guesses appear in feed**
    - **Validates: Requirements 4.4**

- [ ] 6. Implement room manager
  - [ ] 6.1 Create GameRoomManager class
    - Implement room storage with Map<string, GameRoom>
    - Implement createRoom, getRoom, deleteRoom methods
    - Implement addPlayerToRoom, removePlayerFromRoom methods
    - Implement listActiveRooms method
    - _Requirements: 1.4, 7.3, 7.5_
  
  - [ ]* 6.2 Write property test for room creation
    - **Property 3: Non-existent room creates new room**
    - **Validates: Requirements 1.4**
  
  - [ ] 6.3 Implement room cleanup logic
    - Create timeout-based cleanup for empty rooms
    - Implement resource disposal
    - _Requirements: 7.3_
  
  - [ ]* 6.4 Write property test for room cleanup
    - **Property 26: Empty room cleanup**
    - **Validates: Requirements 7.3**

- [ ] 7. Implement WebSocket server
  - [ ] 7.1 Create WebSocketServer class
    - Initialize ws.Server with Express integration
    - Implement connection handler
    - Create client connection tracking with Map<string, WebSocket>
    - _Requirements: 1.1, 1.5_
  
  - [ ] 7.2 Implement message routing
    - Parse incoming WebSocket messages
    - Route messages to correct GameRoom based on room identifier
    - Handle malformed messages with error responses
    - _Requirements: 1.5, 7.4_
  
  - [ ]* 7.3 Write property test for message routing
    - **Property 27: Message routing correctness**
    - **Validates: Requirements 7.4**
  
  - [ ] 7.4 Implement broadcasting methods
    - Create broadcast method for room-specific messages
    - Create sendToClient method for individual messages
    - Ensure room isolation in broadcasts
    - _Requirements: 1.2, 7.1, 7.2_
  
  - [ ]* 7.5 Write property test for room isolation
    - **Property 25: Room isolation**
    - **Validates: Requirements 7.1, 7.2**

- [ ] 8. Implement connection lifecycle handling
  - [ ] 8.1 Handle player connections
    - Parse connection messages with room ID and player name
    - Validate connection data
    - Add player to room via GameRoomManager
    - Broadcast player joined message
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [ ]* 8.2 Write property test for invalid connections
    - **Property 4: Invalid connection data is rejected**
    - **Validates: Requirements 1.5**
  
  - [ ] 8.3 Handle player disconnections
    - Remove player from room on WebSocket close
    - Broadcast player left message
    - Preserve player score in game state
    - Handle drawer disconnection (end round, select new drawer)
    - _Requirements: 1.3, 5.5_
  
  - [ ]* 8.4 Write property test for disconnection handling
    - **Property 2: Disconnection removes player and notifies others**
    - **Validates: Requirements 1.3**
  
  - [ ]* 8.5 Write property test for score preservation
    - **Property 19: Disconnected player score preservation**
    - **Validates: Requirements 5.5**

- [ ] 9. Implement timer system
  - [ ] 9.1 Create Timer class
    - Implement countdown timer with configurable duration
    - Implement periodic update broadcasts
    - Implement timer expiration callback
    - Use server-side timing as source of truth
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ] 9.2 Integrate timer with GameRoom
    - Start timer on round start
    - Broadcast timer updates to all players
    - End round on timer expiration
    - Handle early round end when all guessers guess correctly
    - _Requirements: 6.2, 6.3, 6.5_
  
  - [ ]* 9.3 Write property test for timer initialization
    - **Property 20: Timer initialization on round start**
    - **Validates: Requirements 6.1**
  
  - [ ]* 9.4 Write property test for early round end
    - **Property 22: All correct guesses end round early**
    - **Validates: Requirements 6.3**
  
  - [ ] 9.5 Implement intermission timer
    - Create intermission period between rounds
    - Transition to next round after intermission
    - _Requirements: 6.4_
  
  - [ ]* 9.6 Write property test for intermission
    - **Property 23: Intermission before next round**
    - **Validates: Requirements 6.4**

- [ ] 10. Implement drawing event handling
  - [ ] 10.1 Create drawing event message handlers
    - Handle drawing stroke messages from active drawer
    - Handle tool change messages
    - Handle canvas clear messages
    - Validate that sender is the active drawer
    - _Requirements: 3.2, 3.4_
  
  - [ ] 10.2 Implement drawing event broadcasting
    - Broadcast drawing events only to guessers (not back to drawer)
    - Maintain event sequence order
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
  - [ ] 11.1 Add minimum player check
    - Check player count when players join
    - Automatically start game when minimum reached
    - _Requirements: 2.1_
  
  - [ ]* 11.2 Write property test for game start
    - **Property 5: Minimum players starts game**
    - **Validates: Requirements 2.1**
  
  - [ ] 11.3 Implement prompt distribution
    - Send prompt word only to active drawer
    - Send round start notification to guessers without prompt
    - _Requirements: 2.3, 2.4_
  
  - [ ]* 11.4 Write property test for prompt isolation
    - **Property 7: Prompt isolation to drawer**
    - **Validates: Requirements 2.3, 2.4**

- [ ] 12. Checkpoint - Ensure all server tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement Angular WebSocket service
  - [ ] 13.1 Create WebSocketService (Angular service)
    - Implement connect method with room ID and player name
    - Create RxJS Subject for incoming messages (messages$)
    - Create BehaviorSubject for connection status (connectionStatus$)
    - Implement send method for outgoing messages
    - Use RxJS operators for message handling
    - _Requirements: 1.1_
  
  - [ ] 13.2 Add connection state management
    - Track connection status (connecting, connected, disconnected)
    - Implement reconnection logic with exponential backoff using RxJS retry operators
    - Handle connection errors with error observables
    - _Requirements: 1.3_

- [ ] 14. Implement Angular canvas component
  - [ ] 14.1 Create CanvasComponent (Angular component)
    - Use @ViewChild to access canvas element
    - Implement drawStroke method for rendering lines
    - Implement changeColor and changeBrushSize methods
    - Implement clear method
    - Use @Input() isDrawer to control drawing permissions
    - _Requirements: 3.3, 3.4_
  
  - [ ]* 14.2 Write property test for rendering consistency
    - **Property 10: Drawing event rendering consistency**
    - **Validates: Requirements 3.3**
  
  - [ ] 14.3 Implement drawing input capture
    - Use Angular event bindings for mouse/touch events on canvas
    - Convert to DrawingStroke format
    - Emit drawing events via @Output() strokeDrawn EventEmitter
    - Implement local rendering for immediate feedback
    - _Requirements: 3.1, 3.2_
  
  - [ ] 14.4 Add drawing tool controls to component template
    - Create color picker UI with Angular forms
    - Create brush size selector with range input
    - Add clear button with click handler
    - Use *ngIf to show/hide controls based on isDrawer input
    - _Requirements: 3.2, 3.4_

- [ ] 15. Implement Angular game state service and UI components
  - [ ] 15.1 Create GameStateService (Angular service)
    - Create BehaviorSubjects for players$, scores$, timeRemaining$, currentPrompt$, guesses$, isDrawer$
    - Implement update methods for each state property
    - Expose observables for components to subscribe to
    - _Requirements: 1.2, 5.1, 6.1, 2.3_
  
  - [ ] 15.2 Create GuessFeedComponent
    - Subscribe to guesses$ observable from GameStateService
    - Display guess list with *ngFor
    - Show correct/incorrect indicators with CSS classes
    - Implement auto-scroll using ViewChild and AfterViewChecked
    - _Requirements: 4.4_
  
  - [ ] 15.3 Create GuessInputComponent
    - Create reactive form for guess input
    - Subscribe to isDrawer$ to disable input when drawer
    - Emit guess submissions via @Output() guessSubmitted EventEmitter
    - Clear input after submission
    - _Requirements: 4.1_
  
  - [ ] 15.4 Create PlayerListComponent and ScoreboardComponent
    - PlayerListComponent subscribes to players$ observable
    - ScoreboardComponent subscribes to scores$ observable
    - Display with *ngFor and async pipe
    - _Requirements: 1.2, 5.1_
  
  - [ ] 15.5 Create TimerComponent
    - Subscribe to timeRemaining$ observable
    - Display countdown with formatted time
    - Add visual indicators for low time
    - _Requirements: 6.1_
  
  - [ ] 15.6 Create RoundEndModalComponent
    - Show modal with prompt reveal
    - Display round scores
    - Show intermission countdown
    - Use Angular animations for modal transitions
    - _Requirements: 6.2, 5.2_
  
  - [ ] 15.7 Create GameEndModalComponent
    - Show final rankings
    - Display winner celebration
    - Provide button to start new game
    - _Requirements: 5.3_

- [ ] 16. Create main GameComponent and wire message handlers
  - [ ] 16.1 Create GameComponent (main orchestrator)
    - Inject WebSocketService and GameStateService
    - Subscribe to messages$ observable from WebSocketService
    - Route messages to appropriate GameStateService methods using RxJS operators
    - Include child components: CanvasComponent, PlayerListComponent, ScoreboardComponent, GuessFeedComponent, GuessInputComponent, TimerComponent
    - _Requirements: 1.2, 3.3, 4.4, 5.1, 6.5_
  
  - [ ] 16.2 Implement message routing in GameComponent
    - Use RxJS filter and map operators to route messages by type
    - Route player_joined messages to GameStateService.updatePlayers
    - Route drawing_event messages to CanvasComponent.drawStroke
    - Route guess messages to GameStateService.addGuess
    - Route score_update messages to GameStateService.updateScores
    - Route timer_update messages to GameStateService.updateTimer
    - Route round_end messages to show RoundEndModalComponent
    - _Requirements: 1.2, 3.3, 4.4, 5.1, 6.5_
  
  - [ ] 16.3 Wire component event handlers
    - Connect CanvasComponent strokeDrawn output to WebSocketService.send
    - Connect GuessInputComponent guessSubmitted output to WebSocketService.send
    - Handle drawing tool changes and send via WebSocketService
    - _Requirements: 3.2, 4.1_

- [ ] 17. Create Angular templates and styling
  - [ ] 17.1 Create GameComponent template
    - Add app-canvas component selector
    - Add app-player-list component selector in sidebar
    - Add app-scoreboard component selector
    - Add app-timer component selector
    - Add app-guess-feed component selector
    - Add app-guess-input component selector
    - Use Angular structural directives (*ngIf, *ngFor) for conditional rendering
    - _Requirements: 3.1, 4.4, 5.1, 6.1_
  
  - [ ] 17.2 Style components with CSS/SCSS
    - Create responsive layout using CSS Grid or Flexbox
    - Style canvas with border and background in CanvasComponent styles
    - Style player list and scoreboard in respective component styles
    - Style guess feed with correct/incorrect indicators using CSS classes
    - Add visual feedback for active drawer using Angular class binding
    - Use Angular component-scoped styles
    - _Requirements: 1.2, 4.4, 5.1_
  
  - [ ] 17.3 Create RoomJoinComponent
    - Create reactive form with FormBuilder for room ID and player name
    - Add form validation (required fields, min/max length)
    - Add submit button with disabled state based on form validity
    - Use Angular Router to navigate to game route on successful connection
    - Display validation errors with *ngIf
    - _Requirements: 1.1_
  
  - [ ] 17.4 Set up Angular routing
    - Configure routes: /join and /game/:roomId
    - Add route guards if needed
    - Configure RouterModule in app module
    - _Requirements: 1.1_

- [ ] 18. Implement error handling
  - [ ] 18.1 Add server-side error handling
    - Handle invalid drawing events gracefully
    - Handle drawer disconnection (end round, select new drawer)
    - Handle empty guess submissions
    - Implement rate limiting for guesses
    - _Requirements: 1.3, 4.1_
  
  - [ ] 18.2 Add Angular client-side error handling
    - Create ErrorService for centralized error handling
    - Subscribe to WebSocketService error observables
    - Display connection errors using Angular Material Snackbar or custom toast component
    - Handle WebSocket disconnection with reconnect UI using connectionStatus$ observable
    - Show error messages for invalid actions
    - Use RxJS catchError operator for error handling in observables
    - _Requirements: 1.3, 1.5_

- [ ] 19. Add configuration and word lists
  - [ ] 19.1 Create game configuration
    - Define GameConfig with minPlayers, maxPlayers, roundDuration, etc.
    - Create default configuration
    - Allow configuration override via environment variables
    - _Requirements: 2.1, 6.1_
  
  - [ ] 19.2 Create prompt word lists
    - Create array of prompt words/concepts
    - Implement random selection without repetition within game
    - Organize words by difficulty/category (optional)
    - _Requirements: 2.3_

- [ ] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Create server entry point and startup
  - [ ] 21.1 Create server main file
    - Initialize Express app
    - Initialize WebSocketServer
    - Initialize GameRoomManager
    - Start server on configured port
    - Add health check endpoint
    - _Requirements: 1.1, 7.5_
  
  - [ ] 21.2 Add logging
    - Log server startup
    - Log player connections/disconnections
    - Log room creation/deletion
    - Log errors and warnings
    - _Requirements: 1.1, 1.3, 7.3_

- [ ]* 22. Integration testing
  - [ ]* 22.1 Write integration test for complete game flow
    - Simulate multiple clients connecting
    - Simulate complete round with drawing and guessing
    - Verify all players receive correct messages
    - Verify scores calculated correctly
    - _Requirements: 1.1, 2.1, 3.2, 4.2, 5.1_
  
  - [ ]* 22.2 Write integration test for room isolation
    - Create multiple rooms with different players
    - Send messages in each room
    - Verify no cross-contamination
    - _Requirements: 7.1, 7.2_
