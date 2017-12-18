module.exports = function(shangjiandecl) {
  var async = require('async');
  var app = require('../../../server/server');
  shangjiandecl.createorUpdatebatch = function(datas, cb) {
    async.mapSeries(datas, function(decl, call) {
      if (decl) {
        decl.DataStatus = 2;
        shangjiandecl.upsertWithWhere({Decl_Id: decl.Decl_Id}, decl, function(err, info) {
          if (err) {
            call(err);
          } else {
            call(null, decl);
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

  shangjiandecl.remoteMethod(
        'createorUpdatebatch', {
          http: {path: '/createorUpdateBatch', verb: 'post'},
          accepts: {arg: 'datas', type: 'array', http: {source: 'body'}},
          returns: {type: 'array', root: true},
        }
    );
};
