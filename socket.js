const app = require("express")();
const cors = require("cors");
const mysql = require("mysql");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const fetch = require('node-fetch');
const PORT = process.env.PORT || 5000;

const db = mysql.createConnection({
	host: "remotemysql.com",
	user: "R8nGjvFVRF",
	password: "0avGPlzMQ1",
	database: "R8nGjvFVRF"
});

db.connect(err => {
	if (err) return console.log(err);
	console.log("Connected..");
});

app.use(cors());

app.get('/eczane/:ad', (req, res) => {

	db.query(`SELECT * FROM eczane WHERE eczane_ad LIKE '%${req.params.ad}%'`, (error, result, fields) => {
		if (error) return console.log(error);
		res.json(result);
	});

});
app.post('/register', (req, res) => {
	console.log(req.body);
	let insertQuery = 'INSERT INTO ?? (??,??) VALUES (?,?)';
	let query = mysql.format(insertQuery,["kullanici","kullanici_email","kullanici_sifre",email,pass]);
	let data = {};
	db.query(query, (error, result, fields) => {
		if(result.insertId > 0){
			data.status = true;
		} else {
			data.status = false;
		}
		res.json(data);
	});
});
app.post('/login', (req, res) => {
	res.json({ad : "ozalp"});
});

const allClients = [];


app.get("/", (req, res) => {
	res.send("Özgür ÖZALP");
});

app.get("/client-count", (req, res) => {
	res.json({
		count: socket.client.conn.server.clientsCount
	});
});

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

			fetch(`https://study2gether.online/room/${data.codeId}`)
				.then(res => res.json())
				.then(response => {
					console.log(response);
					if (response.status) {
						allClients[indexNo].roomName = `room#${data.codeId}`;
						socket.join(allClients[indexNo].roomName);

						io.to(allClients[indexNo].roomName).emit("welcome", {
							userName : data.userName,
							row : indexNo + 1,
							roomName : allClients[indexNo].roomName
						});
					}
				})
				.catch(error => console.log(error));
		}
	});

	socket.on("broadcast", data => {
		let indexNo = allClients.findIndex(client => client.id == socket.id);
		if (indexNo > -1) {
			let newClients = allClients.filter(client => client.roomName == allClients[indexNo].roomName);
			newClients = newClients.filter(client => client.id != socket.id);
			newClients.forEach(client => {
				io.to(client.id).emit("text", {
					text: data.text,
					cursorRow : data.cursorRow,
					cursorColumn : data.cursorColumn,
				});
			});

		}

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
});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
