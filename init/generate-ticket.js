const {
    Flight,
    Ticket,
    Airline,
    Airport,
    Aircraft
} = require('../model');
const moment = require('moment');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

function getChineseWeekDay(weekday){
    switch (weekday) {
        case 1:
            return '一';
        case 2:
            return '二';
        case 3:
            return '三';
        case 4:
            return '四';
        case 5:
            return '五';
        case 6:
            return '六';
        case 0:
            return '日';
    }
}


function randomNum(min, max) {
    switch (arguments.length) {
        case 1:
            return (Math.random() * min).toFixed(2);
        case 2:
            return (Math.random() * (max - min) + min).toFixed(2);
        default:
            return 0;
    }
}

async function genarateTicket(flight, startDate, endDate){
    let startMoment = moment(startDate);
    let endMoment = moment(endDate);
    let weeks = flight.week.split(',');
    while (startMoment.isBefore(endMoment)) {       //遍历
        let weekDay = startMoment.weekday();
        if(weeks.indexOf(getChineseWeekDay(weekDay)) >= 0){ //创建一个Ticket
            let effectDate = +moment(startMoment.format('YYYY-MM-DD'));
            let expireDate = effectDate + 1000 * 60 * 60 * 24;

            // 添加头等舱
            let ticket = await Ticket.create({
                level: 0,
                price: (flight.distance * randomNum(3.5, 4)).toFixed(2),
                discount: randomNum(0.8, 0.99),
                standbyTicket: 20,
                effectDate: effectDate,
                expireDate: expireDate,
            });
            await flight.addTicket([ticket]);

            //添加经济舱
            ticket = await Ticket.create({
                level: 1,
                price: (flight.distance * randomNum(2, 2.2)).toFixed(2),
                discount: randomNum(0.2, 0.6),
                standbyTicket: 240,
                effectDate: effectDate,
                expireDate: expireDate,
            });
            await flight.addTicket([ticket]);
        }
        startMoment = startMoment.add(1, 'days');
    }
}

async function generate() {
    let flights = await Flight.findAll({
        include: ['departAirport', 'arrivalAirport', 'airline', 'aircraft']
    });

    await asyncForEach(flights, async (value) => {
        await genarateTicket(value, moment().valueOf(), moment().add(5, 'days').valueOf());
    });
}

module.exports = generate;