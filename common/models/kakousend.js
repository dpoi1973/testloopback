'use strict'
var async = require('async');
var count = 0;
module.exports = function (kakousend) {
    // add post to createorupdate oneby one to test 效率

    kakousend.createorUpdatebatch = function (datas, cb) {
        let resultdata = [];
        let tt = count++;
        //  console.log(datas[0].pre_entry_id,'begin----',datas[datas.length-1].pre_entry_id,' index',tt);
        async.each(datas, function (data, callback) {
            if (data.id < 0) {
                delete data.id;
                kakousend.create(data, function (err, info) {
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
            else {
                kakousend.updateAll({ id: data.id }, data, function (err, info) {
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
            //delete data.CreateAt;
            // kakousend.findOrCreate({ where: { id: data.id } }, data, function (err, foundobj, created) {

            //     if (err) {
            //         //   console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin created',data.pre_entry_id,' index',tt);
            //         callback(err);
            //     }
            //     else if (created) {
            //         resultdata.push(foundobj);
            //         callback()
            //     } else {
            //         if (foundobj) {
            //             kakousend.updateAll({ id: data.id }, data, function (err, info) {
            //                 if (err) {
            //                     //      console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin updat',data.pre_entry_id,' index',tt);
            //                     callback(err);
            //                 }
            //                 else {
            //                     resultdata.push(info);
            //                     callback();
            //                 }
            //             })
            //         }
            //     }
            // });
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


    kakousend.deletebatch = function (datas, cb) {

        //delete data.CreateAt;
        kakousend.destroyAll({ id: { inq: datas } }, function (err, res) {
            if (err) {
                cb(err, err);
            }
            else {
                cb(null, res);
            }

        });
    };

    kakousend.remoteMethod(
        'createorUpdatebatch', {
            http: { path: '/createorUpdateBatch', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'array', root: true },
        }
    );

    kakousend.remoteMethod(
        'deletebatch', {
            http: { path: '/deletebatch', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'array', root: true },
        }
    );
};