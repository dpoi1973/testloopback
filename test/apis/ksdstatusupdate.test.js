'use strict';
var request = require('supertest');
var expect = require('chai').expect;
var async = require('async');
var sampledata = require('./sampledata/testsample.json');
var customsdata = require('./sampledata/testcustoms.json');



const newpreid = '223320171000000001';
describe('ksdstatusupdate ', function () {
  var formtemp = null;
  const methodname = 'ksdstatusupdate';
  const modelname = 'formheadmssqls';


  before(function (done) {
    request = request(global.server);
    //request(`http://0.0.0.0:5001/api/formheadmssqls/edicustomesresult/`)
    formtemp = global.app.models.formtempbase;

    console.log('before ')
    formtemp.destroyAll({}, (err, obj) => {
     
      async.each(sampledata,(value,cb)=>{
          formtemp.create(value,(err,obj)=>{
              cb(err,obj);
          })
        },(err,results)=>{
            done(err);
            

      });
    });
  });
  after(function (done) {


    formtemp.destroyAll({ }, (err, obj) => {
      done(err);
    //   console.log(obj)

    });

  });
  describe('#allnew', () => {

    before((done) => {
      formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {
        done(err);
        // console.log(obj);
        formtemp.create({});

      });
    });
    after((done) => {
      formtemp.destroyAll({ pre_entry_id: newpreid }, (err, obj) => {

        done(err);
        // console.log(obj)

      });


    })


    it('it have copno ', (done) => {
        console.log(modelname+methodname)
        sampledata[0].pre_entry_id = '221020171000023184';
        sampledata[0].updateKSDQueue =1;
      request.post(`/api/${modelname}/${methodname}`)
        .send(sampledata[0])
        .expect(200)
        .end((err, res) => {
          // assert.isError(err);
          expect(err).to.be.null;
          done(err);
          

        });

    });


  });


});
