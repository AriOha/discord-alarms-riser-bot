const fs = require('fs');
const path = require('path');

const CONFIG_FILE_PATH = path.join(__dirname, 'bot-config.json');

// load the json configuration file
const loadConfig = () => {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
  }
  return { 'scope-cities': [], mainChannelId: null, lastChannelId: null, sounds: [], users: [] };
};

// save configuration data to the json file
const saveConfig = (configData) => {
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configData, null, 2), 'utf8');
};

// save the main channel for given ID
const saveMainChannel = (channelId) => {
  const configData = loadConfig();
  configData.mainChannelId = channelId;
  saveConfig(configData);
};

module.exports = {
  loadConfig,
  saveConfig,
  saveMainChannel,
};
