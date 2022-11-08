const { AgentHelper } = require('./__helpers__/agent-helper');
const { DbHelper } = require('./__helpers__/db-helper');

const _ENDPOINT = '/api/v1/products'

describe('建立商品測試', () => {
  /** @type {import('supertest').SuperAgentTest} */
  let _client;
  const _db = new DbHelper();
  const colName = 'Products';

  beforeAll(async () => {
    _client = await AgentHelper.getInstance();
    await _db.tryOpen();
  })

  afterAll(async () => {
    await _db.tryStop();
    await AgentHelper.terminate();
  })

  describe('必填欄位檢查', () => {
    test('[10004]品名為空', async () => {
      const b = {
        price: 0,
        name: '',
        description: ''
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10004);
      expect(res.body.message).toBe('品名為空');
    });
    test('[10005]價格小於0', async () => {
      const b = {
        price: -1,
        name: 'aaa',
        description: ''
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10005);
      expect(res.body.message).toBe('價格小於0');
    });
  })
  describe('成功', () => {
    test('[0]建立新商品', async () => {
      const b = {
        price: 10,
        name: 'I am product',
        description: 'I am description'
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');
      expect(res.body.result.pn).toBeTruthy();

      const { pn } = res.body.result;
      const col = _db.getCollection(colName);
      const oProduct = await col.findOne({ PN: pn });
      expect(oProduct).toBeTruthy();
      expect(oProduct.name).toBe(b.name);
      expect(oProduct.description).toBe(b.description);
      expect(oProduct.price).toBe(b.price);
      expect(oProduct.status).toBe(1);
    });
  });
});
