const app = require("express")();
const cors = require("cors");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;

app.use(cors());

const allClients = [];
const rooms = {};

io.on("connection", socket => {

	allClients.push({
		id : socket.id,
		userName : null,
		roomName : null
	});

	socket.on("add-user", data => {
		let indexNo = allClients.findIndex(client => client.id == socket.id);
		if (indexNo > -1) {
			allClients[indexNo].userName = data.userName;
			allClients[indexNo].roomName = `room#${data.codeId}`;
			socket.join(allClients[indexNo].roomName);
			socket.emit("welcome", {
				userName : data.userName,
				row : indexNo + 1,
				roomName : allClients[indexNo].roomName
			});
		}
	});

	io.to('1').emit('roomTest', 1);
	io.to('12').emit('roomTest', 12);


	socket.on("broadcast", data => {
		socket.broadcast.emit("text", {
			text: data.text,
			cursorRow : data.cursorRow,
			cursorColumn : data.cursorColumn,
		});
	});

	socket.on("howManyClients", () => {
		socket.emit("clients", {
			count: socket.client.conn.server.clientsCount
		});
	});

	socket.on("disconnect", () => {
		let indexNo = allClients.findIndex(client => client.id == socket.id);
		if (indexNo > -1) {
			socket.leave(allClients[indexNo].roomName);
			allClients.splice(indexNo, 1);
		}
	});


	app.get("/client-count", (req, res) => {
		res.json({
			count: socket.client.conn.server.clientsCount
		});
	});

	app.get("/", (req, res) => {
		res.send("Özgür ÖZALP");
	});
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
