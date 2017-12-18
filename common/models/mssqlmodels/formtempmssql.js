module.exports = function(formtempmssql) {
  var app = require('../../../server/server');
  var MQServices = require('../../../server/RabbitMQ/mqService');
  var mq = new MQServices('updateKSDQueun', app.get('remoting').api.mqapi);
  var async = require('async');
  var md5 = require('md5');
  var request = require('request');
  var i =0;

  formtempmssql.ediformhead = function(datas, cb) {
    console.log(datas.length);
    async.mapSeries(datas, function(data, call) {
    console.log(i++);
      var message = {
        updateKSDQueues: '',
        updateFormHeadQueues: '',
        updateEDIQueues: '',
        exceptionQueue: '',
        exceptionflag: false,
      };
      data.sqlflag = true;
      if (data.trade_mode == 2600 || data.trade_mode == '2600') {
        data.bzjflag = true;
        message.exceptionflag = true;
      } else {
        data.bzjflag = false;
      }
      delete data['formlist'];
      delete data['certlist'];
      delete data['container'];
      delete data['formcert'];
      async.waterfall([
        function(callback) {
          app.models.formtempbase.findOne({where: {pre_entry_id: data.pre_entry_id}}, function(err, editempdata) {
            if (err) {
              callback(err);
            } else {
              if (editempdata) {
                callback(null, editempdata);
              } else {
                callback(null, null);
              }
            }
          });
        },
        function(editempdata, callback) {
          if (editempdata) {
            if (editempdata.ksdflag == true && editempdata.sqlflag != true) { //&& md5(data) != md5(editempdata)
            //   data.updateKSDQueue = 1;
              var pp = {
                pre_entry_id: data.pre_entry_id,
                updateKSDQueue: 1,
              };
              mq.sendToQueue(pp, 'updateKSDQueue')
                                .then(function(ok) {
                                  console.log('updateKSDQueue ok');
                                  message.updateKSDQueues = 'updateKSDQueue';
                                  callback(null, editempdata);
                                })
                                .catch(function(se) {
                                  console.log(se);
                                  callback(se);
                                });
            }
            else {
              callback(null, editempdata);
            }
          } else {
            callback(null, null);
          }
        },
        function(editempdata, callback) {
          if (editempdata) {
            if (editempdata.ediflag == true && data.EDI_NO != data.pre_entry_id && editempdata.sqlflag != true) { // && md5(data) != md5(editempdata)
              var pp = {
                pre_entry_id: data.pre_entry_id,
                updateEDIQueues: 1,
              };
              mq.sendToQueue(pp, 'updateEDIQueue')
                                .then(function(ok) {
                                  console.log('updateEDIQueue ok ');
                                  message.updateEDIQueues = 'updateEDIQueue';
                                  callback(null, editempdata);
                                })
                                .catch(function(se) {
                                  console.log(se);
                                  callback(se);
                                });
            } else {
              callback(null, editempdata);
            }
          } else {
            callback(null, null);
          }
        },
        function(editempdata, callback) {
          if (editempdata) {
            if (editempdata.sqlflag != true) {
              if (data.EDI_NO == data.pre_entry_id) {
                callback(null, null);
              } else if (data.COP_NO != '' || data.COP_NO != null) {
                callback(null, 'updateflag');
              } else {
                callback(null, null);
              }
            } else {
              callback(null, null);
            }
          } else if (data.EDI_NO == data.pre_entry_id) {
            callback(null, null);
          } else if (data.COP_NO != '' || data.COP_NO != null) {
            callback(null, 'updateflag');
          } else {
            callback(null, null);
          }
        },
        function(updateflag, callback) {
          if (updateflag == 'updateflag') {
            app.models.formheadmssql.updateAll({COP_NO: data.COP_NO, pre_entry_id: data.COP_NO}, {EDI_NO: data.EDI_NO, pre_entry_id: data.pre_entry_id, customs_id: data.pre_entry_id, CurrFSMState: 'EDI已发送'}, function(err, info) {
              if (err) {
                callback(err);
              } else if (info.count == 1) {
                app.models.formheadmssql.find({where: {COP_NO: data.COP_NO}}, function(herr, head) {
                  if (herr) {
                    callback(herr);
                  } else {
                    console.log(head[0].ywid);
                    app.models.Ywinfo.updateAll({ID: head[0].ywid}, {mainpre_entry_id: data.pre_entry_id}, function(yerr, yinfo) {
                      if (yerr) {
                        console.log(yerr);
                        callback(yerr);
                      } else {
                        var pp = {
                          pre_entry_id: data.pre_entry_id,
                          updateFormHeadQueue: 1,
                        };
                        mq.sendToQueue(pp, 'updateFormHeadQueue')
                        .then(function(ok) {
                          console.log('updateFormHeadQueue ok');
                          message.updateFormHeadQueues = 'updateFormHeadQueue';
                          callback(null, null);
                        })
                        .catch(function(se) {
                          console.log(se);
                          callback(se);
                        });
                      }
                    });
                  }
                });
              }
                else {
                callback(null, null);
              }
            });
          } else {
            callback(null, null);
          }
        },
        function(editempdata, callback) {
          app.models.formtempbase.upsertWithWhere({pre_entry_id: data.pre_entry_id}, {pre_entry_id: data.pre_entry_id, sqlflag: data.sqlflag, md5: md5(data), bzjflag: data.bzjflag, COP_NO: data.COP_NO}, function(err, info) {
            if (err) {
              callback(err);
            } else {
              if (message.exceptionflag == true) {
                mq.sendToQueue(info, 'exceptionQueue')
                .then(function(ok) {
                  console.log('exceptionQueue ok ');
                  message.exceptionQueue = 'exceptionQueue';
                  callback(null, message);
                })
                .catch(function(se) {
                  console.log(se);
                  callback(se);
                });
              } else {
                callback(null, message);
              }
            }
          });
        },
      ], function(err, result) {
        if (err) {
          console.log('A file failed to process', err);
          call(err);
        } else {
          call(null, result);
        }
      });
    }, function(err, result) {
      if (err) {
        console.log('A file failed to process', err);
        cb(err);
      } else {
        cb(null, result);
      }
    });
  },

        formtempmssql.edicustomsresult = function(datas, cb) {
          async.mapSeries(datas, function(cusdata, call) {
            var data = {
              pre_entry_id: cusdata.pre_Entry_ID,
              bill_no: cusdata.Bill_No,
              i_e_date: cusdata.I_E_Date,
              d_date: cusdata.D_Date,
              trade_co: cusdata.Trade_Co,
              net_wt: cusdata.Net_WT,
              pack_no: cusdata.Pack_No,
              gross_wt: cusdata.Cross_WT,
            };
            data.ediflag = true;
            var message = {
              exceptionQueue: '',
              updateEDIQueues: '',
              exceptionflag: false,
              updatetimeflag: false,
            };
            if (cusdata.Channel == 'C' || cusdata.Channel == 'B' || cusdata.Channel == 'c' || cusdata.Channel == 'b') {
              data.ksdcheck = true;
              message.exceptionflag = true;
            }
            if (cusdata.Channel == 'E' || cusdata.Channel == 'e') {
              data.edicustomserror = true;
              message.exceptionflag = true;
            }
            if (cusdata.Channel == 'Z' || cusdata.Channel == 'D' || cusdata.Channel == 'z' || cusdata.Channel == 'd') {
              data.modifyflagentry = true;
              message.exceptionflag = true;
            }
            if (cusdata.Channel == 'L' || cusdata.Channel == 'l' || cusdata.Channel == 'P' || cusdata.Channel == 'p' || cusdata.Channel == 'J' || cusdata.Channel == 'j') {
              message.updatetimeflag = true;
            }
            if (cusdata.Channel == 'S' || cusdata.Channel == 's') {
              data.ediflag = false;
            }
            var ywdata = {
              ImportSource: 'EDI回执',
              LastUpdateDate: new Date(),
              processflag: false,
              StatusDate: cusdata.Notice_Date,
              StatusName: cusdata.Channel,
              MessageMemo: cusdata.Note,
              Pre_entry_id: cusdata.pre_Entry_ID,
            };
            async.waterfall([
              function(callback) {
                app.models.YWRelatedStatusInfo.findOrCreate({where: {StatusDate: ywdata.StatusDate, Pre_entry_id: ywdata.Pre_entry_id, ImportSource: ywdata.ImportSource, StatusName: ywdata.StatusName}}, ywdata, function(err, ywinfo, created) {
                  if (err) {
                    callback(err);
                  } else if (created) {
                    callback(null, ywinfo);
                  } else {
                    callback(null, null);
                  }
                });
              },
              function(ywinfo, callback) {
                if (ywinfo) {
                  app.models.formtempbase.findOne({where: {pre_entry_id: data.pre_entry_id}}, function(err, formtempdata) {
                    if (err) {
                      callback(err);
                    } else {
                      if (formtempdata == null) {
                        callback(null, message);
                      } else
                        if (formtempdata.sqlflag == true && message.updatetimeflag == true) {
                          var pp = {
                            pre_entry_id: data.pre_entry_id,
                            updateEDIQueues: 1,
                          };
                          mq.sendToQueue(pp, 'updateEDIQueue')
                                .then(function(ok) {
                                  console.log('updateEDIQueue ok ');
                                  message.updateEDIQueues = 'updateEDIQueue';
                                  callback(null, message);
                                })
                                .catch(function(se) {
                                  console.log(se);
                                  callback(se);
                                });
                        } else {
                          callback(null, message);
                        }
                    }
                  });
                } else {
                  callback(null, null);
                }
              },
              function(message, callback) {
                if (message) {
                  app.models.formtempbase.upsertWithWhere({pre_entry_id: data.pre_entry_id}, data, function(err, tempinfo) {
                    if (err) {
                      callback(err);
                    } else {
                      if (message.exceptionflag == true) {
                        mq.sendToQueue(data, 'exceptionQueue')
                        .then(function(ok) {
                          console.log('exceptionQueue ok');
                          message.exceptionQueue = 'exceptionQueue';
                          callback(null, message);
                        })
                        .catch(function(se) {
                          console.log(se);
                          callback(se);
                        });
                      } else {
                        callback(null, message);
                      }
                    }
                  });
                } else {
                  callback(null, null);
                }
              },
            ], function(err, result) {
              if (err) {
                console.log(err);
                call(err);
              } else {
                call(null, result);
              }
            });
          },
                function(err, result) {
                  if (err) {
                    console.log(err);
                    cb(err);
                  } else {
                    cb(null, result);
                  }
                });
        },

        formtempmssql.editimeupdate = function(datas, cb) {
          datas = datas[0];
          var data = [];
          async.waterfall([
            function(callback) {
              if (datas.updateEDIQueues == 1) {
                app.models.YWRelatedStatusInfo.find({where: {and: [{ImportSource: 'EDI回执'}, {Pre_entry_id: datas.pre_entry_id}]}}, function(ferr, foundarray) {
                  if (ferr) {
                    callback(ferr);
                  } else {
                    if (foundarray) {
                      data = foundarray;
                      callback(null, data);
                    } else {
                      callback('no such YWRelatedStatusInfo pre_entry_id:' + datas.pre_entry_id);
                    }
                  }
                });
              } else {
                callback('invaild queue');
              }
            },
            function(data, callback) {
              async.mapSeries(data, function(msdata, call) {
                        // msdata.StatusDate = msdata.StatusDate.replace("T"," ");20171213T12431500
                if (msdata.StatusDate.length < 18) {
                  msdata.StatusDate = msdata.StatusDate.substring(0, 4) + '-' + msdata.StatusDate.substring(4, 6) + '-' + msdata.StatusDate.substring(6, 8) + ' ' + msdata.StatusDate.substring(9, 11) + ':' + msdata.StatusDate.substring(11, 13) + ':' + msdata.StatusDate.substring(13, 15) + ':000';
                }
                if (msdata.StatusName == 'L' || msdata.StatusName == 'l') {
                  app.models.formheadmssql.updateAll({or: [{SendDate: null, pre_entry_id: msdata.Pre_entry_id}, {SendDate: '', pre_entry_id: msdata.Pre_entry_id}]}, {SendDate: msdata.StatusDate}, function(err, info) {
                    if (err) {
                      call(err);
                    } else if (info.count == 1) {
                      call(null, info);
                    } else if (info.count == 0) {
                      call(null, null);
                    } else {
                      call('no such formheadmssql 发送 pre_entry_id:' + msdata.Pre_entry_id);
                    }
                  });
                } else if (msdata.StatusName == 'P' || msdata.StatusName == 'p') {
                  app.models.formheadmssql.updateAll({or: [{SWFXDate: null, pre_entry_id: msdata.Pre_entry_id}, {SWFXDate: '', pre_entry_id: msdata.Pre_entry_id}]}, {SWFXDate: msdata.StatusDate}, function(err, info) {
                    if (err) {
                      call(err);
                    } else if (info.count == 1) {
                      call(null, info);
                    } else if (info.count == 0) {
                      call(null, null);
                    } else {
                      call('no such formheadmssql 放行 pre_entry_id:' + msdata.Pre_entry_id);
                    }
                  });
                } else if (msdata.StatusName == 'J' || msdata.StatusName == 'j') {
                  app.models.formheadmssql.updateAll({or: [{TongguanDate: null, pre_entry_id: msdata.Pre_entry_id}, {TongguanDate: '', pre_entry_id: msdata.Pre_entry_id}]}, {TongguanDate: msdata.StatusDate}, function(err, info) {
                    if (err) {
                      call(err);
                    } else if (info.count == 1) {
                      call(null, info);
                    } else if (info.count == 0) {
                      call(null, null);
                    } else {
                      call('no such formheadmssql 通过 pre_entry_id:' + msdata.Pre_entry_id);
                    }
                  });
                } else if (msdata.StatusName == 'Y') {
                  console.log('Y in');
                  app.models.formheadmssql.updateAll({or: [{JGStatusCode: null, pre_entry_id: msdata.Pre_entry_id}, {JGStatusCode: '', pre_entry_id: msdata.Pre_entry_id}]}, {JGStatusCode: msdata.StatusName, JGStatusDate: msdata.StatusDate}, function(err, info) {
                    if (err) {
                      call(err);
                    } else if (info.count == 1) {
                      call(null, info);
                    } else if (info.count == 0) {
                      call(null, null);
                    } else {
                      call('no such formheadmssql Y pre_entry_id:' + msdata.Pre_entry_id);
                    }
                  });
                } else {
                  console.log('else in');
                  app.models.formheadmssql.updateAll({or: [{JGStatusCode: null, pre_entry_id: msdata.Pre_entry_id}, {JGStatusCode: '', pre_entry_id: msdata.Pre_entry_id}]}, {JGStatusCode: msdata.StatusName}, function(err, info) {
                    if (err) {
                      call(err);
                    } else if (info.count == 1) {
                      call(null, info);
                    } else if (info.count == 0) {
                      call(null, null);
                    } else {
                      call('no such formheadmssql other pre_entry_id:' + msdata.Pre_entry_id);
                    }
                  });
                }
              }, function(err, result) {
                if (err) {
                  callback(err);
                } else {
                  callback(null, result);
                }
              });
            },
          ], function(err, resultdata) {
            if (err) {
              cb(err);
            } else {
              cb(null, resultdata);
            }
          });
        };

  formtempmssql.remoteMethod(
        'ediformhead', {
          http: {path: '/ediformhead', verb: 'post'},
          accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
          returns: {type: 'object', root: true},
        }
    );

  formtempmssql.remoteMethod(
        'edicustomsresult', {
          http: {path: '/edicustomsresult', verb: 'post'},
          accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
          returns: {type: 'object', root: true},
        }
    );

  formtempmssql.remoteMethod(
        'editimeupdate', {
          http: {path: '/editimeupdate', verb: 'post'},
          accepts: {arg: 'data', type: 'object', http: {source: 'body'}},
          returns: {type: 'object', root: true},
        }
    );
};

