const { createServer, proxy } = require("aws-serverless-express");
// const { Context } = require("aws-lambda");
const { expressApp } = require("./express-app");

const server = createServer(expressApp);

// noinspection JSUnusedGlobalSymbols
const handler = (event /*: any */, context /*: Context */) =>
  proxy(server, event, context);

module.exports.handler = handler;
