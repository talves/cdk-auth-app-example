const cdk = require("@aws-cdk/core");
const {
  UserPool,
  OAuthScope,
  UserPoolClient,
  CfnUserPoolClient,
  StringAttribute,
} = require("@aws-cdk/aws-cognito");
const {
  AwsCustomResource,
  AwsCustomResourcePolicy,
} = require("@aws-cdk/custom-resources");
const { PolicyStatement, Effect } = require("@aws-cdk/aws-iam");

class CognitoAuthConstruct extends cdk.Construct {
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id);
    // Start provisioning resources here.

    // Create our user pool to allow signup
    const userPool = new UserPool(this, "myUserPool", {
      userPoolName: "demo-userpool",
      selfSignUpEnabled: true,
      // we'll setup a custom member attribute to get later from jwt
      customAttributes: {
        member_status: new StringAttribute(),
      },
      signInAliases: {
        email: true,
        phone: true,
        username: true,
      },
    });
    this.userPool = userPool;

    // add a client with implicit Grant to get token
    const userPoolClient = userPool.addClient("app-client", {
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        // Allows user attributes in the id token
        scopes: [OAuthScope.OPENID],
        callbackUrls: ["https://sdk-demo.alves.dev"],
      },
    });

    // Setup the identity provider for our user pool
    const cfnUserPoolClient = userPoolClient.node.defaultChild;
    cfnUserPoolClient.supportedIdentityProviders = ["COGNITO"];

    userPool.addDomain("DemoAuthDomain", {
      cognitoDomain: {
        domainPrefix: "demo-app-xyz-88779911",
      },
    });

    new AwsCustomResource(this, "UserPoolDomainNameCustomResource", {
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["cognito-idp:*"],
          resources: ["*"],
        }),
      ]),
      // creates the test user
      onCreate: {
        service: "CognitoIdentityServiceProvider",
        action: "adminCreateUser",
        parameters: {
          UserPoolId: userPool.userPoolId,
          Username: "testuser",
          TemporaryPassword: "Password123!",
          UserAttributes: [
            { Name: "email", Value: "testuser@somewhere.com" },
            { Name: "email_verified", Value: "True" },
            { Name: "custom:member_status", Value: "auth_user" },
          ],
          MessageAction: "SUPPRESS",
        },
        physicalResourceId: {
          id: "userpoolcreateid" + Date.now().toString(),
        },
      },
    });

    new cdk.CfnOutput(this, "Cognito-ClientID", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "Cognito-UserPoolID", {
      value: userPool.userPoolId,
    });

    //End of constructor
  }
}

module.exports = { CognitoAuthConstruct };
