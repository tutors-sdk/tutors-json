#!/usr/bin/env node

import { Commands } from './src/controllers/commands';
const root = __dirname;

const commands = new Commands(root);
commands.exec();