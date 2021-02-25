const aws = require("aws-sdk");
// const {DocumentClient} = require("aws-sdk/lib/dynamodb/document_client";
// const {StorageService} = require("./storageService";
// const {ScanInput}= require("aws-sdk/clients/dynamodb";
// const {Pet} = require("../models/pet";

class DynamoDBStorageService /* implements StorageService */ {
  constructor(
    /* private readonly */ tableName /*: string */,
    /* private readonly */ docClient /*: DocumentClient */ = new aws.DynamoDB.DocumentClient()
  ) {}

  async getPet(id /*: string */) /*: Promise<Pet | null> */ {
    try {
      const data = await this.docClient
        .get({
          TableName: this.tableName,
          Key: { id },
          ConsistentRead: true,
        })
        .promise();
      if (data && data.Item) {
        return data.Item /* as Pet */;
      }
      return null; // return null vs undefined
    } catch (ex) {
      // AWSError
      console.warn("Error getting entry", ex);
      throw ex;
    }
  }

  async savePet(pet /*: Pet */) /*: Promise<void> */ {
    try {
      await this.docClient
        .put({
          TableName: this.tableName,
          Item: pet,
        })
        .promise();
    } catch (ex) {
      console.warn("Error saving entry", ex);
      throw ex;
    }
  }

  async getAllPets() /*: Promise<Pet[]> */ {
    try {
      const result /*: Pet[] */ = [];

      const params /*: ScanInput */ = { TableName: this.tableName };

      while (true) {
        const data = await this.docClient.scan(params).promise();
        result.push(...data.Items /* as Pet[] */);

        if (!data.LastEvaluatedKey) {
          break;
        }

        params.ExclusiveStartKey = data.LastEvaluatedKey;
      }

      return result;
    } catch (ex) {
      // AWSError
      console.warn("Error getting all entries", ex);
      throw ex;
    }
  }

  async deletePet(id /*: string */) /*: Promise<void> */ {
    try {
      await this.docClient
        .delete({ TableName: this.tableName, Key: { id } })
        .promise();
    } catch (ex) {
      console.warn("Error deleting entry", ex);
      throw ex;
    }
  }

  async getAllPetsByOwner(owner /*: string */) /*: Promise<Pet[]> */ {
    // in a real world scenario this will be probably using a query on a global secondary index (owner)
    // for simplicity of the demo, this will just filter the scanned results

    return (await this.getAllPets()).filter((pet) => pet.owner === owner);
  }
}

module.exports = { DynamoDBStorageService };
