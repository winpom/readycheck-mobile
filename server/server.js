const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Allow access from any origin (configure this for production)
    methods: ["GET", "POST"]
  }
});

// Listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinReadyCheck", (readyCheckId) => {
    socket.join(readyCheckId);
    console.log(`User ${socket.id} joined ReadyCheck ${readyCheckId}`);
  });

  socket.on("readyCheckUpdate", (data) => {
    const { readyCheckId, update } = data;
    
    // Log the room members before emitting to check if all clients are present
    const roomClients = io.sockets.adapter.rooms.get(readyCheckId);
    console.log(`Clients in room ${readyCheckId}:`, roomClients ? Array.from(roomClients) : "No clients");
    
    // Emit the update to all clients in the room
    io.to(readyCheckId).emit("readyCheckUpdate", { readyCheckId, update });
    console.log(`Emitted readyCheckUpdate to room ${readyCheckId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
