const Koa = require('koa');
const controller = require('./controllers');
const combineMiddleWare = require('./middleware');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

combineMiddleWare(app, __dirname);

app.use(bodyParser());
app.use(cors());
app.use(controller());

app.listen(9797);
console.log('app started at port 9797');