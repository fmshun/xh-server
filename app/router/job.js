'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const serialize = middleware.serialize();

  router.post('/job/get_job_list', serialize, controller.job.getJobList);
  // 微信端获取任务信息
  router.post('/job/get_jobs', serialize, controller.job.getJobs);

  router.post('/job/get_job_info', serialize, controller.job.getJobInfo);
  router.post('/job/create_part_time_job_info', serialize, controller.job.createPartTimeJob);
  router.post('/job/create_job_info', serialize, controller.job.createPartTimeJob);
  router.post('/job/update_job_info', serialize, controller.job.updateJobInfo);
  router.post('/job/apply_job', serialize, controller.job.applyJob);
  router.post('/job/cancel_job', serialize, controller.job.cancelApplyJob);
  router.post('/job/force_cancel_job', serialize, controller.job.forceCancelJob);

  // 获取报名历史
  router.post('/job/get_apply_history', serialize, controller.job.getApplyHistory);
  router.post('/job/get_job_apply_list', serialize, controller.job.getJobApplyList);

  // 删除任务
  router.post('/job/delete_job_info', serialize, controller.job.deleteJobInfo);

  router.post('/job/start_job', serialize, controller.job.startJobInfo);
  router.post('/job/finish_job', serialize, controller.job.finishJob);
};
