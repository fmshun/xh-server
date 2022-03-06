/* eslint valid-jsdoc: "off" */

'use strict';

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
  config.cors = {
    origin: 'http://localhost:3000',
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1625036878408_3677';

  // add your middleware config here
  config.middleware = [];

  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '1234567890',
      database: 'xinhuo',
    },
    // client: {
    //   host: 'sh-cdb-isyp1nvy.sql.tencentcdb.com',
    //   port: '59589',
    //   user: 'root',
    //   password: 'Wd6591386',
    //   database: 'xinhuo',
    // },
    app: true,
    agent: false,
  };

  // todo: 临时关掉
  config.security = {
    csrf: false,
  };

  config.session = {
    key: 'XH_SESSION',
    maxAge: 3600 * 1000, // 1h
    // maxAge: 10 * 1000, // 1h
    httpOnly: true,
    encrypt: true,
    renew: true,
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};

