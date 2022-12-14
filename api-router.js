const Router = require('@koa/router');
const { errorCodes } = require('./error-codes');
const { collectionNames, productStatus, paymentTypes, orderStatus } = require('./enum-codes');
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

_apiRouter
  .get('/orders', async ctx => {
    const { account } = ctx.request.query;
    let q = [];
    if (account) {
      q.push({
        $match: { account }
      });
    }
    q.push({
      $lookup: {
        from: 'OrderItems',
        localField: 'tradeNo',
        foreignField: 'tradeNo',
        as: 'items'
      }
    })
    const col = CustomMongoClient.getCollection(collectionNames.OREDR);
    const oOrders = await col.aggregate(q).toArray();
    const view = [];
    oOrders.forEach(order => {
      const obj = {
        account: order.account,
        tradeNo: order.tradeNo,
        tradedAt: order.tradedAt,
        status: order.status,
        paymentType: order.paymentType,
        totalAmount: order.totalAmount,
        items: []
      }
      order.items.forEach(item => {
        obj.items.push({
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
        });
      });

      view.push(obj);
    });
    const result = new CustomResult();
    result.result = view;
    ctx.status = 200;
    ctx.body = result;
  })
  .post('/orders', async ctx => {
    const {
      account,
      paymentType,
      items,
    } = ctx.request.body;
    const result = new CustomResult();
    ctx.status = 400;
    if (!account) {
      result.code = errorCodes.ACCOUNT_NOT_EXIST.code;
      result.message = errorCodes.ACCOUNT_NOT_EXIST.message;
      ctx.body = result;
      return;
    }
    if (!Object.values(paymentTypes).includes(paymentType)) {
      result.code = errorCodes.PAYMENY_UN_SUPPORT.code;
      result.message = errorCodes.PAYMENY_UN_SUPPORT.message;
      ctx.body = result;
      return;
    }
    if (items.length === 0) {
      result.code = errorCodes.PRODUCT_EMPTY.code;
      result.message = errorCodes.PRODUCT_EMPTY.message;
      ctx.body = result;
      return;
    }
    const PNs = []
    for (const it of items) {
      if (it.quantity <= 0) {
        result.code = errorCodes.ADDED_PRODUCT_EMPTY.code;
        result.message = errorCodes.ADDED_PRODUCT_EMPTY.message;
        ctx.body = result;
        return;
      }
      PNs.push(it.pn)
    }
    console.log(`Find account ${account}`);
    const accountCol = CustomMongoClient.getCollection(collectionNames.ACCOUNT);
    const oAccount = await accountCol.findOne({ account });
    if (!oAccount) {
      result.code = errorCodes.ACCOUNT_NOT_EXIST.code;
      result.message = errorCodes.ACCOUNT_NOT_EXIST.message;
      ctx.body = result;
      return;
    }
    console.log(`Find products ${PNs}`);
    const productCol = CustomMongoClient.getCollection(collectionNames.PRODUCT);
    const oProducts = await productCol.find({ PN: { $in: PNs } }).toArray();
    if (oProducts.length !== PNs.length) {
      result.code = errorCodes.PRODUCT_NOT_EXIST.code;
      result.message = errorCodes.PRODUCT_NOT_EXIST.message;
      ctx.body = result;
      return;
    }

    const now = new Date()
    const orderObj = {
      tradeNo: `ORDER${CustomUtil.generateRandomNumbers(5)}`,
      account,
      paymentType,
      status: orderStatus.UNPAID,
      totalAmount: 0,
      tradedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const oItems = [];
    for (const it of items) {
      const currProduct = oProducts.find(x => x.PN === it.pn);
      if (!currProduct) {
        continue;
      }
      const itemObj = {
        tradeNo: orderObj.tradeNo,
        PN: currProduct.PN,
        name: currProduct.name,
        description: currProduct.description,
        price: currProduct.price * it.quantity,
        quantity: it.quantity,
        createdAt: now,
        updatedAt: now,
      }
      oItems.push(itemObj);
      orderObj.totalAmount += itemObj.price;
    }
    const orderCol = CustomMongoClient.getCollection(collectionNames.OREDR);
    const itemCol = CustomMongoClient.getCollection(collectionNames.ORDER_ITEM);
    await orderCol.insertOne(orderObj);
    await itemCol.insertMany(oItems);

    result.result = { tradeNo: orderObj.tradeNo };
    ctx.status = 200;
    ctx.body = result;
  })

module.exports.apiRouter = _apiRouter;
