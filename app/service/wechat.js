'use strict';

const Service = require('egg').Service;
const __ = require('../lib/index');

class WechatService extends Service {
  async validateUser(open_id) {
    const u = await this.app.mysql.get('user_list', { open_id });
    if (u) {
      return u;
    }
    const p = {
      open_id,
      create_time: __.getDateTime(),
    };
    await this.app.mysql.insert('user_list', p);
    console.log('insert user!!!');
    return {};
  }

  async updateUser(param) {
    const { open_id, ...user_info } = param;
    // const conn = await this.app.mysql.beginTransaction();
    const u = await this.app.mysql.get('user_list', { open_id });
    if (!u) {
      throw __.error('用户不存在');
    }
    await this.app.mysql.update('user_list', user_info, { where: { open_id } });
    return {};
  }

  /**
   * 获取个人预览信息
   * @param user_id
   * @returns {Promise<*>}
   */
  async getOverview(user_id) {
    try {
      const sql = 'select a.*, COUNT(b.apply_id) as applyNum from user_list a left join apply_list b on a.id = b.user_id and b.apply_status in (1, 3, 4) where a.id = ?';
      let r = await this.app.mysql.query(sql, [ user_id ]);
      if (r && r.length) {
        r = r[0];
      }
      return r;
    } catch (e) {
      throw __.error(e);
    }
  }

  async getIndexData() {
    try {
      const sql = '';
      const r = await this.app.mysql.query(sql);
      return r;
    } catch (e) {
      throw __.error(e);
    }
  }
}

module.exports = WechatService;
