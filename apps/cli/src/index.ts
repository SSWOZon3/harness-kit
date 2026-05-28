#!/usr/bin/env node
import "dotenv/config";
import { createCli } from "./cli.js";

await createCli().parseAsync(process.argv);
