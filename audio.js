const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const { loadConfig, saveConfig } = require('./config');
const path = require('path');
const googleTts = require('google-tts-api');
const dotenv = require('dotenv');

dotenv.config();

const audioPlayer = createAudioPlayer();

// Function to play TTS and sound
const announceUserLeave = async (userId, voiceConnection) => {
  const config = loadConfig();
  const userNameHebrew = config.users[userId] || 'משתמש לא ידוע';
  const leaveText = userNameHebrew + ' ' + config.texts.leaveServerText;
  const ttsUrl = googleTts.getAudioUrl(leaveText, {
    lang: 'he',
    slow: false,
    host: 'https://translate.google.com',
  });

  try {
    // play TTS
    const ttsResource = createAudioResource(ttsUrl);
    voiceConnection.subscribe(audioPlayer);
    audioPlayer.play(ttsResource);
    await new Promise((resolve) => audioPlayer.on(AudioPlayerStatus.Idle, resolve));

    // play leave sound
    const leaveSoundResource = createAudioResource(config.sounds.leaveServerSound);
    if (leaveSoundResource) audioPlayer.play(leaveSoundResource);
  } catch (error) {
    console.error('Failed to play TTS or sound:', error);
  }
};

// join a voice channel and
const joinVoiceChannelAndRemember = (channel) => {
  const voiceConnection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  voiceConnection.subscribe(audioPlayer);

  // update lastChannelId in the JSON file
  const configData = loadConfig();
  configData.lastChannelId = channel.id;
  saveConfig(configData);

  console.log(`Joined voice channel: ${channel.name}`);

  // return created voice connection
  return voiceConnection;
};

// play alarm sound
const playAlarmSound = async (voiceConnection, test = false, loopTimes = 1) => {
  const config = loadConfig();
  const alarmTestSoundPath = config.sounds.alarmTestSound
    ? path.join(__dirname, config.sounds.alarmTestSound)
    : undefined;
  const alarmRealSoundPath = config.sounds.alarmRealSound
    ? path.join(__dirname, config.sounds.alarmRealSound)
    : undefined;
  const allahuSoundPath = config.sounds.allahuSound
    ? path.join(__dirname, config.sounds.allahuSound)
    : undefined;

  if (!voiceConnection) {
    console.log('No active voice connection.');
    return;
  }

  // pre-sound path is defined before creating a resource
  if (allahuSoundPath) {
    const preAudioResource = createAudioResource(allahuSoundPath);
    audioPlayer.play(preAudioResource);
    await new Promise((resolve) => setTimeout(resolve, test ? 5500 : 8000)); // Adjust delay if needed
  } else {
    console.error('allahuSound is not defined or accessible.');
  }

  // play the main sound multiple times
  if (alarmRealSoundPath || alarmTestSoundPath) {
    for (let i = 0; i < loopTimes; i++) {
      const audioResource = createAudioResource(test ? alarmTestSoundPath : alarmRealSoundPath);
      audioPlayer.play(audioResource);
      await new Promise((resolve) => setTimeout(resolve, 1600));
    }
  } else {
    console.error('Alarm Sound is not defined or accessible.');
  }
};

audioPlayer.on('error', (error) => {
  console.error('Error from the audio player:', error);
});

module.exports = {
  joinVoiceChannelAndRemember,
  playAlarmSound,
  announceUserLeave,
};
