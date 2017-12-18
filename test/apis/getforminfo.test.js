'use strict';
var request = require('supertest');
var expect = require('chai').expect;
var async = require('async');
var sampledata = require('./sampledata/getforminfo.json');


const newpreid = '223320171000000001';
describe('getforminfo', function () {
  var formtemp = null;
  const methodname = 'getforminfo';
  const modelname = 'formheadmssqls';
  //request = request(global.server);

  before(function (done) {
    request = request(global.server);
    //request(`http://0.0.0.0:5001/api/formheadmssqls/edicustomesresult/`)
    // formheadmssqls = global.app.models.formheadmssqls;

    // console.log('before ')
    // formtemp.destroyAll({}, (err, obj) => {
     
    //   async.each(sampledata,(value,cb)=>{
    //       formtemp.create(value,(err,obj)=>{
    //           cb(err,obj);
    //       })
    //     },(err,results)=>{
    //         done(err);
            

    //   });
    // });
    done();
  });
//   after(function (done) {


//     formtemp.destroyAll({ }, (err, obj) => {
//       done(err);
//     //   console.log(obj)

//     });


  describe('#allnew', () => {

    before((done) => {
    //   formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {
    //     done(err);
    //     // console.log(obj);
    //     formtemp.create({});

    //   });
    done();
    });
    // after((done) => {
    //   formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {

    //     done(err);
    //     // console.log(obj)

    //   });


    // })


    it('it have copno ', (done) => {
      //request.post(`/api/${modelname}/${methodname}`)
      request.post(`/api/formheadmssqls/getforminfo`)
        .send(sampledata)
        .expect(200)
        .end((err, res) => {
          // assert.isError(err);
          expect(err).to.be.null;
          expect(res.body[0].resultdata).to.have.property('pre_entry_id', '221620171000014889');
          expect(res.body[0].resultdata).to.have.property('opnum', 1);
          expect(res.body[0].resultdata).to.have.property('zhuandiaoflag', "转关");
          done(err);
          

        });

    });

  });

  });
