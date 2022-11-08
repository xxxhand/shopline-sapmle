require('dotenv').config();

// const { CustomMongoClient } = require('../shared/custom-mongo-client');

// async function main() {
//   await CustomMongoClient.tryOpen();

// }

// main().catch(ex => console.log(ex));

const http = require('http');
const { app } = require('../app');

const _port = 9000;
const _core = http.createServer(app.callback());

_core.listen(_port);
_core.on('listening', () => console.log(`Server up on ${_port}`));
_core.on('error', (err) => console.error(err.stack));
