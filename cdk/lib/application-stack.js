const { CfnModuleDefaultVersion } = require("@aws-cdk/core");
const cdk = require("@aws-cdk/core");
const { CognitoAuthConstruct } = require("./cognito-auth");
const { LamdaFunctionsConstruct } = require("./lamda-functions");

class ApplicationStack extends cdk.Stack {
  /**
   * @param {cdk.App} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Call a custom auth Construct for our app
    const appCognito = new CognitoAuthConstruct(this, "AppCognito");
    const { userPool } = appCognito;
    const lambdas = new LamdaFunctionsConstruct(this, "LambdaFunctions", {
      userPool,
    });
  }
}

module.exports = { ApplicationStack };
