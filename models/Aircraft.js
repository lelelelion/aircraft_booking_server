const db = require("../db");

/**
 * 飞机
 */
const Aircraft = db.defineModel("Aircraft", {
    version: {
        type: db.STRING(50),
        defaultValue: "",
    },
    capacity: {
        type: db.INTEGER,
        defaultValue: 0,
    },
});

module.exports = Aircraft;