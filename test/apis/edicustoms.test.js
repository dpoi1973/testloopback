// 'use strict';
// var request = require('supertest');
// var expect = require('chai').expect;
// var async = require('async');
// var sampledata = require('./sampledata/testsample.json');
// var customsdata = require('./sampledata/testcustoms.json');





// const newpreid = '223320171000000001';
// describe('edicustomsresult ', function () {
//   var formtemp = null;
//   const methodname = 'edicustomsresult';
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
//         .send(customsdata)
//         .expect(200)
//         .end((err, res) => {
//           // assert.isError(err);
//           expect(err).to.be.null;
//           expect(res.body[0].resultdata).to.have.property('pre_entry_id', '221820171000206429');
//           expect(res.body[0].resultdata).to.have.property('sqlflag', false);
//           expect(res.body[0].resultdata).to.have.property('ediflag', true);
//           expect(res.body[0].resultdata).to.have.property('edicheck', true);
//           expect(res.body[0].updateCustomsQueues).to.be.empty;
//           expect(res.body[1].resultdata).to.have.property('pre_entry_id', '221820171000206430');
//           expect(res.body[1].resultdata).to.have.property('sqlflag', true);
//           expect(res.body[1].resultdata).to.have.property('ediflag', true);
//           expect(res.body[1].updateCustomsQueues).to.equal('updateCustomsQueue');
//           done(err);
          

//         });

//     });


//     it('it have copno ', (done) => {
//     customsdata[0].pre_Entry_ID = '221820171000206422';
//       request.post(`/api/${modelname}/${methodname}`)
//         .send(customsdata)
//         .expect(200)
//         .end((err, res) => {
//           // assert.isError(err);
//           expect(err).to.be.null;
//           expect(res.body[0].resultdata).to.have.property('pre_entry_id', '221820171000206422');
//           expect(res.body[0].resultdata).to.have.property('sqlflag', false);
//           expect(res.body[0].resultdata).to.have.property('edicheck', true);
//           expect(res.body[0].updateCustomsQueues).to.be.empty;
//           expect(res.body[0].resultdata).to.have.property('ediflag', true);
//           expect(res.body[1].resultdata).to.have.property('pre_entry_id', '221820171000206430');
//           expect(res.body[1].resultdata).to.have.property('sqlflag', true);
//           expect(res.body[1].resultdata).to.have.property('ediflag', true);
//           expect(res.body[1].updateCustomsQueues).to.equal('updateCustomsQueue');
//           done(err);
          

//         });

//     });


//   });


// });
