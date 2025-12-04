import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from './websocket/WebSocketServer';
import { GameRoomManager } from './services/GameRoomManager';
import { defaultGameConfig, serverPort } from './config';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List active rooms endpoint
app.get('/rooms', (req, res) => {
  const rooms = roomManager.listActiveRooms();
  res.json({ rooms, count: rooms.length });
});

// Create HTTP server
const server = createServer(app);

// Initialize game room manager
const roomManager = new GameRoomManager();

// Initialize WebSocket server
const wsServer = new WebSocketServer(server, roomManager, defaultGameConfig);

// Start server
server.listen(serverPort, () => {
  console.log('='.repeat(50));
  console.log('🎨 Drawing Game Server Started');
  console.log('='.repeat(50));
  console.log(`Server running on port ${serverPort}`);
  console.log(`WebSocket endpoint: ws://localhost:${serverPort}`);
  console.log(`Health check: http://localhost:${serverPort}/health`);
  console.log(`Active rooms: http://localhost:${serverPort}/rooms`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
