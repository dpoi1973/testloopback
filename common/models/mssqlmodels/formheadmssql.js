module.exports = function (formheadmssql) {
    var app = require('../../../server/server');
    const MQServices = require('../../../server/RabbitMQ/mqService');
    var winston = require('../../../server/logger/logger');
    var mq = new MQServices('updateKSDQueun', app.get('remoting').api.mqapi);
    var md5 = require('md5');
    var async = require('async');
    var request = require('request');
    formheadmssql.findspreadmodel = function (COPNO, cb) {
        setTimeout(function () {
            formheadmssql.findOne({ where: { COP_NO: COPNO }, include: ["formlist", "certlist", "containerlist"] }, function (err, foundobj) {
                if (err) {
                    cb(err);
                }
                else {
                    app.models.attachinfo.find({ where: { and: [{ filetype: { neq: 'Summary' } }, { pre_entry_id: COPNO }] } }, function (ferr, foundarray) {
                        if (ferr) {
                            cb(ferr);
                        }
                        else {
                            //var result = foundobj.__data;
                            foundobj.attachinfo = [];
                            if (foundobj.ie_flag > '3') {
                                foundarray.forEach(function (ele) {
                                    var filtype = {};
                                    filtype.filetype = ele.filetype;
                                    filtype.fileurl = ele.fileurl;
                                    filtype.filename = ele.filename;
                                    foundobj.attachinfo.push(filtype);
                                });
                            }
                            foundobj.create_date = transdate(foundobj.CreateDate);
                            foundobj.__data.formlist.forEach(function (ele) {
                                ele.create_date = foundobj.create_date;
                            });
                            foundobj.type_er = '0';
                            if (foundobj.__data.containerlist == null) {
                                foundobj.container = [];
                            }
                            else {
                                foundobj.container = [];
                                foundobj.__data.containerlist.forEach(function (ele) {
                                    var container = {};
                                    container.pre_entry_id = ele.Pre_entry_id;
                                    container.order_no = ele.OrderNO;
                                    container.container_no = ele.ContainerNO;
                                    container.container_model = ele.ContainerModel;
                                    container.container_wt = ele.ContainerWeight;
                                    foundobj.container.push(container);
                                })
                            }
                            delete foundobj.__data.containerlist;
                            if (foundobj.certlist == null) {
                                foundobj.certlist = [];
                            }


                            var arr = new Array(4);
                            arr[0] = foundobj.promiseflag1 == "1" ? "1" : "0";
                            arr[1] = foundobj.promiseflag2 == "1" ? "1" : "0";
                            arr[2] = foundobj.promiseflag3 == "1" ? "1" : "0";
                            arr[3] = foundobj.promiseflag4 == "1" ? "1" : "0";
                            foundobj.PROMISE_ITMES = arr.join("");
                            cb(null, foundobj);
                        }
                    });
                }
            });
        }, 0);
    };


    formheadmssql.updateksdentry = function (datas, cb) {
        var message = {
            KSDstatusTosqls: '',
            formtempmodify: null,
            formcheck: null,
            ywinfo: null,
            formtemp: null,
            exceptionQueue: '',
            exceptionflag: false
        };
        var formcheck = false;
        if (datas[0].formcheck == 1) {
            formcheck = true;
        }
        var data = transform(datas[0]);
        data.ksdflag = true;
        if (data.PROCESS_STATUS == '修改重审') {
            data.modifyflagentry = true;
        } else {
            data.modifyflagentry = false;
        }
        var ywdata = {
            ImportSource: "KSDOrigin_ksd_form_chk",
            LastUpdateDate: new Date(),
            processflag: false,
            MessageMemo: null,
            Pre_entry_id: data.pre_entry_id
        };
        if (data.PROCESS_STATUS) {
            ywdata.StatusName = `${data.PROCESS_STATUS}[KSD]`;
        } else if (data.f_matter) {
            ywdata.StatusName = data.f_matter;
        } else {
            ywdata.StatusName = '实物放行[KSD]';
        }

        if (data.REC_DATE) {
            ywdata.StatusDate = data.REC_DATE;
        } else
            if (data.REL_TIME_R) {
                ywdata.StatusDate = data.REL_TIME_R;
            } else
                if (data.e_date) {
                    ywdata.StatusDate = data.e_date;
                }
        console.log(data);
        async.waterfall([
            function (callback) {
                if (data.modifyflagentry == true) {
                    data.modifyflagentry = true;
                    message.exceptionflag = true;
                    app.models.formtempmodify.upsertWithWhere({ pre_entry_id: data.pre_entry_id }, data, function (err, info) {
                        if (err) {
                            winston.log('error', 'updateksdentry', err);
                            callback(err);
                        } else {
                            message.formtempmodify = info;
                            callback(null, data)
                        }
                    })
                } else {
                    callback(null, data)
                }
            },
            function (data, callback) {
                if (formcheck == true) {
                    data.ksdcheck = true;
                    message.exceptionflag = true;
                    app.models.formtempcheck.upsertWithWhere({ pre_entry_id: data.pre_entry_id }, data, function (err, info) {
                        if (err) {
                            winston.log('error', 'updateksdentry', err);
                            callback(err);
                        } else {
                            message.formcheck = info;
                            callback(null, data)
                        }
                    })
                } else {
                    callback(null, data)
                }
            },
            function (data, callback) {
                if (data.trade_mode == 2600 || data.trade_mode == '2600') {
                    data.bzjflag = true;
                    message.exceptionflag = true;
                    app.models.formtempbaozhengjin.upsertWithWhere({ pre_entry_id: data.pre_entry_id }, data, function (err, info) {
                        if (err) {
                            winston.log('error', 'updateksdentry', err);
                            callback(err);
                        } else {
                            message.formbaozhengjin = info;
                            callback(null, data)
                        }
                    })
                } else {
                    callback(null, data)
                }
            },
            function (data, callback) {
                app.models.formtempbase.upsertWithWhere({ pre_entry_id: data.pre_entry_id }, data, function (err, tempinfo) {
                    if (err) {
                        winston.log('error', 'updateksdentry', err);
                        callback(err);
                    }
                    else {
                        message.formtemp = tempinfo;
                        if (message.exceptionflag == true) {
                            mq.sendToQueue(tempinfo, "exceptionQueue")
                                .then((ok) => {
                                    console.log(`exceptionQueue ok `);
                                    winston.log('info', 'updateksdentry', { pre_entry_id: tempinfo.pre_entry_id, exceptionQueue: 'exceptionQueue ok' });
                                    message.exceptionQueue = 'exceptionQueue';
                                    callback(null, tempinfo);
                                })
                                .catch((se) => {
                                    console.log(se);
                                    winston.log('error', 'updateksdentry', se);
                                    callback(se);
                                });
                        } else {
                            callback(null, tempinfo)
                        }
                    }
                })
            },
            function (tempinfo, callback) {
                app.models.YWRelatedStatusInfo.findOrCreate({ where: { StatusDate: ywdata.StatusDate, Pre_entry_id: ywdata.Pre_entry_id, ImportSource: ywdata.ImportSource, StatusName: ywdata.StatusName } }, ywdata, function (err, ywinfo) {
                    if (err) {
                        winston.log('error', 'updateksdentry', err);
                        callback(err)
                    } else {
                        message.ywinfo = ywinfo;
                        if (tempinfo.sqlflag == true) {
                            ywinfo.KSDstatusTosql = 1;
                            mq.sendToQueue(ywinfo, "KSDstatusTosql")
                                .then((ok) => {
                                    console.log(`KSDstatusTosql ok `);
                                    winston.log('info', 'updateksdentry', { pre_entry_id: ywinfo.pre_entry_id, KSDstatusTosql: 'KSDstatusTosql ok' });
                                    message.KSDstatusTosqls = 'KSDstatusTosql';
                                    callback(null, message);
                                })
                                .catch((se) => {
                                    console.log(se);
                                    winston.log('error', 'updateksdentry', se);
                                    callback(se);
                                });
                        } else {
                            callback(null, message)
                        }
                    }
                })
            }
        ], function (err, result) {
            if (err) {
                winston.log('error', 'updateksdentry', err);
                cb(err)
            } else {
                cb(null, result)
            }
        })

    };


    formheadmssql.ediformhead = function (datas, cb) {
        async.mapSeries(datas, function (data, call) {
            var message = {
                updateKSDQueues: '',
                updateFormHeadQueues: '',
                exceptionQueue: '',
                resultdata: null,
                exceptionflag: false
            };
            data.ediflag = true;
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
                function (callback) {
                    app.models.formtempbase.findOne({ where: { pre_entry_id: data.pre_entry_id } }, function (err, editempdata) {
                        if (err) {
                            winston.log('error', 'ediformhead', err);
                            callback(err);
                        } else {
                            if (editempdata) {
                                callback(null, editempdata);
                            } else {
                                callback(null, null)
                            }
                        }
                    })
                },
                function (editempdata, callback) {
                    if (editempdata) {
                        if (editempdata.ksdflag == true && md5(data) != md5(editempdata)) {
                            data.updateKSDQueue = 1;
                            var pp = {
                                pre_entry_id: data.pre_entry_id,
                                updateKSDQueue: 1
                            };
                            mq.sendToQueue(pp, "updateKSDQueue")
                                .then((ok) => {
                                    console.log(`updateKSDQueue ok `);
                                    winston.log('info', 'ediformhead', { pre_entry_id: data.pre_entry_id, updateKSDQueue: 'updateKSDQueue ok' });
                                    message.updateKSDQueues = 'updateKSDQueue';
                                    callback(null, editempdata);
                                })
                                .catch((se) => {
                                    console.log(se);
                                    winston.log('error', 'ediformhead', se);
                                    callback(se);
                                });
                        }
                        else {
                            callback(null, editempdata)
                        }
                    } else {
                        callback(null, null);
                    }
                },
                function (editempdata, callback) {
                    if (editempdata) {
                        if (editempdata.ediflag != true || editempdata.sqlflag != true) {
                            if (data.EDI_NO == data.pre_entry_id) {
                                callback(null, null);
                            } else if (data.COP_NO != '' || data.COP_NO != null) {
                                callback(null, 'updateflag');
                            } else {
                                callback(null, null);
                            }
                        } else if (editempdata.sqlflag == true) {
                            data.sqlflag = true;
                            if (md5(data) != md5(editempdata) && data.EDI_NO != data.pre_entry_id) {
                                var pp = {
                                    pre_entry_id: data.pre_entry_id,
                                    updateFormHeadQueue: 1
                                }
                                mq.sendToQueue(pp, "updateFormHeadQueue")
                                    .then((ok) => {
                                        console.log(`updateFormHeadQueue ok `);
                                        winston.log('info', 'ediformhead', { pre_entry_id: data.pre_entry_id, updateFormHeadQueue: "updateFormHeadQueue ok" });
                                        message.updateFormHeadQueues = 'updateFormHeadQueue';
                                        callback(null, null);
                                    })
                                    .catch((se) => {
                                        console.log(se);
                                        winston.log('error', 'ediformhead', se);
                                        callback(se);
                                    });
                            } else {
                                callback(null, null)
                            }
                        } else {
                            callback(null, null)
                        }
                    } else if (data.EDI_NO == data.pre_entry_id) {
                        callback(null, null);
                    } else if (data.COP_NO != '' || data.COP_NO != null) {
                        callback(null, 'updateflag');
                    } else {
                        callback(null, null)
                    }
                },
                function (updateflag, callback) {
                    if (updateflag == 'updateflag') {
                        data.sqlflag = true;//说是第一次来的报关单号肯定是对的，后面都是假的，只更新第一次 --2017-09-20 叶海富
                        formheadmssql.updateAll({ COP_NO: data.COP_NO, pre_entry_id: data.COP_NO }, { EDI_NO: data.EDI_NO, pre_entry_id: data.pre_entry_id, customs_id: data.pre_entry_id, CurrFSMState: 'EDI已发送' }, function (err, info) {
                            if (err) {
                                winston.log('error', 'ediformhead', err);
                                callback(err);
                            } else if (info.count == 1) {
                                winston.log('info', 'ediformhead', { EDI_NO: data.EDI_NO, pre_entry_id: data.pre_entry_id });
                                formheadmssql.find({ where: { COP_NO: data.COP_NO } }, function (herr, head) {
                                    if (herr) {
                                        winston.log('error', 'ediformhead', herr);
                                        callback(herr);
                                    } else {
                                        console.log(head[0].ywid);
                                        app.models.Ywinfo.updateAll({ ID: head[0].ywid }, { mainpre_entry_id: data.pre_entry_id }, function (yerr, yinfo) {
                                            if (yerr) {
                                                winston.log('error', 'ediformhead', yerr);
                                                callback(yerr);
                                            } else {
                                                var pp = {
                                                    pre_entry_id: data.pre_entry_id,
                                                    updateFormHeadQueue: 1
                                                }
                                                mq.sendToQueue(pp, "updateFormHeadQueue")
                                                    .then((ok) => {
                                                        console.log(`updateFormHeadQueue ok `);
                                                        winston.log('info', 'ediformhead', { pre_entry_id: data.pre_entry_id, updateFormHeadQueues: 'updateFormHeadQueue and update pre_entry_id ok' });
                                                        message.updateFormHeadQueues = 'updateFormHeadQueue';
                                                        callback(null, null)
                                                    })
                                                    .catch((se) => {
                                                        winston.log('error', 'ediformhead', se);
                                                        console.log(se);
                                                        callback(se);
                                                    });
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                winston.log('error', 'ediformhead', `no such pre_entry_id ${data.pre_entry_id} EDI_NO ${data.EDI_NO}`);
                                callback(null, null);
                            }
                        })
                    } else {
                        callback(null, null);
                    }
                },
                function (editempdata, callback) {
                    app.models.formtempbase.upsertWithWhere({ pre_entry_id: data.pre_entry_id }, { pre_entry_id: data.pre_entry_id, ediflag: data.ediflag, sqlflag: data.sqlflag, md5: md5(data), bzjflag: data.bzjflag, COP_NO: data.COP_NO }, function (err, info) {
                        if (err) {
                            callback(err);
                        } else {
                            message.resultdata = info;
                            if (message.exceptionflag == true) {
                                // if (info.ksdflag == true) {
                                // var pp = {
                                //     pre_entry_id: data.pre_entry_id,
                                //     updateKSDQueue: 1
                                // };
                                mq.sendToQueue(info, "exceptionQueue")
                                    .then((ok) => {
                                        console.log(`exceptionQueue ok `);
                                        winston.log('info', 'ediformhead', { pre_entry_id: info.pre_entry_id, exceptionQueue: 'exceptionQueue ok' });
                                        message.exceptionQueue = 'exceptionQueue';
                                        callback(null, message);
                                    })
                                    .catch((se) => {
                                        console.log(se);
                                        winston.log('error', 'ediformhead', se);
                                        callback(se);
                                    });

                                // mq.sendToQueue(pp, "updateKSDQueue")
                                // .then((ok) => {
                                //     console.log(`updateKSDQueue ok `);
                                //     winston.log('info', 'ediformhead', { pre_entry_id: data.pre_entry_id, updateKSDQueue: 'updateKSDQueue ok' });
                                //     callback(null, message);
                                // })
                                // .catch((se) => {
                                //     console.log(se);
                                //     winston.log('error', 'ediformhead', se);
                                //     callback(se);
                                // });
                            } else {
                                callback(null, message);
                            }
                        }
                    })
                }
            ], function (err, result) {
                if (err) {
                    console.log('A file failed to process', err);
                    winston.log('error', 'ediformhead', err);
                    call(err);
                } else {
                    // console.log(result)
                    call(null, result);
                }
            })

        }, function (err, result) {
            if (err) {
                console.log('A file failed to process', err);
                winston.log('error', 'ediformhead', err);
                cb(err);
            } else {
                cb(null, result);
            }
        })

    }


    formheadmssql.formtemporder = function (datas, cb) {
        var message = {
            updateKSDQueues: '',
            updateFormHeadQueues: '',
            exceptionQueue: '',
            formtemp: null
        };
        var data = datas;
        async.waterfall([
            function (callback) {
                app.models.formtempbase.findOne({ where: { pre_entry_id: data } }, function (err, formtempdata) {
                    if (err) {
                        winston.log('error', 'formtemporder', err);
                        callback(err);
                    } else {
                        callback(null, formtempdata)
                    }
                })
            },
            function (formtempdata, callback) {
                if (formtempdata) {
                    if (formtempdata.ksdflag == true) {
                        var pp = {
                            pre_entry_id: data,
                            updateKSDQueue: 1
                        };
                        mq.sendToQueue(pp, "updateKSDQueue")
                            .then((ok) => {
                                console.log(`updateupdateKSDQueueKSDQueun ok `);
                                winston.log('info', 'formtemporder', { pre_entry_id: pp.pre_entry_id, updateKSDQueue: 'updateKSDQueue ok' });
                                message.updateKSDQueues = 'updateKSDQueue';
                                callback(null, formtempdata);
                            })
                            .catch((se) => {
                                console.log(se);
                                winston.log('error', 'formtemporder', se);
                                callback(se);
                            });
                    } else {
                        callback(null, formtempdata)
                    }
                } else {
                    callback(null, null)
                }
            },
            function (formtempdata, callback) {
                if (formtempdata) {
                    if (formtempdata.sqlflag == true) {
                        var pp = {
                            pre_entry_id: data,
                            updateFormHeadQueue: 1
                        };
                        mq.sendToQueue(pp, "updateFormHeadQueue")
                            .then((ok) => {
                                console.log(`updateFormHeadQueue ok `);
                                winston.log('info', 'formtemporder', { pre_entry_id: pp.pre_entry_id, updateFormHeadQueue: 'updateFormHeadQueue ok' });
                                message.updateFormHeadQueues = 'updateFormHeadQueue';
                                callback(null, message)
                            })
                            .catch((se) => {
                                console.log(se);
                                winston.log('error', 'formtemporder', se);
                                callback(se);
                            });
                    } else {
                        callback(null, message)
                    }
                } else {
                    callback(null, message)
                }
            },
            function (message, callback) {
                app.models.formtempbase.upsertWithWhere({ pre_entry_id: data }, { pre_entry_id: data, sqlflag: true }, function (err, tempinfo) {
                    if (err) {
                        winston.log('error', 'formtemporder', err);
                        callback(err);
                    }
                    else {
                        message.formtemp = tempinfo;
                        winston.log('info', 'formtemporder data', tempinfo);
                        var pp = {
                            pre_entry_id: data,
                            exceptionQueue: 1
                        };
                        if (tempinfo.modifyflagentry == true || tempinfo.bzjflag == true || tempinfo.ksdcheck == true) {
                            mq.sendToQueue(pp, "exceptionQueue")
                                .then((ok) => {
                                    console.log(`exceptionQueue ok `);
                                    winston.log('info', 'formtemporder', { pre_entry_id: pp.pre_entry_id, exceptionQueue: 'exceptionQueue ok' });
                                    message.exceptionQueue = 'exceptionQueue';
                                    callback(null, message)
                                })
                                .catch((se) => {
                                    console.log(se);
                                    winston.log('error', 'formtemporder', se);
                                    callback(se);
                                });
                        } else {
                            callback(null, message)
                        }
                    }
                })
            }
        ], function (err, result) {
            if (err) {
                winston.log('error', 'formtemporder', err);
                cb(err)
            } else {
                cb(null, result)
            }
        })

    }


    formheadmssql.edicustomsresult = function (datas, cb) {
        async.mapSeries(datas, function (cusdata, call) {
            var data = {
                pre_entry_id: cusdata.pre_Entry_ID,
                bill_no: cusdata.Bill_No,
                i_e_date: cusdata.I_E_Date,
                d_date: cusdata.D_Date,
                trade_co: cusdata.Trade_Co,
                net_wt: cusdata.Net_WT,
                pack_no: cusdata.Pack_No,
                gross_wt: cusdata.Cross_WT
            };
            var message = {
                resultdata: null,
                updateCustomsQueues: '',
                exceptionQueue: '',
                exceptionflag: false,
                updatesenddataflag: false
            }
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
            if (cusdata.Channel == 'L' || cusdata.Channel == 'l') {
                message.updatesenddataflag = true;
            }
            data.ediflag = true;
            var ywdata = {
                ImportSource: "EDI回执",
                LastUpdateDate: new Date(),
                processflag: false,
                StatusDate: cusdata.Notice_Date,
                StatusName: cusdata.Channel,
                MessageMemo: cusdata.Note,
                Pre_entry_id: cusdata.pre_Entry_ID
            };
            async.waterfall([
                function (callback) {
                    app.models.YWRelatedStatusInfo.findOrCreate({ where: { StatusDate: ywdata.StatusDate, Pre_entry_id: ywdata.Pre_entry_id, ImportSource: ywdata.ImportSource, StatusName: ywdata.StatusName } }, ywdata, function (err, ywinfo, created) {
                        if (err) {
                            winston.log('error', 'edicustomsresult', err);
                            callback(err)
                        } else if (created) {
                            callback(null, ywinfo);
                        } else {
                            callback(null, null)
                        }
                    })
                },
                function (ywinfo, callback) {
                    if (ywinfo) {
                        app.models.formtempbase.findOne({ where: { pre_entry_id: data.pre_entry_id } }, function (err, formtempdata) {
                            if (err) {
                                winston.log('error', 'edicustomsresult', err);
                                callback(err);
                            } else {
                                if (formtempdata == null) {
                                    callback(null, message);
                                } else
                                    if (formtempdata.sqlflag == true) {
                                        mq.sendToQueue(data, "updateCustomsQueue")
                                            .then((ok) => {
                                                console.log(`updateCustomsQueue ok `);
                                                winston.log('info', 'edicustomsresult', { pre_entry_id: data.pre_entry_id, updateCustomsQueue: 'updateCustomsQueue ok' });
                                                message.updateCustomsQueues = 'updateCustomsQueue';
                                                callback(null, message)
                                            })
                                            .catch((se) => {
                                                console.log(se);
                                                winston.log('error', 'edicustomsresult', se);
                                                callback(se);
                                            });
                                    } else {
                                        callback(null, message);
                                    }
                            }
                        })
                    } else {
                        callback(null, null)
                    }
                },
                function (message, callback) {
                    if (message) {
                        if (message.updatesenddataflag) {
                            var senddate = cusdata.Notice_Date.substring(0, 4) + '-' + cusdata.Notice_Date.substring(4, 6) + '-' + cusdata.Notice_Date.substring(6, 8) + ' ' + cusdata.Notice_Date.substring(9, 11) + ':' + cusdata.Notice_Date.substring(11, 13) + ':' + cusdata.Notice_Date.substring(13, 15) + ':000';
                            // senddate = new Date(senddate);
                            formheadmssql.updateAll({ pre_entry_id: data.pre_entry_id }, { SendDate: senddate }, function (err, info) {
                                if (err) {
                                    winston.log('error', `edicustomsresult pre_entry_id:${data.pre_entry_id}`, err);
                                    callback(err)
                                } else {
                                    // data.Ywinfo.id = info.ywid; 
                                    if (info.count == 1) {
                                        callback(null, message);
                                    } else {
                                        winston.log('error', `edicustomsresult pre_entry_id:${data.pre_entry_id}`, { err: "no such formheadmssql" });
                                        callback(null, message);
                                    }

                                }
                            })
                        } else {
                            callback(null, message);
                        }
                    } else {
                        callback(null, null);
                    }
                },
                function (message, callback) {
                    if (message) {
                        app.models.formtempbase.upsertWithWhere({ pre_entry_id: data.pre_entry_id }, data, function (err, tempinfo) {
                            if (err) {
                                winston.log('error', 'edicustomsresult', err);
                                callback(err)
                            } else {
                                message.resultdata = tempinfo;
                                if (message.exceptionflag == true) {
                                    mq.sendToQueue(data, "exceptionQueue")
                                        .then((ok) => {
                                            console.log(`exceptionQueue ok `);
                                            winston.log('info', 'edicustomsresult', { pre_entry_id: data.pre_entry_id, exceptionQueue: 'exceptionQueue ok' });
                                            message.exceptionQueue = 'exceptionQueue';
                                            callback(null, message)
                                        })
                                        .catch((se) => {
                                            console.log(se);
                                            winston.log('error', 'edicustomsresult', se);
                                            callback(se);
                                        });
                                } else {
                                    callback(null, message);
                                }
                            }
                        })
                    } else {
                        callback(null, null)
                    }
                }
            ], function (err, result) {
                if (err) {
                    console.log(err);
                    winston.log('error', 'edicustomsresult', err);
                    call(err);
                } else {
                    call(null, result);
                }
            })
        },
            function (err, result) {
                if (err) {
                    console.log(err);
                    winston.log('error', 'edicustomsresult', err);
                    cb(err);
                } else {
                    cb(null, result);
                }
            });

    }

    formheadmssql.ksdstatusupdate = function (datas, cb) {
        // console.log(datas)
        datas = datas[0];
        var data = [];
        async.waterfall([
            function (callback) {
                if (datas.updateKSDQueue == 1) {
                    app.models.YWRelatedStatusInfo.find({ where: { and: [{ ImportSource: "KSDOrigin_ksd_form_chk" }, { Pre_entry_id: datas.pre_entry_id }] } }, function (ferr, foundarray) {
                        if (ferr) {
                            winston.log('error', `ksdstatusupdate pre_entry_id:${datas.pre_entry_id}`, ferr)
                            callback(ferr)
                        } else {
                            if (foundarray) {
                                data = foundarray;
                                callback(null, data)
                            } else {
                                callback(`no such YWRelatedStatusInfo pre_entry_id:${datas.pre_entry_id}`);
                            }
                        }
                    })
                } else if (datas.KSDstatusTosql == 1) {
                    data.push(datas);
                    callback(null, data)
                } else {
                    callback('invaild queue')
                }
            },
            function (data, callback) {
                // callback(null,data);
                async.mapSeries(data, function (msdata, call) {
                    // msdata.StatusDate = msdata.StatusDate.replace("T"," ");
                    if (msdata.StatusName == '实物放行[KSD]') {
                        console.log('实物放行 in');
                        formheadmssql.updateAll({ pre_entry_id: msdata.Pre_entry_id }, { SWFXDate: msdata.StatusDate }, function (err, info) {
                            if (err) {
                                winston.log('error', `ksdstatusupdate pre_entry_id:${msdata.Pre_entry_id} SWFXDate:${msdata.StatusDate}`, err)
                                call(err)
                            } else if (info.count == 1) {
                                winston.log('info', 'ksdstatusupdate', { pre_entry_id: msdata.Pre_entry_id, SWFXDate: msdata.StatusDate });
                                call(null, info);
                            } else {
                                call(`no such formheadmssql 实物放行 pre_entry_id:${msdata.Pre_entry_id}`)
                            }
                        })
                    } else if (msdata.StatusName == '已通过[KSD]') {
                        console.log('已通过 in');
                        formheadmssql.updateAll({ pre_entry_id: msdata.Pre_entry_id }, { TongguanDate: msdata.StatusDate }, function (err, info) {
                            if (err) {
                                winston.log('error', `ksdstatusupdate pre_entry_id:${msdata.Pre_entry_id} TongguanDate:${msdata.StatusDate}`, err)
                                call(err)
                            } else if (info.count == 1) {
                                winston.log('info', 'ksdstatusupdate', { pre_entry_id: msdata.Pre_entry_id, TongguanDate: msdata.StatusDate });
                                call(null, info);
                            } else {
                                call(`no such formheadmssql 已通过 pre_entry_id:${msdata.Pre_entry_id}`)
                            }
                        })
                    } else if (msdata.StatusName == '修改重审[KSD]') {
                        formheadmssql.findOne({ where: { pre_entry_id: msdata.Pre_entry_id } }, function (err, tempdata) {
                            if (err) {
                                winston.log('error', `ksdstatusupdate 修改重审 pre_entry_id:${tempdata.pre_entry_id} ywid:${tempdata.ywid}`, err)
                                call(err)
                            } else {
                                if (tempdata) {
                                    msdata.ywid = tempdata.ywid;
                                    app.models.decmod.upsertWithWhere({ StatusDate: msdata.StatusDate, Pre_entry_id: msdata.Pre_entry_id }, { Pre_entry_id: msdata.Pre_entry_id, StatusDate: msdata.StatusDate, StatusName: msdata.StatusName, ywid: msdata.ywid }, function (err, info) {
                                        if (err) {
                                            winston.log('error', `ksdstatusupdate 修改重审 pre_entry_id:${msdata.Pre_entry_id} StatusDate:${msdata.StatusDate} ywid:${msdata.ywid}`, err)
                                            call(err)
                                        } else {
                                            app.models.decmodmssql.upsertWithWhere({ StatusDate: msdata.StatusDate, Pre_entry_id: msdata.Pre_entry_id }, { Pre_entry_id: msdata.Pre_entry_id, StatusDate: msdata.StatusDate, StatusName: msdata.StatusName, ywid: msdata.ywid }, function (err, info) {
                                                if (err) {
                                                    winston.log('error', `ksdstatusupdate 修改重审 pre_entry_id:${msdata.Pre_entry_id} StatusDate:${msdata.StatusDate} ywid:${msdata.ywid}`, err)
                                                    call(err)
                                                } else {
                                                    winston.log('info', 'ksdstatusupdate 修改重审', { pre_entry_id: msdata.Pre_entry_id, StatusDate: msdata.StatusDate, ywid: msdata.ywid });
                                                    app.models.decmod.find({ where: { Pre_entry_id: msdata.Pre_entry_id } }, function (err, head) {
                                                        if (err) {
                                                            call(err);
                                                        } else {
                                                            var count = head.length;
                                                            app.models.decmodheadcount.upsertWithWhere({ EntryId: msdata.Pre_entry_id }, { EntryId: msdata.Pre_entry_id, ksdcount: count, com: 'KSD' }, function (err, infos) {
                                                                if (err) {
                                                                    call(err);
                                                                } else {
                                                                    call(null, info);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    call(`修改重审 no such ${msdata.Pre_entry_id}`);
                                }
                            }
                        })
                    } else if (msdata.StatusName == 'Y') {
                        console.log('Y in')
                        formheadmssql.updateAll({ pre_entry_id: msdata.Pre_entry_id }, { JGStatusCode: msdata.StatusName, JGStatusDate: msdata.StatusDate }, function (err, info) {
                            if (err) {
                                winston.log('error', `ksdstatusupdate pre_entry_id:${msdata.Pre_entry_id} JGStatusCode:${msdata.StatusName} JGStatusDate:${msdata.StatusDate}`, err)
                                call(err)
                            } else if (info.count == 1) {
                                winston.log('info', 'ksdstatusupdate', { pre_entry_id: msdata.Pre_entry_id, JGStatusCode: msdata.StatusName, JGStatusDate: msdata.StatusDate })
                                call(null, info);
                            } else {
                                call(`no such formheadmssql Y pre_entry_id:${msdata.Pre_entry_id}`)
                            }
                        })
                    } else {
                        console.log('else in')
                        formheadmssql.updateAll({ pre_entry_id: msdata.Pre_entry_id }, { JGStatusCode: msdata.StatusName }, function (err, info) {
                            if (err) {
                                winston.log('error', `ksdstatusupdate pre_entry_id:${msdata.Pre_entry_id} JGStatusCode:${msdata.StatusName}`, err)
                                call(err)
                            } else if (info.count == 1) {
                                winston.log('info', 'ksdstatusupdate', { pre_entry_id: msdata.Pre_entry_id, JGStatusCode: msdata.StatusName });
                                call(null, info);
                            } else {
                                call(`no such formheadmssql other pre_entry_id:${msdata.Pre_entry_id}`)
                            }
                        })
                    }
                }, function (err, result) {
                    if (err) {
                        winston.log('error', 'ksdstatusupdate', err)
                        callback(err)
                    } else {
                        callback(null, result)
                    }
                })
            }
        ], function (err, resultdata) {
            if (err) {
                winston.log('error', 'ksdstatusupdate', err)
                cb(err)
            } else {
                cb(null, resultdata)
            }
        })
    }


    formheadmssql.edistatusupdate = function (datas, cb) {
        // 更新opnum,goodsnum,maingoodsname,tradetotal
        var message = {
            formheadmssql: null,
            ywinfo: null
        }
        async.waterfall([
            function (callback) {
                app.models.transformhead.findOne({ where: { pre_entry_id: datas.pre_entry_id } }, function (err, formheaddata) {
                    if (err) {
                        winston.log('error', `edistatusupdate pre_entry_id:${datas.pre_entry_id}`, err)
                        callback(err);
                    } else if (formheaddata) {
                        callback(null, formheaddata);
                    } else {
                        winston.log('error', 'edistatusupdate', { err: "no such transformhead" })
                        callback(`no such transformhead pre_entry_id:${datas.pre_entry_id}`);
                    }
                })
            },
            function (formheaddata, callback) {
                // var data = getforminfo(formheaddata);
                const url = `http://${app.get('remoting').api.logicapi}:8099/transformheaddatatype`;
                const options = {
                    method: 'POST',
                    uri: url,
                    json: true, // Automatically parses the JSON string in the response,
                    timeout: 3000,
                    body: formheaddata,
                };
                request(options, (error, response, bodyu) => {
                    if (!error && response.statusCode === 200) {
                        winston.log('info', `edistatusupdates`);
                        winston.log('info', `edistatusupdates`, bodyu);
                        callback(null, bodyu);
                    } else if (error) {
                        callback('error', 'no such body', error);
                    } else {
                        callback('no body')
                    }
                });
                // console.log(`mainGoodsName:${data.mainGoodsName},GoodsNum:${data.GoodsNum},opnum:${data.opnum},oldeopnum:${data.oldeopnum},note_s:${data.note_s},bzjflag:${data.bzjflag}`)
                // console.log(`zhuandiaoflag:${data.Ywinfo.zhuandiaoflag},othertypestr1:${data.Ywinfo.othertypestr1},othertypestr:${data.Ywinfo.othertypestr}`);
            },
            function (data, callback) {
                app.models.formtempbase.upsertWithWhere({ pre_entry_id: data.pre_entry_id }, { mainGoodsName: data.mainGoodsName, GoodsNum: data.GoodsNum, opnum: data.opnum, oldeopnum: data.oldeopnum, note_s: data.note_s, bzjflag: data.bzjflag, pre_entry_id: data.pre_entry_id }, function (err, tempinfo) {
                    if (err) {
                        winston.log('error', `edistatusupdate pre_entry_id:${data.pre_entry_id}`, err)
                        callback(err)
                    } else {
                        winston.log('info', 'edistatusupdate', { tempinfo: tempinfo })
                        callback(null, data);
                    }
                })
            },
            function (data, callback) {
                console.log(data.pre_entry_id);
                var updatedata = data;
                var list = data.formlist;
                var yw = data.Ywinfo;
                var cop = data.COP_NO;
                var bzj = data.bzjflag;
                delete updatedata['Ywinfo'];
                delete updatedata['formlist'];
                delete updatedata['COP_NO'];
                delete updatedata['bzjflag'];
                formheadmssql.updateAll({ pre_entry_id: data.pre_entry_id }, updatedata, function (err, info) {
                    if (err) {
                        winston.log('error', `edistatusupdate pre_entry_id:${data.pre_entry_id}`, err);
                        callback(err)
                    } else {
                        // data.Ywinfo.id = info.ywid; 
                        if (info.count == 1) {
                            console.log(updatedata);
                            console.log(11111);
                            data.formlist = list;
                            data.Ywinfo = yw;
                            data.COP_NO = cop;
                            data.bzjflag = bzj;
                            console.log(updatedata);
                            callback(null, data);
                        } else {
                            winston.log('error', `edistatusupdate pre_entry_id:${data.pre_entry_id}`, { err: "no such formheadmssql" });
                            callback('no such formheadmssql');
                        }

                    }
                })
            },
            function (data, callback) {
                // callback(null,data.Ywinfo)
                formheadmssql.findOne({ where: { pre_entry_id: data.pre_entry_id } }, function (err, foundobj) {
                    if (err) {
                        winston.log('error', `edistatusupdate pre_entry_id:${data.pre_entry_id}`, err);
                        callback(err)
                    } else if (foundobj) {
                        data.Ywinfo.ywid = foundobj.ywid;
                        data.id = foundobj.id;
                        winston.log('info', 'edistatusupdate', { foundobj: foundobj });
                        message.formheadmssql = foundobj;
                        app.models.formlistmssql.findOne({ where: { parentID: data.id } }, function (err, foundlist) {
                            if (err) {
                                callback(err)
                            } else {
                                if (foundlist) {
                                    callback(null, data.Ywinfo);
                                } else {
                                    console.log(foundlist);
                                    async.mapSeries(data.formlist, function (formlist, call) {
                                        formlist.parentID = data.id;
                                        console.log(formlist);
                                        app.models.formlistmssql.upsertWithWhere({ pre_entry_id: formlist.pre_entry_id, g_no: formlist.g_no }, formlist, function (err, flist) {
                                            if (err) {
                                                winston.log('error', `edistatusupdate formlist pre_entry_id:${formlist.pre_entry_id} g_no: ${formlist.g_no}`, err);
                                                call(err);
                                            } else {
                                                winston.log('info', `edistatusupdate formlist`, flist);
                                                call(null, flist);
                                            }
                                        })
                                    }, function (err, result) {
                                        if (err) {
                                            winston.log('error', `edistatusupdate formlist`, err);
                                            callback(err)
                                        } else {
                                            callback(null, data.Ywinfo)
                                        }
                                    })
                                }
                            }
                        })
                        // if (foundobj.formlist == null || foundobj.formlist.length == 0){
                        //     async.mapSeries(data.formlist, function(formlist,call){
                        //         formlistmssql.upsertWithWhere({pre_entry_id:formlist.pre_entry_id,g_no:formlist.g_no},formlist,function(err, flist){
                        //             if(err){
                        //                 winston.log('error',`edistatusupdate formlist pre_entry_id:${formlist.pre_entry_id} g_no: ${formlist.g_no}`,err);
                        //                 call(err);
                        //             }else{
                        //                 winston.log('info',`edistatusupdate formlist`,flist);
                        //                 call(null,flist);
                        //             }
                        //         })
                        //     },function(err,result){
                        //         if(err){
                        //             winston.log('error',`edistatusupdate formlist`,err);
                        //             callback(err)
                        //         }else{
                        //             callback(null,data.Ywinfo)
                        //         }
                        //     })
                        // }else{
                        //     callback(null,data.Ywinfo)
                        // }
                    } else {
                        winston.log('info', `edistatusupdate pre_entry_id:${data.pre_entry_id}`, { err: "no such formheadmssql" })
                        callback('no such formheadmssql');
                    }
                })
            },
            function (ywinfo, callback) {
                if (ywinfo.zhuandiaoflag || ywinfo.othertypestr1 || ywinfo.othertypestr || ywinfo.mainpre_entry_id) {
                    ywinfo.zhuandiaoflag = ywinfo.zhuandiaoflag ? ywinfo.zhuandiaoflag : '';
                    ywinfo.othertypestr1 = ywinfo.othertypestr1 ? ywinfo.othertypestr1 : '';
                    ywinfo.othertypestr = ywinfo.othertypestr ? ywinfo.othertypestr : '';
                    ywinfo.mainpre_entry_id = ywinfo.mainpre_entry_id ? ywinfo.mainpre_entry_id : '';
                    app.models.Ywinfo.updateAll({ ID: ywinfo.ywid }, { zhuandiaoflag: ywinfo.zhuandiaoflag, othertypestr1: ywinfo.othertypestr1, othertypestr: ywinfo.othertypestr, mainpre_entry_id: ywinfo.mainpre_entry_id }, function (err, info) {
                        if (err) {
                            winston.log('error', `edistatusupdate ywid:${ywinfo.ywid}`, err);
                            callback(err);
                        } else if (info.count == 1) {
                            message.ywinfo = { zhuandiaoflag: ywinfo.zhuandiaoflag, othertypestr1: ywinfo.othertypestr1, othertypestr: ywinfo.othertypestr, mainpre_entry_id: ywinfo.mainpre_entry_id };
                            winston.log('info', 'edistatusupdate', { ID: ywinfo.ywid, zhuandiaoflag: ywinfo.zhuandiaoflag, othertypestr1: ywinfo.othertypestr1, othertypestr: ywinfo.othertypestr, mainpre_entry_id: ywinfo.mainpre_entry_id });
                            callback(null, message);
                        } else {
                            winston.log('info', `edistatusupdate ywid:${ywinfo.ywid}`, { err: "no such Ywinfo" })
                            callback('no such Ywinfo');
                        }
                    })
                } else {
                    callback(null, message);
                }
            }
        ], function (err, result) {
            if (err) {
                winston.log('error', 'edistatusupdate', err);
                cb(err);
            } else {
                cb(null, result);
            }
        })
    }

    function getforminfo(data) {
        if (data.formlist != null && data.formlist.length > 0) {
            data.mainGoodsName = data.formlist[0].g_name.substring(0, 20);
            data.GoodsNum = data.formlist.length;
            var ieflag = parseInt(data.ie_flag, 16);
            if (ieflag % 4 == 2 || ieflag % 4 == 3) {
                data.opnum = parseInt(data.GoodsNum / 9) + (data.GoodsNum % 9 == 0 && data.GoodsNum != 0 ? 0 : 1);
                data.oldeopnum = parseInt(data.GoodsNum / 9) + (data.GoodsNum % 9 == 0 && data.GoodsNum != 0 ? 0 : 1);
            }
            else {
                if (data.PrintType != "KSD打单") {
                    data.opnum = parseInt(data.GoodsNum / 8) + (data.GoodsNum % 8 == 0 && data.GoodsNum != 0 ? 0 : 1);
                }
                else {
                    data.opnum = parseInt(data.GoodsNum / 5) + (data.GoodsNum % 5 == 0 && data.GoodsNum != 0 ? 0 : 1);
                }
                data.oldeopnum = parseInt(data.GoodsNum / 5) + (data.GoodsNum % 5 == 0 && data.GoodsNum != 0 ? 0 : 1);
            }
        }
        if (data.note_s) {
            var notes = "";
            if (data.note_s.substring(0, 1) == "/") {
                notes = data.note_s.substring(1, data.note_s.length - 1);
            }
            else {
                notes = data.note_s;
            }
            if (!data.Ywinfo) {
                data.Ywinfo = {};
            }

            if (data.DECL_PORT != "2228" && data.DECL_PORT != null) {
                var re = new RegExp("[CJ]\\d{13}\\S*转|转\\S*[CJ]\\d{13}");
                if (notes.match(re)) {
                    data.Ywinfo.zhuandiaoflag = "调拨";
                }
                else if (notes.indexOf("分送集报") != -1) {
                    data.Ywinfo.zhuandiaoflag = "调拨";
                }
                else if (data.i_e_port && data.DECL_PORT && data.DECL_PORT.substring(0, 2) == "22" && data.i_e_port.substring(0, 2) != "22") {
                    data.Ywinfo.zhuandiaoflag = "转关(区外)";
                }
                else if (data.trade_mode == "1200") {
                    data.Ywinfo.zhuandiaoflag = "转关(区内)";
                }
                else if (data.note_s.indexOf("转至") != -1 || data.note_s.indexOf("转自") != -1) {
                    data.Ywinfo.zhuandiaoflag = "转关(区内)";
                }
                else {
                    data.Ywinfo.zhuandiaoflag = "";
                }
            } else {
                data.Ywinfo.zhuandiaoflag = "";
            }
            var sArray = notes.split(/[//@ ]/);
            if (sArray.length > 2) {
                if (sArray[1].length == 4) {
                    data.Ywinfo.othertypestr1 = sArray[1];
                }
            }
            sArray.forEach(note => {
                if (note.indexOf("转自") != -1 || note.indexOf("转至") != -1) {
                    var othertype = note.replace("转自", "").replace("转至", "");
                    data.Ywinfo.othertypestr = note.replace("转自", "").replace("转至", "");
                    data.Ywinfo.othertypestr = othertype.substring(0, 20);
                }
            })
        } else {
            if (!data.Ywinfo) {
                data.Ywinfo = {};
            }
        }
        if (data.trade_mode == "2600") {
            data.bzjflag = true;
        } else {
            data.bzjflag = false;
        }
        // cb(null, data);
        return data;
    }


    formheadmssql.remoteMethod(
        'findspreadmodel', {
            http: { path: '/findspreadmodel', verb: 'get' },
            accepts: { arg: 'COPNO', type: 'string' },
            returns: { type: 'object', root: true }
        }
    );


    formheadmssql.remoteMethod(
        'updateksdentry', {
            http: { path: '/updateksdentry', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'object', root: true }
        }
    );



    formheadmssql.remoteMethod(
        'ediformhead', {
            http: { path: '/ediformhead', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'object', root: true }
        }
    );

    formheadmssql.remoteMethod(
        'edicustomsresult', {
            http: { path: '/edicustomsresult', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'object', root: true }
        }
    );

    formheadmssql.remoteMethod(
        'formtemporder', {
            http: { path: '/formtemporder', verb: 'get' },
            accepts: { arg: 'pre_entry_id', type: 'string' },
            returns: { type: 'object', root: true }
        }
    );

    formheadmssql.remoteMethod(
        'ksdstatusupdate', {
            http: { path: '/ksdstatusupdate', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'object', root: true }
        }
    );



    // formheadmssql.remoteMethod(
    //     'getforminfo', {
    //         http: { path: '/getforminfo', verb: 'post' },
    //         accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    //         returns: { type: 'object', root: true }
    //     }
    // );

    formheadmssql.remoteMethod(
        'edistatusupdate', {
            http: { path: '/edistatusupdate', verb: 'post' },
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { type: 'object', root: true }
        }
    );
};





function transdate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + "年" + month + "月" + day + "日";
}



var field = {
    Entry_ID: "pre_entry_id",
    TRAF_NAME: "traf_name",
    BILL_NO: "bill_no",
    TRADE_NAME: "trade_name",
    APPR_NO: "appr_no",
    createdate: "create_date",
    TRADE_MODE: "trade_mode",
    I_E_DATE: "i_e_date",
    ENTRY_ID: "pre_entry_id",
    AGENT_CODE_R: "agent_code",
    PACK_NO_R: "pack_no",
    GROSS_WT_R: "gross_wt",
    TRAF_MODE_R: "traf_mode",
    TRAF_NAME_R: "traf_name",
    BILL_NO_R: "bill_no",
    ENTRY_ID_R: "pre_entry_id",
    entry_id: "pre_entry_id",
    e_date: "i_e_date",
    TRADE_CO: "trade_co",
    I_E_FLAG: "ie_flag",
    NOTES: 'note_s',
    OWNER_NAME: "owner_name",
    REC_DATE: "TongguanDate"
}


var obj = {
    "ie_flag": "string",
    "pre_entry_id": "string",
    "customs_id": "string",
    "manual_no": "string",
    "contr_no": "string",
    "i_e_date": "string",
    "d_date": "string",
    "trade_co": "string",
    "trade_name": "string",
    "owner_code": "string",
    "owner_name": "string",
    "agent_code": "string",
    "agent_name": "string",
    "traf_mode": "string",
    "traf_name": "string",
    "voyage_no": "string",
    "bill_no": "string",
    "trade_mode": "string",
    "cut_mode": "string",
    "in_ratio": "string",
    "pay_way": "string",
    "lisence_no": "string",
    "trade_country": "string",
    "distinate_port": "string",
    "district_code": "string",
    "appr_no": "string",
    "trans_mode": "string",
    "fee_mark": "string",
    "fee_rate": "string",
    "fee_curr": "string",
    "insur_mark": "string",
    "insur_rate": "string",
    "insur_curr": "string",
    "other_mark": "string",
    "other_rate": "string",
    "other_curr": "string",
    "pack_no": "string",
    "wrap_type": "string",
    "gross_wt": "string",
    "net_wt": "string",
    "ex_source": "string",
    "type_er": "string",
    "entry_group": "string",
    "is_status": "string",
    "username": "string",
    "create_date": "string",
    "del_flag": "string",
    "RaDeclNo": "string",
    "RaManualNo": "string",
    "StoreNo": "string",
    "PrdtID": "string",
    "i_e_port": "string",
    "note_s": "string",
    "print_date": "string",
    "SUP_FLAG": "string",
    "CollectTax": "string",
    "Two_Audit": "string",
    "chk_surety": "string",
    "BILL_TYPE": "string",
    "PaperLessTax": "string",
    "Tax_Amount": "string",
    "is_status_old": "string",
    "Tax_No": "string",
    "CBE": "string",
    "TRADE_CO_SCC": "string",
    "AGENT_CODE_SCC": "string",
    "OWNER_CODE_SCC": "string",
    "EDI_NO": "string",
    "COP_NO": "string",
    "DECL_PORT": "string",
    "TongguanDate": "2017-03-01T00:00:00.000Z",
    "SWFXDate": "2017-03-01T00:00:00.000Z",
    "yearno": "string",
    "Processflag": "string",
    "id": "58b6656e7cf542ad7b5396b5"
}

var dateArr = ['DECL_DATE', 'REC_DATE', 'I_E_DATE', 'REC_TIME', 'REL_TIME_R', 'd_date', 'e_date', 'DECL_DATE', 'FIT_DATE', 'RSLT_DATE'];

function transform(dataObj) {
    for (var i = 0; i < dateArr.length; i++) {
        var d = dateArr[i];
        for (k in dataObj) {
            if (k == d) {
                dataObj[d] = dealsDate(dataObj[d]);
            }
        }
    }

    for (i in dataObj) {
        for (j in field) {
            if (i == j) {
                var key = field[j];
                dataObj[key] = dataObj[j];
            }
        }
    }
    return dataObj;
}



function dealDate(datestr) {
    datestr = datestr.toString();
    if (datestr.length == 8) {
        datestr = datestr + '00';
    }
    else if (datestr.length == 6) {
        datestr = '20' + datestr + '00';
    }
    datestr = datestr.substring(0, 4) + '-' + datestr.substring(4, 6) + '-' + datestr.substring(6, 8) + 'T' + datestr.substring(8, 10) + ':00:00.000Z';
    datestr = new Date(datestr);
    return datestr;
}

function dealsDate(datestr) {
    datestr = datestr.toString();
    if (datestr.length == 8) {
        datestr = datestr + '00';
    }
    else if (datestr.length == 6) {
        datestr = '20' + datestr + '00';
    }
    datestr = datestr.substring(0, 4) + '-' + datestr.substring(4, 6) + '-' + datestr.substring(6, 8) + ' ' + datestr.substring(8, 10) + ':00:00:000';
    return datestr;
}