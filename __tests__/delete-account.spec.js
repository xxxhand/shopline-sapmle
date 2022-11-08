const util = require('util');
const { AgentHelper } = require('./__helpers__/agent-helper');
const { DbHelper } = require('./__helpers__/db-helper');

const _ENDPOINT = '/api/v1/accounts/%s'

describe('刪除帳號測試', () => {
  /** @type {import('supertest').SuperAgentTest} */
  let _client;
  const _db = new DbHelper();
  const accountCol = 'Accounts';
  const orderCol = 'Orders';
  const itemCol = 'OrderItems';

  beforeAll(async () => {
    _client = await AgentHelper.getInstance();
    await _db.tryOpen();
  })

  afterAll(async () => {
    await _db.tryStop();
    await AgentHelper.terminate();
  })

  describe('成功', () => {
    test('[0]刪除帳號', async () => {
      const col = _db.getCollection(accountCol);
      await col.insertOne({ account: 'xxxhand' });
      const endpoint = util.format(_ENDPOINT, 'xxxhand');

      const res = await _client.delete(endpoint)

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');

      const oAccount = await col.findOne({ account: 'xxxhand' });
      expect(oAccount).toBeFalsy();
    });
  });
});