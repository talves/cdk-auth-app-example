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

class LamdaFunctionsConstruct extends cdk.Construct {
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id);
    // Start provisioning resources here.
    const { userPool } = props;
    if (!userPool) throw "userPool missing from props.";
    //End of constructor
  }
}

module.exports = { LamdaFunctionsConstruct };
