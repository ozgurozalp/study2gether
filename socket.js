const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;

console.log('başladı');

app.get('/', function (req, res) {
    res.send('Hello World!');
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

server.listen(port, () => {
    console.log(`${port} portunda çalışıyorum.`)
});
// WARNING: app.listen(80) will NOT work here!
