const db = require('../db');

/**
 * 城市
 */
const City = db.defineModel('City', {
    code: {
        type: db.STRING(5),
        unique: true,
    },
    name: {
        type: db.STRING(50),
        defaultValue: "",
    },
    spell: {
        type: db.STRING(50),
        defaultValue: "",
    }
});

module.exports = City;