const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    User,
    PassengerContact
} = require("../model");

const secret = 'aircraft_booking_server_jwt_secret';

/**
 * 根据token获取payload
 * @param token
 * @returns {Promise<*>}
 */
async function getPayload(token) {
    let payload;
    if (token)
        payload = await jwt.decode(token.split(' ')[1], secret);
    return payload;
}


/**
 * 检查用户的有效性
 * @param ctx
 * @returns {Promise<*>}
 */
async function checkUser(ctx) {
    let user = (await getPayload(ctx.headers.authorization)).data;
    if (!user || !user.username) {
        ctx.easyResponse.error('user not exist');
        return null;
    }

    user = await User.findOne({
        where: {
            username: user.username,
        }
    });

    return user;
}

function checkParams(ctx, body, args) {
    let result = true;
    let errStr = 'these param required: ';
    args.forEach(value => {
        if (!body[value])
            result = false;
        errStr += `'${value}' `
    });
    if (!result) {
        ctx.easyResponse.error(errStr)
    }
    return result;
}
/**
 * 检查Post参数的有效性
 * @param ctx
 * @param args
 * @returns {boolean}
 */
function checkPostParams(ctx, args) {
    return checkParams(ctx, ctx.request.body, args);
}

/**
 * 检查get参数的有效性
 * @param ctx
 * @param args
 */
function checkQueryParams(ctx, args) {
    return checkParams(ctx, ctx.query, args);
}


/**
 * 根据密钥和数据生成token
 * @param data
 * @param exp
 */
function generateToken(data, exp = Math.floor(Date.now() / 1000) + (60 * 60 * 2)){
    return jwt.sign({
        data: data,
        exp: exp      // 2 hour
    }, secret);
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}


module.exports = {
    checkUser,
    checkPostParams,
    getPayload,
    generateToken,
    asyncForEach,
    checkQueryParams,
};