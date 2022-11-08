const { MongoClient } = require('mongodb');

exports.DbHelper = class {
  constructor() {
    /** @type {MongoClient} */
    this.client
    /** @type {import('mongodb').Db} */
    this.db
  }

  tryOpen = async () => {
    this.client = new MongoClient(process.env.X_DEF_MONGO_URI);
    await this.client.connect();
    this.db = this.client.db(process.env.X_DEF_MONGO_DB_NAME);
  }

  /** @returns {import('mongodb').Collection} */
  getCollection = (colName) => {
    return this.db.collection(colName);
  }

  tryStop = async () => {
    const cols = await this.db.collections();
    for await (const col of cols) {
      await col.deleteMany({});
    }
    await this.client.close();
  }
}