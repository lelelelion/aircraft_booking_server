const axios = require('axios');
const model = require('../model');
const pinyin = require('js-pinyin');
const fs = require('fs');
const {
    City,
    Airline,
    Airport,
    Flight,
    Aircraft
} = model;


const targetCities = [
    '北京', '上海', '大连', '厦门', '通辽', '广州', '深圳', '成都', '重庆', '西安', '长沙', '杭州', '哈尔滨', '三亚', '昆明', '武汉',
    '青岛', '乌鲁木齐', '北京南苑',
];

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

/**
 * 获取机场和城市的信息
 * @returns {Promise<void>}
 */
async function getCityAndAirportInfo() {
    let data = fs.readFileSync('./airport.json');
    const jsonObj = JSON.parse(data);

    // //首先获取城市码
    // let res = await axios.get("http://apicloud.mob.com/flight/city/query?key=27f0ed6273924");
    await asyncForEach(jsonObj.result, async (value) => {
        if (targetCities.indexOf(value.cityName) < 0)
            return;
        // await new City(value).save();
        let city = await City.findOne({
            where: {
                code: value.cityCode,
            }
        });
        let airport = await Airport.findOne({
            where: {
                threeCode: value.threeCode
            }
        });
        if (!!city) {     //城市已经在数据库了
            if (!airport)
                airport = await Airport.create({
                    name: value.airPortName,
                    threeCode: value.threeCode,
                    City: city,
                });
            airport.cityId = city.id;
            await airport.save();
        } else {
            let city = await City.create({
                name: value.cityName,
                code: value.cityCode,
                spell: pinyin.getFullChars(value.cityName),
            });
            if (!airport)
                airport = await Airport.create({
                    name: value.airPortName,
                    threeCode: value.threeCode,
                });
            airport.cityId = city.id;
            await airport.save();
        }
    });
}

/**
 * 获取航班信息
 * @returns {Promise<void>}
 */
async function getFlightsInfo() {
    const dir = './flights';
    let files = fs.readdirSync(dir);
    await asyncForEach(files, async value => {    //同步处理每一个json文件
        let data = fs.readFileSync(`${dir}/${value}`);
        let jsonObj = JSON.parse(data);
        await asyncForEach(jsonObj.result, async (value, index) => {      //处理每一个对象
            let flight = await Flight.create({
                distance: '',
                punctuality: value.flightRate,
                duration: value.flightTime,
                departTime: value.planTime,
                arrivalTime: value.planArriveTime,
                fromTerminal: value.fromTerminal,
                toTerminal: value.toTerminal,
            });

            //先查看是否存在航空公司数据
            let airline = await Airline.findOne({
                where: {
                    name: value.airLines,
                }
            });
            if (!airline) {   //没有则先创建一个
                airline = await Airline.create({
                    name: value.airLines,
                });
            }
            flight.setAirline(airline);


            //关联飞机
            let aircraft = await Aircraft.findOne({
                where: {
                    flightNumber: value.flightNo,
                }
            });
            if(!aircraft){
                aircraft = await Aircraft.create({
                    flightNumber: value.flightNo,
                });
            }
            flight.setAircraft(aircraft);

            // 关联始发机场
            let departAirport = await Airport.findOne({
                where: {
                    threeCode: value.fromAirportCode,
                },
            });
            if(!!departAirport) {
                flight.departAirportId = departAirport.id;
            } else {
                console.log('not found: ' + value.fromAirportCode);
            }

            //关联到达机场
            let arrivalAirport = await Airport.findOne({
                where: {
                    threeCode: value.toAirportCode,
                }
            });

            if(!!arrivalAirport)
               flight.arrivalAirportId = arrivalAirport.id;

            await flight.save();
        });
    })
    // await asyncForEach(targetCities, async (v1, idx1, arr) => {
    //     await asyncForEach(targetCities, async (v2, idx2, arr) => {
    //         if (idx1 === idx2)
    //             return;
    //
    //         //先得到v1 ~ v2 的所有航班信息
    //         console.log(`http://apicloud.mob.com/flight/line/query?key=27f0ed6273924&start=${v1}&end=${v2}`);
    //         try {
    //             let res = await axios.get(`http://apicloud.mob.com/flight/line/query?key=27f0ed6273924&start=${v1}&end=${v2}`);
    //             if (res.retCode === "200") {
    //                 await asyncForEach(res.result, (value, index) => {
    //                     Flight.create({
    //                         distance: '',
    //                         punctuality: value.flightRate,
    //                         duration: value.flightTime,
    //                         departTime: value.planTime,
    //                         arrivalTime: value.planArriveTime,
    //                         fromTerminal: value.fromTerminal,
    //                         toTerminal: value.toTerminal,
    //                     });
    //                 });
    //             } else {
    //                 console.log('err: ' + res.msg);
    //             }
    //         } catch (e) {
    //             console.log(e);
    //         }
    //
    //     });
    // })
}

const doInitData = async () => {
    await getCityAndAirportInfo();
    await getFlightsInfo();
    // 执行完成后退出
    process.exit(0);
};

doInitData();


// axios.get("http://apicloud.mob.com/flight/line/query?key=27f0ed6273924&start=上海&end=海口");