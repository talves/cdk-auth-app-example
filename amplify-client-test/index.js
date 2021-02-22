const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const axios = require("axios");

const myArgs = process.argv.slice(2);
const originalPassword = "Password123!";
const updatedPassword = "Password12345!";

const userPoolIdParam = myArgs[0];
const clientIdParam = myArgs[1];
const apiGatewayUrlParam = myArgs[2];

const poolData = {
  UserPoolId: userPoolIdParam,
  ClientId: clientIdParam,
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const userData = {
  Username: "testuser",
  Pool: userPool,
};
const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
let authDetail = new AmazonCognitoIdentity.AuthenticationDetails({
  Username: "testuser",
  Password: originalPassword,
});
authenticateUser(authDetail);

function authenticateUser(authDetail) {
  console.log("Authenticating user.");
  cognitoUser.authenticateUser(authDetail, {
    onSuccess: function (result) {
      console.log("Success authenticating user!");
      callLambdaAPI(result);
    },
    onFailure: function (result) {
      console.log("Failure! " + JSON.stringify(result));
      console.log(result);
      console.log(JSON.stringify(result));
    },
    mfaRequired: function (codeDeliveryDetails) {
      console.log("mfaRequired: " + codeDeliveryDetails);
    },
    newPasswordRequired: function (userAttributes, requiredAttributes) {
      console.log("A new password is required");
      const userChallengeIdInfo = {
        email: "testuser@somewhere.com",
      };
      cognitoUser.completeNewPasswordChallenge(
        updatedPassword,
        userChallengeIdInfo,
        this
      );
    },
  });
}

function callLambdaAPI(result) {
  const jwtToken1 = result.getIdToken().getJwtToken();
  console.log(jwtToken1);
  axios
    .get(apiGatewayUrlParam, {
      headers: { Authorization: jwtToken1 },
    })
    .then(function (apiRes) {
      console.log("Success calling API!!");
      console.log(apiRes.data);
    })
    .catch(function (err) {
      console.log(err);
    });
}
