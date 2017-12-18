module.exports = function (attachinfo) {
    var app = require('../../../server/server');
    const MQServices = require('../../../server/RabbitMQ/mqService');
    var mq = new MQServices('edifileback');
    attachinfo.getfileback = function (data, cb) {


        var filetype = {};
        filetype["00000001"] = "发票";
        filetype["00000002"] = "装箱单";
        filetype["00000003"] = "提运单";
        filetype["00000004"] = "合同";
        filetype["00000005"] = "其他1";
        filetype["00000006"] = "其他2";
        filetype["00000007"] = "其他3";

        filetype["00000008"] = "代理报关委托协议";
        filetype["10000001"] = "电子代理委托协议";
        filetype["10000002"] = "减免税货物税款担保证明";
        filetype["10000003"] = "减免税货物税款担保延期证明";

        var addresslist = {};
        addresslist["WLE1"] = "207抓取";
        addresslist["WLH2"] = "207抓取";
        addresslist["WLDO"] = "207抓取";
        addresslist["DLH1"] = "207抓取";
        addresslist["WLN1"] = "机场抓取";
        addresslist["WLA2"] = "机场抓取";
        addresslist["WLD3"] = "机场抓取";
        addresslist["WLD5"] = "机场抓取";
        addresslist["DLDB"] = "机场抓取";
        addresslist["WLH3"] = "近铁抓取";
        addresslist["WLH1"] = "近铁抓取";
        addresslist["WLC1"] = "近铁抓取";
        addresslist["WLDA"] = "近铁抓取";
        addresslist["WLDE"] = "物流园区抓取";
        addresslist["WLD7"] = "物流园区抓取";
        addresslist["WLH6"] = "物流园区抓取";
        //获取传参
        app.models.formheadmssql.findOne({ where: { pre_entry_id: data.pre_entry_id } }, function (err, form) {
            if (form) {
                app.models.Ywinfo.findOne({ where: { ID: form.ywid } }, function (err, yw) {
                    // 新建attachinfo
                    var newname = data.pre_entry_id + filetype[data.filetype] + ".pdf";
                    var URI = "FTP://" + app.get('remoting').api.ftpapi + "/" + data.pre_entry_id + "/" + data.ftpfilename;
                    var username = data.username;
                    var file = {};
                    file.pre_entry_id = form.COP_NO;
                    file.fileurl = URI;
                    file.CreateDate = new Date();
                    file.filename = newname;
                    // file.filelength=data.filesize;
                    file.filetype = filetype[data.filetype];
                    attachinfo.findOrCreate({ where: { pre_entry_id: file.pre_entry_id, filetype: file.filetype } }, file, function (err, file) {
                        //新建summarylog
                        var log = {};
                        log.level = "success";
                        log.realpre_entry_id = form.pre_entry_id;
                        log.pre_entry_id = form.COP_NO;
                        log.message = "报关单" + form.pre_entry_id + "保存成功";
                        log.logType = "Summary";
                        log.createdate = new Date();
                        if (addresslist[username]) {
                            log.address = addresslist[username];
                        }
                        else {
                            log.address = username;
                        }
                        if (yw != null) {
                            log.wldandang = yw.WLDandang;
                        }
                        console.log(form.COP_NO);
                        app.models.Summarylog.upsertWithWhere({ pre_entry_id: form.COP_NO }, log, function (err, file) {
                            // 更新formhead summaryflag
                            app.models.formheadmssql.updateAll({ COP_NO: form.COP_NO }, { Summaryflag: true }, function (err, info) {
                                cb(err, info);
                            });
                        })
                    })
                })
            }
            else {
                // 更新失败 放入队列 下次更新
                mq.sendToQueue(data, "edifileback")
                cb('lack of pre');
            }
        })

    }

    attachinfo.testfileback = function (data, cb) {

        data.pre_entry_id = '223320171001555450';
        var filetype = {};
        filetype["00000001"] = "发票";
        filetype["00000002"] = "装箱单";
        filetype["00000003"] = "提运单";
        filetype["00000004"] = "合同";
        filetype["00000005"] = "其他1";
        filetype["00000006"] = "其他2";
        filetype["00000007"] = "其他3";

        filetype["00000008"] = "代理报关委托协议";
        filetype["10000001"] = "电子代理委托协议";
        filetype["10000002"] = "减免税货物税款担保证明";
        filetype["10000003"] = "减免税货物税款担保延期证明";

        var addresslist = {};
        addresslist["WLE1"] = "207抓取";
        addresslist["WLH2"] = "207抓取";
        addresslist["WLDO"] = "207抓取";
        addresslist["DLH1"] = "207抓取";
        addresslist["WLN1"] = "机场抓取";
        addresslist["WLA2"] = "机场抓取";
        addresslist["WLD3"] = "机场抓取";
        addresslist["WLD5"] = "机场抓取";
        addresslist["DLDB"] = "机场抓取";
        addresslist["WLH3"] = "近铁抓取";
        addresslist["WLH1"] = "近铁抓取";
        addresslist["WLC1"] = "近铁抓取";
        addresslist["WLDA"] = "近铁抓取";
        addresslist["WLDE"] = "物流园区抓取";
        addresslist["WLD7"] = "物流园区抓取";
        addresslist["WLH6"] = "物流园区抓取";
        //获取传参
        app.models.formheadmssql.findOne({ where: { pre_entry_id: data.pre_entry_id } }, function (err, form) {
            if (form) {
                app.models.Ywinfo.findOne({ where: { ID: form.ywid } }, function (err, yw) {
                    // 新建attachinfo
                    var newname = data.pre_entry_id + data.filetype + ".pdf";
                    var URI = "FTP://" + app.get('remoting').api.ftpapi + "/" + data.pre_entry_id + "/" + data.filename;
                    var username = data.username;
                    var file = {};
                    file.pre_entry_id = form.COP_NO;
                    file.fileurl = URI;
                    file.CreateDate = new Date();
                    file.filename = newname;
                    // file.filelength=data.filesize;
                    file.filetype = data.filetype;
                    file.fileid = '';
                    file.batchNo = '';
                    file.packname = '';
                    file.order = '';
                    app.models.attachinfotest.findOrCreate({ where: { pre_entry_id: file.pre_entry_id, filetype: file.filetype } }, file, function (err, file) {
                        //新建summarylog
                        var log = {};
                        log.level = "success";
                        log.realpre_entry_id = form.pre_entry_id;
                        log.pre_entry_id = form.COP_NO;
                        log.message = "报关单" + form.pre_entry_id + "保存成功";
                        log.logType = "Summary";
                        log.createdate = new Date();
                        if (addresslist[username]) {
                            log.address = addresslist[username];
                        }
                        else {
                            log.address = username;
                        }
                        if (yw != null) {
                            log.wldandang = yw.WLDandang;
                        }
                        console.log(form.COP_NO);
                        app.models.Summarylogtest.upsertWithWhere({ pre_entry_id: form.COP_NO }, log, function (err, file) {
                            // 更新formhead summaryflag
                            cb(err, file);
                            // app.models.formheadmssql.updateAll({ COP_NO: form.COP_NO }, { Summaryflag: true }, function (err, info) {
                            //     cb(err, info);
                            // });
                        })
                    })
                })
            }
            else {
                // 更新失败 放入队列 下次更新
                // mq.sendToQueue(data, "edifileback")
                cb('lack of pre');
            }
        })

    }

    attachinfo.remoteMethod(
        'getfileback', {
            http: { path: '/getfileback', verb: 'post' },
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { type: 'object', root: true }
        }
    );

    attachinfo.remoteMethod(
        'testfileback', {
            http: { path: '/testfileback', verb: 'post' },
            accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
            returns: { type: 'object', root: true }
        }
    );

};