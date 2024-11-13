// server.js
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

  // Event for when a user joins a readycheck
  socket.on("joinReadyCheck", (readyCheckId) => {
    socket.join(readyCheckId);
    console.log(`User ${socket.id} joined ReadyCheck ${readyCheckId}`);
  });

  // Event for broadcasting updates
  socket.on("readyCheckUpdate", (data) => {
    const { readyCheckId, update } = data;
    io.to(readyCheckId).emit("readyCheckUpdate", update);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
