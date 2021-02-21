const cdk = require("@aws-cdk/core");

class CognitoAuth extends cdk.Construct {
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id);
    // Start provisioning resources here.
  }
}

module.exports = { CognitoAuth };
