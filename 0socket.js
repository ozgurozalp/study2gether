// Gerekli kütüphaneler
const app = require("express")(); // http sunucusu için
const cors = require("cors"); // siteler arası veri transferi için izin
const server = require("http").Server(app); // sunucuyu kurma
const io = require("socket.io")(server);
const fetch = require("node-fetch");
const PORT = process.env.PORT || 5000; // sunucunun hangi portta çalışacağı
// cors için kullanıma açma
app.use(cors());

const allClients = [];

app.get("/", (req, res) => {
  res.send("Özgür ÖZALP");
});

io.on("connection", (socket) => {
  allClients.push({
    id: socket.id,
    userName: null,
    roomName: null,
  });

  socket.on("add-user", (data) => {
    let indexNo = allClients.findIndex((client) => client.id == socket.id);
    if (indexNo > -1) {
      allClients[indexNo].userName = data.userName;

      fetch(`https://study2gether.online/room/${data.codeId}`)
        .then((res) => res.json())
        .then((response) => {
          console.log(response);
          if (response.status) {
            allClients[indexNo].roomName = `room#${data.codeId}`;
            socket.join(allClients[indexNo].roomName);

            io.to(allClients[indexNo].roomName).emit("welcome", {
              userName: data.userName,
              row: indexNo + 1,
              roomName: allClients[indexNo].roomName,
            });
          }
        })
        .catch((error) => console.log(error));
    }
  });

  socket.on("broadcast", (data) => {
    let indexNo = allClients.findIndex((client) => client.id == socket.id);
    if (indexNo > -1) {
      let newClients = allClients.filter((client) =>
        client.roomName == allClients[indexNo].roomName
      );
      newClients = newClients.filter((client) => client.id != socket.id);
      newClients.forEach((client) => {
        io.to(client.id).emit("text", {
          text: data.text,
          cursorRow: data.cursorRow,
          cursorColumn: data.cursorColumn,
        });
      });
    }
  });
  socket.on("howManyClients", () => {
    socket.emit("clients", {
      count: socket.client.conn.server.clientsCount,
    });
  });
  socket.on("disconnect", () => {
    let indexNo = allClients.findIndex((client) => client.id == socket.id);
    if (indexNo > -1) {
      socket.leave(allClients[indexNo].roomName);
      allClients.splice(indexNo, 1);
    }
  });
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`)); // sunucuyu ayağa kaldırıyor
