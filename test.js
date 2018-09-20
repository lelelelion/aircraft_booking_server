const axios = require('axios');

const BASE_URL = 'http://localhost:9797';

const testUser = {
    username: 'qjm253',
    password: '123456',
};

const testTicketId = '';

function checkStateCode(res){
    if(res.data.code !== 0){
        console.log('---------------------------------');
        console.log(res.data.msg);
        console.log('---------------------------------');
        process.exit(0);
    }
}
async function test() {
    let res;
    // 测试注册
    res = await axios.post(`${BASE_URL}/register`, testUser);
    checkStateCode(res);

    //测试登陆
    res = await axios.post(`${BASE_URL}/login`, testUser);
    checkStateCode(res);

    let token = res.data.data.token;
    console.log(token);
    axios.defaults.headers.common['Authorization'] = token;
    // axios.defaults.headers.get['authorization'] = token;


    //测试添加乘机人信息
    let passengerContactIds = [];
    res = await axios.post(`${BASE_URL}/addPassengerContact`, {
        "name": "洋溢",
        "certificateType": "身份证",
        "certificateValue": "1234566454245254"
    }, {
        headers: {
            'Authorization': token,
        }
    });
    console.log(res);
    checkStateCode(res);
    passengerContactIds.push(res.data.id);
    res = await axios.post(`${BASE_URL}/addPassengerContact`, {
        "name": "洋溢2",
        "certificateType": "身份证",
        "certificateValue": "1234566454245254"
    });
    checkStateCode(res);
    passengerContactIds.push(res.data.id);


    //测试下订单
    res = await axios.post(`${BASE_URL}/generateOrder`, {
        "ticketId": testTicketId,
        "contactName": "洋溢",
        "phone": "18340857280",
        "email": "123@gmail.com",
        "passengers": passengerContactIds,
    });
    checkStateCode(res);

    process.exit(0);
}

test();