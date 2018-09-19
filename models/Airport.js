const db = require('../db');

/**
 * 机场
 */
const Airport = db.defineModel("Airport", {
    name: {
        type: db.STRING(100),
        defaultValue: "",
    },
    threeCode: {
        type: db.STRING(3),
        defaultValue: "",
    }
});

module.exports = Airport;