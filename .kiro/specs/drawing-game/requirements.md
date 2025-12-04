# Requirements Document

## Introduction

This document specifies the requirements for a real-time multiplayer drawing and guessing game application similar to Gartic Phone/Montagsmaler. The system enables players to connect to game rooms via WebSocket connections, where one player draws a secret word or concept while others watch the drawing in real-time and attempt to guess what is being drawn. Players earn points for correct guesses, creating an engaging competitive experience.

## Glossary

- **Drawing Game System**: The complete application including server, client, and WebSocket infrastructure
- **Game Room**: A virtual space where multiple players participate in a single game session
- **Active Drawer**: The player currently responsible for drawing the assigned word or concept
- **Guesser**: A player attempting to identify what the Active Drawer is drawing
- **Drawing Canvas**: The visual area where the Active Drawer creates their drawing
- **Drawing Event**: A single drawing action (line, stroke, color change) transmitted via WebSocket
- **Game Round**: A single turn where one player draws and others guess
- **WebSocket Connection**: A persistent bidirectional communication channel between client and server
- **Prompt Word**: The secret word or concept that the Active Drawer must illustrate

## Requirements

### Requirement 1

**User Story:** As a player, I want to connect to a game room using WebSockets, so that I can participate in real-time drawing and guessing games with other players.

#### Acceptance Criteria

1. WHEN a player initiates a connection with a valid room identifier, THEN the Drawing Game System SHALL establish a WebSocket connection and add the player to the specified Game Room
2. WHEN a player connects to a Game Room, THEN the Drawing Game System SHALL broadcast the updated player list to all connected players in that room
3. WHEN a WebSocket Connection is interrupted, THEN the Drawing Game System SHALL remove the disconnected player from the Game Room and notify remaining players
4. WHEN a player attempts to connect to a non-existent Game Room, THEN the Drawing Game System SHALL create a new Game Room with the specified identifier
5. WHEN a player attempts to connect with invalid credentials or malformed data, THEN the Drawing Game System SHALL reject the connection and return an error message

### Requirement 2

**User Story:** As a game organizer, I want the game to start automatically when enough players have joined, so that gameplay can begin without manual intervention.

#### Acceptance Criteria

1. WHEN a Game Room reaches the minimum player count, THEN the Drawing Game System SHALL initiate the first Game Round
2. WHEN a Game Round begins, THEN the Drawing Game System SHALL select one player as the Active Drawer using a fair rotation algorithm
3. WHEN an Active Drawer is selected, THEN the Drawing Game System SHALL send the Prompt Word only to that player
4. WHEN a Game Round begins, THEN the Drawing Game System SHALL notify all Guessers that drawing has started without revealing the Prompt Word
5. WHEN a Game Round begins, THEN the Drawing Game System SHALL initialize a clean Drawing Canvas for all players

### Requirement 3

**User Story:** As the active drawer, I want to draw on a canvas that transmits my strokes in real-time to other players, so that they can see what I am creating as I draw it.

#### Acceptance Criteria

1. WHEN the Active Drawer creates a stroke on the Drawing Canvas, THEN the Drawing Game System SHALL transmit the Drawing Event to all Guessers within 100 milliseconds
2. WHEN the Active Drawer changes drawing tools or colors, THEN the Drawing Game System SHALL transmit the tool change as a Drawing Event to all Guessers
3. WHEN a Drawing Event is received by a Guesser client, THEN the Drawing Game System SHALL render the drawing action on the Guesser's Drawing Canvas in the same position and style
4. WHEN the Active Drawer clears the Drawing Canvas, THEN the Drawing Game System SHALL transmit a clear event and reset all Guessers' canvases
5. WHEN Drawing Events are transmitted, THEN the Drawing Game System SHALL maintain the correct sequence order for all drawing actions

### Requirement 4

**User Story:** As a guesser, I want to submit text guesses for what is being drawn, so that I can earn points by correctly identifying the drawing.

#### Acceptance Criteria

1. WHEN a Guesser submits a text guess, THEN the Drawing Game System SHALL compare the guess against the Prompt Word using case-insensitive matching
2. WHEN a Guesser submits a correct guess, THEN the Drawing Game System SHALL award points to that Guesser and broadcast the correct guess to all players
3. WHEN a Guesser submits an incorrect guess, THEN the Drawing Game System SHALL broadcast the guess to all players without awarding points
4. WHEN a Guesser submits a guess, THEN the Drawing Game System SHALL display the guess in a shared chat or guess feed visible to all players
5. WHEN multiple Guessers submit correct guesses, THEN the Drawing Game System SHALL award more points to earlier correct guesses based on submission timestamp

### Requirement 5

**User Story:** As a player, I want to see my score and other players' scores update in real-time, so that I can track my performance and compete with others.

#### Acceptance Criteria

1. WHEN a Guesser earns points, THEN the Drawing Game System SHALL update the player's score and broadcast the updated scoreboard to all players in the Game Room
2. WHEN a Game Round ends, THEN the Drawing Game System SHALL display the final scores for that round to all players
3. WHEN all Game Rounds are completed, THEN the Drawing Game System SHALL calculate and display the final rankings for all players
4. WHEN the scoreboard is updated, THEN the Drawing Game System SHALL display players in descending order by total points
5. WHEN a player disconnects, THEN the Drawing Game System SHALL preserve their score for the duration of the game session

### Requirement 6

**User Story:** As a player, I want game rounds to have time limits, so that games progress at a reasonable pace and don't stall indefinitely.

#### Acceptance Criteria

1. WHEN a Game Round begins, THEN the Drawing Game System SHALL start a countdown timer visible to all players
2. WHEN the round timer reaches zero, THEN the Drawing Game System SHALL end the current Game Round and reveal the Prompt Word to all players
3. WHEN all Guessers have submitted correct guesses before the timer expires, THEN the Drawing Game System SHALL end the Game Round early
4. WHEN a Game Round ends, THEN the Drawing Game System SHALL transition to the next Game Round after a brief intermission period
5. WHEN the timer is active, THEN the Drawing Game System SHALL broadcast time remaining updates to all players at regular intervals

### Requirement 7

**User Story:** As a system administrator, I want the system to handle multiple concurrent game rooms, so that many groups can play simultaneously without interference.

#### Acceptance Criteria

1. WHEN multiple Game Rooms exist, THEN the Drawing Game System SHALL isolate all game state, player lists, and WebSocket messages between rooms
2. WHEN a Drawing Event is transmitted in one Game Room, THEN the Drawing Game System SHALL ensure the event is not received by players in other Game Rooms
3. WHEN a Game Room becomes empty, THEN the Drawing Game System SHALL clean up the room resources after a timeout period
4. WHEN the server receives WebSocket messages, THEN the Drawing Game System SHALL route each message to the correct Game Room based on the sender's room identifier
5. WHEN querying active rooms, THEN the Drawing Game System SHALL return a list of all Game Rooms with their current player counts

### Requirement 8

**User Story:** As a developer, I want clear separation between WebSocket transport, game logic, and client rendering, so that the system is maintainable and testable.

#### Acceptance Criteria

1. WHEN WebSocket transport mechanisms are modified, THEN the Drawing Game System SHALL ensure game logic and rendering components remain unaffected
2. WHEN game logic is updated, THEN the Drawing Game System SHALL ensure WebSocket transport and rendering components continue functioning without modification
3. WHEN client rendering is changed, THEN the Drawing Game System SHALL ensure WebSocket transport and game logic operate without changes
4. WHEN testing game logic, THEN the Drawing Game System SHALL allow unit tests to execute without requiring active WebSocket connections
5. WHEN new drawing tools are added, THEN the Drawing Game System SHALL support extension without modifying core WebSocket or game state management code
