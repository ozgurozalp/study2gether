const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

let firsClient = null;
let firsClient = null;
const allClient = [];

app.get("/", (req, res) => {
  res.send("404");
});

io.on("connection", socket => {
  if (socket.client.conn.server.clientsCount == 1) firsClient = socket.id;
  if (socket.client.conn.server.clientsCount == 2) secondClient = socket.id;

  allClient.push(socket.id);

  let index = allClient.findIndex(id => id == firsClient);

  if (index > -1) allClient.splice(index, 1);

  socket.on("broadcast", data => {
    for (let item of allClient) {
      io.to(item).emit("text", {
        text: data.text
      });
    }
  });

  socket.on("howManyClients", data => {
    io.emit("clients", {
      count: socket.client.conn.server.clientsCount,
      id: socket.id
    });
  });
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
