const Joi = require('joi');
const { ObjectId } = require('mongodb');

const storedb = require('../../database');
const collectionName = 'products';

// Validation schema for products
const schema = Joi.object().keys({
  name: Joi.string(),
  description: Joi.string(),
  category: Joi.string(),
  price: Joi.number()
});

// Checks if Joi validation came back with an error
async function handleJoiResult(joiResult) {
  if (!joiResult.error) {
    return joiResult.value;
  } else {
    debug(`Joi validation error from mongo product document: ${joiResult.error}`);
    next(joiResult.error);
    return;
  }
}

// Validates a single product (object) against Joi schema
async function validateSingleProduct(product) {
  const joiResult = schema.validate(product);
  return handleJoiResult(joiResult);
}

// Validates multiple products (array of objects) against Joi schema
async function validateArrayOfProducts(arr) {
  const validatedArray = [];
  arr.forEach(product => {
    const joiResult = schema.validate(product);
    const validatedResult = handleJoiResult(joiResult);
    if (validatedResult) {
      validatedArray.push(validatedResult);
    }
  });
  return validatedArray;
}

// GET /api/product/list
async function listAllProducts() {
  const mongoResult = await storedb.findAll(collectionName);
  return validateArrayOfProducts(mongoResult);
};

// GET /api/product/id/:productId
async function getProductById(productId) {
  const query = {
    _id: ObjectId(productId)
  };
  const mongoResult = await storedb.findOne(collectionName, query);
  return validateSingleProduct(mongoResult);
};

// GET /api/product/id/:productName
async function getProductByName(productName) {
  const query = {
    name: productName
  };
  const mongoResult = await storedb.findOne(collectionName, query);
  return validateSingleProduct(mongoResult);
};

// PUT /api/product/new
async function insertNewProduct(query) {
  if (validateSingleProduct(query)) {
    const insertResp = await storedb.insertOne(collectionName, query);
    return insertResp;
  } else {
    return;
  }
};

// PUT /api/product/:productId
async function updateProductWithId(productId, query) {
  if (validateSingleProduct(query)) {
    const fullQuery = {
      _id: ObjectId(productId),
      ...query
    };
    await storedb.updateOne(collectionName, fullQuery);
  } else {
    // inform query is invalid
  }
};

// DELETE /api/product/:productId
async function deleteProductWithId(productId) {
  const query = {
    _id: ObjectId(productId)
  };
  await storedb.deleteOne(collectionName, query);
};

module.exports = {
  listAllProducts: listAllProducts,
  getProductById: getProductById,
  getProductByName: getProductByName,
  insertNewProduct: insertNewProduct,
  updateProductWithId: updateProductWithId,
  deleteProductWithId: deleteProductWithId
};