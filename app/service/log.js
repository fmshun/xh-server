'use strict';

const Service = require('egg').Service;
const __ = require('../lib/index');

class LogService extends Service {
  async getList(userInfo) {
    // @todo: 移除user_id
    const { user_id = 1 } = userInfo;
    const sql = 'select id, operation, DATE_FORMAT(create_time, \'%Y-%m-%d %H:%i:%s\') as create_time from operation_log where user_id = ?'
    const logList = await this.app.mysql.query(sql, [ user_id ]);
    return logList;
  }
}

module.exports = LogService;
