const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

let firstClient = null;
let secondClient = null;

app.get("/", (req, res) => {
  res.send("404");
});

io.on("connection", socket => {
  if (socket.client.conn.server.clientsCount == 1) firstClient = socket.id;
  if (socket.client.conn.server.clientsCount == 2) secondClient = socket.id;

  io.emit("info", {
    id: socket.id,
    durum:
      firstClient == socket.id
        ? "Bağlanan ilk kişisiniz."
        : secondClient == socket.id
        ? "Bağlanan 2. kişisiniz."
        : "3. ve üstü bağlanan kişisiniz."
  });

  socket.on("broadcast", data => {
    io.to(secondClient).emit("text", {
      text: data.text
    });
  });

  socket.on("howManyClients", data => {
    io.emit("clients", {
      count: "Bağlı kişi sayısı : " + socket.client.conn.server.clientsCount,
      id: socket.id
    });
  });
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
