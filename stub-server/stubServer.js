const express = require('express');
const apiMocker = require('connect-api-mocker');

const port = 9000;
const demoServer = express();

demoServer.use('/api', apiMocker('stub-server/api'));

console.log(`Mock API Server is up and running at: http://localhost:${port}`);
demoServer.listen(port);