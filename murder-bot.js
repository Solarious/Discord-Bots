import { setupClient } from './util.js';

import dotenv from 'dotenv';
dotenv.config();

const {
    MURDER_TOKEN,
    MURDER_PROBABILITY
} = process.env;

const MURDER_PROBABILITY_FLOAT = parseFloat(MURDER_PROBABILITY);

export async function createMurderBot() {
    const client = await setupClient();

    client.once('ready', async () => {
        console.log('Setting up murder bot');
        console.log('Murder bot ready');
    });

    client.on('messageCreate', async message => {
        if (message.author.bot || message.content.trim() === '') return;
        if (Math.random() < MURDER_PROBABILITY_FLOAT) {
            await message.reply('...');
        }
    });

    await client.login(MURDER_TOKEN);

    return client;
}
