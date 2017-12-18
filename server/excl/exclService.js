var Excel = require('exceljs');
var app = require('../server');


var Client = require('mysql').createConnection({
    host: app.get('remoting').api.mysqlapi,
    user: 'parauser',
    password: '',
    database: 'qqautodb',
    charset: 'UTF8',
  });
// var config = {
//     user: 'poweruser',
//     password: 'system',
//     server: '192.168.0.133', // You can use 'localhost\\instance' to connect to named instance
//     database: 'Classifytestpl',
//     timeout:30000,
// }

// var sqlClient = require('mssql')
// exports.getinvoicedetailmssql = function (inv_no, callback){
//   console.log(inv_no);
//   inv_no = inv_no.toString();
//     sqlClient.connect(config).then(() => {
//         return sqlClient.query`select cg.CnName,cg.ManuPlace,cg.HsCode,cg.Quantity,cg.QuantityUnitCode,cg.Quantity_Sta,cg.QuantityUnitCode_sta,cg.PackQuantity,cg.PackUnitCode,cg.Amount,cg.MoneyUnitCode,cg.HsCodeDesc,cg.CiqCode,cg.CiqName,ca.inv_no FROM dbo.Ciq_In_Apl_Goods cg left join dbo.Ciq_In_Apl ca on ca.Id = cg.Parentid where ca.inv_no = '${inv_no}'`;
//     }).then(result => {
//         sqlClient.close();
//         console.log(result);
//         callback(result.recordset);
//     }).catch(err => {
//         // ... error checks
//         console.log(err);
//     })
// }

exports.getinvoicedetail  = function (sql, callback){
    Client.query(sql, function selectCb(err, results, fields) {  
        if (err) {  
          console.log(err);
            throw err;  
        } 
        console.log(results.length)
        callback(results);
    });
}

exports.xls = function(_columns,_data,_filename,callback){
var start_time = new Date();
var workbook = new Excel.stream.xlsx.WorkbookWriter({
  filename: _filename
});
var worksheet = workbook.addWorksheet('Sheet');


console.log(_data[5])
for(var i=0;i<_data.length;i++){
  _data[i].item = i+1;
  for(var key in _data[i]){
    if(_data[i][key]==null || _data[i][key]==undefined){
      _data[i][key] = '';
    }
  }
}

worksheet.columns = _columns;
var data = _data;
var length = data.length;

// 当前进度
var current_num = 0;
var time_monit = 400;
var temp_time = Date.now();

console.log('开始添加数据',length);
// 开始添加数据
for(let i in data) {
    console.log(i)
  worksheet.addRow(data[i]).commit();
  current_num = i;
  if(Date.now() - temp_time > time_monit) {
    temp_time = Date.now();
    console.log((current_num / length * 100).toFixed(2) + '%');
  }
}
console.log('添加数据完毕：', (Date.now() - start_time));
workbook.commit();

var end_time = new Date();
var duration = end_time - start_time;

console.log('用时：' + duration);
console.log("程序执行完毕");
setTimeout(function() {
  callback(_filename);
}, 2000);
}


exports.xlstwosheet = function(_columns1,_data1,_columns2,_data2,_filename,callback){
var start_time = new Date();
var workbook = new Excel.stream.xlsx.WorkbookWriter({
  filename: _filename
});
var worksheet1 = workbook.addWorksheet('Sheet1');
var worksheet2 = workbook.addWorksheet('Sheet2');


for(var i=0;i<_data1.length;i++){
  _data1[i].item = i+1;
  for(var key in _data1[i]){
    if(_data1[i][key]==null || _data1[i][key]==undefined){
      _data1[i][key] = '';
    }
  }
}

for(var i=0;i<_data2.length;i++){
  _data2[i].item = i+1;
  for(var key in _data2[i]){
    if(_data2[i][key]==null || _data2[i][key]==undefined){
      _data2[i][key] = '';
    }
  }
}

worksheet1.columns = _columns1;
var data1 = _data1;
var length1 = data1.length;

// 当前进度
var current_num1 = 0;
var time_monit1 = 400;
var temp_time1 = Date.now();

console.log('开始添加数据',length1);
// 开始添加数据
for(let i in data1) {
    console.log(i)
  worksheet1.addRow(data1[i]).commit();
  current_num1 = i;
  if(Date.now() - temp_time1 > time_monit1) {
    temp_time1 = Date.now();
    console.log((current_num1 / length1 * 100).toFixed(2) + '%');
  }
}
console.log('添加数据完毕：', (Date.now() - start_time));
// workbook1.commit();



worksheet2.columns = _columns2;
var data2 = _data2;
var length2 = data2.length;

// 当前进度
var current_num2 = 0;
var time_monit2 = 400;
var temp_time2 = Date.now();

console.log('开始添加数据',length2);
// 开始添加数据
for(let i in data2) {
    console.log(i)
  worksheet2.addRow(data2[i]).commit();
  current_num2 = i;
  if(Date.now() - temp_time2 > time_monit2) {
    temp_time2 = Date.now();
    console.log((current_num2 / length2 * 100).toFixed(2) + '%');
  }
}
console.log('添加数据完毕：', (Date.now() - start_time));
workbook.commit();

var end_time = new Date();
var duration = end_time - start_time;

console.log('用时：' + duration);
console.log("程序执行完毕");
setTimeout(function() {
  callback(_filename);
}, 2000);
}