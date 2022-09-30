const debug = require('debug')
const { MongoClient, ObjectId } = require('mongodb');
const config = require('config');

// Global variable storing the open connection, do not use it directly.
let _db = null;

// Connect to the database
async function connect() {
  if (!_db) {
    const dbUrl = config.get('db.url');
    const dbName = config.get('db.name');
    const client = await MongoClient.connect(dbUrl);
    _db = client.db(dbName);
  }
  return _db;
}

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
  connect();
  try {
    const storedb = db.db(dbName);
    storedb.createCollection(collectionName);
  } catch(opErr) {
    debug(`error creating ${collectionName} collection: ${opErr}`)
    next(opErr);
  }
};

// Returns all documents in the given collection
async function findAll(collectionName) {
  connect();
  try {
    const storedb = db.db(dbName);
    const collection = storedb.collection(collectionName);
    const result = await collection.find({});
    return result;
  } catch(opErr) {
    debug(`error querying ${collectionName} for find operation: ${opErr}`);
    next(opErr);
    return;
  }
};

// Returns the first document from given collection that matches query body
async function findOne(collectionName, query) {
  connect();
  try {
    const storedb = db.db(dbName);
    const collection = storedb.collection(collectionName);
    const result = await collection.findOne(query);
    return result;
  } catch(opErr) {
    debug(`error querying ${collectionName} for query ${JSON.stringify(query)}: ${opErr}`);
    next(opErr);
    return;
  }
};

// Inserts a single document into given collection with query body
async function insertOne(collectionName, query) {
  connect();
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
};

// Updates a single document in given collection with query body
async function updateOne(collectionName, query) {
  connect();
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
};

// Deletes a single document from the given collection that matches query body
async function deleteOne(collectionName, query) {
  connect();
  try {
    const storedb = db.db(dbName);
    await storedb.collection(collectionName).deleteOne(query);
  } catch(opErr) {
    debug(`error deleting entry from ${collectionName} for query ${JSON.stringify(query)}: ${opErr}`);
    next(opErr);
  }
};

module.exports = {
  createCollection: createCollection,
  findAll: findAll,
  findOne: findOne,
  insertOne: insertOne,
  updateOne: updateOne,
  deleteOne: deleteOne
}