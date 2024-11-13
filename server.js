const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const http = require('http');
const cors = require("cors");

const { Server } = require('socket.io');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_URL || "http://localhost:3000",
    credentials: true,
  },
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await apolloServer.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(apolloServer, { context: authMiddleware }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('readycheck', (readyCheckID) => {
        io.emit('readycheck', readyCheckID);
        io.join(readyCheckID)
      });

      socket.on('readycheckUpdate', (readyCheckID) => {
        io.emit('readycheckUpdate', readyCheckID);
        io.join(readyCheckID)
      });

      // socket.on('readycheckRSVP', (readyCheckID) => {
      //   io.emit('readycheckRSVP', readyCheckID);
      //   io.join(readyCheckID)
      // });

      socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });

    server.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();
