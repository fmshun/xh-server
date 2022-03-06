'use strict';

const Service = require('egg').Service;
const __ = require('../lib/index');
const { settlementTypes, genderLimits } = require('../enum');

// todo: 枚举值需要从接口中取
class JobService extends Service {
  /**
   * 获取工作信息
   * @returns {Promise<(number|*|string)[]>}
   */
  async getJobList({ page, page_size }) {
    const query = { job_status: [ 1, 2, 3, 4 ] };
    // todo: job_status需要变为
    let jobList = await this.app.mysql.select('job_list', {
      where: query,
      limit: page_size,
      offset: (page - 1) * page_size,
      orders: [[ 'create_time', 'desc' ]],
    });
    if (!jobList) jobList = [];
    for (const job of jobList) {
      job.create_time = __.getDateTime(job.create_time);
      job.update_time = __.getDateTime(job.update_time);
      job.applyList = await this.getJobApplyList(job.job_id);
      job.settlement_type_title = settlementTypes[job.settlement_type];
      job.gender_limit_title = genderLimits[job.gender_limit];
    }
    const total = await this.app.mysql.count('job_list', query);
    return { total, jobList };
  }

  /**
   * 获取已发布状态的工作信息
   * @returns {Promise<(number|*|string)[]>}
   */
  async getJobs({ page, page_size }) {
    const query = { job_status: [ 1, 2 ] };
    // todo: job_status需要变为
    let jobList = await this.app.mysql.select('job_list', {
      where: query,
      limit: page_size,
      offset: (page - 1) * page_size,
      orders: [[ 'create_time', 'desc' ]],
    });
    if (!jobList) jobList = [];
    for (const job of jobList) {
      job.create_time = __.getDateTime(job.create_time);
      job.update_time = __.getDateTime(job.update_time);
      job.applyList = await this.getJobApplyList(job.job_id);
      job.settlement_type_title = settlementTypes[job.settlement_type];
      job.gender_limit_title = genderLimits[job.gender_limit];
    }
    const total = await this.app.mysql.count('job_list', query);
    return { total, jobList };
  }

  /**
   * 创建工作信息
   * @returns {Promise<string[]>}
   */
  async createJobInfo(jobInfo) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      await conn.insert('job_list', jobInfo);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
    return {};
  }

  /**
   * 修改工作信息
   * @returns {Promise<void>}
   */
  async updateJobInfo(job_id, jobInfo) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      await conn.update('job_list', jobInfo, { where: { job_id } });
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
    return {};
  }

  async getJobInfo(job_id, user_id) {
    // const job = await this.app.mysql.get('job_list', { job_id });
    const sql = 'select a.job_id, a.title, a.job_price, a.price_unit, a.settlement_type, a.gender_limit, a.job_status, a.limit_num, a.description, a.notice, b.contact_name, b.contact_phone_number, b.contact_wechat_code  from job_list a left join contact_info b on a.contact_id = b.contact_id where a.job_id = ?'
    let job = await this.app.mysql.query(sql, [ job_id ]);
    if (job && job.length) job = job[0];
    if (job) {
      job.settlement_type_title = settlementTypes[job.settlement_type];
      job.gender_limit_title = genderLimits[job.gender_limit];
      const q = { job_id, apply_status: 1 };
      const applyList = await this.app.mysql.select('apply_list', { where: q });
      job.apply_num = applyList ? applyList.length : 0;
      if (applyList && applyList.find(v => v.user_id === user_id)) {
        job.is_apply = true;
        return job;
      }
      job.is_apply = false;
    }
    return job;
  }

  async getJobApplyList(job_id) {
    const query = { job_id, apply_status: 1 };
    let applyList = await this.app.mysql.select('apply_list', { where: query });
    if (!applyList) applyList = [];
    for (const v of applyList) {
      v.create_time = __.getDateTime(v.create_time);
      v.update_time = __.getDateTime(v.update_time);
      const u = await this.app.mysql.get('user_list', { id: v.user_id });
      v.name = u ? u.name : '';
      v.phone_number = u ? u.phone_number : '';
      v.prestige = u ? u.prestige : 0;
    }
    return applyList;
  }

  /**
   * 报名工作
   * @param applyInfo
   * @returns {Promise<string[]|[string, {}, undefined]>}
   */
  async applyJob(applyInfo) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      const { job_id, create_time, user_id } = applyInfo;
      // const job = await this.getJobInfo(job_id);
      const user = await conn.get('user_list', { id: user_id });
      // && user.level === 1
      if (!(user && user.name && user.id_card && user.phone_number)) {
        throw __.error('个人信息需要完善后才可以报名');
      }
      const job = await conn.get('job_list', { job_id });
      if (!job) {
        throw __.error('未找到工作信息');
      }
      if (job.job_status === 2) {
        throw __.error('工作已经招满');
      }
      // const applyList = await this.getJobApplyList(job_id);
      const applyList = await conn.select('apply_list', { where: { job_id, apply_status: 1 } });
      await conn.insert('apply_list', applyInfo);
      await conn.insert('operation_log', __.formatLog({ user_id, operation: `报名${job.title}` }));
      if (applyList.length >= job.limit_num - 1) {
        const p = { job_status: 2, update_time: create_time };
        await conn.update('job_list', p, { where: { job_id } });
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
    return {};
  }

  /**
   * 更新报名信息
   * @param applyInfo
   * @returns {Promise<string[]|[string, {}, string]>}
   */
  async updateApply(applyInfo) {
    await this.app.mysql.update('apply_list', applyInfo);
    return {};
  }

  /**
   * 取消报名
   * @param applyInfo
   * @returns {Promise<{}>}
   */
  async cancelApplyJob(applyInfo) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      const { user_id, job_id, update_time, apply_status } = applyInfo;
      await conn.update('apply_list', { apply_status, update_time }, { where: { job_id, user_id, apply_status: 1 } });
      const job = await conn.get('job_list', { job_id });
      await conn.insert('operation_log', __.formatLog({ user_id, operation: `取消报名${job.title}` }));
      if (job.job_status === 2) {
        const p = { job_status: 1, update_time };
        await conn.update('job_list', p, { where: { job_id } });
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
    return {};
  }

  /**
   * 强制取消报名
   * @param applyInfo
   * @returns {Promise<{}>}
   */
  async forceCancelApplyJob(userInfo, applyInfo) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      const u = await conn.get('user_list', { id: userInfo.user_id });
      if (!u || u.user_level < 99) {
        throw __.error('用户权限不足');
      }
      const { job_id, apply_id, update_time, apply_status } = applyInfo;
      const applyData = await conn.get('apply_list', { apply_id, apply_status: 1 });
      if (!applyData) {
        throw __.error('未找到报名信息');
      }
      await conn.update('apply_list', { apply_status, update_time }, { where: { apply_id, apply_status: 1 } });
      const job = await conn.get('job_list', { job_id });
      await conn.insert('operation_log', __.formatLog({
        user_id: applyData.user_id, operation: `取消报名${job.title}`, operator_id: userInfo.user_id,
      }));
      if (job.job_status === 2) {
        const p = { job_status: 1, update_time };
        await conn.update('job_list', p, { where: { job_id } });
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }
    return {};
  }

  /**
   * 开始任务，状态改为3
   * job_status: 1、2 --> 3
   * apply_status: 1 --> 3
   * @param job_id
   * @returns {Promise<void>}
   */
  async startJobInfo(job_id) {
    // job和apply状态改为3
    const conn = await this.app.mysql.beginTransaction();
    try {
      const job = await conn.get('job_list', { job_id });
      if (job.job_status !== 1 && job.job_status !== 2) {
        throw __.error('任务的状态不正确');
      }
      const d = __.getDateTime();
      const sql1 = 'update apply_list set apply_status=3,update_time=? where apply_status=1 and job_id=?;';
      const sql2 = 'update job_list set job_status=3,update_time=? where job_id=?;';
      await conn.query(sql1, [ d, job_id ]);
      await conn.query(sql2, [ d, job_id ]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw __.error(e);
    }
  }


  /**
   * 完成任务
   * job_status: 3 --> 4
   * apply_status: 3 -->4
   * @param job_id
   * @returns {Promise<void>}
   */
  async finishJob(job_id) {
    // job和apply状态改为4
    const conn = await this.app.mysql.beginTransaction();
    try {
      const job = await conn.get('job_list', { job_id });
      if (job && job.job_status !== 3) {
        throw __.error('任务的状态不正确');
      }
      const sql1 = 'update apply_list set apply_status=4,update_time=? where job_id=? and apply_status=3;';
      const sql2 = 'update job_list set job_status=4,update_time=? where job_id=? and job_status=3;';
      const d = __.getDateTime();
      await conn.query(sql1, [ d, job_id ]);
      await conn.query(sql2, [ d, job_id ]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw __.error(e);
    }
  }

  /**
   * 获取用户的兼职信息
   * @param userInfo
   * @returns {Promise<*>}
   */
  async getApplyHistory(userInfo) {
    // @todo: 移除user_id
    const { user_id } = userInfo;
    if (!user_id) {
      throw __.error('未找到用户');
    }
    // const applyList = await conn.select('apply_list', { user_id });
    const sql = 'select a.job_id as id, a.apply_id, b.title, DATE_FORMAT(a.create_time, \'%Y-%m-%d %H:%i:%s\') as create_time from apply_list a left join job_list b on a.job_id = b.job_id where a.user_id = ? and a.apply_status in (1, 3, 4)';
    const applyHistory = await this.app.mysql.query(sql, [ user_id ]);
    return { applyHistory };
  }

  /**
   * 删除兼职信息
   * @param job_id
   * @returns {Promise<void>}
   */
  async deleteJobInfo(job_id) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      const sql = 'update job_list set job_status=0 where job_id=?';
      const sql2 = 'update apply_list set apply_status=0 where job_id=?';
      await conn.query(sql, [ job_id ]);
      await conn.query(sql2, [ job_id ]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      __.error(e);
    }
  }
}

module.exports = JobService;
