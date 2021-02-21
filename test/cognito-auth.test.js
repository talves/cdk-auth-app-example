const {
  expect: expectCDK,
  matchTemplate,
  MatchStyle,
  haveResource,
} = require("@aws-cdk/assert");
const cdk = require("@aws-cdk/core");
const CdkApplication = require("../cdk/lib/application-stack");

const app = new cdk.App();
// WHEN
const stack = new CdkApplication.ApplicationStack(app, "MyTestStack");

test("User Pool Created", () => {
  // THEN
  expectCDK(stack).to(haveResource("AWS::Cognito::UserPool"));
});

test("User Pool Client", () => {
  // THEN
  expectCDK(stack).to(haveResource("AWS::Cognito::UserPoolClient"));
});

test("User Role Created", () => {
  // THEN
  expectCDK(stack).to(haveResource("AWS::IAM::Role"));
});

test("Domain Created", () => {
  // THEN
  expectCDK(stack).to(haveResource("AWS::Cognito::UserPoolDomain"));
});

test("Test User Created", () => {
  // THEN
  expectCDK(stack).to(haveResource("Custom::AWS"));
});

test("Create Lambda", () => {
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
  expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
});

// AWS::Lambda::Permission
test("Lambda permissions set", () => {
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Permission"));
});

// test("Empty Stack", () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new CdkApplication.ApplicationStack(app, "MyTestStack");
//   // THEN
//   expectCDK(stack).to(
//     matchTemplate(
//       {
//         Resources: {},
//       },
//       MatchStyle.EXACT
//     )
//   );
// });
