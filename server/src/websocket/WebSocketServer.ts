import WebSocket from 'ws';
import { Server as HTTPServer } from 'http';
import { GameRoomManager } from '../services/GameRoomManager';
import { GameConfig, Player, GameMessage, ClientMessage } from '../models/types';
import { AvatarService } from '../services/AvatarService';
import { v4 as uuidv4 } from 'uuid';

interface ConnectionInfo {
  ws: WebSocket;
  playerId: string | null;
  roomId: string | null;
  playerName: string | null;
}

export class WebSocketServer {
  private wss: WebSocket.Server;
  private connections: Map<string, ConnectionInfo>;
  private roomManager: GameRoomManager;
  private config: GameConfig;

  constructor(server: HTTPServer, roomManager: GameRoomManager, config: GameConfig) {
    this.wss = new WebSocket.Server({ server });
    this.connections = new Map();
    this.roomManager = roomManager;
    this.config = config;

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });
  }

  private handleConnection(ws: WebSocket): void {
    const connectionId = uuidv4();
    
    this.connections.set(connectionId, {
      ws,
      playerId: null,
      roomId: null,
      playerName: null
    });

    console.log(`New WebSocket connection: ${connectionId}`);

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString()) as ClientMessage;
        this.handleMessage(connectionId, message);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.sendError(connectionId, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(connectionId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
    });
  }

  private handleDisconnection(connectionId: string): void {
    const conn = this.connections.get(connectionId);
    if (!conn) return;

    console.log(`Connection closed: ${connectionId}`);

    if (conn.playerId && conn.roomId) {
      const room = this.roomManager.getRoom(conn.roomId);
      if (room) {
        room.removePlayer(conn.playerId);
        
        // Broadcast player left
        this.broadcastToRoom(conn.roomId, {
          type: 'player_left',
          playerId: conn.playerId,
          players: room.getPlayers(),
          timestamp: Date.now()
        });

        // If drawer disconnected, handle it
        if (room.activeDrawerId === conn.playerId) {
          // End round and select new drawer
          // This will be handled by the game logic integration
        }

        // Schedule cleanup if room is empty
        if (room.isEmpty()) {
          this.roomManager.scheduleCleanup(conn.roomId);
        }
      }
    }

    this.connections.delete(connectionId);
  }

  private handleMessage(connectionId: string, message: ClientMessage): void {
    switch (message.type) {
      case 'join':
        this.handleJoin(connectionId, message);
        break;
      case 'draw':
        this.handleDraw(connectionId, message);
        break;
      case 'tool_change':
        this.handleToolChange(connectionId, message);
        break;
      case 'clear_canvas':
        this.handleClearCanvas(connectionId, message);
        break;
      case 'guess':
        this.handleGuess(connectionId, message);
        break;
      default:
        this.sendError(connectionId, 'Unknown message type');
    }
  }

  private handleJoin(connectionId: string, message: any): void {
    const { roomId, playerName } = message;

    if (!roomId || !playerName || typeof roomId !== 'string' || typeof playerName !== 'string') {
      this.sendError(connectionId, 'Invalid join data: roomId and playerName required');
      return;
    }

    if (roomId.trim() === '' || playerName.trim() === '') {
      this.sendError(connectionId, 'roomId and playerName cannot be empty');
      return;
    }

    const playerId = uuidv4();
    const conn = this.connections.get(connectionId);
    if (!conn) return;

    conn.playerId = playerId;
    conn.roomId = roomId;
    conn.playerName = playerName;

    const room = this.roomManager.getOrCreateRoom(roomId, this.config);

    const player: Player = {
      id: playerId,
      name: playerName,
      connectionId,
      score: 0,
      isConnected: true,
      avatar: AvatarService.assignRandomAvatar()
    };

    room.addPlayer(player);

    // Send player_joined to all players in room
    this.broadcastToRoom(roomId, {
      type: 'player_joined',
      player,
      players: room.getPlayers(),
      timestamp: Date.now()
    });

    console.log(`Player ${playerName} (${playerId}) joined room ${roomId}`);

    // Check if game should start
    if (!room.hasStarted && room.hasMinimumPlayers()) {
      room.hasStarted = true;
      this.startRound(room);
    }
  }

  private handleDraw(connectionId: string, message: any): void {
    const conn = this.connections.get(connectionId);
    if (!conn || !conn.roomId || !conn.playerId) return;

    const room = this.roomManager.getRoom(conn.roomId);
    if (!room) return;

    // Validate sender is the active drawer
    if (room.activeDrawerId !== conn.playerId) {
      this.sendError(connectionId, 'Only the active drawer can draw');
      return;
    }

    // Broadcast drawing event to all players except the drawer
    this.broadcastToRoom(conn.roomId, {
      type: 'drawing_event',
      stroke: message.stroke,
      timestamp: Date.now()
    }, connectionId);
  }

  private handleToolChange(connectionId: string, message: any): void {
    const conn = this.connections.get(connectionId);
    if (!conn || !conn.roomId || !conn.playerId) return;

    const room = this.roomManager.getRoom(conn.roomId);
    if (!room) return;

    // Validate sender is the active drawer
    if (room.activeDrawerId !== conn.playerId) {
      return;
    }

    // Broadcast tool change to all players except the drawer
    this.broadcastToRoom(conn.roomId, {
      type: 'tool_change',
      color: message.color,
      brushSize: message.brushSize,
      timestamp: Date.now()
    }, connectionId);
  }

  private handleClearCanvas(connectionId: string, message: any): void {
    const conn = this.connections.get(connectionId);
    if (!conn || !conn.roomId || !conn.playerId) return;

    const room = this.roomManager.getRoom(conn.roomId);
    if (!room) return;

    // Validate sender is the active drawer
    if (room.activeDrawerId !== conn.playerId) {
      return;
    }

    // Broadcast clear canvas to all players except the drawer
    this.broadcastToRoom(conn.roomId, {
      type: 'clear_canvas',
      timestamp: Date.now()
    }, connectionId);
  }

  private handleGuess(connectionId: string, message: any): void {
    const conn = this.connections.get(connectionId);
    if (!conn || !conn.roomId || !conn.playerId || !conn.playerName) return;

    const room = this.roomManager.getRoom(conn.roomId);
    if (!room) return;

    const guess = message.guess;
    if (!guess || typeof guess !== 'string' || guess.trim() === '') {
      return; // Ignore empty guesses
    }

    // Process guess
    const result = room.processGuess(conn.playerId, guess);

    // Broadcast guess to all players
    this.broadcastToRoom(conn.roomId, {
      type: 'guess',
      playerId: conn.playerId,
      playerName: conn.playerName,
      guess,
      timestamp: Date.now()
    });

    if (result.correct) {
      // Calculate points (simplified for now)
      const points = 500; // TODO: Use ScoringEngine with proper timing
      room.updateScore(conn.playerId, points);

      // Broadcast guess result
      this.broadcastToRoom(conn.roomId, {
        type: 'guess_result',
        playerId: conn.playerId,
        playerName: conn.playerName,
        correct: true,
        pointsAwarded: points,
        timestamp: Date.now()
      });

      // Broadcast score update
      this.broadcastToRoom(conn.roomId, {
        type: 'score_update',
        scores: room.getScoreboard(),
        timestamp: Date.now()
      });

      // Check if all guessers have guessed correctly
      if (room.hasAllGuessersGuessed()) {
        this.endRound(room);
      }
    }
  }

  private startRound(room: any): void {
    room.startRound();

    // Send round_start to drawer with prompt
    const drawerConnectionId = this.getConnectionIdByPlayerId(room.id, room.activeDrawerId);
    if (drawerConnectionId) {
      this.sendToConnection(drawerConnectionId, {
        type: 'round_start',
        roundNumber: room.currentRound,
        isDrawer: true,
        prompt: room.currentPrompt,
        drawerId: room.activeDrawerId,
        timestamp: Date.now()
      });
    }

    // Send round_start to guessers without prompt
    this.broadcastToRoom(room.id, {
      type: 'round_start',
      roundNumber: room.currentRound,
      isDrawer: false,
      drawerId: room.activeDrawerId,
      timestamp: Date.now()
    }, drawerConnectionId || undefined);

    // Start timer
    // TODO: Integrate Timer class
  }

  private endRound(room: any): void {
    room.endRound();

    // Broadcast round_end
    this.broadcastToRoom(room.id, {
      type: 'round_end',
      prompt: room.currentPrompt || '',
      scores: room.getScoreboard(),
      timestamp: Date.now()
    });

    // Start intermission timer and then next round
    setTimeout(() => {
      if (room.currentRound < this.config.totalRounds) {
        this.startRound(room);
      } else {
        // Game end
        this.broadcastToRoom(room.id, {
          type: 'game_end',
          finalRankings: [], // TODO: Calculate rankings
          timestamp: Date.now()
        });
      }
    }, this.config.intermissionDuration * 1000);
  }

  private getConnectionIdByPlayerId(roomId: string, playerId: string): string | null {
    for (const [connId, conn] of this.connections.entries()) {
      if (conn.roomId === roomId && conn.playerId === playerId) {
        return connId;
      }
    }
    return null;
  }

  broadcastToRoom(roomId: string, message: GameMessage, excludeConnectionId?: string): void {
    this.connections.forEach((conn, connId) => {
      if (conn.roomId === roomId && connId !== excludeConnectionId) {
        this.sendToConnection(connId, message);
      }
    });
  }

  sendToConnection(connectionId: string, message: GameMessage): void {
    const conn = this.connections.get(connectionId);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(JSON.stringify(message));
    }
  }

  private sendError(connectionId: string, errorMessage: string): void {
    this.sendToConnection(connectionId, {
      type: 'error',
      message: errorMessage,
      timestamp: Date.now()
    });
  }
}
