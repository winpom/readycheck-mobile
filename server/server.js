const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config(); // Use dotenv to access PORT variable

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Allow access from any origin (configure this for production)
    methods: ["GET", "POST"]
  }
});

const livePORT = process.env.PORT || 3000;

// Listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a user-specific room
  socket.on("joinUserRoom", (userId) => {
    const userRoom = `userRoom_${userId}`; // Use a naming convention
    socket.join(userRoom);
    console.log(`User ${socket.id} joined room ${userRoom}`);
  });

  // Allow users to leave user-specific room
  socket.on("leaveUserRoom", (userId) => {
    const userRoom = `userRoom_${userId}`; // Use the same naming convention
    socket.leave(userRoom);
    console.log(`User ${socket.id} left room ${userRoom}`);
  });

  // Join and leave common rooms for friends and homepage
  socket.on("joinHomePage", () => {
    socket.join("homePageRoom");
    console.log(`User ${socket.id} joined the homePageRoom [server]`);
  });

  socket.on("joinFriendsRoom", () => {
    socket.join("friendsRoom");
    console.log(`User ${socket.id} joined friendsRoom for real-time updates [server]`);
  });

  socket.on("leaveFriendsRoom", () => {
    socket.leave("friendsRoom");
    console.log(`User ${socket.id} left friendsRoom for real-time updates [server]`);
  });

  // Emit friendRequestSent event to friendsRoom and user-specific rooms
  socket.on("friendRequestSent", (userId, friendId) => {
    io.to("friendsRoom").emit("friendRequestSent", { userId, friendId });
    io.to(userId).emit("friendRequestSent", { friendId });
    io.to(friendId).emit("friendRequestSent", { userId });
    console.log(`Emitted friendRequestSent event for userId: ${userId} and friendId: ${friendId}`);
  });

  // Emit friendAdded event to friendsRoom and user-specific rooms
  socket.on("friendAdded", (userId, friendId) => {
    const userRoom = `userRoom_${userId}`;
    const friendRoom = `userRoom_${friendId}`;
    io.to("friendsRoom").emit("friendAdded", { userId, friendId });
    io.to("homePageRoom").emit("friendAdded", { userId, friendId });
    io.to(userRoom).emit("friendAdded", { friendId });
    io.to(friendRoom).emit("friendAdded", { userId });
    console.log(`Emitted friendAdded event for userId: ${userId} and friendId: ${friendId}`);
  });

  // Emit friendRemoved event to friendsRoom and user-specific rooms
  socket.on("friendRemoved", (userId, friendId) => {
    const userRoom = `userRoom_${userId}`;
    const friendRoom = `userRoom_${friendId}`;
    io.to("friendsRoom").emit("friendRemoved", { userId, friendId });
    io.to(userRoom).emit("friendRemoved", { friendId });
    io.to(friendRoom).emit("friendRemoved", { userId });
    console.log(`Emitted friendRemoved event for userId: ${userId} and friendId: ${friendId}`);
  });

  // Room joins for readyCheck and homepage
  socket.on("joinReadyCheck", (readyCheckId) => {
    socket.join(readyCheckId);
    console.log(`User ${socket.id} joined ReadyCheck room ${readyCheckId} [server]`);
  });

  socket.on("leaveReadyCheck", (readyCheckId) => {
    socket.leave(readyCheckId);
    console.log(`User ${socket.id} left ReadyCheck room ${readyCheckId} [server]`);
  });

  // Handle readyCheck creation
  socket.on("readyCheckCreated", (data) => {
    const { readyCheckId, invitees } = data;

    // Emit update to the homepage room for real-time ReadyCheck updates
    io.to("homePageRoom").emit("readyCheckUpdate", { readyCheckId });
    console.log(`Emitted readyCheckCreated to homePageRoom for ReadyCheck ID ${readyCheckId} [server]`);

    // Notify specific invitees
    invitees.forEach((inviteeId) => {
      io.to(inviteeId).emit("readyCheckUpdate", { readyCheckId });
      console.log(`Notified invitee ${inviteeId} of new ReadyCheck ${readyCheckId} [server]`);
    });
  });

  // Handle readyCheck updates
  socket.on("readyCheckUpdate", (data) => {
    const { readyCheckId, update } = data;

    // Emit to the specific readyCheck room and homepage
    io.to(readyCheckId).emit("readyCheckUpdate", { readyCheckId, update });
    io.to("homePageRoom").emit("readyCheckUpdate", { readyCheckId, update });
  });

  socket.on("newInvite", (readyCheckId, invitedUserId) => {
    io.to("homePageRoom").emit("readyCheckUpdate", { readyCheckId });
    console.log(`Emitted readyCheckUpdate to homePageRoom for new invite on ID ${readyCheckId}`);
  });

  socket.on("readyCheckDeleted", (readyCheckId) => {
    io.to(readyCheckId).emit("readyCheckDeleted", readyCheckId);
    io.to("homePageRoom").emit("readyCheckDeleted", readyCheckId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Listen on designated port
server.listen(livePORT, () => {
  console.log(`Server is running on port ${livePORT}`);
});