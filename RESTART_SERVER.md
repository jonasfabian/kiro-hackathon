# How to Restart the Server

## The Issue
The server code has been updated with avatar support, but the running server needs to be restarted to pick up the changes.

## Steps to Fix

### Option 1: Kill and Restart
1. **Stop the current server:**
   ```bash
   # Find the server process
   lsof -i :3000
   
   # Kill it (replace PID with the actual process ID)
   kill 62016
   ```

2. **Start the server again:**
   ```bash
   cd server
   npm start
   ```

### Option 2: Use the test script
```bash
cd server
./test-server.sh
```

### Option 3: Manual restart
If you started the server in a terminal, just:
1. Press `Ctrl+C` in that terminal
2. Run `npm start` again

## Verify It's Working
After restarting:
1. Refresh your browser (or rejoin the room)
2. Join room "123" with nickname "sofiii"
3. You should now see a random Halloween avatar instead of the broken image icon

## What Changed
- Server now assigns a random avatar from 12 Halloween-themed options
- The avatar field is included in the Player object sent to clients
- Client displays the avatar image in the player list and scoreboard
