module.exports = function(manualcustproductdetail) {
  var app = require('../../../server/server');
  var async = require('async');
  manualcustproductdetail.upsertmanualpro = function(datas, cb) {
    var ppp = [];
    for (var i = 0; i < datas.length; i++) {
      var oo = {};
      oo.SKU = datas[i].Key1;
      oo.HScode = (datas[i].HScode.length == 8) ? (datas[i].HScode + '00') : datas[i].HScode;
      oo.custid = datas[i].Updatememo;// 3282;// 806 // 751 // 3283
      oo.Cgoodsname = datas[i].Cgoodsname;
      oo.Cspec = datas[i].Cspec;
      oo.Cunit = datas[i].Cunit;
      oo.Cunit1 = datas[i].Cunit1;
      oo.Cunit2 = datas[i].Cunit2;
      oo.status = datas[i].Status;
      oo.CreateDate = datas[i].CreateDate;
      oo.LastUpdateDate = datas[i].LastUpdateDate;
      oo.CreatePerson = datas[i].CreatePerson;
      oo.LastUpdatePerson = datas[i].LastUpdatePerson;
      oo.ControlMark = datas[i].ControlMark;
      ppp.push(oo);
    }
    console.log(ppp.length);
    var count = 0;
    async.mapSeries(ppp, function(data, callback) {
      if (data.custid == 3282 || data.custid == 806 || data.custid == 751 || data.custid == 3283) {
        console.log(count++);
        manualcustproductdetail.upsertWithWhere({SKU: data.SKU, custid: data.custid}, data, function(err, info) {
          if (err) {
            callback(err);
          } else {
            console.log(info);
            callback(null, data);
          }
        });
      } else {
        callback(null, data);
      }
    }, function(err, result) {
      if (err) {
        cb(err, err);
      } else {
        cb(null, result);
      }
    });
  };

  manualcustproductdetail.remoteMethod(
    'upsertmanualpro', {
      http: {path: '/upsertmanualpro', verb: 'post'},
      accepts: {arg: 'datas', type: 'array', http: {source: 'body'}},
      returns: {type: 'object', root: true},
    }
  );
};
