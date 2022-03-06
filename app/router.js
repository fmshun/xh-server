'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  require('./router/job')(app);
  require('./router/user')(app);
  require('./router/wechat')(app);
  require('./router/contact')(app);
  require('./router/log')(app);
};
