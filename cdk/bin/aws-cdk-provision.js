#!/usr/bin/env node
const cdk = require("@aws-cdk/core");
const { ApplicationStack } = require("../lib/application-stack");

const app = new cdk.App();
new ApplicationStack(app, "MyApplicationStack");
