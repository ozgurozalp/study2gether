const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

const firsClient = null;
const allClient = [];

app.get("/", (req, res) => {
  res.send("404");
});

io.on("connection", socket => {
  socket.on("broadcast", data => {
    io.to(socket.id).emit("text", {
      text: data.text
    });
  });

  socket.on("howManyClients", data => {
    io.emit("clients", {
      count: socket.client.conn.server.clientsCount,
      id: socket.id
    });
  });
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
