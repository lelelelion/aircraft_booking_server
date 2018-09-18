const responseBody = require('./response-body');

function combineMiddleWare(app, dirname) {
    app.use(responseBody());
}


module.exports = combineMiddleWare;
