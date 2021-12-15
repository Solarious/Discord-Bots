import { Client, Intents } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';

export async function setupClient() {
    const intents = new Intents();
    intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);

    const client = new Client({ intents });

    return client;
}

export async function setupCommands(token, clientId, guildId, ...commands) {
    const rest = new REST({ version: '9' }).setToken(token);

    const commandNames = commands.map(c => c.name).join(', ');

    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), { body: commands }
        );
        console.log(`Commands setup: ${commandNames}`);
    } catch (error) {
        console.log(`Error setting up commands ${commandNames}`);
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