const db = require('../db');

const Ticket = db.defineModel('Ticket', {
    level: {
        type: db.INTEGER,
    },

    price: {
        type: db.DOUBLE,
    },
    discount: {
        type: db.DOUBLE,
        defaultValue: 1.0
    },
    standbyTicket: {
        type: db.INTEGER,
        defaultValue: 0,
    },
    effectDate: {
        type: db.BIGINT,
    },
    expireDate: {
        type: db.BIGINT,
    },
});

module.exports = Ticket;