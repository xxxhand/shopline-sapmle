const serverless = require('serverless-http')
const { app } = require('./app')
const { CustomMongoClient } = require('./shared/custom-mongo-client');


const handler = serverless(app)
module.exports.handler = async (event, ctx) => {
  if (!CustomMongoClient.isConnected) {
    await CustomMongoClient.tryOpen();
  }
  const result = await handler(event, ctx);
  return result;
}