const {
    CODE_TABLE
} = require('../config/err-code-table');

const errorHandle = (ctx, next) => {
  return next().catch(err => {
      if(err.status === 401){       //令牌无效或过期
          ctx.status = 401;
          ctx.easyResponse.error(err.originalError ? err.originalError.message : err.message, CODE_TABLE.jwt_expired)
      } else {
          throw err;
      }
  })
};

module.exports = errorHandle;