const db = require("../db");

/**
 * 航班
 */
const Flight = db.defineModel("Flight", {
    date: {
        type: db.BIGINT,
        defaultValue: new Date().valueOf(),
    },
    distance: {
        type: db.BIGINT,
        defaultValue: 0,
    },
    punctuality: {
        type: db.DOUBLE,
        defaultValue: 0.0,
    },
    duration: {
        type: db.BIGINT,
        defaultValue: 0,
    },
    departTime: {
        type: db.BIGINT,
        defaultValue: 0,
    },
    arrivalTime: {
        type: db.BIGINT,
        defaultValue: 0,
    },
    ticketPrice: {
        type: db.DOUBLE,
        defaultValue: 0.0,
    },
    discount: {
        type: db.DOUBLE,
        defaultValue: 0.0,
    },
    ticketAllowance: {      //票余量
        type: db.INTEGER,
        defaultValue: 0,
    }
});

module.exports = Flight;