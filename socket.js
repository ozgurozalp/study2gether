import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://study2gether.online',
  },
});

const allClients = [];

io.on('connection', socket => {
  console.log('a user connected');

  allClients.push({
    id: socket.id,
  });

  socket.on('disconnect', () => {
    let indexNo = allClients.findIndex(client => client.id === socket.id);
    if (indexNo > -1) {
      socket.leave(allClients[indexNo].roomName);
      allClients.splice(indexNo, 1);
    }
  });

  socket.on('add-user', async ({ codeId, userName }) => {
    try {
      const res = await fetch(`https://study2gether.online/room/${codeId}`);
      const { status } = await res.json();
      if (status) {
        const roomName = `room#${codeId}`;
        let client = allClients.find(client => client.id === socket.id);

        if (client) {
          client.userName = userName;
          client.roomName = roomName;
          socket.join(roomName);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('broadcast', data => {
    let client = allClients.find(client => client.id === socket.id);
    if (client) {
      socket.broadcast.to(client.roomName).emit('text', {
        text: data.text,
        cursorRow: data.cursorRow,
        cursorColumn: data.cursorColumn,
      });
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    msg: 'Hello World',
  });
});

server.listen(PORT, () => {
  console.log(`Socket is running on port ${PORT}`);
});
