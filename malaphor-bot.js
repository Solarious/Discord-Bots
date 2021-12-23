import { readFileSync } from 'fs';
import { setupClient, setupCommands } from './util.js';

import dotenv from 'dotenv';
dotenv.config();

const {
    MALAPHOR_TOKEN,
    MALAPHORS_FILE,
    MALAPHOR_CLIENT_ID,
    MALAPHOR_PROBABILITY,
    GUILD_ID
} = process.env;

const MALAPHOR_PROBABILITY_FLOAT = parseFloat(MALAPHOR_PROBABILITY);

export async function createMalaphorBot() {
    const client = await setupClient();

    client.once('ready', async () => {
        console.log('Setting up malaphor bot');
        await setupCommands(MALAPHOR_TOKEN, MALAPHOR_CLIENT_ID, GUILD_ID, malaphorJson);
        console.log('Malaphor bot ready');
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        if (interaction.commandName === 'malaphor') {
            await malaphorInteraction(interaction);
        }
    });

    client.on('messageCreate', async message => {
        if (message.author.bot || message.content.trim() === '') return;
        if (Math.random() < MALAPHOR_PROBABILITY_FLOAT) {
            const msg = 'Well you know what they say\n' + GetRandomMalaphor();
            await message.reply(msg);
        }
    });

    await client.login(MALAPHOR_TOKEN);

    return client;
}

const malaphorJson = {
    'name': 'malaphor',
    'type': 1,
    'description': 'Get a malaphor'
};

async function malaphorInteraction(interaction) {
    const malaphor = GetRandomMalaphor();
    await interaction.reply(malaphor);
}

function GetRandomMalaphor() {
    const malaphors = LoadMalaphors();
    return selectRandom(malaphors);
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