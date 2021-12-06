import { setupClient, setupCommand } from './util.js';

import dotenv from 'dotenv';
dotenv.config();

const {
    MOCK_TOKEN,
    MOCK_CLIENT_ID,
    GUILD_ID,
    MOCK_PROBABILITY
} = process.env;

const MOCK_PROBABILITY_INT = parseFloat(MOCK_PROBABILITY);

export async function createMockBot() {
    const client = await setupClient();

    client.once('ready', async () => {
        console.log('Setting up mock bot');
        //await setupMockUserCommand();
        await setupMockMessageCommand();
        await setupMockUsersLastMessageCommand();
        console.log('Mock bot ready');
    });

    client.on('interactionCreate', async interaction => {
        if (interaction.isCommand()) {
            if (interaction.commandName === 'mockuser') {
                await mockUserInteraction(interaction);
            } else if (interaction.commandName === 'mockuserslastmessage') {
                await mockUsersLastMessageInteraction(interaction);
            }
        } else if (interaction.isApplicationCommand()) {
            if (interaction.commandName === 'mockmessage') {
                mockMessageInteraction(interaction);
            }
        }
    });

    client.on('messageCreate', async message => {
        if (message.author.bot || message.content.trim() === '') return;
        if (Math.random() < MOCK_PROBABILITY_INT) {
            const msg = mockify(message.content);
            await message.reply(msg);
        }
    });

    await client.login(MOCK_TOKEN);

    return client;
}

async function setupMockUserCommand() {
    const json = {
        'name': 'mockuser',
        'type': 1,
        'description': 'Mock target users next num messages',
        'options': [
            {
                'name': 'user',
                'type': 6,
                'description': 'The user to mock'
            },
            {
                'name': 'num',
                'type': 4,
                'description': 'The number of messages to mock',
                'min_value': 1,
                'max_value': 10
            }
        ]
    };

    await setupCommand(MOCK_TOKEN, MOCK_CLIENT_ID, GUILD_ID, json);
}

async function mockUserInteraction(interaction) {// eslint-disable-line no-unused-vars
}

async function setupMockMessageCommand() {
    const json = {
        'name': 'mockmessage',
        'type': 3,
    };
    await setupCommand(MOCK_TOKEN, MOCK_CLIENT_ID, GUILD_ID, json);
}

async function mockMessageInteraction(interaction) {
    const message = interaction.channel.messages.cache.get(interaction.targetId).content;
    const mockedMessage = mockify(message);
    await interaction.reply(mockedMessage);
}

async function setupMockUsersLastMessageCommand() {
    const json = {
        'name': 'mockuserslastmessage',
        'type': 1,
        'description': 'Mocks the given users last message in this channel',
        'options': [
            {
                'name': 'user',
                'type': 6,
                'description': 'The user to mock'
            }
        ]
    };
    
    await setupCommand(MOCK_TOKEN, MOCK_CLIENT_ID, GUILD_ID, json);
}

async function mockUsersLastMessageInteraction(interaction) {
    const messages = await interaction.channel.messages.fetch();
    const usersMessages = messages.filter(m => m.author.id == interaction.options.getUser('user').id);
    if (usersMessages.size == 0) {
        await interaction.reply({
            contents: 'Could not find a message to mock',
            ephemeral: true
        });
    } else {
        const message = usersMessages.first().content;
        const mocked = mockify(message);
        await interaction.reply(mocked);
    }
}

function mockify(text) {
    const regex = /[a-zA-Z]/;
    const array = [...text];
    const mockedArray = array.map((char, i) => {
        if (regex.test(char)) {
            return i % 2 == 1 ? char.toUpperCase() : char.toLowerCase();
        } else {
            return char;
        }
    });
    return mockedArray.join('');
}