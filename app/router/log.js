'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const serialize = middleware.serialize();

  router.post('/log/get_operation_list', serialize, controller.log.getList);
};
