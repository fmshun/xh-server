'use strict';

const Controller = require('egg').Controller;
const __ = require('../lib/index');

class JobController extends Controller {
  async getJobList() {
    const { ctx, service } = this;
    const param = ctx.request.body;
    const v = new __.Validator({
      page: [ 'required', 'number' ],
      page_size: [ 'required', 'number' ],
    });
    v.validate(param);
    const r = await service.job.getJobList(param);
    return r;
  }

  async getJobs() {
    const { ctx, service } = this;
    const param = ctx.request.body;
    const v = new __.Validator({
      page: [ 'required', 'number' ],
      page_size: [ 'required', 'number' ],
    });
    v.validate(param);
    const r = await service.job.getJobs(param);
    return r;
  }

  async getJobInfo() {
    const { ctx, service } = this;
    if (!ctx.request.body.id) {
      throw __.error('id为必传字段');
    }
    const { user_id } = ctx.session;
    const r = await service.job.getJobInfo(ctx.request.body.id, user_id);
    return { job: r };
  }

  /**
   * 创建兼职任务
   * @returns {Promise<*>}
   */
  async createPartTimeJob() {
    const { ctx, service } = this;
    // todo: jod_type 最好从字典接口中取
    const r = await service.job.createJobInfo(Object.assign({}, ctx.request.body, {
      job_type: 1,
      job_status: 1,
      create_time: __.getDateTime(),
    }));
    return r;
  }

  /**
   * 创建工作任务
   * @returns {Promise<*>}
   */
  async createJobInfo() {
    const { ctx, service } = this;
    // todo: 可能需要修改
    const r = await service.job.createJobInfo(ctx.request.body.id, {
      job_status: 1,
      publish_time: __.getDateTime(),
    });
    return r;
  }

  /**
   * 开始进行工作
   * @returns {Promise<*>}
   */
  async startJobInfo() {
    const { ctx, service } = this;
    // const r = await service.job.updateJobInfo(Object.assign({}, ctx.request.body, {
    //   update_time: __.getDateTime(),
    //   job_status: 3,
    // }));
    const { job_id } = ctx.request.body;
    if (!job_id) {
      throw __.error('job_id is required');
    }
    const r = await service.job.startJobInfo(job_id);
    return r;
  }

  /**
   * 完成工作
   * @returns {Promise<*>}
   */
  async finishJob() {
    const { ctx, service } = this;
    const { job_id } = ctx.request.body;
    if (!job_id) {
      throw __.error('job_id is required');
    }
    const r = await service.job.finishJob(job_id);
    return r;
  }

  /**
   * 编辑工作信息
   * @returns {Promise<*>}
   */
  async updateJobInfo() {
    const { ctx, service } = this;
    const { job_id, ...param } = ctx.request.body;
    const r = await service.job.updateJobInfo(job_id, Object.assign({}, param, {
      update_time: __.getDateTime(),
    }));
    return r;
  }

  /**
   * 报名工作
   * @returns {Promise<*>}
   */
  async applyJob() {
    const { ctx, service } = this;
    const { user_id } = ctx.session;
    const r = await service.job.applyJob(Object.assign({}, ctx.request.body, {
      user_id,
      apply_status: 1,
      create_time: __.getDateTime(),
    }));
    return r;
  }

  /**
   * 取消报名
   * @returns {Promise<*>}
   */
  async cancelApplyJob() {
    const { ctx, service } = this;
    const data = ctx.request.body;
    if (data && !data.user_id) {
      data.user_id = ctx.session.user_id;
    }
    const r = await service.job.cancelApplyJob(Object.assign({}, data, {
      apply_status: 2,
      update_time: __.getDateTime(),
    }));
    return r;
  }

  /**
   * 强制取消报名
   * @returns {Promise<{}>}
   */
  async forceCancelJob() {
    const { ctx, service } = this;
    // todo: 需要从session取用户信息
    const userInfo = ctx.session || { user_id: 1 };
    const r = await service.job.forceCancelApplyJob(userInfo, Object.assign({}, ctx.request.body, {
      apply_status: 2,
      update_time: __.getDateTime(),
    }));
    return r;
  }

  /**
   * 获取报名信息
   * @returns {Promise<*>}
   */
  async getApplyHistory() {
    const { ctx, service } = this;
    const userInfo = ctx.session;
    const r = await service.job.getApplyHistory(userInfo);
    return r;
  }

  async getJobApplyList() {
    const { ctx, service } = this;
    const { job_id } = ctx.request.body;
    // const userInfo = ctx.session;
    const r = await service.job.getJobApplyList(job_id);
    return { applyList: r };
  }

  async deleteJobInfo() {
    const { ctx, service } = this;
    const { job_id } = ctx.request.body;
    const r = await service.job.deleteJobInfo(job_id);
    return {};
  }
}

module.exports = JobController;
