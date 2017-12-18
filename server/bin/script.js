var loopback = require('loopback');
var fs = require('fs');
var ds = loopback.createDataSource('mssql', {
    "host": "192.168.0.132",
    "port": 1433,
    "database": "classifyTestPL",
    "username": "poweruser",
    "password": "system",
    "connector": "mssql"
});
//,
// "sqlserverdb": {
//   "host": "192.168.0.132",
//   "port": 1433,
//   "database": "classifyTestPL",
//   "username": "poweruser",
//   "password": "system",
//   "name": "sqlserverdb",
//   "connector": "mssql"
// }

console.log('testddd');

// Discover and build models from INVENTORY table

ds.discoverSchema('tbl_custgoods', null)
    .then(function(defs) {


        // console.log(JSON.stringify(defs));
        fs.writeFile('../../common/models/tblcustgoods.json', JSON.stringify(defs), (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        });

    });