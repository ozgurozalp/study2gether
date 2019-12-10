const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

const allClients = [];

io.on("connection", socket => {

	allClients.push({
		id : socket.id,
		userName : null
	});

	socket.on("add-user", userName => {
		let indexNo = allClients.findIndex(client => client.id == socket.id);
		if (indexNo > -1) {
			allClients[indexNo].userName = userName;
			socket.emit("welcome", {
				userName,
				row : indexNo + 1
			});
		}
	});

	socket.on("broadcast", data => {
		socket.broadcast.emit("text", {
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
		let indexNo = allClients.findIndex(client => client.id == socket.id);
		if (indexNo > -1) allClients.splice(indexNo, 1);
	});

	app.get("/", (req, res) => {
		res.send("Özgür ÖZALP");
	});
	app.get("/client-count", (req, res) => {
		res.json({
			count: socket.client.conn.server.clientsCount
		});
	});

});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
