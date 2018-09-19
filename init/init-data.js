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

/**
 * 初始化城市和机场信息
 * 27f0ed6273924
 */
fs.readFile('./airport.json', async function (err, data) {
    if (err)
        console.log(err);
    else {
        const jsonObj = JSON.parse(data);

        //插入国内城市信息
        jsonObj.result.forEach( async (value, index, arr) => {
            // await new City(value).save();
            let city = await City.findOne({
                where: {
                    code: value.cityCode,
                }
            });
            if(!!city){     //城市已经在数据库了
                let airport = await Airport.create({
                    name: value.airPortName,
                    threeCode: value.threeCode,
                    City: city,
                });
                city.setAirports([airport]);
            } else {
                let city = await City.create({
                    name: value.cityName,
                    code: value.cityCode,
                    spell: pinyin.getFullChars(value.cityName),
                });
                let airport = await Airport.create({
                    name: value.airPortName,
                    threeCode: value.threeCode,
                });
                city.setAirports([airport]);
                // airport.setCitys(city);
                // // await airport.save();
            }
        });
    }
});


const airlineBsePrices = {
    '中国国航': {
        basePrice: 1,
        contacts: [
            {
                ownerType: 'airline',
                type: '电话',
                value: '0086-10-95583'
            },
            {
                ownerType: 'airline',
                type: '传真',
                value: '0086-10-95583-1-0'
            },
        ]
    },
    '南方航空': {
        basePrice: 1,
        contacts: []
    },
    '厦门航空': {
        basePrice: 1,
        contacts: []
    },
    '海南航空': {
        basePrice: 1,
        contacts: []
    },
    '山东航空': {
        basePrice: 1,
        contacts: []
    },
    '天津航空': {
        basePrice: 1,
        contacts: []
    },
    '祥鹏航空': {
        basePrice: 1,
        contacts: []
    },
    '深圳航空': {
        basePrice: 1,
        contacts: []
    },
    '首都航空': {
        basePrice: 1,
        contacts: []
    },
    '华夏航空': {
        basePrice: 1,
        contacts: []
    },
    '东方航空': {
        basePrice: 1,
        contacts: []
    },
    '四川航空': {
        basePrice: 1,
        contacts: []
    },
    '瑞丽航空': {
        basePrice: 1,
        contacts: []
    },
    '吉祥航空': {
        basePrice: 1,
        contacts: []
    },
    '成都航空': {
        basePrice: 1,
        contacts: []
    },
    '春秋航空': {
        basePrice: 1,
        contacts: []
    },
    '奥凯航空': {
        basePrice: 1,
        contacts: []
    },
    '新西兰航空': {
        basePrice: 1,
        contacts: []
    },
    '西藏航空': {
        basePrice: 1,
        contacts: []
    },
    '联合航空': {
        basePrice: 1,
        contacts: []
    },
    '重庆航空': {
        basePrice: 1,
        contacts: []
    },
    '全日空航空': {
        basePrice: 1,
        contacts: []
    },
    '昆明航空': {
        basePrice: 1,
        contacts: []
    },
    '河北航空': {
        basePrice: 1,
        contacts: []
    },
    '福州航空': {
        basePrice: 1,
        contacts: []
    },
    '大新华航空': {
        basePrice: 1,
        contacts: []
    },
    '香港航空': {
        basePrice: 1,
        contacts: []
    },
    '长龙航空': {
        basePrice: 1,
        contacts: []
    },
    '上海航空': {
        basePrice: 1,
        contacts: []
    },
    '夏威夷航空': {
        basePrice: 1,
        contacts: []
    },
    '东海航空': {
        basePrice: 1,
        contacts: []
    },
    '澳洲航空': {
        basePrice: 1,
        contacts: []
    },
    '幸福航空': {
        basePrice: 1,
        contacts: []
    },
    '九元航空': {
        basePrice: 1,
        contacts: []
    },
    '红土航空': {
        basePrice: 1,
        contacts: []
    },
    '青岛航空': {
        basePrice: 1,
        contacts: []
    },
    '多彩航空': {
        basePrice: 1,
        contacts: []
    },
    '西部航空': {
        basePrice: 1,
        contacts: []
    },
    '北部湾航空': {
        basePrice: 1,
        contacts: []
    },
    '扬子江航空': {
        basePrice: 1,
        contacts: []
    },
    '英国航空': {
        basePrice: 1,
        contacts: []
    },
    '日本航空': {
        basePrice: 1,
        contacts: []
    },
    '乌鲁木齐航空': {
        basePrice: 1,
        contacts: []
    },
    '酷航': {
        basePrice: 1,
        contacts: []
    },
    '桂林航空': {
        basePrice: 1,
        contacts: []
    },
    '江西航空': {
        basePrice: 1,
        contacts: []
    },
    '长安航空': {
        basePrice: 1,
        contacts: []
    },
    '北欧航空': {
        basePrice: 1,
        contacts: []
    },
};

const airlines = [
    '中国国航',
    '南方航空',
    '厦门航空',
    '海南航空',
    '山东航空',
    '天津航空',
    '祥鹏航空',
    '深圳航空',
    '首都航空',
    '华夏航空',
    '东方航空',
    '四川航空',
    '瑞丽航空',
    '吉祥航空',
    '成都航空',
    '春秋航空',
    '奥凯航空',
    '新西兰航空',
    '西藏航空',
    '联合航空',
    '重庆航空',
    '全日空航空',
    '昆明航空',
    '河北航空',
    '福州航空',
    '大新华航空',
    '香港航空',
    '长龙航空',
    '上海航空',
    '夏威夷航空',
    '东海航空',
    '澳洲航空',
    '幸福航空',
    '九元航空',
    '红土航空',
    '青岛航空',
    '多彩航空',
    '西部航空',
    '北部湾航空',
    '扬子江航空',
    '英国航空',
    '日本航空',
    '乌鲁木齐航空',
    '酷航',
    '桂林航空',
    '江西航空',
    '长安航空',
    '北欧航空',
];

/**
 * 初始化航空公司
 */

function initialAirline() {
    airlines.forEach(value => {
        new Airline({
            name: value
        }).save()
    })
}

initialAirline();


/**
 * 初始化航班信息
 */
fs.readFile('./flight.json', async (err, data) => {
    if (err)
        console.log(err);
    else {
        const jsonObj = JSON.parse(data);
        let companys = new Set();
        jsonObj.forEach((value, index, arr) => {
            
            companys.add(`{airport: '${value.departAirport}',city: '${value.departCity}',}`);
            companys.add(`{airport: '${value.arrivalAirport}',city: '${value.arrivalCity}',}`);
        });

        companys.forEach(value => {
            console.log(value);
        })
    }
});