'use strict'
var async = require('async');
var count = 0;
var app = require('../../../server/server');

module.exports = function (transcustomresult) {
    // add post to createorupdate oneby one to test 效率

    transcustomresult.createorUpdatebatch = function (datas, cb) {
        let resultdata = [];
        let tt = count++;
        //  console.log(datas[0].pre_entry_id,'begin----',datas[datas.length-1].pre_entry_id,' index',tt);
        async.each(datas, function (data, callback) {

            // Perform operation on file here.
            data.Datastatus = 2;
            //data._id=uuid.v1();

            data.UserName = data.username;
            data.errorflag = false;
            data.versionid = null;
            data.Updatememo = "";



            data.MessageCreateDate = Date.parse(new Date());


            delete data.username;
            delete data.CreateAt;
            delete data.UpdateAt;
            delete data.SUP_RESULT_INFO;
            delete data.TODO_FLAG;


            transcustomresult.findOrCreate({ where: { CID: data.CID } }, data, function (err, foundobj, created) {

                if (err) {
                    //   console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin created',data.pre_entry_id,' index',tt);
                    callback(err);
                }
                else if (created) {
                    resultdata.push(foundobj);
                    callback()
                } else {
                    if (foundobj) {
                        transcustomresult.updateAll({ CID: data.CID }, data, function (err, info) {
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


    // transcustomresult.movebatch = function (datas, cb) {
    //     let resultdata = [];
    //     let tt = count++;
    //     //  console.log(datas[0].pre_entry_id,'begin----',datas[datas.length-1].pre_entry_id,' index',tt);skip: i, limit: 1000
    //     console.log('start');
    //     var total = 14962;
    //     var i = 0;

    //     app.models.Customsresults.find({}, function (ferr, foundarray) {
    //         if (ferr) {
    //             cb(ferr);
    //         }
    //         else {
    //             console.log(foundarray.length);
    //             async.each(foundarray, function (data, callback) {

    //                 // Perform operation on file here.
    //                 data.Datastatus = 2;
    //                 //data._id=uuid.v1();

    //                 data.UserName = data.username;
    //                 data.errorflag = false;
    //                 data.versionid = null;
    //                 data.Updatememo = "";



    //                 data.MessageCreateDate = Date.parse(new Date());


    //                 delete data.username;
    //                 delete data.CreateAt;
    //                 delete data.UpdateAt;
    //                 delete data.SUP_RESULT_INFO;
    //                 delete data.TODO_FLAG;


    //                 transcustomresult.findOrCreate({ where: { CID: data.CID } }, data, function (err, foundobj, created) {

    //                     if (err) {
    //                         //   console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin created',data.pre_entry_id,' index',tt);
    //                         callback(err);
    //                     }
    //                     else if (created) {
    //                         resultdata.push(foundobj);
    //                         callback()
    //                     } else {
    //                         if (foundobj) {
    //                             callback()
    //                         }
    //                     }
    //                 });
    //             },
    //                 function (err) {
    //                     // console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   end',' index',tt);
    //                     // if any of the file processing produced an error, err would equal that error
    //                     if (err) {
    //                         // One of the iterations produced an error.
    //                         // All processing will now stop.
    //                         console.log('A file failed to process', err, tt);
    //                         cb(err, err);

    //                     } else {
    //                         // console.log('All files have been processed successfully');
    //                         cb(null, resultdata);
    //                     }
    //                 });
    //         }

    //     })


    // };

    transcustomresult.remoteMethod(
        'createorUpdatebatch', {
            http: { path: '/createorUpdateBatch', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'array', root: true },
        }
    );


    // transcustomresult.remoteMethod(
    //     'movebatch', {
    //         http: { path: '/movebatch', verb: 'post' },
    //         accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
    //         returns: { type: 'array', root: true },
    //     }
    // );
};

