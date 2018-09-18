const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    User
} = require("../model");

const secret = 'aircraft_booking_server_jwt_secret';

/**
 * 注册
 * @param ctx
 * @returns {Promise<void>}
 */
const register = async ctx => {
    const {body} = ctx.request;

    // 检查字段是否存在
    if (!body.username || !body.password) {
        ctx.easyResponse.error("请求失败，缺少 username 或 password 字段");
        return;
    }
    body.password = await bcrypt.hash(body.password, 5);
    let user = await User.findOne({
        where: {
            username: body.username,
        }
    });
    if (!user) {
        const newUser = new User(body);
        await newUser.save();
        user = await User.findOne({
            where: {
                username: body.username,
            },
            attributes: {
                exclude: ['password', 'lastToken'],
            }
        });
        ctx.easyResponse.success(user, 'register user success')
    } else {
        ctx.easyResponse.error('username already exists')
    }
};

/**
 * 登陆
 * @param ctx
 * @returns {Promise<void>}
 */
const login = async ctx => {
    const {body} = ctx.request;
    let user = await User.findOne({
        where: {
            username: body.username,
        },
        attributes: {
            exclude: ['lastToken'],
        }
    });
    if (!user) {
        ctx.easyResponse.error("username not exists");
        return;
    }

    //验证密码是否匹配
    if (await bcrypt.compare(body.password, user.password)) {
        user.password = undefined;
        let result = {
            user: user,
            token: jwt.sign({
                data: user,
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2)      // 2 hour
            }, secret),
        };
        ctx.easyResponse.success(result, "login success");
    } else {
        ctx.easyResponse.error("password not correct for user: " + body.username);
    }
};


/**
 * 更新用户信息
 * @param ctx
 * @returns {Promise<void>}
 */
const updateUserInfo = async ctx => {
    const {body} = ctx.request;

    //密码和头像不可通过这个接口修改
    delete body.password;
    delete body.avatar;

    console.log(ctx.user);
    ctx.easyResponse.success("success");
};

/**
 * 根据token获取payload
 * @param token
 * @returns {Promise<*>}
 */
async function getPayload(token) {
    let payload;
    if(token)
        payload = await jwt.verify(token.split(' ')[1], secret);
    return payload;
}

/**
 * 获取用户的信息
 * @param ctx
 * @returns {Promise<void>}
 */
const getUserInfo = async ctx => {
    let user = (await getPayload(ctx.header.authorization)).data;
    user = await User.findOne({
        where: {
            username: user.username
        }
    });
    user.password = undefined;
    ctx.easyResponse.success(user);
};


module.exports = {
    'POST /register': register,
    'POST /login': login,
    'POST /updateUserInfo': updateUserInfo,
    'GET /getUserInfo': getUserInfo,
};