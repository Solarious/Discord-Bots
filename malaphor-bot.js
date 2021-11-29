import { readFileSync } from 'fs';
import { setupClient, setupCommand } from './util.js';

import dotenv from 'dotenv';
dotenv.config();

const {
    MALAPHOR_TOKEN,
    MALAPHORS_FILE,
    MALAPHOR_CLIENT_ID,
    GUILD_ID
} = process.env;

export async function createMalaphorBot() {
    const client = await setupClient();

    client.once('ready', async () => {
        console.log('Setting up malaphor bot');
        await setupMalaphorCommand();
        console.log('Malaphor bot ready');
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        if (interaction.commandName === 'malaphor') {
            await malaphorInteraction(interaction);
        }
    });

    await client.login(MALAPHOR_TOKEN);

    return client;
}

async function setupMalaphorCommand() {
    const json = {
        'name': 'malaphor',
        'type': 1,
        'description': 'Get a malaphor'
    };

    await setupCommand(MALAPHOR_TOKEN, MALAPHOR_CLIENT_ID, GUILD_ID, json);
}

async function malaphorInteraction(interaction) {
    const malaphors = LoadMalaphors();
    const malaphor = selectRandom(malaphors);
    await interaction.reply(malaphor);
}

function LoadMalaphors() {
    const data = readFileSync(MALAPHORS_FILE, 'utf8');
    const malaphors = data.trim().split('\n');
    if (malaphors.length === 0) {
        throw new Error('Error loading malaphors');
    }
    return malaphors;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function selectRandom(array) {
    return array[getRandomInt(0, array.length)];
}