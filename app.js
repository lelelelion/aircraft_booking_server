const Koa = require('koa');
const controller = require('./controllers');
const combineMiddleWare = require('./middleware');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const jwtKoa = require('koa-jwt');

const app = new Koa();

combineMiddleWare(app, __dirname);

const secret = 'aircraft_booking_server_jwt_secret';
app.use(bodyParser());
app.use(cors());
app.use(jwtKoa({
    secret
}).unless({
    path: [/^\/register/, /^\/login/, /^\/updateToken/, /^\/getCities/],
}));

app.use(controller());

app.listen(9797);
console.log('app started at port 9797');