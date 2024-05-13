// Import required modules and configurations
const dotenv = require('dotenv');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannelAndRemember, playAlarmSound, announceUserLeave, speakText } = require('./audio');
const { checkAlerts } = require('./alerts');
const { loadConfig, saveMainChannel } = require('./config');

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 5000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

let voiceConnection;

// join the last channel or the main channel
const joinLastOrMainChannel = () => {
  const configData = loadConfig();
  const { lastChannelId, mainChannelId } = configData;

  // join last
  const lastChannel = client.channels.cache.get(lastChannelId);
  if (lastChannel && lastChannel.members.size > 0) {
    voiceConnection = joinVoiceChannelAndRemember(lastChannel);
  } else if (mainChannelId) {
    // join main if the last channel is empty or n/a
    const mainChannel = client.channels.cache.get(mainChannelId);
    if (mainChannel) {
      voiceConnection = joinVoiceChannelAndRemember(mainChannel);
    }
  }
};

// initialize
client.once('ready', () => {
  console.log('Discord bot is ready!');
  joinLastOrMainChannel();

  // check for alerts
  setInterval(() => checkAlerts(voiceConnection), CHECK_INTERVAL);
});

// handle commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  try {
    // defer the reply to give the bot more time to process the command
    await interaction.deferReply();

    if (commandName === 'ts') {
      if (!voiceConnection) {
        await interaction.editReply('I need to be in a voice channel first. Try using the `jm` command.');
        return;
      }

      await playAlarmSound(voiceConnection, true);
      await interaction.editReply('Playing test sound...');
    } else if (commandName === 'jm') {
      const userVoiceChannel = interaction.member.voice.channel;
      if (userVoiceChannel) {
        joinVoiceChannelAndRemember(userVoiceChannel, voiceConnection);
        await interaction.editReply(`Joined your voice channel: ${userVoiceChannel.name}`);
      } else {
        await interaction.editReply('You need to be in a voice channel to summon the bot.');
      }
    } else if (commandName === 'set-main-channel') {
      const channelId = interaction.options.getString('channel_id');
      const newChannel = client.channels.cache.get(channelId);

      if (newChannel) {
        joinVoiceChannelAndRemember(newChannel, voiceConnection);
        saveMainChannel(channelId);
        await interaction.editReply(`Main channel set to: ${newChannel.name}`);
      } else {
        await interaction.editReply('Invalid channel ID or the channel is not a voice channel.');
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channelId && !newState.channelId) {
    // user has disconnected from any voice channel
    if (voiceConnection) {
      announceUserLeave(oldState.member.user.id, voiceConnection);
    }
  }
});

client.login(DISCORD_TOKEN);
