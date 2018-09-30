const {
    Order,
    PassengerContact,
    User,
    Flight,
    Ticket,
} = require('../model');

const {
    checkUser,
    checkPostParams,
    checkQueryParams,
    asyncForEach
} = require('../util/controller-base-util');

const {
    sequelize,
} = require('../db');


/**
 * 下订单
 * @param ctx
 * @returns {Promise<void>}
 */
const generateOrder = async ctx => {
    let user = await checkUser(ctx);
    if (!user || !checkPostParams(ctx, ['ticketId', 'passengers', 'contactName', 'phone']))
        return;
    let {body} = ctx.request;
    if (!body.passengers || !body.passengers.length || body.passengers.length <= 0) {
        ctx.easyResponse.error('please add passengers');
        return;
    }

    let ticket = await Ticket.findById(body.ticketId);
    // 检查票数是否足够
    if (ticket.standbyTicket < body.passengers.length) {
        ctx.easyResponse.error('ticket is not enough for ' + body.passengers.length + ' people');
        return;
    }
    //检查余额是否足够
    if (!ticket) {
        ctx.easyResponse.error('ticket not exists');
        return;
    }
    let cost = parseInt((ticket.price * ticket.discount)) * body.passengers.length;
    if (cost > user.money) {
        ctx.easyResponse.error('Sorry, your credit is running low');
        return;
    }

    body.id = undefined;
    body.uid = undefined;
    body.ticketId = undefined;

    /**
     * 开启一个事务，失败则回滚
     */
    await sequelize.transaction(async t => {

        return Order.create({
            ...body,
            cost: cost
        }, {transaction: t})
            .then(async order => {
                if (!order) {
                    ctx.easyResponse.error('crate oder fail');
                    return;
                }
                await user.addOrder(order, {transaction: t});
                await ticket.addOrder(order, {transaction: t});
                await asyncForEach(body.passengers, async value => {
                    let passenger = await PassengerContact.findById(value);
                    if (!passenger) {
                        ctx.easyResponse.error('passenger contact not exists for: ' + value);
                        return;
                    }
                    await passenger.addOrders(order, {transaction: t});
                });

                user.money = user.money - cost;
                await user.save({transaction: t});
                ticket.standbyTicket = ticket.standbyTicket - 1;
                await ticket.save({transaction: t});
                ctx.easyResponse.success(order, 'createOrderSuccess');
            });
    });
};


/**
 * 获取订单的详情
 * @param ctx
 * @returns {Promise<void>}
 */
const getOrderDetail = async ctx => {
    let user = await checkUser(ctx);
    if (!user || !checkQueryParams(ctx, ['orderId']))
        return;
    let result = await Order.findOne({
        where: {
            id: ctx.query.orderId,
        },
        include: ['passengers', User, {
            model: Ticket,
            include: [Flight]
        },]
    });
    ctx.easyResponse.success(result);
};


/**
 * 获取订单列表
 * @param ctx
 * @returns {Promise<void>}
 */
const getOrders = async ctx => {
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
        },
        offset: (page - 1) * size,
        limit: size,
        include: ['passengers', {
            model: Ticket,
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


/**
 * 删除订单
 * @param ctx
 * @returns {Promise<void>}
 */
const deleteOrder = async ctx => {
    let user = checkUser(ctx);
    if (!user || !checkPostParams(ctx, ['orderId']))
        return;
    let affectedCount = (await Order.destroy({
        where: {
            id: ctx.request.body.orderId
        }
    }));
    ctx.easyResponse.success({affectedCount});
};



/**
 * 退票
 * @param ctx
 * @returns {Promise<void>}
 */
const returnTicket = async ctx => {
    let user = await checkUser(ctx);
    if (!user || !checkPostParams(ctx, ['orderId']))
        return;
    let order = await Order.findOne({
        where: {
            id: ctx.request.body.orderId,
        },
        include: ['passengers', User, {
            model: Ticket,
            include: [Flight]
        },]
    });
    if (!order) {
        ctx.easyResponse.error("订单不存在");
        return;
    }
    if (order.status !== 0) {     //订单已经完成,无法退票
        ctx.easyResponse.error("订单已经完成,无法退票");
        return;
    }

    // 开启一个事务执行退票操作
    await sequelize.transaction(async t => {
        //置订单为退票状态
        order.status = 2;
        user.money += order.cost;
        console.log(user);
        return order.save({transaction: t})
            .then(order => {
                return user.save({transaction: t})
            })
    });
    ctx.easyResponse.success("", "退票成功")
};

module.exports = {
    'POST /generateOrder': generateOrder,
    'GET /getOrderDetail': getOrderDetail,
    'GET /getOrders': getOrders,
    'POST /deleteOrder': deleteOrder,
    'POST /returnTicket': returnTicket,
};