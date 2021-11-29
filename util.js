import { Client, Intents } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';

export async function setupClient() {
    const intents = new Intents();
    intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);

    const client = new Client({ intents });

    return client;
}

export async function setupCommand(token, clientId, guildId, json) {
    const rest = new REST({ version: '9' }).setToken(token);

    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), { body: [json] }
        );
        console.log(`Command setup: ${json.name}`);
    } catch (error) {
        console.log(`Error setting up command ${json.name}`);
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