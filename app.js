const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require("dotenv");
const socketEmitters = require('./middlewares/socketEmitters');

const app = express();
const port = 5000;
const prisma = new PrismaClient();

const channelRoutes = require('./routes/channels');
const programRoutes = require('./routes/programs');
const userRoutes = require('./routes/users');

app.use(cors());
app.use(express.json());
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL , "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(socketEmitters(io));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('updatePrograms', () => {
    io.emit('programsUpdated');
  });

  socket.on('updateChannels', () => {
    io.emit('channelsUpdated');
  });
  socket.on('updateUsers', () => {
    io.emit('usersUpdated');
  });
});

app.use('/api/channels', channelRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/users', userRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
