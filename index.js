const serverless = require('serverless-http')
const { app } = require('./app')

const handler = serverless(app)
module.exports.handler = async (event, ctx) => {
  const result = await handler(event, ctx);
  return result;
}