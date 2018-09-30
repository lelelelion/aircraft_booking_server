const bcrypt = require('bcrypt');
const {
    User,
    PassengerContact,
    Order,
    Ticket,
    Flight
} = require("../model");
const {
    CODE_TABLE
} = require('../config/err-code-table');
const Sequelize = require('sequelize');
const {or, and, gt, lt, gte, lte} = Sequelize.Op;
const {
    checkPostParams,
    checkUser,
    getPayload,
    generateToken,
    getPayloadSkipExpired,
} = require('../util/controller-base-util');

const axios = require('axios');
const querystring = require('querystring');


/**
 * 注册
 * @param ctx
 * @returns {Promise<void>}
 */
const register = async ctx => {
    const {body} = ctx.request;

    // 检查字段是否存在
    if (!checkPostParams(ctx, ['username', 'password']))
        return;

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
    if (!checkPostParams(ctx, ['username', 'password']))
        return;
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
        let token = generateToken(user);
        let result = {
            user: user,
            token: token,
        };
        ctx.easyResponse.success(result, "login success");

        /**
         * 保存最后一次获取的token，以便失效后可以凭借最近一次的旧token再次登陆
         */
        User.update({
            lastToken: token,
        }, {
            where: {
                username: user.username,
            }
        });
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
    delete body.username;       //无法试图通过这个接口修改username
    let user = (await getPayload(ctx.header.authorization)).data;

    let affectedCount = await User.update(body, {
        where: {
            username: user.username,
        },
    });

    user = await User.findOne({
        where: {
            username: user.username,
        }
    });
    user.password = undefined;
    user.lastToken = undefined;
    ctx.easyResponse.success({
        affectedCount: affectedCount[0],
        user: user,
    }, "update user info success");
};


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


/**
 * 凭借最新的一个旧token（可以是已失效的），得到一个最新的token
 * @param ctx
 * @returns {Promise<void>}
 */
const updateToken = async ctx => {
    if (!!ctx.headers.authorization) {
        let payload = (await getPayloadSkipExpired(ctx.headers.authorization));
        if (payload === null) {
            ctx.easyResponse.error("未登陆", CODE_TABLE.not_login);
            return
        }
        let user = payload.data;
        if (!!user) { //如果这是一个格式正确的token，则检查是否与数据库中的一致
            let checkUser = await User.findOne({
                where: {
                    username: user.username,
                },
            });
            if (!!checkUser) {
                if (checkUser.lastToken === ctx.headers.authorization.split(' ')[1]) {
                    //generate a new token
                    let token = generateToken(user);
                    let affectedCount = await User.update({
                        lastToken: token,
                    }, {
                        where: {
                            username: user.username,
                        }
                    });
                    if (affectedCount > 0) {
                        ctx.easyResponse.success({
                            token: token,
                        });
                    } else {
                        ctx.easyResponse.error("Update token fail");
                    }
                } else {
                    ctx.easyResponse.error("The token which you input is too old!");
                }
            } else {
                ctx.easyResponse.error("username not exists!");
            }
        } else {
            ctx.easyResponse.error("Please ensure the token is correct!");
        }
    } else {
        ctx.easyResponse.error("Please put your old token into authorization header!");
    }
};


/**
 * 修改密码
 * @param ctx
 * @returns {Promise<void>}
 */
const modifyPassword = async ctx => {
    let user = (await getPayload(ctx.headers.authorization)).data;
    if (!checkPostParams(ctx, ['oldPassword', 'newPassword']))
        return;
    let targetUser = await User.findOne({
        where: {
            username: user.username,
        }
    });

    if (!!targetUser) {
        if (await bcrypt.compare(body.oldPassword, targetUser.password)) {
            targetUser.password = await bcrypt.hash(body.newPassword, 5);
            user = await targetUser.save();
            if (!!user) {         //修改密码成功
                let token = generateToken({
                    username: user.username,
                });
                targetUser.lastToken = token;
                await targetUser.save();
                ctx.easyResponse.success({
                    token: token,
                }, "modify password success~");
            } else {
                ctx.easyResponse.error("modify password fail!");
            }


        } else {
            ctx.easyResponse.error("Please input the correct old password!");
        }
    } else {
        ctx.easyResponse.error("Target user not exists!!");
    }
};


/**
 * 忘记密码
 */
const forgetPassword = async ctx => {
    if (!checkPostParams(ctx, ['phone', 'oldPassword', 'newPassword', 'code', 'zone']))
        return;
    let {phone, oldPassword, newPassword, code, zone} = ctx.request.body;
    let res = await axios.post('https://webapi.sms.mob.com/sms/verify', querystring.stringify({
        appkey: '27f0ed6273924',
        phone: phone,
        zone: zone,
        code: code,
    }));
    if (res.data.status === 200) {    // 验证手机号成功
        let targetUser = await User.findOne({
            where: {
                phone: phone
            }
        });
        if (!targetUser) {
            ctx.easyResponse.error('用户不存在');
            return;
        }
        if (await bcrypt.compare(oldPassword, targetUser.password)) {
            targetUser.password = await bcrypt.hash(newPassword, 5);
            user = await targetUser.save();
            if (!!user) {         //修改密码成功
                let token = generateToken({
                    username: user.username,
                });
                targetUser.lastToken = token;
                await targetUser.save();
                ctx.easyResponse.success({
                    token: token,
                }, "modify password success~");
            } else {
                ctx.easyResponse.error("修改密码失败");
            }
        } else {
            ctx.easyResponse.error("原密码错误");
        }
    } else {    //验证手机号失败
        ctx.easyResponse.error("验证码错误")
    }
};


/**
 * 添加乘机人信息
 */
const addPassengerContact = async ctx => {
    let {body} = ctx.request;
    let user = await checkUser(ctx);

    //检查用户是否有效，并且参数齐备
    if (!user || !checkPostParams(ctx, ['name', 'certificateType', 'certificateValue']))
        return;

    //过滤调一些不允许修改的字段
    body.id = undefined;
    body.version = undefined;
    body.uid = undefined;
    body.createAt = undefined;
    body.updateAt = undefined;
    let pc = await PassengerContact.findOne({
        where: {
            name: body.name,
            certificateType: body.certificateType,
            certificateValue: body.certificateValue,
        }
    });
    if (!!pc) {
        ctx.easyResponse.error('passenger info already exists!');
        return;
    }
    pc = await PassengerContact.create({...body});
    await user.addPassengerContact(pc);

    ctx.easyResponse.success(pc, 'add passenger contact success!');
};


/**
 * 获取乘机人信息列表
 * @param ctx
 * @returns {Promise<void>}
 */
const getPassengerContacts = async ctx => {
    let user = await checkUser(ctx);
    if (!user)
        return;
    let result = await user.getPassengerContacts();
    ctx.easyResponse.success(result);
};


/**
 * 更新乘机人信息
 * @param ctx
 * @returns {Promise<void>}
 */
const updatePassengerContact = async ctx => {
    let {body} = ctx.request;
    let user = await checkUser(ctx);

    //检查用户是否有效，并且参数齐备
    if (!user || !checkPostParams(ctx, ['id']))
        return;

    //过滤调一些不允许修改的字段
    body.version = undefined;
    body.uid = undefined;
    body.createAt = undefined;
    body.updateAt = undefined;
    let affectedCount = (await PassengerContact.update({...body}, {
        where: {
            id: body.id,
        }
    }))[0];

    ctx.easyResponse.success({affectedCount: affectedCount});
};


/**
 * 删除乘机人信息
 * @param ctx
 * @returns {Promise<void>}
 */
const deletePassengerContact = async ctx => {
    let {body} = ctx.request;
    let user = await checkUser(ctx);

    //检查用户是否有效，并且参数齐备
    if (!user || !checkPostParams(ctx, ['id']))
        return;
    let affectedCount = (await PassengerContact.destroy({
        where: {
            id: body.id,
        }
    }))[0];
    ctx.easyResponse.success({affectedCount: affectedCount});
};

/**
 * 获取行程(未完成, 且未过期的机票)
 * @param ctx
 */
const getTrips = async ctx => {
    let user = await checkUser(ctx);
    if (!user)
        return;
    let page = 1;
    let size = 10;
    if (!!ctx.query.page)
        page = parseInt(ctx.query.page);
    if (!!ctx.query.size)
        size = parseInt(ctx.query.size);
    let result = await Order.findAll({
        where: {
            uid: user.id,
            status: 0,
        },
        offset: (page - 1) * size,
        limit: size,
        include: ['passengers', {
            model: Ticket,
            where: {
                effectDate: {
                    [gt]: new Date().valueOf()
                }
            },
            include: [{
                model: Flight,
                include: ['departAirport', 'arrivalAirport', 'airline', 'aircraft']
            }]
        },],
        order: [
            ['createdAt', 'DESC']
        ]
    });
    ctx.easyResponse.success(result);
};


module.exports = {
    'POST /register': register,
    'POST /login': login,
    'POST /updateUserInfo': updateUserInfo,
    'GET /getUserInfo': getUserInfo,
    'GET /updateToken': updateToken,
    'POST /modifyPassword': modifyPassword,
    'POST /addPassengerContact': addPassengerContact,
    'GET /getPassengerContacts': getPassengerContacts,
    'POST /updatePassengerContact': updatePassengerContact,
    'POST /deletePassengerContact': deletePassengerContact,
    'POST /forgetPassword': forgetPassword,
    'GET /getTrips': getTrips
};