const {
  expect: expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource,
} = require("@aws-cdk/assert");
const cdk = require("@aws-cdk/core");
const CdkBackend = require("../cdk/lib/backend-sample");

const app = new cdk.App();
// WHEN
const stack = new CdkApplication.ApplicationStack(app, "MyTestStack");

test("User Pool Created", () => {
  // THEN
  expectCDK(stack).to(haveResource("AWS::Cognito::UserPool"));
});
