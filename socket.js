const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

let firstClient = null;
let secondClient = null;

const allClients = [];

app.get("/", (req, res) => {
	res.send("404");
});

io.on("connection", socket => {
	if (socket.client.conn.server.clientsCount == 1) firstClient = socket.id;
	if (socket.client.conn.server.clientsCount == 2) secondClient = socket.id;

	allClients.push(socket.id);

	socket.emit("test", `Selam #${socket.id}`)

	if (firstClient !== null) {
		socket.emit("info", {
			id: socket.id,
			durum: "Bağlanan ilk kişisiniz."
		});
	}

	if (secondClient !== null) {
		socket.emit("info", {
			id: socket.id,
			durum: "Bağlanan 2. kişisiniz."
		});
	}

	socket.on("broadcast", data => {
		io.to(secondClient).emit("text", {
			text: data.text
		});
	});

	socket.on("howManyClients", () => {
		io.emit("clients", {
			count: socket.client.conn.server.clientsCount,
			id: socket.id
		});
	});


	socket.on("disconnect", () => {
		let indexNo = allClients.findIndex(x => x == socket.id);
		if (indexNo > -1) allClients.splice(indexNo, 1);
	});

	socket.broadcast.emit("all", allClients);

});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
