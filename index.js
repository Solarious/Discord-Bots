import dotenv from 'dotenv';
import { createMalaphorBot } from './malaphor-bot.js';
import { createMockBot } from './mock-bot.js';
import { createMurderBot } from './murder-bot.js';

dotenv.config();

await createMalaphorBot();
await createMockBot();
await createMurderBot();