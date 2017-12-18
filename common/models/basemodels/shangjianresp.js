module.exports = function(shangjianresp) {
  var async = require('async');
  var app = require('../../../server/server');
  shangjianresp.createorUpdatebatch = function(datas, cb) {
    async.mapSeries(datas, function(resp, call) {
      if (resp) {
        resp.DataStatus = 2;
        shangjianresp.upsertWithWhere({Response_Id: resp.Response_Id}, resp, function(err, info) {
          if (err) {
            call(err);
          } else {
            call(null, resp);
          }
        });
      } else {
        call(null, null);
      }
    }, function(err, resul) {
      if (err) {
        cb(err);
      } else {
        cb(null, resul);
      }
    });
  };

  shangjianresp.remoteMethod(
        'createorUpdatebatch', {
          http: {path: '/createorUpdateBatch', verb: 'post'},
          accepts: {arg: 'datas', type: 'array', http: {source: 'body'}},
          returns: {type: 'array', root: true},
        }
    );
};
