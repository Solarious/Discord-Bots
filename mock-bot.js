import { setupClient, setupCommands } from './util.js';

import dotenv from 'dotenv';
dotenv.config();

const {
    MOCK_TOKEN,
    MOCK_CLIENT_ID,
    GUILD_ID,
    MOCK_PROBABILITY,
    MAX_SEARCH
} = process.env;

const MOCK_PROBABILITY_FLOAT = parseFloat(MOCK_PROBABILITY);
const MAX_SEARCH_INT = parseInt(MAX_SEARCH);

export async function createMockBot() {
    const client = await setupClient();

    client.once('ready', async () => {
        console.log('Setting up mock bot');
        await setupCommands(MOCK_TOKEN, MOCK_CLIENT_ID, GUILD_ID,
            mockMessageJson,
            mockUsersLastMessageJson
        );
        console.log('Mock bot ready');
    });

    client.on('interactionCreate', async interaction => {
        try {
            if (interaction.isCommand()) {
                if (interaction.commandName === 'mockuserslastmessage') {
                    await mockUsersLastMessageInteraction(interaction);
                }
            } else if (interaction.isApplicationCommand()) {
                if (interaction.commandName === 'mockmessage') {
                    mockMessageInteraction(interaction);
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: 'Internal error with bot',
                ephemeral: true
            });
        }
    });

    client.on('messageCreate', async message => {
        if (message.author.bot || message.content.trim() === '') return;
        if (Math.random() < MOCK_PROBABILITY_FLOAT) {
            const msg = mockify(message.content);
            await message.reply(msg);
        }
    });

    await client.login(MOCK_TOKEN);

    return client;
}

const mockMessageJson = {
    'name': 'mockmessage',
    'type': 3,
};

async function mockMessageInteraction(interaction) {
    const message = interaction.channel.messages.cache.get(interaction.targetId).content;
    const mockedMessage = mockify(message);
    await interaction.reply(mockedMessage);
}

const mockUsersLastMessageJson = {
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

async function mockUsersLastMessageInteraction(interaction) {
    await interaction.reply({
        content: 'Searching for message',
        ephemeral: true
    });

    let before = undefined;
    for (let i = 0; i < MAX_SEARCH_INT; i++) {
        const messages = await interaction.channel.messages.fetch({
            limit: 100,
            before
        });
        if (messages.size == 0) break;

        const usersMessages = messages.filter(m => m.author?.id == interaction.options.getUser('user').id);
        if (usersMessages.size > 0) {
            const message = usersMessages.first();
            const text = message.content;
            const mocked = mockify(text);
            await message.reply(`${mocked}\nAs requested by ${interaction.member.user}`);
            await interaction.editReply('Message found and mocked');
            return;
        }

        before = messages.sorted(m => m.createdAt).firstKey();
        await interaction.editReply(`Searching for message: searched ${(i+1)*100} messages`);
    }

    await interaction.editReply('Could not find a message to mock');
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