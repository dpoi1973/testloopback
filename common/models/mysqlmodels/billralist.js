module.exports = function (billralist) {
    billralist.insertbatch = function (datas, cb) {
        billralist.create(
            datas, function (err, createdModel, created) {
                if (err) {
                    cb(err, err);
                } else {
                    cb(null, createdModel);
                }
            });
    };

    billralist.remoteMethod(
        'insertbatch', {
            http: { path: '/insertbatch', verb: 'post' },
            accepts: { arg: 'datas', type: 'array', http: { source: 'body' } },
            returns: { type: 'array', root: true },
        }
    );
};
