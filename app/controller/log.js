'use strict';

const Controller = require('egg').Controller;
const __ = require('../lib/index');

class LogController extends Controller {

  async getList() {
    const { ctx, service } = this;
    const userInfo = ctx.session;
    const r = await service.log.getList(userInfo);
    return r;
  }
}

module.exports = LogController;
