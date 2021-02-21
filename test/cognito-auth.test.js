const {
  expect: expectCDK,
  matchTemplate,
  MatchStyle,
} = require("@aws-cdk/assert");
const cdk = require("@aws-cdk/core");
const CdkApplication = require("../cdk/lib/application-stack");

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkApplication.ApplicationStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
