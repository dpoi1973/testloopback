// 'use strict';
// var request = require('supertest');
// var expect = require('chai').expect;
// var async = require('async');
// var sampledata = require('./sampledata/testksdentry.json');

// var tt =[{
//     "Entry_ID":"221020171000023184",
//     "TRAF_NAME":"NES80134471",
//     "BILL_NO":"11219354985",
//     "DECL_CO":"3120980025",
//     "TRADE_CO":"3122240460",
//     "DECL_NAME":"上海万历报关有限公司",
//     "TRADE_NAME":"上海慧与有限公司",
//     "DECL_DATE":"170209",
//     "PROCESS_STATUS":"已通过",
//     "NOTES":"",
//     "REC_DATE":"2017020908    ",
//     "REC_TIMA":"",
//     "APPR_NO":"BFYE020602",
//     "OWNER_NAME":"",
//     "AutoIncrease":898622,
//     "createdate":"2017-02-09T08:19:39.953",
//     "TRADE_MODE":"0110",
//     "I_E_DATE":"20170201",
//     "REC_TIME":"",
//     "NoteError":null,
//     "errorflag":false,
//     "Updatememo":null,
//     "Datastatus":0,
//     "sqlflag":true
// }]

// var newpreid = '221020171000023184';

// describe('updateksdentry ', function () {
//   var formtemp = null;
//   const methodname = 'updateksdentry';
//   const modelname = 'formheadmssqls';


//   before(function (done) {
//     request = request(global.server);
//     //request(`http://0.0.0.0:5001/api/formheadmssqls/edicustomesresult/`)
//     formtemp = global.app.models.formtempbase;

//     console.log('before ')
//     formtemp.destroyAll({}, (err, obj) => {
     
//       async.each(sampledata,(value,cb)=>{
//           formtemp.create(value,(err,obj)=>{
//               cb(err,obj);
//           })
//         },(err,results)=>{
//             done(err);
            

//       });
//     });
//   });
//   after(function (done) {


//     formtemp.destroyAll({ }, (err, obj) => {
//       done(err);
//     //   console.log(obj)

//     });

//   });
//   describe('#allnew', () => {

//     before((done) => {
//       formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {
//         done(err);
//         // console.log(obj);
//         formtemp.create({});

//       });
//     });
//     after((done) => {
//       formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {

//         done(err);
//         // console.log(obj)

//       });


//     })


//     it('it have copno ', (done) => {
//       request.post(`/api/${modelname}/${methodname}`)
//         .send(tt)
//         .expect(200)
//         .end((err, res) => {
//           // assert.isError(err);
//           expect(err).to.be.null;
//           expect(res.body.formtemp).to.have.property('pre_entry_id', '221020171000023184');
//         //   expect(res.body[0].resultdata).to.have.property('sqlflag', false);
//         //   expect(res.body[0].resultdata).to.have.property('ksdflag', true);
//         expect(res.body.ywinfo).to.have.property('Pre_entry_id', '221020171000023184');
//           expect(res.body.KSDstatusTosqls).to.equal('KSDstatusTosql');
//           done(err);
          

//         });

//     });

//     it('it have copno ', (done) => {
//     tt[0].sqlflag = false;
//     tt[0].PROCESS_STATUS = '修改重审';
//     tt[0].formcheck = 1;
//       request.post(`/api/${modelname}/${methodname}`)
//         .send(tt)
//         .expect(200)
//         .end((err, res) => {
//           // assert.isError(err);
//           expect(err).to.be.null;
//           expect(res.body.formtemp).to.have.property('pre_entry_id', '221020171000023184');
//             expect(res.body.formtempmodify).to.have.property('pre_entry_id', '221020171000023184');
//             expect(res.body.ywinfo).to.have.property('Pre_entry_id', '221020171000023184');
//             expect(res.body.formtemp).to.have.property('ksdmodify', true);
//             expect(res.body.formtemp).to.have.property('ksdcheck', true);
//             expect(res.body.formcheck).to.have.property('pre_entry_id', '221020171000023184');
//           done(err);
          

//         });

//     });


//   });


// });




