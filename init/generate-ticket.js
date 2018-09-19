const {
    Flight,
    Ticket,
    Airline,
    Airport,
    Aircraft
} = require('../model');
const moment = require('moment');

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
                price: 100,
                discount: 0.9,
                standbyTicket: 20,
                effectDate: effectDate,
                expireDate: expireDate,
            });
            await ticket.setFlight(flight);

            //添加经济舱
            ticket = await Ticket.create({
                level: 1,
                price: 100,
                discount: 0.9,
                standbyTicket: 240,
                effectDate: effectDate,
                expireDate: expireDate,
            });
            await ticket.setFlight(flight)
        }
        startMoment = startMoment.add(1, 'days');
    }
}

async function generate() {
    let flight = await Flight.findOne({
        where: {
            id: '009a4f1f-9499-4af0-b53f-46b9f478e753'
        },
        include: ['departAirport', 'arrivalAirport', 'airline', 'aircraft']
    });

    console.log(JSON.stringify(flight));
    await genarateTicket(flight, moment().valueOf(), moment().add(20, 'days').valueOf());
    process.exit(0);
}

generate();