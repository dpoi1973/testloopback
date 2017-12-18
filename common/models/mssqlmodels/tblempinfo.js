module.exports = function (tblempinfo) {
  tblempinfo.getempinfoByOpenid = function (Openid, cb) {
    tblempinfo.findOne({ where: { wechatno: Openid } }, function (err, foundobj) {
      if (err) {
        cb(err);
      }
      else {
        if (foundobj) {
          cb(null, foundobj);
        }
        else {
          cb(null, null);
        }
      }
    });
  };
  tblempinfo.relempinfoByOpenid = function (empid, Openid, cb) {
    if (Openid) {
      tblempinfo.updateAll({ Empid: empid, wechatno: null }, { wechatno: Openid }, function (err, info) {
        cb(err, info);
      });
    }
    else {
      cb('openid不能为空');
    }
  };
  tblempinfo.DisposeempinfoByOpenid = function (empid, Openid, cb) {
    tblempinfo.updateAll({ Empid: empid, wechatno: Openid }, { wechatno: null }, function (err, info) {
      cb(err, info);
    });
  };
  tblempinfo.remoteMethod(
    'getempinfoByOpenid', {
      http: { path: '/getempinfoByOpenid', verb: 'get' },
      accepts: { arg: 'Openid', type: 'string' },
      returns: { type: 'object', root: true },
    }
  );

  tblempinfo.remoteMethod(
    'relempinfoByOpenid', {
      http: { path: '/relempinfoByOpenid', verb: 'get' },
      accepts: [{ arg: 'empid', type: 'string' }, { arg: 'Openid', type: 'string' }],
      returns: { type: 'object', root: true },
    }
  );

  tblempinfo.remoteMethod(
    'DisposeempinfoByOpenid', {
      http: { path: '/DisposeempinfoByOpenid', verb: 'get' },
      accepts: [{ arg: 'empid', type: 'string' }, { arg: 'Openid', type: 'string' }],
      returns: { type: 'object', root: true },
    }
  );
};
