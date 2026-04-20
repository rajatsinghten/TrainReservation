const dotenv = require('dotenv')
const path = require('path');
dotenv.config()

const express = require('express')
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const trainRoute = require('./routes/findTrainRoute');
const stationRoute = require('./routes/stationRoute');
const userRoute = require('./routes/userRoute');
const bookingRoute = require('./routes/bookingRoute');

// Initialize railway stations data at startup
try {
  const { loadRailwayStations } = require('./utils/railwayStations');
  loadRailwayStations();
} catch (error) {
  console.error('Failed to load railway stations data at startup:', error);
}

const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

app.use(express.json())

app.use('/api/trains', trainRoute)
app.use('/api/stations', stationRoute)
app.use('/api/users', userRoute)
app.use('/api/bookings', bookingRoute)

app.get('/', (req, res) => {
  res.json({
    status: "success",
    message: "Train Reservation API is live",
    environment: process.env.NODE_ENV || "development"
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Set global io object for access in controllers (like payment notifications)
global.io = io;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId) => {
    // Join a personal room for targeted notifications (like payment confirmation)
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
});
