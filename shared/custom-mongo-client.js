const { MongoClient } = require('mongodb');

/** @type {import('mongodb').MongoClient} */
let _client;
/** @type {import('mongodb').Db} */
let _db;

exports.CustomMongoClient = class {
  static tryOpen = async () => {
    _client = new MongoClient(process.env.X_DEF_MONGO_URI);
    await _client.connect();
    _db = _client.db(process.env.X_DEF_MONGO_DB_NAME);
  }

  /** @returns {import('mongodb').Collection} */
  static getCollection = (colName) => {
    return _db.collection(colName);
  }

  static tryClose = async () => {
    return _client.close();
  }
}
