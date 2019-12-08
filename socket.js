const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("404");
});

io.on("connection", socket => {
  console.log("sokete bağlananlar var");

  socket.on("broadcast", data => {
    console.log(data);
    io.emit("text", {
      text: data.text
    });
  });

  socket.on("howManyClients", data => {
    console.log(data);
    io.emit("clients", {
      count: io.sockets.clients().length
    });
  });
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
