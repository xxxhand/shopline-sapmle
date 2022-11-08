const { AgentHelper } = require('./__helpers__/agent-helper');
const { DbHelper } = require('./__helpers__/db-helper');

const _ENDPOINT = '/api/v1/products'

describe('查詢商品測試', () => {
  /** @type {import('supertest').SuperAgentTest} */
  let _client;
  const _db = new DbHelper();
  const colName = 'Products'

  beforeAll(async () => {
    _client = await AgentHelper.getInstance();
    await _db.tryOpen();
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
    const col = _db.getCollection(colName);
    await col.insertMany(objs);
  })

  afterAll(async () => {
    await _db.tryStop();
    await AgentHelper.terminate();
  })

  describe('成功', () => {
    test('[0]查詢單一商品', async () => {

      const res = await _client
        .get(_ENDPOINT)
        .query({ pn: 'PN00001' });


      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body.result).toHaveLength(1);
      const [p1] = res.body.result;
      expect(p1.name).toBe('Product 1');
      expect(p1.description).toBe('I am product 1');
      expect(p1.price).toBe(30);
    });
    test('[0]查詢全部商品', async () => {

      const res = await _client
        .get(_ENDPOINT);


      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(res.body.result).toHaveLength(2);
      
      const p1 = res.body.result.find(x => x.pn === 'PN00001');
      expect(p1.name).toBe('Product 1');
      expect(p1.description).toBe('I am product 1');
      expect(p1.price).toBe(30);
      const p2 = res.body.result.find(x => x.pn === 'PN00002');
      expect(p2.name).toBe('Product 2');
      expect(p2.description).toBe('I am product 2');
      expect(p2.price).toBe(50);
    })
  });
});