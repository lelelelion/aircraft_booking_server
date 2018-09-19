const db = require("../db");

/**
 * 航班
 */
const Flight = db.defineModel("Flight", {
    distance: {
        type: db.STRING,
        defaultValue: '',
    },
    punctuality: {
        type: db.STRING,
        defaultValue: '',
    },
    duration: {
        type: db.STRING,
        defaultValue: '',
    },
    departTime: {
        type: db.STRING,
        defaultValue: '',
    },
    arrivalTime: {
        type: db.STRING,
        defaultValue: '',
    },
    fromTerminal: {
        type: db.STRING,
        defaultValue: '',
    },
    toTerminal: {
        type: db.STRING,
        defaultValue: '',
    },
    week: {
        type: db.STRING,
        defaultValue: '',
    },
    // date: {
    //     type: db.BIGINT,
    //     defaultValue: new Date().valueOf(),
    // },
    // ticketPrice: {
    //     type: db.DOUBLE,
    //     defaultValue: 0.0,
    // },
    // discount: {
    //     type: db.DOUBLE,
    //     defaultValue: 0.0,
    // },
    // ticketAllowance: {      //票余量
    //     type: db.INTEGER,
    //     defaultValue: 0,
    // }
});

module.exports = Flight;