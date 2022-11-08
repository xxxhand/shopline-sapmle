const path = require('path');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const mount = require('koa-mount');
const serve = require('koa-static');
const { apiRouter } = require('./api-router');
const { CustomMongoClient } = require('./shared/custom-mongo-client');

const _tryInitial = async () => {
  await CustomMongoClient.tryOpen();
}

const _tryTerminate = async () => {
  return CustomMongoClient.tryClose();
}

const _app = new Koa();

_app.use(mount('/api-docs', serve(path.resolve(__dirname, './public/api-docs'))))
_app.use(koaBody())
_app.use(apiRouter.routes())
_app.use(apiRouter.allowedMethods())
_app.use(async ctx => {
  ctx.body = { message: 'Hello world' };
})

module.exports = {
  app: _app,
  tryInitial: _tryInitial,
  tryTerminate: _tryTerminate,
};
