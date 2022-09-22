const express = require('express');
const https = require('https');
const server = express();
const { ObjectId } = require('mongodb');

const product = require('./routes/api/product.js');
const path = '/api/product';
const INVALID_ID_MESSAGE = 'Invalid ID';
function idNotFoundMessage(id) {
  return `Product with ID ${id} not found`
}
function nameNotFoundMessage(name) {
  return `Product with name ${name} not found`
}

// Returns a single product from the database as a JSON object
// Find the product based on the provided ID
// If the ID is invalid or the product is not found, return a 404 response
server.get(`${path}/list`, async (req, res) => {
  const result = await product.listAllProducts();
  res.json(result);
});

// Returns a single product from the database as a JSON object
// Find th product based on the provided name
// If the product is not found, return a 404 response
server.get(`${path}/id/:productId`, async (req, res) => {
  const result = await product.getProductById(req.params.productId);
  if (result) {
    res.json(result);
  } else {
    res.status(404).send(idNotFoundMessage(req.params.productId));
  }
});

// Returns a single product form the database as a JSON object
// Find the product based on the provided name
// If the product is not found, return a 404 response
server.get(`${path}/name/:productName`, async (req, res) => {
  const result = await product.getProductByName(req.params.productName);
  if (result) {
    res.json(result);
  } else {
    res.status(404).send(nameNotFoundMessage(req.params.productName));
  }
});

// Inserts a new product into the database
// Returns a JSON object containing a message and the new productId
server.put(`${path}/new`, async (req, res) => {
  if (insertResp) {
    const result = {
        message: `Product ID ${req.params.productId} has been updated.`,
        productId: insertResp.productId  //TODO: check this is valid
    };
    res.json(result);
  } else {
    res.status(500).send('New product could not be inserted.');
  }
});

// Updates an existing product in the database
// Returns a JSON object containing a message and the productId
// If the ID invalid or the product is not found, return a 404 response
server.put(`${path}/:productId`, async (req, res) => {
  if (!ObjectId.isValid(req.params.productId)) {
    res.status(404).send(INVALID_ID_MESSAGE)
  }
  try {
    await product.updateProductWithId(req.params.productId);
    const result = {
        message: `Product ID ${req.params.productId} has been updated.`,
        productId: req.params.productId
    };
    res.json(result);
  } catch(err) {
    res.status(404).send(idNotFoundMessage(req.params.productId));
  }
});

// Deletes an existing product from the database
// Returns a JSON object containing a message and the productId
// If the ID is invalid or the product is not found, return a 404 response
server.delete(`${path}/:productId`, async (req, res) => {
  if (!ObjectId.isValid(req.params.productId)) {
    res.status(404).send(INVALID_ID_MESSAGE)
  }
  try {
    await product.deleteProductWithId(req.params.productId);
    const result = {
        message: `Product ID ${req.params.productId} has been updated.`,
        productId: req.params.productId
    };
    res.json(result);
  } catch(err) {
    res.status(404).send(idNotFoundMessage(req.params.productId));
  }
});

https.createServer(server);
server.listen(process.env.PORT);