// socket.js: Sets up socket.io server and exports initSocket function
import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Authenticate user here if needed (e.g., JWT)
    // socket.handshake.query.token
    console.log('Socket connected:', socket.id);

    // Example: join rooms for hackathon creators/organizers
    socket.on('joinHackathonRoom', (hackathonId) => {
      socket.join(`hackathon_${hackathonId}`);
    });

    // Example: join room for participant
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

export function emitRegistrationCreated(hackathonId, registration) {
  if (io) {
    io.to(`hackathon_${hackathonId}`).emit('registration:created', { registration });
  }
}

export function emitRegistrationUpdated(hackathonId, userId, registration) {
  if (io) {
    io.to(`hackathon_${hackathonId}`).emit('registration:updated', { registration });
    io.to(`user_${userId}`).emit('registration:updated', { registration });
  }
}
