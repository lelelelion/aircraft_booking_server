const fs = require('fs');
const path = require('path');
const db = require('./db');


let files = fs.readdirSync(path.join(__dirname, 'models'));

let js_files = files.filter(f => {
    return f.endsWith('.js');
});


module.exports = {};


for (let f of js_files) {
    console.log(`import model from file ${f}...`);
    let name = f.substring(0, f.length - 3);
    module.exports[name] = require(path.join(__dirname, 'models', f));
}


////////////////////////////////////////////////////////
//////// 下面建立表之间的关联
////////////////////////////////////////////////////////

const {
    Airport,
    City,
    CommonContact,
    Airline,
    Aircraft,
    Flight,
    User,
    PassengerContact,
    Order,
} = module.exports;

const CASCADE = "CASCADE";

City.hasMany(Airport, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'cityId'
});

Airport.hasMany(CommonContact, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'ownerId',
});

/**
 * Airline
 */
Airline.hasMany(CommonContact, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'ownerId',
});
Airline.hasMany(Aircraft, {
    constraints: true,
    onDelete: CASCADE,
    foreignKey: 'companyId',
});


/**
 * Flight
 */
Flight.belongsTo(Airline, {
    foreignKey: "companyId",
});
Flight.belongsTo(Aircraft, {
    foreignKey: "aircraftId",
});
Flight.belongsTo(Airport, {
    foreignKey: "departAirportId",
});
Flight.belongsTo(Airport, {
   foreignKey: "arrivalAirportId",
});


/**
 * Order
 */
Order.belongsTo(User, {
    foreignKey: "uid",
    onDelete: CASCADE
});
Order.belongsTo(Flight, {
    foreignKey: "flightId",
    onDelete: CASCADE,
});
Order.belongsToMany(PassengerContact, {
    onDelete: CASCADE,
    through: "Order_Passenger",
    foreignKey: "orderId",
    otherKey: "passengerContactId"
});


/**
 * Passenger Contact
 */
PassengerContact.belongsTo(User, {
    onDelete: CASCADE,
    foreignKey: "uid",
});


module.exports.sync = (then) => {
    db.sync(then);
};