const debug = require('debug')
const MongoClient = require('mongodb').MongoClient;

const dbName = 'storedb'
const url = `mongodb://localhost:${process.env.PORT}/${dbName}`

// Processes any immediate error from MongoClient.connect()
async function connErrCheck(connErr) {
  if (connErr) {
    debug(`mongo connection error: ${connErr}`)
    next(connErr);
    return;
  }
}

// Creates a new mongo collection with given name
async function createCollection(collectionName) {
  await MongoClient.connect(url, (connErr, db) => {
    connErrCheck(connErr);
    try {
      const storedb = db.db(dbName);
      storedb.createCollection(collectionName);
    } catch(opErr) {
      debug(`error creating ${collectionName} collection: ${opErr}`)
      next(opErr);
    } finally {
        storedb.close();
    }
    db.close();
  });
};

// Returns all documents in the given collection
async function findAll(collectionName) {
  await MongoClient.connect(url, async (connErr, db) => {
    connErrCheck(connErr);
    try {
      const storedb = db.db(dbName);
      const collection = storedb.collection(collectionName);
      const result = await collection.find({});
      return result;
    } catch(opErr) {
      debug(`error querying ${collectionName} for find operation: ${opErr}`);
      next(opErr);
      return;
    } finally {
      storedb.close();
    };
  });
};

// Returns the first document from given collection that matches query body
async function findOne(collectionName, query) {
  await MongoClient.connect(url, async (connErr, db) => {
    connErrCheck(connErr);
    try {
      const storedb = db.db(dbName);
      const collection = storedb.collection(collectionName);
      const result = await collection.findOne(query);
      return result;
    } catch(opErr) {
      debug(`error querying ${collectionName} for query ${JSON.stringify(query)}: ${opErr}`);
      next(opErr);
      return;
    } finally {
      storedb.close();
    };
  });
};

// Inserts a single document into given collection with query body
async function insertOne(collectionName, query) {
  await MongoClient.connect(url, async (connErr, db) => {
    connErrCheck(connErr);
    try {
      const storedb = db.db(dbName);
      const currDate = new Date();
      await storedb.collection(collectionName).insertOne({
        ...query,
        createdOn: currDate,
        lastUpdatedOn: currDate
      });
    } catch(opErr) {
      debug(`error deleting entry from ${collectionName} for query ${JSON.stringify(query)}: ${opErr}`);
      next(opErr);
    }
  });
};

// Updates a single document in given collection with query body
async function updateOne(collectionName, query) {
  await MongoClient.connect(url, async (connErr, db) => {
    connErrCheck(connErr);
    try {
      const storedb = db.db(dbName);
      const currDate = new Date();
      await storedb.collection(collectionName).updateOne({
        ...query,
        lastUpdatedOn: currDate
      });
    } catch(opErr) {
      debug(`error deleting entry from ${collectionName} for query ${JSON.stringify(query)}: ${opErr}`);
      next(opErr);
    }
  });
};

// Deletes a single document from the given collection that matches query body
async function deleteOne(collectionName, query) {
  await MongoClient.connect(url, async (connErr, db) => {
    connErrCheck(connErr);
    try {
      const storedb = db.db(dbName);
      await storedb.collection(collectionName).deleteOne(query);
    } catch(opErr) {
      debug(`error deleting entry from ${collectionName} for query ${JSON.stringify(query)}: ${opErr}`);
      next(opErr);
    }
  });
};

module.exports = {
  createCollection: createCollection,
  findAll: findAll,
  findOne: findOne,
  insertOne: insertOne,
  updateOne: updateOne,
  deleteOne: deleteOne
}