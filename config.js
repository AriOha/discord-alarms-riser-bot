const fs = require('fs');
const path = require('path');

const CONFIG_FILE_PATH = path.join(__dirname, 'bot-config.json');
const DISTRICTS_FILE_PATH = path.join(__dirname, 'districts.json');

// load the json configuration file
const loadConfig = () => {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
  }
  return { 'scope-areas': [], mainChannelId: null, lastChannelId: null, sounds: [], users: [] };
};

// load the json configuration file
const loadDistricts = () => {
  if (fs.existsSync(DISTRICTS_FILE_PATH)) {
    return JSON.parse(fs.readFileSync(DISTRICTS_FILE_PATH, 'utf8'));
  }
  return [];
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
  loadDistricts,
  saveConfig,
  saveMainChannel,
};
