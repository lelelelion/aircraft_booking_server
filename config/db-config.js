const defaultConfig = './db-config-default';
const overrideConfig = './db-config-override';
const testConfig = './db-config-test';

let config = null;

if (process.env.NODE_ENV === 'test') {
    console.log(`Load ${testConfig}...`);
    config = require(testConfig);
} else {
    console.log(`Load ${defaultConfig}...`);
    config = require(defaultConfig);
    try {
        console.log(`Load ${overrideConfig}...`);
        config = Object.assign(config, require(overrideConfig));
    } catch (e) {
        console.log(`Cannot load ${overrideConfig}.`);
    }
}

module.exports = config;