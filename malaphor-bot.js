import { Client, Intents } from 'discord.js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
dotenv.config();

const {
    MALAPHOR_TOKEN,
    //MOTD_CHANNEL,
    MALAPHORS_FILE,
    MALAPHOR_CLIENT_ID,
    GUILD_ID
} = process.env;

export async function createMalaphorBot() {
    const intents = new Intents();
    intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
    const client = new Client({ intents });

    await client.login(MALAPHOR_TOKEN);

    client.once('ready', async () => {
        await setupMalaphorCommand();
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        if (interaction.commandName === 'malaphor') {
            await malaphorInteraction(interaction);
        }
    });

    return client;
}

async function setupMalaphorCommand() {
    const json = {
        'name': 'malaphor',
        'type': 1,
        'description': 'Get a malaphor'
    };

    const rest = new REST({ version: '9' }).setToken(MALAPHOR_TOKEN);

    try {
        //await axios.post(url, json, headers);
        await rest.put(
            Routes.applicationGuildCommands(MALAPHOR_CLIENT_ID, GUILD_ID), { body: [json] }
        );
        console.log('Malaphor command setup');
    } catch (error) {
        console.log('Error setting up malaphor command');
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
        } else if (error.request) {
            console.log(error.request);
        } else {
            console.log(error.message);
        }
    }
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