#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('lifememoryapis:server');
const http = require('http');
const createwebsocket = require('../utils/websocket');
// const { ExpressPeerServer } = require("peer");
// const { PeerServer } = require("peer");
// const fs = require("fs");
// const sss = require("../../CA/localhost/localhost.decrypted.key");
// const ddd = require("../../CA/localhost/localhost.crt")
// const key = fs.readFileSync("/home/lonshan/Documents/odin_projects/git_odin/git_test_odin/mainproject_lifememory/restapis/CA/localhost/localhost.decrypted.key");
// const cert = fs.readFileSync("/home/lonshan/Documents/odin_projects/git_odin/git_test_odin/mainproject_lifememory/restapis/CA/localhost/localhost.crt");
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT);
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


// const WebSocket = require("ws");
// // const server = require("../../bin/www");
// const wsS = new WebSocket.Server({server : server});

// wsS.on("connection", (e)=>{
//     console.log("new user Connected");
// });
// const io = require('socket.io')(server, {
//   path: '/my-websocket-path'
// });


createwebsocket(server);
// const peerServer = ExpressPeerServer(server, {
//   cors : {
//     origin : ["http://localhost:3000"]
//   },
//   path: "/",
// });
// app.get("/callserver/videocall", peerServer);


// const peerServer = PeerServer({ port: 49667, path: "/callserver" });

// module.exports = server;