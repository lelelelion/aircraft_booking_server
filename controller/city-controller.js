const {
    City
} = require('../model');

const getCities = async ctx => {
    let result = await City.findAll();
    ctx.easyResponse.success(result);
};

module.exports = {
    'GET /getCities': getCities
};