'use strict';

const Controller = require('egg').Controller;
const { error, Validator, getDateTime, WXBizDataCrypt, timeout } = require('../lib/index');
const wechatParam = require('../config.json');

class WechatController extends Controller {
  async validateUser() {
    const { ctx, service } = this;
    const { we_code } = ctx.request.body;
    if (!we_code) {
      if (ctx.session && ctx.session.user_id) {
        return {};
      }
      ctx.throw(302, '未找到用户');
    }
    const { wechat: { appid, secret } } = wechatParam;
    const u = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${we_code}&grant_type=authorization_code`
    const re = await ctx.curl(u, {
      method: 'GET',
      dataType: 'json',
    });
    if (re.data.errcode) {
      throw error(re.data.errcode);
    }
    const { openid, session_key } = re.data;
    console.log(openid, session_key, 123123);
    const user = await service.wechat.validateUser(openid);
    if (user) {
      ctx.session = { open_id: user.open_id, session_key, user_id: user.id, user_level: user.user_level };
    }
    return {};
  }

  async updateUser() {
    const { ctx, service } = this;
    // todo: 需要完善
    const param = ctx.request.body;
    const v = new Validator({
      open_id: [ 'required', 'string' ],
      user_name: [ 'required', 'string' ],
      name: 'string',
      gender: 'string',
      id_card: 'string',
      phone_number: 'string',
    });
    const p = v.validate(param);
    const r = await service.wechat.updateUser(Object.assign({}, p, {
      update_time: getDateTime(),
    }));
    return r;
  }


  async getUserPhone() {
    const { ctx, service } = this;
    const p = ctx.request.body;
    const { open_id, session_key } = ctx.session;
    const v = new Validator({
      // cloudID: [ 'string', 'required' ],
      encrypted_data: [ 'string', 'required' ],
      iv: [ 'string', 'required' ],
    });
    const { encrypted_data, iv } = v.validate(p);
    const { wechat: { appid } } = wechatParam;
    const pc = new WXBizDataCrypt(appid, session_key);
    const d = pc.decryptData(encrypted_data, iv);
    await service.wechat.updateUser({
      open_id,
      phone_number: d.purePhoneNumber,
      update_time: getDateTime(),
    });
    return { phone_number: d.purePhoneNumber };
  }

  /**
   * 获取个人预览信息
   * @returns {Promise<*>}
   */
  async getOverview() {
    const { ctx, service } = this;
    const { user_id } = ctx.session;
    const r = await service.wechat.getOverview(user_id);
    return r;
  }

  async getIndexData() {
    const { ctx, service } = this;
    const r = await service.wechat.getIndexData();
  }
}

module.exports = WechatController;
