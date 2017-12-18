'use strict'
var async = require('async');
var uuid = require('node-uuid');
var mongo = require('mongodb');
var count = 0;
module.exports = function (transformhead) {
    // add post to createorupdate oneby one to test 效率

    transformhead.createorUpdatebatch = function (datas, cb) {
        let resultdata = [];
        let tt = count++;
        //  console.log(datas[0].pre_entry_id,'begin----',datas[datas.length-1].pre_entry_id,' index',tt);
        async.each(datas, function (data, callback) {

            // Perform operation on file here.
            data.Datastatus = 2;
            //data._id=uuid.v1();

            var arr = new Buffer(16); // -> [] 


            var GUID = new mongo.Binary(uuid.v1(null, arr, 0), 3);
            data.id = GUID;

            data.CreateDate=Date.parse(new Date());
            data.Lastupdatedate=Date.parse(new Date());

            // var _id = uuid.v1();
            // var responseData = new Buffer(_id, "binary");
            // data._id = new Buffer(_id, "hex");
            delete data.yearno;
            delete data.CreateAt;
            delete data.SUP_FLAG;
            delete data.UpdateAt;

            var certlist = data.certlist;
            delete data.certlist;
            data.CerList = certlist;
            // data.Containlist = data.container;
            delete data.container;
            var co = 0;
            for (var i = 0; i < data.formlist.length; i++) {
                delete data.formlist[i].FORM_LIST_GUID;
                delete data.formlist[i].SUP_TYPE;
            }

            transformhead.findOrCreate({ where: { EDI_NO: data.EDI_NO } }, data, function (err, foundobj, created) {

                if (err) {
                    //   console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin created',data.pre_entry_id,' index',tt);
                    callback(err);
                }
                else if (created) {
                    resultdata.push(foundobj);
                    callback()
                } else {
                    if (foundobj) {
                        transformhead.updateAll({ EDI_NO: data.EDI_NO }, data, function (err, info) {
                            if (err) {
                                //      console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin updat',data.pre_entry_id,' index',tt);
                                callback(err);
                            }
                            else {
                                resultdata.push(info);
                                callback();
                            }
                        })
                    }
                }
            });
        },
            function (err) {
                // console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   end',' index',tt);
                // if any of the file processing produced an error, err would equal that error
                if (err) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('A file failed to process', err, tt);
                    cb(err, err);

                } else {
                    // console.log('All files have been processed successfully');
                    cb(null, resultdata);
                }
            });
    };

    transformhead.remoteMethod(
        'createorUpdatebatch', {
            http: { path: '/createorUpdateBatch', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'array', root: true },
        }
    );
};

