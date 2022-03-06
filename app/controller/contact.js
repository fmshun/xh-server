'use strict';

const Controller = require('egg').Controller;
const __ = require('../lib/index');

class ContactController extends Controller {
  async getContactList() {
    const { ctx, service } = this;
    const param = ctx.request.body;
    const r = await service.contact.getContactList(param);
    return r;
  }

  async getContactInfo() {

  }

  async createContactInfo() {
    const { ctx, service } = this;
    const contactInfo = ctx.request.body;
    const r = await service.contact.createContactInfo(Object.assign({}, contactInfo, {
      contact_status: 1,
      create_time: __.getDateTime(),
    }));
    return r;
  }

  async updateContactInfo() {
    const { ctx, service } = this;
    const { contact_id, ...contactInfo } = ctx.request.body;
    const r = await service.contact.updateContactInfo(contact_id, contactInfo);
    return r;
  }

  async deleteContactInfo() {
    const { ctx, service } = this;
    const { contact_id } = ctx.request.body;
    const r = await service.contact.updateContactInfo(contact_id, { contact_status: 0 });
    return r;
  }

  async contactSelectList() {
    const { service } = this;
    const r = await service.contact.getContactList({ contact_status: 1 });
    return r;
  }
}


module.exports = ContactController;
