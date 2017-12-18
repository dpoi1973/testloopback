// 'use strict';
// var request = require('supertest');
// var expect = require('chai').expect;
// var async = require('async');
// var sampledata = require('./sampledata/testsample.json');






// const newpreid = '223320171000000001';
// describe('formtemporder ', function () {
//   var formtemp = null;
//   const methodname = 'formtemporder';
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
//       console.log(obj)

//     });

//   });
//   describe('#allnew', () => {

//     before((done) => {
//       formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {
//         done(err);
//         console.log(obj);
//         formtemp.create({});

//       });
//     });
//     after((done) => {
//       formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {

//         done(err);
//         console.log(obj)

//       });


//     })


//     it('it should insert into mongo ', (done) => {

//       request.get(`/api/${modelname}/${methodname}`)
//         .query({ pre_entry_id: newpreid })
//         .expect(200)
//         .end((err, res) => {
//           // assert.isError(err);
//           expect(err).to.be.null;
//           expect(res.body.formtemp).to.have.property('pre_entry_id', newpreid);
//           expect(res.body.formtemp).to.have.property('sqlflag', true);
//           expect(res.body.updateKSDQueues).to.be.empty;
//           expect(res.body.updateFormHeadQueues).to.be.empty;
//           done(err);
          

//         });

//     });
//     it('shold send ksdquene',(done)=>{
//         const pre_entry_id = '221820171000206429';
//         request.get(`/api/${modelname}/${methodname}`)
//         .query({ pre_entry_id: pre_entry_id })
//         .expect(200)
//         .end((err, res) => {
//           // assert.isError(err);
//           expect(err).to.be.null;


//           expect(res.body.formtemp).to.have.property('pre_entry_id', pre_entry_id);
//           expect(res.body.formtemp).to.have.property('sqlflag', true);
//           expect(res.body.updateKSDQueues).to.equal('updateKSDQueue');
          
//           done(err);

//         });


//     });
//      it('shold send ediqueue',(done)=>{
//         const pre_entry_id = '221820171000206430';
//         request.get(`/api/${modelname}/${methodname}`)
//         .query({ pre_entry_id: pre_entry_id })
//         .expect(200)
//         .end((err, res) => {
//           // assert.isError(err);
//           expect(err).to.be.null;


//           expect(res.body.formtemp).to.have.property('pre_entry_id', pre_entry_id);
//           expect(res.body.formtemp).to.have.property('sqlflag', true);
//          // expect(res.body.updateKSDQueue).to.equal('updateKSDQueue');
//           expect(res.body.updateFormHeadQueues).to.equal('updateFormHeadQueue');
          
//           done(err);

//         });


//     });






//   });


// });
