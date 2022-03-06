'use strict';
const __ = require('../lib/index');

function formatResult(code, info = {}, msg) {
  return {
    code,
    info,
    msg: code === '0' ? 'success' : msg,
  };
}

const excludeUrls = [
  '/user/login',
  '/wechat/validate_user',
];

module.exports = () => {
  return async function serialize(ctx, next) {
    const param = ctx.request.body;
    if (__.isObject(param)) {
      ctx.request.body = __.camel2Under(param);
    }
    if (!excludeUrls.includes(ctx.request.url) && (!ctx.session || !ctx.session.open_id || !ctx.session.user_id)) {
      ctx.throw(302, '未找到用户');
    }
    let result = {};
    let code = 0;
    let msg = 'success';
    try {
      result = await Promise.race([ next(), __.timeout(5000) ]);
      code = 0;
    } catch (e) {
      console.error(e);
      if (e.statusCode) {
        ctx.throw(e.statusCode, e.message);
      }
      code = 1;
      msg = e.message;
    }
    ctx.set('Content-Type', 'application/json');
    ctx.body = formatResult(code, __.under2Camel(result), msg);
  };
};
