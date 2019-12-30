// Gerekli kütüphaneler
const app = require("express")(); // http sunucusu için
const cors = require("cors"); // siteler arası veri transferi için izin
const mysql = require("mysql"); // mysql için
const server = require("http").Server(app); // sunucuyu kurma
const io = require("socket.io")(server);
const fetch = require('node-fetch');
const PORT = process.env.PORT || 5000; // sunucunun hangi portta çalışacağı
// cors için kullanıma açma
app.use(cors());

// veritabanına bağlanmak için sunucu bilgilerini girdik



// ilaç sorgulama
app.get('/eczane/:ad/:k_id', (req, res) => {
	const db = mysql.createConnection({
		host: "remotemysql.com",
		user: "R8nGjvFVRF",
		password: "0avGPlzMQ1",
		database: "R8nGjvFVRF"
	});
	db.connect();
	let ilac_id;
	let sql = `SELECT eczane.eczane_ad, ilac.ilac_ad, ilac.ilac_id, eczane.eczane_adres, eczane.eczane_tel_no,
 		tablo_stok.adet FROM tablo_stok INNER JOIN eczane on eczane.eczane_id = tablo_stok.eczane_id 
	 	INNER JOIN ilac on tablo_stok.ilac_id = ilac.ilac_id WHERE ilac.ilac_ad LIKE '%${req.params.ad}%' ORDER BY tablo_stok.adet DESC`;

	db.query(sql, (error, result, fields) => {
		if (error) {
			console.log(error);
			return res.json({status : false});
		}
		else {
			ilac_id = result[0].ilac_id;
			res.json(result);

			let sql2 = `INSERT INTO son_aranan_ilac (ilac_id, kullanici_id) VALUES(${ilac_id}, ${req.params.k_id})`;
			db.query(sql2, (error2, result2, fields2) => {
				if (error2)
					console.log(error2);
				else
					db.end();
			});
		}
	});
});

// Kayıt olma
app.get('/register/:email/:pass', (req, res) => {
	const db = mysql.createConnection({
		host: "remotemysql.com",
		user: "R8nGjvFVRF",
		password: "0avGPlzMQ1",
		database: "R8nGjvFVRF"
	});
	db.connect();

	let {email, pass} = req.params;
	let sql = `INSERT INTO kullanici (kullanici_email, kullanici_sifre) VALUES ('${email}', '${pass}')`;
	db.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			return res.json({status : false});
		}
	});
	let sql2 = `SELECT kullanici_ad, kullanici_id from kullanici WHERE kullanici_email = '${email}' AND kullanici_sifre = '${pass}'`;
	db.query(sql2, (err, result) => {
		if (err) return console.log(err);
		if (result.length > 0) {
			let data = {
				status : true,
				...result[0]
			}
			res.json(data);
		} else
			res.json({status : false});
	});
	db.end();
});

// giriş yapma
app.get('/login/:email/:pass', (req, res) => {
	const db = mysql.createConnection({
		host: "remotemysql.com",
		user: "R8nGjvFVRF",
		password: "0avGPlzMQ1",
		database: "R8nGjvFVRF"
	});
	db.connect()

	let {email, pass} = req.params;
	let sql = `SELECT kullanici_ad, kullanici_id from kullanici WHERE kullanici_email = '${email}' AND kullanici_sifre = '${pass}'`;
	db.query(sql, (err, result) => {
		if (err) return console.log(err);
		if (result.length > 0) {
			let data = {
				status : true,
				...result[0]
			}
			res.json(data);
		} else
			res.json({status : false});
	});

	db.end();
});

app.get('/getLastSearched/:k_id', (req, res) => {
	res.end("Hello");
	/*const db = mysql.createConnection({
		host: "remotemysql.com",
		user: "R8nGjvFVRF",
		password: "0avGPlzMQ1",
		database: "R8nGjvFVRF"
	});
	db.connect()

	let id = req.params.id;
	let sql = `SELECT kullanici.kullanici_id, kullanici.kullanici_ad, ilac.ilac_ad FROM son_aranan_ilac 
			INNER JOIN kullanici on kullanici.kullanici_id = son_aranan_ilac.kullanici_id 
			INNER JOIN ilac on ilac.ilac_id = son_aranan_ilac.ilac_id WHERE kullanici.kullanici_id = ${id} ORDER BY id DESC`;
	db.query(sql, (err, result) => {
		if (err) return console.log(err);
		res.json(result);
	});

	db.end();*/
});

const allClients = [];


app.get("/", (req, res) => {
	res.send("Özgür ÖZALP");
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

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`)); // sunucuyu ayağa kaldırıyor
