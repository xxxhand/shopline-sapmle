const { AgentHelper } = require('./__helpers__/agent-helper');
const { DbHelper } = require('./__helpers__/db-helper');

const _ENDPOINT = '/api/v1/accounts'

describe('建立帳號測試', () => {
  /** @type {import('supertest').SuperAgentTest} */
  let _client;
  const _db = new DbHelper();
  const colName = 'Accounts';

  beforeAll(async () => {
    _client = await AgentHelper.getInstance();
    await _db.tryOpen();
  })

  afterAll(async () => {
    await _db.tryStop();
    await AgentHelper.terminate();
  })

  describe('必填欄位檢查', () => {
    test('[10001]帳號為空', async () => {
      const b = {
        account: '',
        name: ''
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10001);
      expect(res.body.message).toBe('帳號為空');
    });
    test('[10002]姓名為空', async () => {
      const b = {
        account: 'aaa',
        name: ''
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10002);
      expect(res.body.message).toBe('姓名為空');


    });
  })
  describe('資料檢查', () => {
    test('[10003]帳號重複', async () => {
      const col = _db.getCollection(colName);
      await col.insertOne({ account: 'xxxhand' });

      const b = {
        account: 'xxxhand',
        name: 'hand'
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(10003);
      expect(res.body.message).toBe('帳號重複');


    });
  });
  describe('成功', () => {
    test('[0]建立新帳號', async () => {
      const b = {
        account: 'xxxmary',
        name: 'mary'
      };
      const res = await _client
        .post(_ENDPOINT)
        .send(b)

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toBe('');

      const col = _db.getCollection(colName);
      const mary = await col.findOne({ account: 'xxxmary' });
      expect(mary).toBeTruthy();
      expect(mary.name).toBe('mary');
    });
  });
});