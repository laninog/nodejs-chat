let express = require('express');
let app = express();

let server = require('http').createServer(app);

let io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let usernames = [];

io.sockets.on('connection', function (socket) {
    // New user
    socket.on('new user', function (data, callback) {
        if (usernames.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            usernames.push(socket.username);
            updateUsernames();
            io.sockets.emit('new user', {user: data});
        }
    });

    // Update usernames
    function updateUsernames() {
        io.sockets.emit('usernames', usernames);
    }

    // Send message event
    socket.on('send message', function (data) {
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    // Disconect
    socket.on('disconnect', function (data) {
        if (!socket.username) return;
        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsernames();
    });

});