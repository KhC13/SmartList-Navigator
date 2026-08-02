require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const routeRoutes = require('./routes/routeRoutes');
const queueRoutes = require('./routes/queueRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

app.set('io', io); // make io accessible inside controllers via req.app.get('io')

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'SmartStore Navigator API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/stats', statsRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  io.emit('activeCustomers', { count: io.engine.clientsCount });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    io.emit('activeCustomers', { count: io.engine.clientsCount });
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`SmartStore Navigator backend running on port ${PORT}`);
  });
});
