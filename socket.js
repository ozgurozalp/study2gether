const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;
let kullaniciSayisi = 0;

app.get("/", (req, res) => {
  res.send("404");
});

socket.on("connect", () => kullaniciSayisi++);
socket.on("disconnect", () => kullaniciSayisi--);

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
      count: kullaniciSayisi
    });
  });
});

io.on("connect", () => kullaniciSayisi++);
io.on("disconnect", () => kullaniciSayisi--);

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
