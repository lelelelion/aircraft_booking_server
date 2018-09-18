const db = require('../db');

/**
 * 机场和航空公司联系方式
 */
const CommonContact = db.defineModel("CommonContact", {
    ownerType: {
        type: db.INTEGER,
        defaultValue: 0,
    },
    type: {
        type: db.STRING(20),
        defaultValue: "phone",
    },
    value: {
        type: db.STRING(50),
        defaultValue: "",
    }
});

module.exports = CommonContact;