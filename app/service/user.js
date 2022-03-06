'use strict';

const Service = require('egg').Service;
const __ = require('../lib/index');

class UserService extends Service {

  async login(param) {
    const { user_name, password } = param;
    const user = await this.app.mysql.get('user_list', { user_name });
    if (user && user.password === password) {
      return user;
    }
    throw __.error('用户名或密码不正确!');
  }


  /**
   * 获取user列表
   * @returns {Promise<(string|*)[]>}
   */
  async getUserList() {
    let userList = await this.app.mysql.get('user_list');
    if (!userList) {
      userList = [];
    }
    return userList;
  }

  /**
   * 获取用户信息
   * @param id
   * @returns {Promise<[string, {}, string]|(string|*)[]>}
  */
  async getUserInfo(id) {
    const user = await this.app.mysql.get('user_list', { id });
    if (!user) {
      throw __.error('未找到该用户');
    }
    return user;
  }

  /**
   * 更新user信息
   * @param userInfo
   * @returns {Promise<void>}
   */
  async updateUserInfo(userInfo) {
    const { id, ...info } = userInfo;
    const conn = await this.app.mysql.beginTransaction();
    try {
      await conn.update('user_list', info, { where: { id } });
      await conn.commit();
    } catch (e) {
      console.error(e);
      await conn.rollback();
      throw __.error(e);
    }
    return {};
  }


  async createUser(userInfo) {
    const { user_name } = userInfo;
    const conn = await this.app.mysql.beginTransaction();
    try {
      const u = await conn.get('user_list', { user_name });
      if (u) {
        throw __.error('用户名已存在');
      }
      await conn.insert('user_list', userInfo);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw __.error(e);
    }
    return {};
  }
}

module.exports = UserService;
