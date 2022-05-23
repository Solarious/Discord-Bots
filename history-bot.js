import { setupClient, setupCommands } from './util.js';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const {
    HISTORY_TOKEN,
    HISTORY_CLIENT_ID,
    GUILD_ID,
} = process.env;

export async function createHistoryBot() {
    const client = await setupClient();

    client.once('ready', async() => {
        console.log('Setting up history bot');
        await setupCommands(HISTORY_TOKEN, HISTORY_CLIENT_ID, GUILD_ID,
            saveHistoryJson, quoteJson
        );
        console.log('History bot ready');
    });

    client.on('interactionCreate', async interaction => {
        try {
            if (interaction.isCommand()) {
                if (interaction.commandName == 'savehistory') {
                    await saveHistoryInteraction(interaction);
                } else if (interaction.commandName == 'quote') {
                    await quoteInteraction(interaction);
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

    await client.login(HISTORY_TOKEN);

    return client;
}

const MesssageSchema = new mongoose.Schema({
    discord_id: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        discord_id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    channel: {
        discord_id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        required: true
    },
    isLink: {
        type: Boolean,
        required: false
    },
    content: {
        type: String,
        required: true
    }
}, { strict: true });

const Message = new mongoose.model('Message', MesssageSchema);

const saveHistoryJson = {
    'name': 'savehistory',
    'type': 1,
    'description': 'Saves history for a channel',
    'options': [
        {
            'name': 'channel',
            'type': 7,
            'description': 'The channel to download history for',
            'required': true,
            'channel_types': [0]
        }
    ]
};

const quoteJson = {
    'name': 'quote',
    'type': 1,
    'description': 'Quote an user',
    'options': [
        {
            'name': 'user',
            'type': 6,
            'description': 'The user to quote',
            'required': true
        },
        {
            'name': 'channel',
            'type': 7,
            'description': 'The channel to quote from',
            'channel_types': [0]
        },
        {
            'name': 'messagetype',
            'type': 3,
            'description': 'Get a message of the specified type',
            'choices': [
                {
                    'name': 'text',
                    'value': 'text'
                },
                {
                    'name': 'link',
                    'value': 'link'
                },
                {
                    'name': 'both',
                    'value': 'both'
                }
            ]
        }
    ]
};

async function saveHistoryInteraction(interaction) {
    const channel = interaction.options.getChannel('channel');
    let before = undefined;
    let total = 0;

    await interaction.reply({
        content: `Saving history for channel ${channel.name}`,
        ephemeral: true
    });

    await Message.deleteMany({ 'channel.discord_id': channel.id });

    for (;;) {
        const messages = await channel.messages.fetch({
            limit: 100,
            before: before
        });
        
        if (messages.size == 0) break;
        before = messages.sorted(m => m.createdAt).lastKey();

        let all = [...messages.mapValues(m => CreateMessage(m)).filter(m => m.content !== '').values()];
        let num = await Message.insertMany(all);
        total += num.length;
        interaction.editReply(`Saving history for channel ${channel.name}\nSaved ${total} messages`);
    }
    interaction.editReply(`Saving history for channel ${channel.name}\nSaved ${total} messages\nComplete`);
}

async function quoteInteraction(interaction) {
    const user = interaction.options.getUser('user');
    const channel = interaction.options.getChannel('channel');
    const type = interaction.options.get('messagetype')?.value ?? 'both';

    let obj = { 'user.discord_id': user.id };
    if (channel) {
        obj['channel.discord_id'] = channel.id;
    }
    if (type != 'both') {
        obj.isLink = type == 'link';
    }

    let agg = Message.aggregate();
    agg.match(obj);
    agg.sample(1);

    let result = await agg.exec();

    if (result.length > 0) {
        let msg = result[0];
        await interaction.reply({
            content: `In the wise words of ${msg.user.name}:\n${msg.content}`,
            ephemeral: false
        });
    } else {
        await interaction.reply({
            content: 'Error: no quotes found',
            ephemeral: true
        });
    }
}

function CreateMessage(msg) {
    let isLink = false;
    let content = msg.content;
    for (let embed of msg.embeds) {
        if (content.length > 0) content += '\n';
        content += embed.url;
        isLink = true;
    }
    for (let attachment of msg.attachments.values()) {
        if (content.length > 0) content += '\n';
        content += attachment.url;
        isLink = true;
    }

    return new Message({
        discord_id: msg.id,
        user: {
            discord_id: msg.author.id,
            name: msg.author.username
        },
        channel: {
            discord_id: msg.channel.id,
            name: msg.channel.name
        },
        createdAt: msg.createdAt,
        isLink: isLink,
        content: content
    });
}