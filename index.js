import dotenv from 'dotenv';
import { createMalaphorBot } from './malaphor-bot.js';
import { createMockBot } from './mock-bot.js';

dotenv.config();

await createMalaphorBot();
await createMockBot();