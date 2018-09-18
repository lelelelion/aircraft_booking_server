
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// 当前中间件的职能是为ctx对象添加一个easyResponse成员，可以便捷的返回Json格式化的信息
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CODE_TABLE = {
    success: 0,
    error: -1,
};

function responseBody() {
    return async (ctx, next) => {
        ctx.easyResponse = {
            success: (data) => {
                ctx.response.type = 'application/json';
                ctx.response.body = JSON.stringify({
                    code: CODE_TABLE.success,
                    data: data,
                    msg: ''
                });
            },
            error: (errmsg) => {
                ctx.response.type = 'application/json';
                ctx.response.body = JSON.stringify({
                    code: CODE_TABLE.error,
                    msg: errmsg
                });
            }
        };
        await next();
    }
}

module.exports = responseBody;