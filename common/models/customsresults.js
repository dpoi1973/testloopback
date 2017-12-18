'use strict'
var async = require('async');

module.exports = function (Customsresults) {

 let insertcount=0;
       let updatecount=0;
  Customsresults.createorUpdatebatch = function (datas, cb) {
       let resultdata = [];
       
    async.each(datas, (data, callback) => {

      // Perform operation on file here.
      //var mdata = new Customsresults(data);
      delete data.CreateAt;
      data.UpdateAt=new Date();

      Customsresults.findOrCreate({where:{CID:data.CID}},data,function(err, foundobj, created) {

       if (err){
          //   console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin created',data.pre_entry_id,' index',tt);
            callback(err);
          }
          else if (created) {
            resultdata.push(foundobj);
            insertcount++;
            callback()
          } else {
            if (foundobj) {
              Customsresults.updateAll({CID: data.CID }, data, function(err, info) {
                if (err)
                {
              //      console.log(datas[0].customs_id,'----',datas[datas.length-1].customs_id+'   errin updat',data.pre_entry_id,' index',tt);
                  callback(err);
                }
                else {
                  updatecount++;
                  insertcount++;
                  resultdata.push(info);
                  callback();
                }
              })
            }
          }
      })
        
      
    }, function (err) {
      // if any of the file processing produced an error, err would equal that error
      if (err) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('A file failed to process');
        cb(err);

      } else {
        console.log('All files have been processed successfully',insertcount,'update count ',updatecount);
        
        cb(null, resultdata);
      }
    });
  

  };

  Customsresults.remoteMethod(
    'createorUpdatebatch', {
      http: { path: '/createorUpdateBatch', verb: 'post' },
      accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
      returns: { type: 'array', root: true },
    }
  );

};
