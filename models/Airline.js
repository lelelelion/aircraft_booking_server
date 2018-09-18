const db = require("../db");

/**
 * 航空公司
 */
const Airline = db.defineModel("Airline", {
    name: {
        type: db.STRING(100),
        defaultValue: "",
    },
    location: {
        type: db.STRING(1000),
        defaultValue: "",
    }
});

module.exports = Airline;