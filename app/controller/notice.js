'use strict';

const Controller = require('egg').Controller;
const __ = require('../lib/index');

class NoticeController extends Controller {
  async createNotice() {
    const { ctx, service } = this;
    const p = ctx.request.body;
    const v = new __.Validator({});
    const r = await service.notice.createNotice();
    return r;
  }
}

module.exports = NoticeController;

