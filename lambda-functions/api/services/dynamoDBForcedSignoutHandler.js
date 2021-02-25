const { ForceSignOutHandler } = require("./authorizationMiddleware");
// const {Request} = require("express";
// const {DocumentClient} = require("aws-sdk/lib/dynamodb/document_client";
const aws = require("aws-sdk");

class DynamoDBForcedSignoutHandler /* implements ForceSignOutHandler */ {
  constructor(
    /* private readonly */ tableName /*: string */,
    /* private readonly */ docClient /*: DocumentClient */ = new aws.DynamoDB.DocumentClient(),
    /* private readonly */ keyAttributeName /*: string */ = "username",
    /* private readonly */ lastForceSignOutTimeAttributeName /*: string */ = "lastForceSignOutTime",
    /* private readonly */ ttlAttributeName /*: string */ = "ttl",
    /* private readonly */ ttlInSeconds /*: number */ = 2592000 /*30 days*/
  ) {}

  async isForcedSignOut(req /*: Request */) /*: Promise<boolean> */ {
    const key = this.getKey(req.username);

    try {
      const params = {
        TableName: this.tableName,
        Key: key,
      };

      const result = await this.docClient.get(params).promise();

      if (
        result.Item &&
        typeof result.Item[this.lastForceSignOutTimeAttributeName] === "number"
      ) {
        const issuedAtInMillis = req.claims.iat * 1000; // issued at is in seconds since epoch
        // if the token was issued before the last time this user issued a forced sign out, deny
        // (any newer sign-in will generate newer tokens hence will pass this check, but older ones will require re-auth
        if (
          issuedAtInMillis < result.Item[this.lastForceSignOutTimeAttributeName]
        ) {
          // optionally log the event
          // console.warn("Login attempt with a token issued before a forced sign out:" + req.username, req.rawHeaders);
          return true;
        }
      }
      return false;
    } catch (ex) {
      console.error("Error checking forced sign out", ex);
      throw ex;
    }
  }

  async forceSignOut(req /*: Request */) {
    const nowInMillis = Date.now();

    const item = this.getKey(req.username);

    item[this.ttlAttributeName] =
      Math.round(nowInMillis / 1000) + this.ttlInSeconds;
    item[this.lastForceSignOutTimeAttributeName] = nowInMillis;

    try {
      await this.docClient
        .put({
          TableName: this.tableName,
          Item: item,
        })
        .promise();
    } catch (ex) {
      console.error("Error revoking token: ", ex);
    }
  }

  getKey(username /*: string */) {
    const key = {}; /* as any */
    key[this.keyAttributeName] = username;
    return key;
  }
}

module.exports = { DynamoDBForcedSignoutHandler };
