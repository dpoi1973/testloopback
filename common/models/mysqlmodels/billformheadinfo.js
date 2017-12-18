module.exports = function(billformheadinfo) {
    billformheadinfo.insertbatch = function(datas, cb) {
      billformheadinfo.create(
            datas, function(err, createdModel, created) {
              if (err) {
                  cb(err, err);
                } else {
                  cb(null, createdModel);
                }
            });
    };

  billformheadinfo.remoteMethod(
        'insertbatch', {
          http: {path: '/insertbatch', verb: 'post'},
          accepts: {arg: 'datas', type: 'array', http: {source: 'body'}},
          returns: {type: 'array', root: true},
        }
    );
};
