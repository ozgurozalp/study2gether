const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 5000

console.log('başladı');

app.get('/', function (req, res) {
    res.send('Özgür Cereni seviyor...');
});

io.on('connection', function (socket) {
    console.log('sokete bağlananlar var');

    socket.on('broadcast', data => {
        console.log(data);
        io.emit('text', {
            text: data.text
        });
    });

});

server.listen(PORT, () => console.log(`${PORT} portunda çalışıyorum.`));
// WARNING: app.listen(80) will NOT work here!