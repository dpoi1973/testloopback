module.exports = function(billcostinfo) {
    // add post to createorupdate oneby one to test 效率

  billcostinfo.insertbatch = function(datas, cb) {
      billcostinfo.create(
            datas, function(err, createdModel, created) {
              if (err) {
                  cb(err, err);
                } else {
                  cb(null, createdModel);
                }
            });
    };

  billcostinfo.remoteMethod(
        'insertbatch', {
          http: {path: '/insertbatch', verb: 'post'},
          accepts: {arg: 'datas', type: 'array', http: {source: 'body'}},
          returns: {type: 'array', root: true},
        }
    );
};
