'use strict';
const crypto = require('crypto');

function isObject(param) {
  return Object.prototype.toString.call(param) === '[object Object]';
}

function under2Camel(p) {
  if (!p) return p;
  if (Array.isArray(p)) return p.map(v => under2Camel(v));
  const keys = Object.keys(p);
  const result = {};
  keys.forEach(v => {
    const key = v.replace(/_(.)/g, (__, letter) => letter.toUpperCase());
    if (Array.isArray(p[v])) {
      result[key] = p[v].map(val => under2Camel(val));
    } else if (isObject(p[v])) {
      result[key] = under2Camel(p[v]);
    } else {
      result[key] = p[v];
    }
  });
  return result;
}

function camel2Under(p) {
  if (!p) return p;
  const keys = Object.keys(p);
  const result = {};
  keys.forEach(v => {
    const key = v.replace(/([a-z])([A-Z])/g, (_, letter1, letter2) => `${letter1}_${letter2.toLowerCase()}`);
    if (Array.isArray(p[v])) {
      result[key] = p[v].map(val => camel2Under(val));
    } else if (isObject(p[v])) {
      result[key] = p[v].map(val => camel2Under(val));
    } else {
      result[key] = p[v];
    }
  });
  return result;
}

/**
 * 获取datetime
 * @param t
 * @returns {string}
 */
function getDateTime(t) {
  const moment = require('moment');
  const d = t ? moment(t) : moment();
  return d.format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 生成error
 * @param p
 * @returns {Error}
 */
function error(p) {
  return new Error(p);
}

/**
 * 尝试joi来替换
 */
class Validator {
  constructor(options) {
    this.options = options;
  }

  required(key, value) {
    if (value === null || value === void 0) {
      throw error(`${key} is required`);
    }
    return this;
  }

  string(key, value) {
    if (value && typeof value !== 'string') {
      throw error(`${key} is not a string`);
    }
    return this;
  }
  object(key, value) {
    if (value && !isObject(value)) {
      throw error(`${key} is not an object`);
    }
    return this;
  }
  array(key, value) {
    if (value && !Array.isArray(value)) {
      throw error(`[${key}]:${value} is not an array`);
    }
    return this;
  }
  number(key, value) {
    if (value === null || value === void 0 || Number(value) !== value) {
      throw error(`[${key}]:${value} is not a number`);
    }
    return this;
  }

  validate(p) {
    const d = (k, f) => {
      if (!this[f]) {
        throw error(`not found ${f} function`);
      }
      this[f](k, p[k]);
    };
    const result = {};
    for (const [ k, v ] of Object.entries(this.options)) {
      if (Array.isArray(v)) {
        for (const f of v) {
          d(k, f);
          result[k] = p[k];
        }
      } else if (typeof v === 'string') {
        d(k, v);
        result[k] = p[k];
      } else {
        throw error(`暂不支持${k}`);
      }
    }
    return result;
  }
}

const formatLog = ({ user_id, operation, operator_id }) => {
  return {
    user_id,
    operation,
    operator_id: operator_id || user_id,
    create_time: getDateTime(),
  };
};

const cryptoPwd = pwd => {
  const saltPwd = `${pwd}:xh-ydg`;
  const hash = crypto.createHash('sha1');
  return hash.update(saltPwd).digest('hex');
};

class WXBizDataCrypt {
  constructor(appId, sessionKey) {
    this.appId = appId;
    this.sessionKey = sessionKey;
  }

  decryptData(encryptedData, iv) {
    // base64 decode
    const sessionKey = new Buffer(this.sessionKey, 'base64');
    const encryptedDataR = new Buffer(encryptedData, 'base64');
    iv = new Buffer(iv, 'base64');
    let decoded;
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedDataR, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);

    } catch (err) {
      throw new Error('Illegal Buffer');
    }

    if (decoded.watermark.appid !== this.appId) {
      console.log(decoded.watermark.appid, this.appId);
      throw new Error('Illegal Buffer');
    }
    return decoded;
  }
}

const timeout = (time, message = '请求超时') => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej(new Error(message));
    }, time);
  });
};


exports.camel2Under = camel2Under;
exports.under2Camel = under2Camel;
exports.isObject = isObject;
exports.getDateTime = getDateTime;
exports.error = error;
exports.Validator = Validator;
exports.formatLog = formatLog;
exports.cryptoPwd = cryptoPwd;
exports.WXBizDataCrypt = WXBizDataCrypt;
exports.timeout = timeout;
