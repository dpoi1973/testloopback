  'use strict'
var async = require('async');
var count=0;
module.exports = function (Formheadbase) {

  // add post to createorupdate oneby one to test 效率

  Formheadbase.createorUpdatebatch = function (datas, cb) {
      let resultdata = [];
      let tt=count++;
    //  console.log(datas[0].pre_entry_id,'begin----',datas[datas.length-1].pre_entry_id,' index',tt);
      async.each(datas, function(data, callback){

        // Perform operation on file here.
        data.yearno = data.pre_entry_id.substr(4, 4);
        data.UpdateAt=new Date();
     

        // var mdata= new Formheadbase(data);
        delete data.CreateAt;
        Formheadbase.findOrCreate({where:{ pre_entry_id:data.pre_entry_id}}, data, function(err, foundobj, created) {

          if (err){
          //   console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin created',data.pre_entry_id,' index',tt);
            callback(err);
          }
          else if (created) {
            resultdata.push(foundobj);
            callback()
          } else {
            if (foundobj) {
              Formheadbase.updateAll({pre_entry_id: data.pre_entry_id }, data, function(err, info) {
                if (err)
                {
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
        console.log('A file failed to process',err,tt);
        cb(err, err);

      } else {
       // console.log('All files have been processed successfully');
        cb(null, resultdata);
      }
    });
};

Formheadbase.remoteMethod(
  'createorUpdatebatch', {
    http: { path: '/createorUpdateBatch', verb: 'post' },
    accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
    returns: { type: 'array', root: true },
  }
);
};
