
import http from 'http';

import express from 'express';
import socket from 'socket.io';

import Controller from './controller/controller';

let app = express();
let server = http.Server(app);
let io = socket(server);

const PORT = 3000;

io.on('connection', function (socket) {
    console.log('新的连接已建立...');

    new Controller(socket, io);

});

server.listen(PORT, function () {
    console.log('服务器已开启...');
});
