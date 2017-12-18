module.exports = function (app) {
    // var mysqlDs = app.dataSources.testmysql;
    // mysqlDs.automigrate('workstatus', err => {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(null, 'clientuser ok!');
    // })
    // mysqlDs.automigrate('billinfomysql', err => {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(null, 'clientuser ok!');


    // })
    // mysqlDs.automigrate('ywbillmysql', err => {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(null, 'clientuser ok!');


    // })

    // mysqlDs.automigrate('billcostinfo', err => {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(null, 'clientuser ok!');


    // })

    // mysqlDs.automigrate('billformheadinfo', err => {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(null, 'clientuser ok!');


    // })

    // mysqlDs.automigrate('billralist', err => {
    //     if (err)
    //         console.log(err)
    //     else
    //         console.log(null, 'clientuser ok!');


    // })
    /*  var mysqlDs = app.dataSources.productmysql;
    
    
      async.series([
          function(cb) {
            mysqlDs.automigrate('gridColumnModel', err => {
              if (err)
                cb(err)
    
              else
    
                cb(null, 'gridColumnModel ok!');
    
    
            })
          },
          function(cb) {
            mysqlDs.automigrate('gridoption', err => {
              if (err) {
                console.log(err);
                cb(err);
              }
    
              cb(null, 'gridoption ok!');
    
            })
          },
          function(cb) {
            var Gridoption = app.models.Gridoption;
            Gridoption.create([{
                applicationName: 'Bel Cafe',
                gridModelName: 'Vancouver',
                columns: [{ columnName: 'test', columnTitle: 'zzzz' }]
              },
              { applicationName: 'Three Bfee House', gridModelName: 'San Mateo' },
              { applicationName: 'Caffe Artigiano', gridModelName: 'Vancouver' },
            ], function(err, data) {
              if (err)
                cb(err);
              else
                cb(null, data);
            });
          }
        ],
        
        // optional callback
        function(err, results) {
          if (err)
            console.log(err);
          else
            console.log(results);
          // results is now equal to ['one', 'two']
        });
    */
    // mysqlDs.automigrate('Gridoption', function(err) {
    //     if (err) return cb(err);
    //     var Gridoption = app.models.Gridoption;
    //     Gridoption.create([{
    //             applicationName: 'Bel Cafe',
    //             gridModelName: 'Vancouver',
    //             columns: [{ columnName: 'test', columnTitle: 'zzzz' }]
    //         },
    //         { applicationName: 'Three Bees Coffee House', gridModelName: 'San Mateo' },
    //         { applicationName: 'Caffe Artigiano', gridModelName: 'Vancouver' },
    //     ], cb);
    // });


}