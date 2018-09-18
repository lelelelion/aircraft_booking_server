const db = require('../db');

const Order = db.defineModel("Order", {
    contactName: {
        type: db.STRING(200),
        defaultValue: "",
    },
    phone: {
        type: db.STRING(20),
        defaultValue: ""
    },
    email: {
        type: db.STRING(100),
        defaultValue: "",
    },
    status: {
        type: db.INTEGER,
        defaultValue: 0,
    },
});

module.exports = Order;