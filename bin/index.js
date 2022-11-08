require('dotenv').config();
const http = require('http');
const { app, tryInitial } = require('../app');

async function main() {
  await tryInitial();

  const _port = 9000;
  const _core = http.createServer(app.callback());
  
  _core.listen(_port);
  _core.on('listening', () => console.log(`Server up on ${_port}`));
  _core.on('error', (err) => console.error(err.stack));
}

main().catch(ex => console.log(ex));



