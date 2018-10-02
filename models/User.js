const db = require("../db");

/**
 * 用户信息
 */
const User = db.defineModel("User", {
    username: {
        type: db.STRING(200),
        defaultValue: "",
    },
    avatar: {
        type: db.STRING(100),
        defaultValue: "",
    },
    nickname: {
        type: db.STRING(200),
        defaultValue: "",
    },
    gender: {
        type: db.INTEGER,
        defaultValue: 0,
    },
    phone: {
        type: db.STRING(11),
        defaultValue: "",
    },
    email: {
        type: db.STRING(50),
        defaultValue: "",
    },
    password: {
        type: db.STRING(200),
        defaultValue: "",
    },
    lastToken: {
        type: db.STRING(1000),
        defaultValue: "",
    },
    money: {
        type: db.INTEGER,
        defaultValue: 10000000,
        validate: {
            min: 0,
        }
    },
    birthday: {
        type: db.BIGINT,
        defaultValue: 0
    }
});

module.exports = User;
