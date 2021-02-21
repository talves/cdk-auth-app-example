const cdk = require("@aws-cdk/core");
const { CognitoAuth } = require("./cognito-auth");

export class ApplicationStack extends cdk.Stack {
  /**
   * @param {cdk.App} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Call a custom Construct for our app
    const appCognito = new Backend(this, "AppCognito");
  }
}
