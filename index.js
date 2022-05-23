import dotenv from 'dotenv';
import { createMalaphorBot } from './malaphor-bot.js';
import { createMockBot } from './mock-bot.js';
import { createMurderBot } from './murder-bot.js';
import { createHistoryBot } from './history-bot.js';
import mongoose from 'mongoose';

dotenv.config();

const {
    MONGODB_URI
} = process.env;

console.log('--- Program start ---');
await mongoose.connect(MONGODB_URI);
await createMalaphorBot();
await createMockBot();
await createMurderBot();
await createHistoryBot();