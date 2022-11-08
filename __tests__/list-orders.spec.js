const { AgentHelper } = require('./__helpers__/agent-helper');
const { DbHelper } = require('./__helpers__/db-helper');

const _ENDPOINT = '/api/v1/orders'

describe('查詢訂單測試', () => {
  /** @type {import('supertest').SuperAgentTest} */
  let _client;
  const _db = new DbHelper();
  const orderCol = 'Orders';
  const itemCol = 'OrderItems';
  beforeAll(async () => {
    _client = await AgentHelper.getInstance();
    await _db.tryOpen();
    const colOrder = _db.getCollection(orderCol);
    const colItem = _db.getCollection(itemCol);
    const order1Obj = {
      tradeNo: 'ORDER00001',
      account: '0988999000',
      paymentType: 1,
      status: 1,
      totalAmount: 100,
      tradedAt: new Date(),
    };
    const order1Items = [
      {
        trateNo: order1Obj.tradeNo,
        name: 'product 1',
        description: 'I am product 1',
        price: 100,
        quantity: 2
      }
    ];
    await colOrder.insertOne(order1Obj);
    await colItem.insertMany(order1Items)

    const order2Obj = {
      tradeNo: 'ORDER00002',
      account: '0988999070',
      paymentType: 1,
      status: 1,
      totalAmount: 100,
      tradedAt: new Date(),
    };
    const order2Items = [
      {
        trateNo: order2Obj.tradeNo,
        name: 'product 1',
        description: 'I am product 1',
        price: 100,
        quantity: 2
      }
    ];
    await colOrder.insertOne(order2Obj);
    await colItem.insertMany(order2Items)

  });

  afterAll(async () => {
    await _db.tryStop();
    await AgentHelper.terminate();
  });

  describe('成功', () => {
    test('[0] 查詢單一帳號訂單', async () => {
      const res = await _client
        .get(_ENDPOINT)
        .query({ account: '0988999000' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body.result).toHaveLength(1);
    });
    test('[0] 查詢全部訂單', async () => {
      const res = await _client
        .get(_ENDPOINT);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body.result).toHaveLength(2);
    });
  });

});