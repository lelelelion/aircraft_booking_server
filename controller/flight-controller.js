const {
    Flight,
    Airline,
    Aircraft,
    Airport,
    Ticket,
    City
} = require('../model');
const Sequelize = require('sequelize');
const {or, and, gt, lt, gte, lte} = Sequelize.Op;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

/**
 * 输入始发和到达，返回可用的航班
 * @param ctx
 * @returns {Promise<void>}
 */
const searchAvailableFlight = async ctx => {
    const {fromCityCode, toCityCode, date} = ctx.query;
    if (!fromCityCode || !toCityCode || !date) {
        ctx.easyResponse.error("Please check your param. (require: 'fromCity', 'toCity', 'date')");
        return;
    }
    let page = 1;
    let size = 10;
    if(!!ctx.query.page)
        page = parseInt(ctx.query.page);
    if(!!ctx.query.size)
        size = parseInt(ctx.query.size);

    let departCities = await City.findOne({
        where: {
            code: fromCityCode,
        },
        include: [{model: Airport}]
    });

    let arrivalCities = await City.findOne({
        where: {
            code: toCityCode,
        },
        include: [{model: Airport}]
    });

    let result = [];
    await asyncForEach(departCities.Airports, async (v1, idx1, arr1) => {
        await asyncForEach(arrivalCities.Airports, async (v2, idx2, arr2) => {
            result.push(...(await Flight.findAll({
                where: {
                    departAirportId: v1.id,
                    arrivalAirportId: v2.id,
                },
                offset: (page - 1) * size,
                limit: size,
                include: ['departAirport', 'arrivalAirport', 'airline', 'aircraft', {
                    model: Ticket,
                    as: 'tickets',
                    where: {
                        [and]: [
                            {effectDate: {[lte]: date}},
                            {expireDate: {[gt]: date}}
                        ]
                    }
                }]
            })));
        });
    });
    ctx.easyResponse.success(result);
};


module.exports = {
    'GET /searchAvailableFlight': searchAvailableFlight,
};