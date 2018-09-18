const db = require('../db');

/**
 * 机场
 */
const Airport = db.defineModel("Airport", {
    name: {
        type: db.STRING(100),
        defaultValue: "",
    },
    location: {
        type: db.STRING(500),
        defaultValue: "",
    }
});

module.exports = Airport;