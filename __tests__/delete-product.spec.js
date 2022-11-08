const util = require('util');
const { AgentHelper } = require('./__helpers__/agent-helper');
const { DbHelper } = require('./__helpers__/db-helper');

const _ENDPOINT = '/api/v1/products/%s'

describe('刪除商品測試', () => {
  /** @type {import('supertest').SuperAgentTest} */
  let _client;
  const _db = new DbHelper();
  const colName = 'Products'

  beforeAll(async () => {
    _client = await AgentHelper.getInstance();
    await _db.tryOpen();
  })

  afterAll(async () => {
    await _db.tryStop();
    await AgentHelper.terminate();
  })

  describe('成功', () => {
    test('[0]刪除商品', async () => {
      const col = _db.getCollection(colName);
      await col.insertOne({
        PN: 'PN00001'
      });
      const endpoint = util.format(_ENDPOINT, 'PN00001');

      const res = await _client.delete(endpoint)

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');

      const oProduct = await col.findOne({ PN: 'PN00001' });
      expect(oProduct).toBeFalsy();
    });
  });
});