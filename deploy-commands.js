require('dotenv').config(); // Load environment variables
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Optional: Set to clear/register commands for a specific guild

// define the commands to be registered
const commands = [
  new SlashCommandBuilder().setName('jm').setDescription('Joins the voice channel the user is currently in'),
  new SlashCommandBuilder()
    .setName('set-main-channel')
    .setDescription('Sets the main voice channel for the bot')
    .addStringOption((option) =>
      option
        .setName('channel_id')
        .setDescription('The ID of the voice channel to set as main')
        .setRequired(true)
    ),
  new SlashCommandBuilder().setName('ts').setDescription('Plays a test sound in the current voice channel'),
].map((command) => command.toJSON());

// Initialize the REST client for managing commands
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// clear existing commands and re-register the new ones
(async () => {
  try {
    // Clear & register guild-specific commands
    if (GUILD_ID) {
      console.log(`Clearing commands for guild: ${GUILD_ID}`);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
      console.log('Successfully cleared all guild-specific commands.');

      console.log(`Registering commands for guild: ${GUILD_ID}`);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      console.log('Successfully registered commands for the guild.');
    } else {
      // Clear register global commands
      console.log('Clearing all global commands.');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
      console.log('Successfully cleared all global commands.');

      console.log('Registering global commands.');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('Successfully registered global commands.');
    }
  } catch (error) {
    console.error('Error clearing or registering commands:', error);
  }
})();
