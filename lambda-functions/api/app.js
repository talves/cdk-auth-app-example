const express = require("express");
// const CognitoIdentityServiceProvider = require("aws-sdk/clients/cognitoidentityserviceprovider");
const {
  /* Express, Request, Response, */ json,
  urlencoded,
} = require("express");
const cors = require("cors");
const { eventContext } = require("aws-serverless-express/middleware");

const { v4: uuid4 } = require("uuid");
const {
  authorizationMiddleware,
  ForceSignOutHandler,
} = require("./services/authorizationMiddleware");
// const {StorageService} = require("./services/storageService")
// const {Pet} = require("./models/pet")

// export interface AppOptions {
//   adminsGroupName: string;
//   usersGroupName: string;
//   authorizationHeaderName?: string;
//   allowedOrigin: string;
//   userPoolId: string;
//   storageService: StorageService;
//   cognito: CognitoIdentityServiceProvider;
//   expressApp?: Express; // intended for unit testing / mock purposes
//   forceSignOutHandler?: ForceSignOutHandler;
// }

/**
 * Using a separate class to allow easier unit testing
 * All dependencies are provided on the constructor to allow easier mocking
 * This is not intended to be an exemplary idiomatic express.js app
 * A lot of shortcuts have been made for brevity
 */
class App {
  constructor(opts /*: AppOptions */, expressApp /*: Express */ = express()) {
    const app = expressApp;

    app.use(
      cors({
        credentials: false,
        origin: [opts.allowedOrigin],
      })
    );

    app.use(json());
    app.use(urlencoded({ extended: true }));

    app.use(eventContext());

    app.use(
      authorizationMiddleware({
        authorizationHeaderName: opts.authorizationHeaderName,
        supportedGroups: [opts.adminsGroupName, opts.usersGroupName],
        forceSignOutHandler: opts.forceSignOutHandler,
        allowedPaths: ["/"],
      })
    );

    /**
     * Ping
     */
    app.get("/", async (req /*: Request */, res /*: Response */) => {
      res.json({ status: "ok" });
    });

    /**
     * List all pets
     */
    app.get("/pets", async (req /*: Request */, res /*: Response */) => {
      if (req.groups.has(opts.adminsGroupName)) {
        // if the user has the admin group, we return all pets
        res.json(await opts.storageService.getAllPets());
      } else {
        // otherwise, just owned pets (middleware ensure that the user is in either of the 2 groups)
        res.json(await opts.storageService.getAllPetsByOwner(req.username));
      }
    });

    /**
     * Get a pet
     */
    app.get("/pets/:petId", async (req /*: Request */, res /*: Response */) => {
      const petId = req.params.petId;

      const pet = await opts.storageService.getPet(petId);

      if (!pet) {
        res.status(404).json({ error: `Pet with id ${petId} was not found` });
        return;
      }

      if (req.groups.has(opts.adminsGroupName) || pet.owner === req.username) {
        // if the pet is owned by the user or they are an admin, return it.
        res.json(pet);
      } else {
        res.status(403).json({ error: `Unauthorized` });
      }
    });

    /**
     * Create a pet
     */
    app.post("/pets", async (req /*: Request */, res /*: Response */) => {
      const pet = req.body; /*: Pet */

      // TODO: make sure body is parsed as JSON, post and put stopped working
      console.log("post /pets ", typeof pet, pet);

      if (pet.id) {
        res
          .status(400)
          .json({
            error:
              "POST /pet auto assigns an id. In order to update use PUT /pet",
          });
        return;
      }

      // auto generate an ID
      pet.id = uuid4();
      // set the owner to the current user
      pet.owner = req.username;

      pet.ownerDisplayName = req.claims.email;

      await opts.storageService.savePet(pet);
      res.json(pet);
    });

    /**
     * Update a pet
     */
    app.put("/pets/:petId", async (req /*: Request */, res /*: Response */) => {
      const updatedPet = req.body; /*: Pet */
      const petId = req.params.petId;

      if (!petId) {
        res.status(400).json({ error: "Invalid request - missing Pet ID" });
        return;
      }
      if (!updatedPet) {
        res.status(400).json({ error: "Invalid request - missing Pet" });
        return;
      }
      if (updatedPet.id !== petId) {
        res
          .status(400)
          .json({
            error: "Invalid request - Pet.id doesn't match request param",
          });
        return;
      }
      const existingPet = await opts.storageService.getPet(petId);

      if (!existingPet) {
        res.status(404).json({ error: `Pet with id ${petId} was not found` });
        return;
      }

      if (
        req.groups.has(opts.adminsGroupName) ||
        (updatedPet.owner === existingPet.owner &&
          existingPet.owner === req.username)
      ) {
        // if the user is an admin, or the pet is owned by the owner and didn't change the owner, allow
        // only admin can change the owner
        await opts.storageService.savePet(updatedPet);
        res.json(updatedPet);
      } else {
        res.status(403).json({ error: "Unauthorized" });
      }
    });

    /**
     * Delete a pet
     */
    app.delete("/pets/:petId", async (
      req /*: Request */,
      res /*: Response */
    ) => {
      const petId = req.params.petId;
      const pet = await opts.storageService.getPet(petId);

      if (!pet) {
        res.status(404).json({ error: `Pet with id ${petId} was not found` });
        return;
      }

      if (req.groups.has(opts.adminsGroupName) || pet.owner === req.username) {
        // if the pet is owned by the user or they are an admin, allow deleting it
        await opts.storageService.deletePet(petId);
        res.json(pet);
      } else {
        res.status(403).json({ error: `Unauthorized` });
      }
    });

    app.post("/forceSignOut", async (
      req /*: Request */,
      res /*: Response */
    ) => {
      // all tokens issued before this call will no longer be allowed to be used
      await opts.cognito
        .adminUserGlobalSignOut({
          Username: req.username,
          UserPoolId: opts.userPoolId,
        })
        .promise();
      if (opts.forceSignOutHandler) {
        await opts.forceSignOutHandler.forceSignOut(req);
      }
      res.status(200).send();
    });
  }
}

module.exports = { App };
