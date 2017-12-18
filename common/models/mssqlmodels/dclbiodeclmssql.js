module.exports = function(dclbiodeclmssql) {
  var app = require('../../../server/server');
  var winston = require('../../../server/logger/logger');
  var async = require('async');
  var uuid = require('uuid');
  dclbiodeclmssql.upsertsjmodel = function(datas, cb) {
    var sjgoods = datas[0].Dcl_B_Io_Decl_Goods;
    var sjcont = datas[0].Dcl_B_Io_Decl_Att;
    var sjdecl = datas[0];
    async.waterfall([
      function(callback) {
        delete sjdecl['Dcl_B_Io_Decl_Goods'];
        delete sjdecl['Dcl_B_Io_Decl_Att'];
        delete sjdecl['sjUsername'];
        delete sjdecl['id'];
        delete sjdecl['createdAt'];
        delete sjdecl['updatedAt'];
        delete sjdecl['Decl_Id'];
        dclbiodeclmssql.updateAll({Ent_Decl_No: sjdecl.Ent_Decl_No}, sjdecl, function(err, info) {
          if (err) {
            winston.log('error', 'updatesj  decl', err);
          } else {
            if (info.count == 1) {
              dclbiodeclmssql.find({where: {Ent_Decl_No: sjdecl.Ent_Decl_No}}, function(err, result) {
                if (err) {
                  winston.log('error', 'updatesj  decl', err);
                } else {
                  console.log(result);
                  callback(null, result[0]);
                }
              });
            } else {
              callback('nosuchdecl');
            }
          }
        });
      },
      function(dd, callback) {
        app.models.dclbiodeclgoodsmssql.destroyAll({Ent_Decl_No: sjdecl.Ent_Decl_No}, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            callback(null, dd);
          }
        });
      },
      function(dd, callback) {
        async.mapSeries(sjgoods, function(data, call) {
          for (var key in data) {
            if (data[key] == null) {
              data[key] = '';
            }
            if (key == 'Orig_Place_Name') {
              data[key] = data[key].split('[')[0];
            } else if (key == 'Decl_Goods_Cname' || key == 'Ciq_Name') {
              data[key] = data[key].split('(')[0];
            } else if (key == 'Qty' || key == 'Std_Qty' || key == 'Goods_Total_Val' || key == 'Price_Per_Unit') {
              data[key] = parseFloat(data[key]);
            }
          }
          data.Decl_Id = dd.Decl_Id;
          data.Goods_Id = uuid().toString().replace('-', '').replace('-', '').replace('-', '').replace('-', '');
          app.models.dclbiodeclgoodsmssql.upsertWithWhere({Ent_Decl_No: data.Ent_Decl_No, Goods_No: data.Goods_No}, data, function(err, info) {
            if (err) {
              winston.log('error', 'updatesj  decl', err);
              call(err);
            } else {
              call(null, info);
            }
          });
        }, function(err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, dd);
          }
        });
      },
      function(dd, callback) {
        async.mapSeries(sjcont, function(data, call) {
          data.Decl_Id = dd.Decl_Id;
          data.Cont_Id = uuid().toString().replace('-', '').replace('-', '').replace('-', '').replace('-', '');
          app.models.dclbiodeclcontmssql.upsertWithWhere({Ent_Decl_No: data.Ent_Decl_No, Cont_Num: data.Cont_Num}, data, function(err, info) {
            if (err) {
              winston.log('error', 'updatesj  decl', err);
              call(err);
            } else {
              call(null, null);
            }
          });
        }, function(err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, dd);
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

  dclbiodeclmssql.insertsjgoodsmodel = function(datas, cb) {
    var data = datas[0];
    app.models.dclbiodeclgoodsmssql.findOrCreate({where: {Ent_Decl_No: data.Ent_Decl_No, Goods_No: data.Goods_No}}, data, function(err, dd) {
      if (err) {
        cb(err);
      } else {
        cb(null, dd);
      }
    });
  };

  dclbiodeclmssql.remoteMethod(
        'upsertsjmodel', {
          http: {path: '/upsertsjmodel', verb: 'post'},
          accepts: {arg: 'datas', type: 'array', http: {source: 'body'}},
          returns: {type: 'object', root: true},
        }
);

  dclbiodeclmssql.remoteMethod(
        'insertsjmodel', {
          http: {path: '/insertsjmodel', verb: 'post'},
          accepts: {arg: 'datas', type: 'array', http: {source: 'body'}},
          returns: {type: 'object', root: true},
        }
);
};
