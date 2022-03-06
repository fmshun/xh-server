'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const serialize = middleware.serialize();

  router.post('/user/login', serialize, controller.user.login);
  router.post('/user/validate_login', serialize, controller.user.validateLogin);

  router.post('/user/get_user_list', serialize, controller.user.getUserList);
  router.post('/user/update_user_info', serialize, controller.user.updateUserInfo);
  router.post('/user/get_user_info', serialize, controller.user.getUserInfo);
  router.post('/user/register_user', serialize, controller.user.createUser);

  router.post('/user/insert_session', serialize, controller.user.insertSession);
};

