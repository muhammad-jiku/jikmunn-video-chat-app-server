const express = require('express');

const app = express();
const { Server } = require('socket.io');
const httpServer = require('http').createServer(app);
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
// const io = require('socket.io')(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

app.use(cors());

app.get('/', (req, res) => {
  res.send('Running');
});

io.on('connection', (socket) => {
  socket.emit('me', socket.id);

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('callUser', {
      signal: signalData,
      from,
      name,
    });
  });

  socket.on('updateMyMedia', ({ type, currentMediaStatus }) => {
    console.log('updateMyMedia');
    socket.broadcast.emit('updateUserMedia', { type, currentMediaStatus });
  });

  socket.on('msgUser', ({ name, to, msg, sender }) => {
    io.to(to).emit('msgRcv', { name, msg, sender });
  });

  socket.on('answerCall', (data) => {
    socket.broadcast.emit('updateUserMedia', {
      type: data.type,
      currentMediaStatus: data.myMediaStatus,
    });
    io.to(data.to).emit('callAccepted', data);
  });
  socket.on('endCall', ({ id }) => {
    io.to(id).emit('endCall');
  });
});

server.listen(PORT, () =>
  console.log(`Server is running on port http://localhost:${PORT}`)
);
