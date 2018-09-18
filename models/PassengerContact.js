const db = require("../db");

/**
 * 乘机人信息
 */
const PassengerContact = db.defineModel("PassengerContact", {
    name: {
        type: db.STRING(100),
        defaultValue: "",
    },
    certificateType: {
        type: db.STRING(100),
        defaultValue: ""
    },
    certificateValue: {
        type: db.STRING(100),
        defaultValue: "",
    },
    birthday: {
        type: db.BIGINT,
        defaultValue: 0,
    },
    phone: {
        type: db.STRING,
        defaultValue: "",
    },
    email: {
        type: db.STRING,
        defaultValue: "",
    }
});

module.exports = PassengerContact;