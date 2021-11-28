import dotenv from 'dotenv';
import { createMalaphorBot } from './malaphor-bot.js';

dotenv.config();

await createMalaphorBot();