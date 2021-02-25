#!/usr/bin/env node
const cdk = require("@aws-cdk/core");
// const { ApplicationStack } = require("../lib/application-stack");
const { BackendSampleStack } = require("../lib/backend-sample");

// const app = new cdk.App();
// new ApplicationStack(app, "MyApplicationStack");

const backendApp = new cdk.App();
new BackendSampleStack(backendApp, "SampleBackendStack");
