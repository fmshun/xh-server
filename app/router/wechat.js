'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const serialize = middleware.serialize();

  router.post('/wechat/validate_user', serialize, controller.wechat.validateUser);

  router.post('/wechat/update_user', serialize, controller.wechat.updateUser);

  router.post('/wechat/get_user_phone', serialize, controller.wechat.getUserPhone);

  router.post('/wechat/get_overview', serialize, controller.wechat.getOverview);

  router.post('/wechat/get_index_data', serialize, controller.wechat.getIndexData);
};
