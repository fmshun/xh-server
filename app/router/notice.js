'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const serialize = middleware.serialize();

  router.post('/notice/create_notice', serialize, controller.notice.createNotice);
};
