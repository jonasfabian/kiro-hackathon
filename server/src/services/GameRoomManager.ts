import { GameRoom } from './GameRoom';
import { GameConfig, RoomInfo } from '../models/types';

export class GameRoomManager {
  private rooms: Map<string, GameRoom>;
  private cleanupTimers: Map<string, NodeJS.Timeout>;
  private readonly cleanupDelay = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.rooms = new Map();
    this.cleanupTimers = new Map();
  }

  createRoom(roomId: string, config: GameConfig): GameRoom {
    const room = new GameRoom(roomId, config);
    this.rooms.set(roomId, room);
    console.log(`Room created: ${roomId}`);
    return room;
  }

  getRoom(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) || null;
  }

  getOrCreateRoom(roomId: string, config: GameConfig): GameRoom {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId, config);
    }
    
    // Cancel cleanup timer if room is being used again
    const timer = this.cleanupTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(roomId);
    }
    
    return room;
  }

  deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.rooms.delete(roomId);
      console.log(`Room deleted: ${roomId}`);
    }
    
    // Clear any cleanup timer
    const timer = this.cleanupTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(roomId);
    }
  }

  scheduleCleanup(roomId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.isEmpty()) {
      return;
    }
    
    // Clear existing timer if any
    const existingTimer = this.cleanupTimers.get(roomId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Schedule cleanup
    const timer = setTimeout(() => {
      const currentRoom = this.getRoom(roomId);
      if (currentRoom && currentRoom.isEmpty()) {
        this.deleteRoom(roomId);
      }
      this.cleanupTimers.delete(roomId);
    }, this.cleanupDelay);
    
    this.cleanupTimers.set(roomId, timer);
    console.log(`Cleanup scheduled for room: ${roomId}`);
  }

  listActiveRooms(): RoomInfo[] {
    const roomInfos: RoomInfo[] = [];
    
    this.rooms.forEach((room, roomId) => {
      roomInfos.push({
        roomId,
        playerCount: room.players.size,
        hasStarted: room.hasStarted
      });
    });
    
    return roomInfos;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }
}
