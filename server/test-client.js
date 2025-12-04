const WebSocket = require('ws');

// Create two clients to test the game
const client1 = new WebSocket('ws://localhost:3000');
const client2 = new WebSocket('ws://localhost:3000');

client1.on('open', () => {
  console.log('Client 1 connected');
  client1.send(JSON.stringify({
    type: 'join',
    roomId: 'test-room',
    playerName: 'Alice'
  }));
});

client1.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Client 1 received:', message.type, message);
});

client2.on('open', () => {
  console.log('Client 2 connected');
  setTimeout(() => {
    client2.send(JSON.stringify({
      type: 'join',
      roomId: 'test-room',
      playerName: 'Bob'
    }));
  }, 500);
});

client2.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Client 2 received:', message.type, message);
  
  // If round started and client 2 is not the drawer, make a guess
  if (message.type === 'round_start' && !message.isDrawer) {
    setTimeout(() => {
      console.log('Client 2 making a guess...');
      client2.send(JSON.stringify({
        type: 'guess',
        guess: 'test guess'
      }));
    }, 1000);
  }
});

// Clean up after 10 seconds
setTimeout(() => {
  console.log('Closing connections...');
  client1.close();
  client2.close();
  process.exit(0);
}, 10000);
