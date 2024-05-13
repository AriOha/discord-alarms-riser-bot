const pikudHaoref = require('pikud-haoref-api');
const { playAlarmSound } = require('./audio');
const { loadConfig, loadDistricts } = require('./config');

const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes
let cooldownEnd = 0;
// const districts = loadDistricts();
// const uniqueAreaNames = Array.from(new Set(districts.map((area) => area.areaname)));
// console.log(uniqueAreaNames);

// check for alerts
const checkAlerts = (voiceConnection) => {
  const now = Date.now();

  const configData = loadConfig();
  const scopeAreas = configData['scope-areas'];
  const districts = loadDistricts();

  const cities = getScopeCities(districts, scopeAreas);

  pikudHaoref.getActiveAlert((err, alertData) => {
    if (err) return;

    // Alert header
    // console.log('Currently active alert:', alertData);
    // Log the alert (if any)
    // console.log(alertData);
    // Line break for readability
    // console.log();

    const { cities } = alertData;
    if (Array.isArray(cities) && cities.length > 0) {
      const hasMatchingCity = scopeCities.some((city) => cities.includes(city));

      if (hasMatchingCity) {
        // console.log('Currently active alert:', alertData?.type, 'in cities:', cities);
        if (now < cooldownEnd) {
          console.log('Alert sound on cooldown. Will not play again until:', new Date(cooldownEnd));
          return;
        }
        // Play the test sound and set cooldown
        playAlarmSound(voiceConnection).then(() => {
          cooldownEnd = Date.now() + COOLDOWN_PERIOD;
        });
      }
    }
  });
};

// filter the relevant cities according the areas in the config
const getScopeCities = (districts, areas) => {
  const cityNames = districts
    .filter((district) => areas.includes(district.areaname))
    .map((district) => district.label);

  return Array.from(new Set(cityNames));
};

module.exports = {
  checkAlerts,
};
