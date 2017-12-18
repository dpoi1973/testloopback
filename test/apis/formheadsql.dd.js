// 'use strict';
// var assert = require('assert');
// var request = require('supertest');
// const data = '221820171000212580';
// describe('KSDEntry', function() {
//     describe('no edit',()=>{
//               it('should be return username',(done)=>{
//             request(`http://0.0.0.0:5001/api/formheadmssqls/formtemporder/?pre_entry_id=${data}`)
//             .get('')
//            // .post('/ControllerActionAuth/register')
//             // .field('username', registersuser.username)
//             // .field('password',registersuser.password)
//             .expect(200)
//             .end((err,res)=>{
//                 console.log(err,res.body);
                
//                 // const resultuser=res.body;
//                 assert.ifError(err);
//                 // assert.ifError(resultuser.error);
//                 // assert.equal(resultuser.username,registersuser.username);
//                 done(err);
//             });

//         })
//          });

// });


// const data = {"Entry_ID":"221820171000206421","TRAF_NAME":"NKR55193666","BILL_NO":"18012160083","DECL_CO":"3120980025","TRADE_CO":"3122445095","DECL_NAME":"上海万历报关有限公司","TRADE_NAME":"金士顿科技(上海)有限公司","DECL_DATE":"170303","PROCESS_STATUS":"已通过","NOTES":"","REC_DATE":"2017030313    ","REC_TIMA":"","APPR_NO":"","OWNER_NAME":"","AutoIncrease":905624,"createdate":"2017-03-03T13:53:37.747+08:00","TRADE_MODE":"1234","I_E_DATE":"20170303","REC_TIME":"","NoteError":null,"errorflag":false,"Updatememo":null,"Datastatus":0}
// describe('KSDEntry', function() {
//     describe('no edit',()=>{
//               it('should be return username',(done)=>{
//             request(`http://0.0.0.0:5001/api/formheadmssqls/updateksdentry/`)
//             .post('')
//             .send(data)
//            // .post('/ControllerActionAuth/register')
//             // .field('username', registersuser.username)
//             // .field('password',registersuser.password)
//             .expect(200)
//             .end((err,res)=>{
//                 console.log(err,res.body);
                
//                 // const resultuser=res.body;
//                 assert.ifError(err);
//                 // assert.ifError(resultuser.error);
//                 // assert.equal(resultuser.username,registersuser.username);
//                 done(err);
//             });

//         })
//          });

// });


// const data = {
//     "errorflag" : false,
//     "Datastatus" : 1,
//     "versionid" : null,
//     "Updatememo" : null,
//     "ywinfo" : null,
//     "tiyundaninfo" : null,
//     "ie_flag" : "8",
//     "pre_entry_id" : "224620170000021657",
//     "customs_id" : "224620170000021657",
//     "manual_no" : "",
//     "contr_no" : "INV4291496",
//     "i_e_date" : "",
//     "d_date" : "2017-02-09",
//     "trade_co" : "3104941520",
//     "trade_name" : "英特奈国际纸业投资(上海)有限公司",
//     "owner_code" : "3104941520",
//     "owner_name" : "英特奈国际纸业投资(上海)有限公司",
//     "agent_code" : "3120980025",
//     "agent_name" : "上海万历报关有限公司",
//     "traf_mode" : "X",
//     "traf_name" : "",
//     "voyage_no" : "",
//     "bill_no" : "",
//     "trade_mode" : "0110",
//     "cut_mode" : "101",
//     "in_ratio" : "",
//     "pay_way" : "",
//     "lisence_no" : "",
//     "trade_country" : "142",
//     "distinate_port" : "142",
//     "district_code" : "31049",
//     "appr_no" : "",
//     "trans_mode" : "3",
//     "fee_mark" : "",
//     "fee_rate" : "",
//     "fee_curr" : "",
//     "insur_mark" : "",
//     "insur_rate" : "",
//     "insur_curr" : "",
//     "other_mark" : "",
//     "other_rate" : "",
//     "other_curr" : "",
//     "pack_no" : "4",
//     "wrap_type" : "5",
//     "gross_wt" : "830.4",
//     "net_wt" : "715.2",
//     "ex_source" : "0(0)",
//     "type_er" : "0",
//     "entry_group" : "Entr",
//     "is_status" : "4",
//     "username" : "WLH6",
//     "create_date" : "2017-02-09 12:05:13",
//     "del_flag" : "0",
//     "RaDeclNo" : "",
//     "RaManualNo" : "",
//     "StoreNo" : "",
//     "PrdtID" : "",
//     "i_e_port" : "2246",
//     "note_s" : "/W4600003201701101653/1010/56包",
//     "print_date" : "",
//     "ywid" : "",
//     "opnum" : 0,
//     "pinflag" : 0,
//     "IEDZType" : "",
//     "GoodsNum" : 0,
//     "PaperlessFlag" : false,
//     "PrintType" : "",
//     "CurrFSMState" : "初始状态",
//     "FSMName" : "",
//     "CreatePersonName" : "",
//     "DepartName" : "",
//     "LastupdatePerson" : "",
//     "TempleteName" : "",
//     "ie_flagName" : null,
//     "PaperlessType" : "",
//     "DutyFlag" : false,
//     "Dutyflag" : false,
//     "Ywno" : "",
//     "Custname" : "",
//     "ShendanPersonName" : "",
//     "ShendanFinishDate" : null,
//     "TongguanDate" : null,
//     "SWFXDate" : null,
//     "CollectTax" : "0",
//     "Two_Audit" : "",
//     "chk_surety" : "0",
//     "BILL_TYPE" : "",
//     "PaperLessTax" : "",
//     "Tax_Amount" : "0",
//     "is_status_old" : "3",
//     "Tax_No" : "",
//     "CBE" : "",
//     "TRADE_CO_SCC" : "",
//     "AGENT_CODE_SCC" : "",
//     "OWNER_CODE_SCC" : "",
//     "PROMISE_ITMES" : "0000",
//     "TRADE_AREA_CODE" : "142",
//     "EDI_REMARK_2" : "",
//     "promiseflag1" : null,
//     "promiseflag2" : null,
//     "promiseflag3" : null,
//     "promiseflag4" : null,
//     "EDI_NO" : "EDI178000017543890",
//     "COP_NO" : "BG201702KWGQ002577",
//     "TGWSTATUS" : null,
//     "DECL_PORT" : "2246",
//     "YNWO" : null,
//     "ZhidanPersonId" : null,
//     "ZhidanPersonName" : null,
//     "CustYwno" : null,
//     "mainGoodsName" : null,
//     "billcustname" : null,
//     "formlist" : [ 
//         {
//             "errorflag" : false,
//             "Datastatus" : 2,
//             "versionid" : null,
//             "Updatememo" : null,
//             "pre_entry_id" : "224620170000021657",
//             "g_no" : "0",
//             "seqno" : "1",
//             "code_t" : "48237000",
//             "code_s" : "",
//             "g_name" : "纸压制件",
//             "g_model" : "模制|纸浆制|长*宽141.09毫米*79.17毫米|无需报",
//             "qty_1" : "89400.00000",
//             "g_unit" : "007",
//             "decl_price" : "0.0666",
//             "trade_total" : "5954.04",
//             "trade_curr" : "502",
//             "qty_conv" : "715.20000",
//             "unit_1" : "035",
//             "ver_no" : "",
//             "prdt_no" : "",
//             "use_to" : "",
//             "origin_country" : "142",
//             "contr_item" : "",
//             "qty_2" : "",
//             "unit_2" : "",
//             "duty_mode" : "1",
//             "work_usd" : "",
//             "create_date" : "星期四,2017年2",
//             "entry_group" : "ABCD",
//             "ControlMark" : "",
//             "GrossWeight" : "0",
//             "NetWeight" : "0",
//             "DutyRate" : "0",
//             "VATRate" : "0",
//             "GSTRate" : "0",
//             "USDRate" : "0",
//             "USDTotal" : "0",
//             "OtherMemo" : "",
//             "CFlag" : false,
//             "YFlag" : false,
//             "Qty" : "0",
//             "productid" : null,
//             "TotalNOs" : null,
//             "markValue" : null,
//             "ShangjianMark" : null,
//             "DESTINATION_COUNTRY" : "142"
//         }
//     ],
//     "EDocFilelist" : [],
//     "Containlist" : [],
//     "CerList" : [],
//     "CustomsResultList" : [],
//     "FSMNextEventName" : null,
//     "QuanshenbaoState" : null,
//     "fajianflag" : null,
//     "SendDate" : null,
//     "zuofeiflag" : false,
//     "JGStatusDate" : null,
//     "JGStatusCode" : null,
//     "JGStatusName" : null,
//     "scanPdfDownloadflag" : false,
//     "WLDandang" : null,
//     "GroupName" : null,
//     "NValue" : "0",
//     "InputTypeName" : "其他",
//     "zhuandiaoflag" : null,
//     "DutyClearDate" : null,
//     "Scanflag" : false,
//     "JiedanMemo" : null,
//     "totaldays" : 0,
//     "dutyReceiveDate" : null,
//     "dutySendoutDate" : null,
//     "dutyQianshouDate" : null,
//     "xietongMsg" : null,
//     "oldeopnum" : 0,
//     "YWFSMCurrState" : null,
//     "YWSDate" : null,
//     "BillBinaryValue" : null,
//     "BillTypeDetails" : null
// };

// describe('KSDEntry', function() {
//     describe('no edit',()=>{
//               it('should be return username',(done)=>{
        //     request(`http://0.0.0.0:5001/api/formheadmssqls/edicustomesresult/`)
        //     .post('')
        //     .send(data)
        //    // .post('/ControllerActionAuth/register')
        //     // .field('username', registersuser.username)
        //     // .field('password',registersuser.password)
        //     .expect(200)
        //     .end((err,res)=>{
        //         console.log(err,res.body);
                
        //         // const resultuser=res.body;
        //         assert.ifError(err);
        //         // assert.ifError(resultuser.error);
        //         // assert.equal(resultuser.username,registersuser.username);
        //         done(err);
        //     });
//         done();

//         })
//          });

// });
