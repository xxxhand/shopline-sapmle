const Router = require('@koa/router');
const { errorCodes } = require('./error-codes');
const { collectionNames, productStatus } = require('./enum-codes');
const { CustomResult } = require('./shared/custom-result');
const { CustomUtil } = require('./shared/custom-util');
const { CustomMongoClient } = require('./shared/custom-mongo-client');

const _apiRouter = new Router();
_apiRouter.prefix('/api/v1');

_apiRouter.post('/accounts', async ctx => {
  console.log(ctx.request.body);
  const { account, name } = ctx.request.body;
  const result = new CustomResult();
  if (!account) {
    result.code = errorCodes.ACCOUNT_EMPTY.code;
    result.message = errorCodes.ACCOUNT_EMPTY.message;
    ctx.status = 400;
    ctx.body = result;
    return;
  }
  if (!name) {
    result.code = errorCodes.NAME_EMPTY.code;
    result.message = errorCodes.NAME_EMPTY.message;
    ctx.status = 400;
    ctx.body = result;
    return;
  }
  console.log(`Find account ${account} from db`);
  const col = CustomMongoClient.getCollection(collectionNames.ACCOUNT);
  const oAccount = await col.findOne({ account: account });
  if (oAccount) {
    result.code = errorCodes.ACCOUNT_EXISTS.code;
    result.message = errorCodes.ACCOUNT_EXISTS.message;
    ctx.status = 400;
    ctx.body = result;
    return;
  }
  const now = new Date();
  const obj = {
    account,
    name,
    createdAt: now,
    updatedAt: now
  };
  await col.insertOne(obj);
  result.result = { account };
  ctx.status = 200;
  ctx.body = result;
});

_apiRouter.delete('/accounts/:account', async ctx => {
  const { account } = ctx.params;
  const col = CustomMongoClient.getCollection(collectionNames.ACCOUNT);
  await col.deleteOne({ account });
  ctx.status = 200;
  ctx.body = new CustomResult();
});

_apiRouter
  .get('/products', async ctx => {
    const { pn } = ctx.request.query;
    let q = {};
    if (pn) {
      q.PN = pn;
    }
    const col = CustomMongoClient.getCollection(collectionNames.PRODUCT);
    const view = [];
    const oProducts = await col.find(q).toArray();
    oProducts.forEach(x => {
      view.push({
        pn: x.PN,
        name: x.name,
        description: x.description,
        price: x.price,
      });
    });
    const result = new CustomResult();
    result.result = view;
    ctx.status = 200;
    ctx.body = result;
  })
  .post('/products', async ctx => {
    const {
      name,
      description,
      price,
    } = ctx.request.body;

    const result = new CustomResult();
    if (!name) {
      result.code = errorCodes.PRODUCT_NAME_EMPTY.code;
      result.message = errorCodes.PRODUCT_NAME_EMPTY.message;
      ctx.status = 400;
      ctx.body = result;
      return;
    }
    if (price < 0) {
      result.code = errorCodes.PRICE_LESS_ZERO.code;
      result.message = errorCodes.PRICE_LESS_ZERO.message;
      ctx.status = 400;
      ctx.body = result;
      return;
    }

    const pn = `PN${CustomUtil.generateRandomNumbers(5)}`;
    const now = new Date();
    const obj = {
      name,
      description,
      price,
      PN: pn,
      status: productStatus.ONLINE,
      createdAt: now,
      updatedAt: now
    }

    const col = CustomMongoClient.getCollection(collectionNames.PRODUCT);
    await col.insertOne(obj);

    result.result = { pn };
    ctx.status = 200;
    ctx.body = result;
  })

_apiRouter.delete('/products/:pn', async ctx => {
  const { pn } = ctx.params;
  const col = CustomMongoClient.getCollection(collectionNames.PRODUCT);
  await col.deleteOne({ PN: pn });
  ctx.status = 200;
  ctx.body = new CustomResult();
})

module.exports.apiRouter = _apiRouter;
