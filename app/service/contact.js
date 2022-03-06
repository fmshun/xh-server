'use strict';

const Service = require('egg').Service;
const __ = require('../lib/index');

class ContactService extends Service {
  /**
   * 获取联系人信息
   * @returns {Promise<{total: *, contactList: *}>}
   */
  async getContactList(param = {}) {
    const query = Object.assign({}, param);
    const contactList = await this.app.mysql.select('contact_info', {
      where: query,
      orders: [[ 'create_time', 'desc' ]],
    });
    const total = await this.app.mysql.count('contact_info', query);
    return { total, contactList };
  }

    async getContactInfo() {

    }

  /**
   * 创建联系人信息
   * @param info
   * @returns {Promise<{}>}
   */
  async createContactInfo(info) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      await conn.insert('contact_info', info);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw __.error(e);
    }
    return {};
  }

  /**
   * 更新联系人信息
   * @param contact_id
   * @param contact_info
   * @returns {Promise<{}>}
   */
  async updateContactInfo(contact_id, contact_info) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      await conn.update('contact_info', contact_info, { where: { contact_id } });
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw __.error(e);
    }
    return {};
  }
}

module.exports = ContactService;
