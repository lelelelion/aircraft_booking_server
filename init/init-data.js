const fs = require('fs');
const model = require('../model');
const pinyin = require('js-pinyin');
const {
    City,
    Airline,
    Airport,
    Flight,
    Aircraft
} = model;



async function getMainInfo() {
    let data = await fs.readFileSync('./flight.json');
    const jsonObj = JSON.parse(data);
    let results = [];
    let set = new Set();
    jsonObj.forEach((value, index, arr) => {
        if (!set.has(`${value.departCity}-${value.arrivalCity}`)) {
            set.add(`${value.arrivalCity}-${value.departCity}`);
            set.add(`${value.departCity}-${value.arrivalCity}`);
            results.push({
                departAirport: value.departAirport,
                arrivalAirport: value.arrivalAirport,
                departCity: value.departCity,
                arrivalCity: value.arrivalCity,
                distance: value.distance,
            });
        }
    });

    fs.writeFileSync('./flight_main_info.json', JSON.stringify(results));

    process.exit(0);
}

getMainInfo();