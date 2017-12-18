module.exports = function (decmodhead) {
  var app = require('../../../server/server');
  var winston = require('../../../server/logger/logger');
  var async = require('async');
  var request = require('request');
  decmodhead.upsertdecmodel = function (datas, cb) {
    var dechead = datas[0].dechead;
    var decresult = datas[0].decresult;
    var decrelation = datas[0].decrelation;
    async.map(dechead, function (data) {
      data.result = [];
      async.map(decresult, function (data1) {
        if (data.ObjectID == data1.ObjectID) {
          data.result.push(data1);
        }
      });
    });
    async.waterfall([
      function (callback) {
        async.mapSeries(dechead, function (data, call) {
          decmodhead.upsertWithWhere({ ObjectID: data.ObjectID }, data, function (err, info) {
            if (err) {
              winston.log('error', 'upsertdecmodel  dechead', err);
              call(err);
            } else {
              const url = `http://${app.get('remoting').api.zhidanapi}/api/ModifyApplyinfotbl/addmodifyremote?pre_entry_id=${data.EntryId}&memo=${data.DecModNote}&applydate=${data.Create_Time}`;
              request.get(encodeURI(url), function (err, res, body) {
                if (body != 'success') {
                  console.log(2222, err);
                  winston.log('error', 'upsertdecmodel  dechead', body);
                }
                console.log(3333, body);
                call(null, data);
              })
            }
          });
        }, function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, null);
          }
        });
      },
      function (dd, callback) {
        async.mapSeries(decrelation, function (data, call) {
          app.models.decmodedorelation.upsertWithWhere({ ObjectID: data.ObjectID }, data, function (err, info) {
            if (err) {
              winston.log('error', 'upsertdecmodel  decrelation', err);
              call(err);
            } else {
              call(null, null);
            }
          });
        }, function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, null);
          }
        });
      },
      function (dd, callback) {
        async.mapSeries(decresult, function (data, call) {
          app.models.decmodresult.upsertWithWhere({ Reply_Time: data.Reply_Time, ObjectID: data.ObjectID }, data, function (err, info) {
            if (err) {
              winston.log('error', 'upsertdecmodel  decresult', err);
              call(err);
            } else {
              call(null, null);
            }
          });
        }, function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, null);
          }
        });
      },
      function (dd, callback) {
        async.mapSeries(dechead, function (data, call) {
          decmodhead.find({ where: { EntryId: data.EntryId } }, function (err, head) {
            if (err) {
              call(err);
            } else {
              var count = head.length;
              var gaidan = 0;
              var bohui = 0;
              for (var i = 0; i < head.length; i++) {
                if (head[i].Status == 'A' || head[i].Status == 'S') {
                  gaidan++;
                } else if (head[i].Status == 'E' || head[i].Status == 'F') {
                  bohui++;
                }
              }
              app.models.decmodheadcount.upsertWithWhere({ EntryId: data.EntryId }, { EntryId: data.EntryId, count: count, gaidan: gaidan, bohui: bohui }, function (err, info) {
                if (err) {
                  call(err);
                } else {
                  call(null, null);
                }
              });
            }
          });
        }, function (err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, null);
          }
        });
      },
    ], function (err, result) {
      if (err) {
        cb(err);
      } else {
        cb(null, result);
      }
    });
  };

  decmodhead.remoteMethod(
    'upsertdecmodel', {
      http: { path: '/upsertdecmodel', verb: 'post' },
      accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
      returns: { type: 'object', root: true },
    }
  );
};

