const db = require('../db');

const Ticket = db.defineModel('Ticket', {
    level: {
        type: db.INTEGER,
    },
    date: {
        type: db.BIGINT,
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
});

module.exports = Ticket;