'use strict';
var request = require('supertest');
var expect = require('chai').expect;
var async = require('async');
var sampledata = require('./sampledata/testsample.json');






const newpreid = '223320171000000001';
describe('ediformhead ', function () {
  var formtemp = null;
  const methodname = 'ediformhead';
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
      request.post(`/api/${modelname}/${methodname}`)
        .send(sampledata)
        .expect(200)
        .end((err, res) => {
          // assert.isError(err);
          expect(err).to.be.null;
          expect(res.body[0].resultdata).to.have.property('pre_entry_id', '221820171000206429');
          expect(res.body[0].resultdata).to.have.property('sqlflag', false);
          expect(res.body[0].resultdata).to.have.property('ksdflag', true);
          expect(res.body[0].updateFormHeadQueues).to.be.empty;
          expect(res.body[0].KSDstatusTosqls).to.equal('KSDstatusTosql');
          expect(res.body[1].resultdata).to.have.property('pre_entry_id', '221820171000206430');
          expect(res.body[1].resultdata).to.have.property('sqlflag', true);
          expect(res.body[1].resultdata).to.have.property('ksdflag', false);
          expect(res.body[1].updateFormHeadQueues).to.equal('updateFormHeadQueue');
          expect(res.body[1].KSDstatusTosqls).to.be.empty;
          done(err);
          

        });

    });

    it('it have not copno ', (done) => {
        sampledata[0].pre_entry_id = '221820171000206428';
        sampledata[1].pre_entry_id = '221820171000206427';
      request.post(`/api/${modelname}/${methodname}`)
        .send(sampledata)
        .expect(200)
        .end((err, res) => {
          // assert.isError(err);
          expect(err).to.be.null;
          expect(res.body[0].resultdata).to.have.property('pre_entry_id', '221820171000206428');
          expect(res.body[0].resultdata).to.have.property('sqlflag', false);
          expect(res.body[0].resultdata).to.have.property('ksdflag', true);
          expect(res.body[0].updateFormHeadQueues).to.be.empty;
          expect(res.body[0].KSDstatusTosqls).to.be.empty;
          expect(res.body[1].resultdata).to.have.property('pre_entry_id', '221820171000206427');
          expect(res.body[1].resultdata).to.have.property('sqlflag', true);
          expect(res.body[1].resultdata).to.have.property('ksdflag', false);
          expect(res.body[1].updateFormHeadQueues).to.equal('updateFormHeadQueue');
          expect(res.body[1].KSDstatusTosqls).to.be.empty;
          done(err);
          

        });

    });


  });


});
