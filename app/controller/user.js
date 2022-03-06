'use strict';

const Controller = require('egg').Controller;
const __ = require('../lib/index');

class UserController extends Controller {

  async insertSession() {
    this.session = {};
    return {};
  }

  /**
   * 用户登陆
   * @returns {Promise<*>}
   */
  async login() {
    const { ctx, service } = this;
    const p = ctx.request.body;
    const v = new __.Validator({
      user_name: [ 'required', 'string' ],
      password: [ 'required', 'string' ],
    });
    const param = v.validate(p);
    if (ctx.session.user_id || ctx.session.open_id) {
      return {};
    }
    const user = await service.user.login(param);
    ctx.session = { open_id: user.open_id, user_id: user.id, user_level: user.user_level };
    return {};
  }


  async validateLogin() {
    const { ctx } = this;
    if (ctx.session && ctx.session.user_id) {
      return {};
    }
    throw __.error('未登录');
  }

  /**
   * 获取user列表
   * @returns {Promise<*>}
   */
  async getUserList() {
    const { ctx, service } = this;
    const r = await service.user.getUserList();
    return { userList: r };
  }

  /**
   * 更新user信息
   * @returns {Promise<*>}
   */
  async updateUserInfo() {
    const { ctx, service } = this;
    const p = Object.assign({}, ctx.request.body, {
      update_time: __.getDateTime(),
    });
    const v = new __.Validator({
      id: [ 'required', 'number' ],
    });
    v.validate(p);
    const r = await service.user.updateUserInfo(p);
    return r;
  }

  /**
   * 获取用户信息
   * @returns {Promise<{userInfo: *}>}
   */
  async getUserInfo() {
    const { ctx, service } = this;
    // todo: 展示写死使用id来搜索
    const { user_id } = ctx.session;
    if (!user_id) {
      throw __.error('未找到用户');
    }
    const r = await service.user.getUserInfo(user_id);
    return { userInfo: r };
  }

  async createUser() {
    const { ctx, service } = this;
    const p = ctx.request.body;
    const v = new __.Validator({
      user_name: [ 'required', 'string' ],
      password: [ 'string' ],
    });
    v.validate(p);
    const r = await service.user.createUser(Object.assign({}, p, {
      create_time: __.getDateTime(),
    }));
    return r;
  }
}

module.exports = UserController;
