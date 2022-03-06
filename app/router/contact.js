'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const serialize = middleware.serialize();

  router.post('/contact/get_contact_list', serialize, controller.contact.getContactList);
  router.post('/contact/get_contact_info', serialize, controller.contact.getContactInfo);
  router.post('/contact/create_contact_info', serialize, controller.contact.createContactInfo);
  router.post('/contact/update_contact_info', serialize, controller.contact.updateContactInfo);
  router.post('/contact/delete_contact_info', serialize, controller.contact.deleteContactInfo);

  router.post('/contact/get_contact_select_list', serialize, controller.contact.contactSelectList);

};
