const cdk = require("@aws-cdk/core");
import {
  LambdaRestApi,
  CfnAuthorizer,
  LambdaIntegration,
  AuthorizationType,
} from "@aws-cdk/aws-apigateway";
import { AssetCode, Function, Runtime } from "@aws-cdk/aws-lambda";

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

    const helloFunction = new Function(this, "helloFunction", {
      code: new AssetCode("lambda-functions/hello"),
      handler: "hello.handler",
      runtime: Runtime.NODEJS_12_X,
    });

    const helloLambdaRestApi = new LambdaRestApi(this, "helloLambdaRestApi", {
      restApiName: "Hello API",
      handler: helloFunction,
      proxy: false,
    });

    const authorizer = new CfnAuthorizer(this, "cfnAuth", {
      restApiId: helloLambdaRestApi.restApiId,
      name: "HelloWorldAPIAuthorizer",
      type: "COGNITO_USER_POOLS",
      identitySource: "method.request.header.Authorization",
      providerArns: [userPool.userPoolArn],
    });

    const hello = helloLambdaRestApi.root.addResource("HELLO");

    hello.addMethod("GET", new LambdaIntegration(helloFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref,
      },
    });

    let apiURL = helloLambdaRestApi.url + "HELLO";

    new cdk.CfnOutput(this, "TestURL", { value: apiURL });

    //End of constructor
  }
}

module.exports = { LamdaFunctionsConstruct };
