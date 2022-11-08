const { AgentHelper } = require('./__helpers__/agent-helper');
const { DbHelper } = require('./__helpers__/db-helper');

const _ENDPOINT = '/api/v1/orders'

describe('建立訂單測試', () => {
  /** @type {import('supertest').SuperAgentTest} */
  let _client;
  const _db = new DbHelper();
  const accountCol = 'Accounts';
  const productCol = 'Products';
  const orderCol = 'Orders';
  const itemCol = 'OrderItems';
  const accountStr = '098989988';

  beforeAll(async () => {
    _client = await AgentHelper.getInstance();
    await _db.tryOpen();
    const obj = {
      account: accountStr
    };
    const col1 = _db.getCollection(accountCol);
    await col1.insertOne(obj);

    const objs = [
      {
        PN: 'PN00001',
        name: 'Product 1',
        description: 'I am product 1',
        price: 30,
      },
      {
        PN: 'PN00002',
        name: 'Product 2',
        description: 'I am product 2',
        price: 50,
      }
    ]
    const col = _db.getCollection(productCol);
    await col.insertMany(objs);
  })

  afterAll(async () => {
    await _db.tryStop();
    await AgentHelper.terminate();
  })

  describe('必填欄位檢查', () => {
    test('[10006]商品為空', async () => {
      const b = {
        account: accountStr,
        paymentType: 1,
        items: []
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10006);
      expect(res.body.message).toBe('商品為空');
    });
    test('[10007]商品數量小於等於0', async () => {
      const b = {
        account: accountStr,
        paymentType: 1,
        items: [
          {
            pn: 'PN00001',
            quantity: 0
          }
        ]
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10007);
      expect(res.body.message).toBe('商品數量小於等於0');
    });
    test('[10010]不支援的付款方式', async () => {
      const b = {
        account: accountStr,
        paymentType: 8,
        items: [
          {
            pn: 'PN00001',
            quantity: 0
          }
        ]
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)
  
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10010);
      expect(res.body.message).toBe('不支援的付款方式');
    });
  });
  describe('檢查規則', () => {
    test('[10008]帳號不存在', async () => {
      const b = {
        account: '000099990',
        paymentType: 1,
        items: [
          {
            pn: 'PN00001',
            quantity: 2
          }
        ]
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)
  
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10008);
      expect(res.body.message).toBe('帳號不存在');
    });
    test('[10009]商品不存在', async () => {
      const b = {
        account: accountStr,
        paymentType: 2,
        items: [
          {
            pn: 'PN00008',
            quantity: 2
          }
        ]
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)
  
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10009);
      expect(res.body.message).toBe('商品不存在');
    });
  })
  describe('成功', () => {
    test('[0]建立新訂單', async () => {
      const b = {
        account: accountStr,
        paymentType: 1,
        items: [
          {
            pn: 'PN00002',
            quantity: 2
          }
        ]
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)
  
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');
      expect(res.body.result.tradeNo).toBeTruthy();
  
      const { tradeNo } = res.body.result;
      const colOrder = _db.getCollection(orderCol);
      const oOrder = await colOrder.findOne({ tradeNo });
      expect(oOrder).toBeTruthy();
      expect(oOrder.account).toBe(accountStr);
      expect(oOrder.paymentType).toBe(1);
      expect(oOrder.totalAmount).toBe(100);
      expect(oOrder.status).toBe(1);
      const colItem = _db.getCollection(itemCol);
      const oItems = await colItem.find({ tradeNo }).toArray();
      expect(oItems).toHaveLength(1)
      const [i1] = oItems;
      expect(i1.PN).toBe('PN00002');
      expect(i1.name).toBe('Product 2');
      expect(i1.description).toBe('I am product 2');
      expect(i1.price).toBe(100);
      expect(i1.quantity).toBe(2);
    });
  });
});

