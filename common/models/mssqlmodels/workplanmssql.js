module.exports = function(workplanmssql) {
  var app = require('../../../server/server');
  var async = require('async');
  workplanmssql.getworkplan = function(data, cb) {
    async.waterfall([
      function(callback) {
        workplanmssql.find({where: {begindate: data.begindate, begintime: {between: [data.begintime, data.endtime]}}}, function(err, form) {
          if (err) {
            console.log(err);
            callback(err);
          } else {
            // console.log(form);
            callback(null, form);
          }
        });
      },
      function(plandata, callback) {
        async.mapSeries(plandata, function(pdata, call) {
          pdata.username = [];
          var ppo = pdata.resourceid.split(',');
          async.mapSeries(ppo, function(pid, callb) {
            app.models.HrmPinYinResource.findOne({where: {id: pid}}, function(err, finadata) {
              if (err) {
                console.log(err);
                callb(err);
              } else {
                // pdata.username.push(finadata.lastname);
                callb(null, finadata.lastname);
              }
            });
          }, function(err, llda) {
            if (err) {
              call(err);
            } else {
              pdata.username  = llda;
              app.models.HrmPinYinResource.findOne({where: {id: pdata.createrid}}, function(err, cdata) {
                if (err) {
                  console.log(err);
                  call(err);
                } else {
                  pdata.creatername = cdata.lastname;
                  call(null, pdata);
                }
              });
            //   call(null, pdata);
            }
          });
        }, function(err, lastdata) {
          if (err) {
            callback(err);
          } else {
            console.log(lastdata);
            callback(null, lastdata);
          }
        });
      },
    ], function(err, result) {
      if (err) {
        cb(err);
      } else {
        cb(null, result);
      }
    });
  };

  workplanmssql.remoteMethod(
        'getworkplan', {
          http: {path: '/getworkplan', verb: 'post'},
          accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
          returns: {type: 'object', root: true},
        }
    );
};
