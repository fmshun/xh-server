/* eslint valid-jsdoc: "off" */

'use strict';

const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // todo: 需要删除跨域
  // config.cors = {
  //   origin: '*',
  //   allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  // };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1625036878408_3677';

  // add your middleware config here
  config.middleware = [];

  config.cluster = {
    https: {
      key: path.join(__dirname, '../cert/www.xinhuochian.com.key'),
      cert: path.join(__dirname, '../cert/www.xinhuochian.com.crt'),
    },
  };

  config.mysql = {
    client: {
      host: 'sh-cdb-isyp1nvy.sql.tencentcdb.com',
      port: '59589',
      user: 'root',
      password: 'Wd6591386',
      database: 'xinhuo',
    },
    app: true,
    agent: false,
  };

  config.session = {
    key: 'XH_SESSION',
    maxAge: 3600 * 1000, // 1h
    httpOnly: true,
    encrypt: true,
    renew: true,
  };

  // add your user config here
  const userConfig = {
    myAppName: 'xinhuo',
  };

  return {
    ...config,
    ...userConfig,
  };
};

