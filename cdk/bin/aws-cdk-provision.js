#!/usr/bin/env node
const cdk = require("@aws-cdk/core");
import { ApplicationStack } from "../lib/application-stack";

const app = new cdk.App();
new ApplicationStack(app, "MyApplicationStack");
