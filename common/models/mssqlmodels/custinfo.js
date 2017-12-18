var async = require('async')

module.exports = function(Custinfo) {
  var exclService = require('../../../server/excl/exclService');
  var fs = require('fs');


  Custinfo.downloadso = function(ywinfoid,res, cb) {
    try{
        var sql = `select  t.pre_entry_id,t.pre_entry_id as pre_entry_id1,custid,'SO',shipto,soldto,ifnull(contr_no,'') as contr_no,ifnull(billno,'') as billno,ifnull(voyage_no,'') as voyage_no,sku,ocoo, sum(qty1) as uomqty,sum(netweight) as netweight,
        -- cast((gross_wt/net_wt)*sum(netweight) as decimal(10,2)) as singlegw,sum(qty1) as qty1,sum(qtyc) as qtyc,
        cast(sum(totalpriceCIF) as decimal(10,2))as totalpriceCIF,ManualItemID,g_model,
        gross_wt,net_wt,pack_no,venderid ,curr,'WL' as carrierid,'' as key1,'' as key2,'' as key3,'' as key4,'' as key5,concat( t.kwesku, lpad( concat(t.kid),8,'0')) as kwksu from (
        select JSON_UNQUOTE(productdetailjson->"$.SHIP_TO") as shipto,JSON_UNQUOTE(productdetailjson->'$.SOLD_TO') as soldto,fh.pre_entry_id ,'INDITEX' as custid,(select billNo from tiyundaninfo where ywinfoid = ${ywinfoid}) as billno,fh.voyage_no,i.sku,ocoo,curr,qty1 as uomqty,qtyc,qty1,i.netweight, totalpriceCIF,fh.gross_wt,fh.net_wt, fh.pack_no,'998Z' as venderid ,fl.g_no ,fh.contr_no,i.ManualItemID,g_model,i.combineid,fl.id,k.kwesku,k.id as kid from  invoicedetailinfo i 
        left join formlist fl on  JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$') -- fl.combineid = i.combineid 
        left join formhead fh on fl.parentid = fh.id and fh.ie_flag='A' 
        left join kweskuinfo k on i.sku = k.sku and i.hscode = k.hscode 
        where i.ywinfoid=${ywinfoid}  
        and fh.ywid = ${ywinfoid} 
        ) t group by 
        t.pre_entry_id,custid,billno,voyage_no,sku,ocoo,curr,gross_wt,net_wt,pack_no,g_no,contr_no,ManualItemID,g_model,shipto,soldto,kwesku,kid
        order by pre_entry_id, cast(g_no as UNSIGNED)`;
        console.log(sql)
        exclService.getinvoicedetail(sql, function(data){
            var colums = [
            { header: '序号', key: 'item' },
            { header: 'h#OMKey', key: 'pre_entry_id' },   
            { header: 'H#OMReference1', key: 'pre_entry_id1' },
            { header: 'H#CustomerId', key: 'custid' },
            { header: 'H#OMType', key: 'SO' },
            { header: 'H#ConsigneeId', key: 'soldto' },
            { header: 'H#ISSUEPARTYID', key: 'key1' },
            { header: 'H#OMReference4', key: 'shipto' },
            { header: 'H#INCOTERM', key: 'key2' },
            { header: 'H#OMReference3', key: 'contr_no' },//contractid
            { header: 'h#MAWB', key: 'billno' },
            // { header: 'h#HAWB1', key: 'voyage_no' },
            { header: 'H#CarrierId', key: 'carrierid' },
            { header: 'H#totalGrossWeight', key: 'gross_wt' },
            { header: 'H#CS', key: 'pack_no' },
            { header: 'H#Cube', key: 'key3' },
            { header: 'D#SKU', key: 'kwksu' },            
            { header: 'D#lotatt08', key: 'ocoo' },
            { header: 'D#orderedQty', key: 'uomqty' },
            { header: 'D#REALNETWEIGHT', key: 'netweight' },
            { header: 'D#totalPrice', key: 'totalpriceCIF' },
            { header: 'D#userDefine1', key: '' },
            { header: 'D#userDefine7', key: 'key5' }];
            var filename = 'so.xlsx';
            async.waterfall([
                function (callback){
                    exclService.xls(colums,data,filename,function(result){
                        callback(null,result);
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err)
                }else{
                    const rr = fs.createReadStream('so.xlsx');
                    rr.pipe(res);
                    cb(null, rr, 'application/octet-stream');
                }
            })
        })
        }catch(err){
            cb(err);
        }
  };


// Custinfo.downloadsonotes = function(ywinfoid,res, cb) {
//         try{
//         var sql = `select p.sku,f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE") as bundle,sum(Qty) as qty,p.OCOO,p.curr,concat('MD-', lpad( concat(max(sk.id)),8,'0')) as kwsku,max(JSON_UNQUOTE(productdetailjson->"$.SHIP_TO")) as shipto,'' as yy,p.Cgoodsname,p.HScode,p.Cspec from invoicedetailinfo p
// left join formlist l on JSON_CONTAINS(l.combinejson,cast(p.id as json),'$')
// left join formhead f on l.parentid=f.id
// left join ywinfo yw on yw.ID=p.ywinfoid
// left join kweskuinfo sk on p.sku=sk.sku and p.hscode=sk.hscode
// where p.ywinfoid=${ywinfoid}  and f.ywid=${ywinfoid}
// and yw.ID=${ywinfoid}
// and f.ie_flag='A'
// group by p.sku,f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE"),OCOO,p.curr,p.Cgoodsname,p.HScode,p.Cspec`;

//         var sql1 = `select f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE") as bundle,max(JSON_UNQUOTE(productdetailjson->"$.SHIP_TO")) as shipto,'' as yy  from invoicedetailinfo p
// left join formlist l on JSON_CONTAINS(l.combinejson,cast(p.id as json),'$')
// left join formhead f on l.parentid=f.id
// left join ywinfo yw on yw.ID=p.ywinfoid
// left join kweskuinfo sk on p.sku=sk.sku and p.hscode=sk.hscode
// where p.ywinfoid=${ywinfoid}  and f.ywid=${ywinfoid}
// and yw.ID=${ywinfoid}
// and f.ie_flag='A'
// group by f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE")`;
//         exclService.getinvoicedetail(sql, function(data1){
//             exclService.getinvoicedetail(sql1, function(data2){
//             var p1 = objnum(data1);
//             var p2 = objnum(data2);
//             var colums1 = [
//             { header: '调拨单号', key: '' },
//             { header: '万历单号', key: 'pre_entry_id' },
//             { header: '品名', key: 'Cgoodsname' },   
//             { header: '税号', key: 'HScode' },
//             { header: '成分含量', key: 'Cspec' }, 
//             { header: '托盘号', key: '' },
//             { header: '箱号', key: 'bundle' },
//             { header: 'MD料号', key: 'sku' },
//             { header: '调拨料号', key: 'kwsku' },
//             { header: '原产国', key: 'OCOO' },
//             { header: '数量', key: 'qty' },
//             { header: '是否混箱', key: 'yy' },
//             { header: '目的地', key: 'shipto' }];
//             var colums2 = [
//             { header: '调拨单号', key: '' },
//             { header: '万历单号', key: 'pre_entry_id' },   
//             { header: '托盘号', key: '' },
//             { header: '箱号', key: 'bundle' },
//             { header: '是否混箱', key: 'yy' },
//             { header: '目的地', key: 'shipto' }];
//             var filename = 'sonotes.xlsx';
//             async.waterfall([
//                 function (callback){
//                     exclService.xlstwosheet(colums1,data1,colums2,data2,filename,function(result){
//                         callback(null,result);
//                     })
//                 }
//             ],function(err,result){
//                 if(err){
//                     cb(err)
//                 }else{
//                     const rr = fs.createReadStream('sonotes.xlsx');
//                     rr.pipe(res);
//                     cb(null, rr, 'application/octet-stream');
//                 }
//             })
//           })
//         })
//         }catch(err){
//             cb(err);
//         }
//   };



Custinfo.downloadsonotesN = function(ywinfoid,ie_flag,res, cb) {
    try{
        var sql = `select p.sku,f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE") as bundle,sum(Qty) as qty,p.OCOO,p.curr,concat('MD-', lpad( concat(max(sk.id)),8,'0')) as kwsku,max(JSON_UNQUOTE(productdetailjson->"$.SHIP_TO")) as shipto,'' as yy,p.Cgoodsname,p.HScode,cu.Cspec from invoicedetailinfo p
left join formlist l on JSON_CONTAINS(l.combinejson,cast(p.id as json),'$')
left join formhead f on l.parentid=f.id
left join ywinfo yw on yw.ID=p.ywinfoid
left join kweskuinfo sk on p.sku=sk.sku and p.hscode=sk.hscode 
left join custproductdetailinfo cu on p.sku=cu.sku
where p.ywinfoid=${ywinfoid}  and f.ywid=${ywinfoid}
and yw.ID=${ywinfoid}
and f.ie_flag=${ie_flag}
group by p.sku,f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE"),OCOO,p.curr,p.Cgoodsname,p.HScode,cu.Cspec`;

        var sql1 = `select f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE") as bundle,max(JSON_UNQUOTE(productdetailjson->"$.SHIP_TO")) as shipto,'' as yy  from invoicedetailinfo p
left join formlist l on JSON_CONTAINS(l.combinejson,cast(p.id as json),'$')
left join formhead f on l.parentid=f.id
left join ywinfo yw on yw.ID=p.ywinfoid
left join kweskuinfo sk on p.sku=sk.sku and p.hscode=sk.hscode
where p.ywinfoid=${ywinfoid}  and f.ywid=${ywinfoid}
and yw.ID=${ywinfoid}
and f.ie_flag=${ie_flag}
group by f.pre_entry_id,JSON_UNQUOTE(productdetailjson->"$.BUNDLE")`;
        exclService.getinvoicedetail(sql, function(data1){
            exclService.getinvoicedetail(sql1, function(data2){
            var p1 = objnum(data1);
            var p2 = objnum(data2);
            var colums1 = [
            { header: '调拨单号', key: '' },
            { header: '万历单号', key: 'pre_entry_id' },
            { header: '品名', key: 'Cgoodsname' }, 
            { header: '税号', key: 'HScode' },  
            { header: '托盘号', key: '' },
            { header: '箱号', key: 'bundle' },
            { header: 'MD料号', key: 'sku' },
            { header: '调拨料号', key: 'kwsku' },
            { header: '原产国', key: 'OCOO' },
            { header: '数量', key: 'qty' },
            { header: '是否混箱', key: 'yy' },
            { header: '目的地', key: 'shipto' },
            { header: '成分含量', key: 'Cspec' } 
            ];
            var colums2 = [
            { header: '调拨单号', key: '' },
            { header: '万历单号', key: 'pre_entry_id' },   
            { header: '托盘号', key: '' },
            { header: '箱号', key: 'bundle' },
            { header: '是否混箱', key: 'yy' },
            { header: '目的地', key: 'shipto' }];
            var filename = 'sonotesN.xlsx';
            async.waterfall([
                function (callback){
                    exclService.xlstwosheet(colums1,data1,colums2,data2,filename,function(result){
                        callback(null,result);
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err)
                }else{
                    const rr = fs.createReadStream('sonotesN.xlsx');
                    rr.pipe(res);
                    cb(null, rr, 'application/octet-stream');
                }
            })
          })
        })
        }catch(err){
            cb(err);
        }
  };

Custinfo.downloadasn = function(ywinfoid,res,cb) {
    try{
        var sql = `select t.pre_entry_id,t.pre_entry_id as pre_entry_id1,t.pre_entry_id as pre_entry_id2,custid,contr_no,billno,voyage_no,sku,ocoo,sum(netweight) as netweight, cast((gross_wt/net_wt)*sum(netweight) as decimal(10,2)) as singlegw,sum(qtyc) as uomqty,sum(qty1) as qty1,sum(qtyc) as qtyc,cast(sum(totalpriceCIF) as decimal(10,2))as totalpriceCIF,ManualItemID,g_model,
        gross_wt,net_wt,pack_no,venderid ,curr,'ASN' as hometype,'MD' as supplierid,'CUST' as carrierid,(select feeweight from ywinfo where id=${ywinfoid}) as feeweight,concat( t.kwesku, lpad( concat(t.kid),8,'0')) as kwksu from (
        select fh.pre_entry_id ,'INDITEX' as custid,fh.bill_no as billno,fh.voyage_no,i.sku,ocoo,curr,qty1 as uomqty,qtyc,qty1,i.netweight, totalpriceCIF,fh.gross_wt,fh.net_wt, fh.pack_no,'998Z' as venderid ,fl.g_no ,fh.contr_no,i.ManualItemID,g_model,i.combineid,fl.id,k.kwesku,k.id as kid from  invoicedetailinfo i

        left join formlist fl on  JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$') -- fl.combineid = i.combineid
        left join formhead fh on fl.parentid = fh.id and fh.ie_flag='B'
        left join kweskuinfo k on i.sku = k.sku and i.hscode = k.hscode 
        where i.ywinfoid=${ywinfoid}  
        and fh.ywid = ${ywinfoid} 
        ) t group by 
        t.pre_entry_id,custid,billno,voyage_no,sku,ocoo,contr_no,curr,gross_wt,net_wt,pack_no,g_no,ManualItemID,g_model,kwesku,kid

        order by pre_entry_id, cast(g_no as UNSIGNED)`;
          exclService.getinvoicedetail(sql, function(data){
            var colums = [
            { header: 'ITEM', key: 'item' },
            { header: 'h#omKey', key: 'pre_entry_id' },
            { header: 'H#UserDefine3', key: 'pre_entry_id1' },
            { header: 'h#CUStomERID', key: 'custid' },
            { header: 'H#OMType', key: 'hometype' },
            { header: 'H#OMReference3', key: 'pre_entry_id2' },
            { header: 'H#OMReference5', key: 'contr_no' },
            { header: 'H#MAWB', key: 'billno' },
            // { header: 'H#HAWB1', key: 'voyage_no' },
            { header: 'd#sku', key: 'kwksu' },
            { header: 'D#LOTATT08', key: 'ocoo' },
            { header: 'D#OrderedQty', key: 'qty1' },
            { header: 'D#TotalNetWeight', key: 'netweight' },
            { header: 'D#TotalPrice', key: 'totalpriceCIF' },
            { header: 'H#Supplierid', key: 'supplierid' },
            { header: 'H#CarrierId', key: 'carrierid' },
            { header: 'H#cs', key: 'pack_no' },
            { header: 'H#totalGrossWeight', key: 'gross_wt' },
            { header: 'H#UserDefine1', key: 'feeweight' },
            ];
            var filename = 'asn.xlsx';
            async.waterfall([
                function (callback){
                    exclService.xls(colums,data,filename,function(result){
                        callback(null,result);
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err)
                }else{
                    const rr = fs.createReadStream('asn.xlsx');
                    rr.pipe(res);
                    cb(null, res, 'application/octet-stream');
                }
             })
        })
        }catch(err){
            cb(err);
        }
  };


Custinfo.downloadnewsku = function(custid,res,cb) {
    try{
        console.log(custid,'test')
        var sql = `select 'INDITEX' as inditex,'NSK' as nsk,'H22160000002' as ex,k.sku,k.hscode,concat( k.kwesku, lpad( concat(k.id),8,'0')) as kwksu,c.GName,c.Unit1 as c,c.Unit2 as c1,c.ControlMark as controlmark,d.kweno as kwno
from kweskuinfo k 
left join classifyinfo c on k.hscode=c.HScode 
left join kwedic d on d.hscode=k.hscode`;
        exclService.getinvoicedetail(sql, function(data){
            var colums = [
            { header: '客户编号', key: 'inditex' },
            { header: '关务批次属性', key: 'nsk' },
            { header: '账册号', key: 'ex' },
            { header: '项号', key: 'kwno' },
            { header: '产品', key: 'kwksu' },
            { header: '规格型号', key: 'sku' },
            { header: '批次属性', key: '' },
            { header: '毛重', key: '' },
            { header: '净重', key: '' },
            { header: '皮重', key: '' },
            { header: '单价', key: '' },
            { header: '长', key: '' },
            { header: '宽', key: '' },
            { header: '高', key: '' },
            { header: '体积', key: '' },
            { header: '有效期控制', key: '' },
            { header: '周期类型', key: '' },
            { header: '入库效期', key: '' },
            { header: '出库效期', key: '' },
            { header: '周转规则', key: '' },
            { header: '货物类型', key: '' },
            { header: '组合件标识', key: '' },
            { header: '库位指定规则', key: '' },
            { header: '上架规则', key: '' },
            { header: '预配规则', key: '' },
            { header: '分配规则', key: '' },
            { header: '备注', key: '' },
            { header: '提示信息', key: '' },
            { header: '危险品标识', key: '' },
            { header: '分拨标记', key: '' },
            { header: '七证标识', key: '' },
            { header: '3C许可认证标识', key: '' },
            { header: '化工品鉴定证书', key: '' },
            { header: '两用物项证', key: '' },
            { header: '通关单', key: '' },
            { header: '化工品鉴定证书编号', key: '' },
            { header: '两用物项证书编号', key: '' },
            { header: '产品组9', key: '' }
            ];
            var filename = 'newsku.xlsx';
            async.waterfall([
                function (callback){
                    exclService.xls(colums,data,filename,function(result){
                        callback(null,result);
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err)
                }else{
                    const rr = fs.createReadStream('newsku.xlsx');
                    rr.pipe(res);
                    cb(null, res, 'application/octet-stream');
                }
            })
        })
        }catch(err){
            cb(err);
        }
  };


  Custinfo.downloadform = function(ywinfoid,res,cb) {
      try{
        console.log(ywinfoid,'test')
        var sql = `select pre_entry_id,entry_group,ywno from formhead where ywid = ${ywinfoid}`;
        exclService.getinvoicedetail(sql, function(data){
            async.map(data,function(dd){
                if(dd.entry_group=='ecom'){
                    dd.entry_group = 'E-COM'
                }else if(dd.entry_group == 'reg'){
                    dd.entry_group = 'LIFESTYLE'
                }
            })
            var colums = [
            { header: 'pre_entry_id', key: 'pre_entry_id' },
            { header: 'entry_group', key: 'entry_group' },
            { header: 'ywno', key: 'ywno' }
            ];
            var filename = 'form.xlsx';
            async.waterfall([
                function (callback){
                    exclService.xls(colums,data,filename,function(result){
                        callback(null,result);
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err)
                }else{
                    const rr = fs.createReadStream('form.xlsx');
                    rr.pipe(res);
                    cb(null, res, 'application/octet-stream');
                }
            })
        })
        }catch(err){
            cb(err);
        }
  };

Custinfo.downloadxsfp = function(ie_flag,ywinfoid, cb) {
        var sql = `select t.pre_entry_id,g_no,ocoo,sum(netweight) as netweight, cast((gross_wt/net_wt)*sum(netweight) as decimal(10,2)) as singlegw,sum(qtyc) as uomqty,sum(qty1) as qtyc,sum(qtyc) qty1,cast(sum(totalpriceCIF) as decimal(10,2))as totalpriceCIF,g_model,g_name,gross_wt,pack_no,SUBSTRING(trans_mode,1,3) as trans_mode 
        -- , gross_wt,net_wt,pack_no,venderid ,curr, ManualItemID
        from (
        select fh.pre_entry_id ,'INDITEX' as custid,fh.bill_no as billno,fh.voyage_no,sku,ocoo,curr,qty1 as uomqty,qtyc,qty1,i.netweight, totalpriceCIF,fh.gross_wt,fh.net_wt, fh.pack_no,'998Z' as venderid ,fl.g_no ,fh.contr_no,i.ManualItemID,g_model,i.combineid,fl.id,g_name,fh.trans_mode from  invoicedetailinfo i
        left join formlist fl on JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$') -- fl.combineid = i.combineid 
        left join formhead fh on fl.parentid = fh.id 
        where i.ywinfoid=${ywinfoid} and fh.ywid = ${ywinfoid} and fh.ie_flag=${ie_flag} and fh.entry_group != 'reg'
        ) t group by
        t.pre_entry_id,ocoo,curr,gross_wt,net_wt,pack_no,g_no,contr_no,ManualItemID,g_model,g_name,trans_mode 
        order by pre_entry_id, cast(g_no as UNSIGNED)`;
        exclService.getinvoicedetail(sql, function(data){
            // var pop = [];
            // var ooo = [];
            // for(var i=0;i<data.length;i++){
            //     if(pop.indexOf(data[i].pre_entry_id) == -1){
            //         pop.push(data[i].pre_entry_id);
            //     }
            // }
            // for(var j = 0;j<pop.length;j++){
            //     var kk = [];
            //     for(var k=0;k<data.length;k++){
            //         if(pop[j]== data[k].pre_entry_id){
            //             kk.push(data[k]);
            //         }
            //     }
            //     ooo.push(kk);
            // }
            var pid = '';
            var pp = {
                gross_wt_sum : 0,
                pack_no_sum: 0,
            }
            for(var i=0; i<data.length;i++){
                if (pid != data[i].pre_entry_id){
                    pid = data[i].pre_entry_id;
                    pp.gross_wt_sum += parseFloat(data[i].gross_wt);
                    pp.pack_no_sum += parseInt(data[i].pack_no);
                }
            }
            data.push(pp);
            cb(null,data);
        })
  };


  Custinfo.downloadxsfpzarareg = function(ie_flag,ywinfoid, cb) {
        var sql = `select t.pre_entry_id,g_no,ocoo,sum(netweight) as netweight, cast((gross_wt/net_wt)*sum(netweight) as decimal(10,2)) as singlegw,sum(qtyc) as uomqty,sum(qty1) as qtyc,sum(qtyc) qty1,cast(sum(totalpriceCIF) as decimal(10,2))as totalpriceCIF,g_model,g_name,gross_wt,pack_no,SUBSTRING(trans_mode,1,3) as trans_mode 
        -- , gross_wt,net_wt,pack_no,venderid ,curr, ManualItemID
        from (
        select fh.pre_entry_id ,'INDITEX' as custid,fh.bill_no as billno,fh.voyage_no,sku,ocoo,curr,qty1 as uomqty,qtyc,qty1,i.netweight, totalpriceCIF,fh.gross_wt,fh.net_wt, fh.pack_no,'998Z' as venderid ,fl.g_no ,fh.contr_no,i.ManualItemID,g_model,i.combineid,fl.id,g_name,fh.trans_mode from  invoicedetailinfo i
        left join formlist fl on JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$') -- fl.combineid = i.combineid 
        left join formhead fh on fl.parentid = fh.id 
        where i.ywinfoid=${ywinfoid} and fh.ywid = ${ywinfoid} and fh.ie_flag=${ie_flag} and fh.entry_group = 'reg'
        ) t group by
        t.pre_entry_id,ocoo,curr,gross_wt,net_wt,pack_no,g_no,contr_no,ManualItemID,g_model,g_name,trans_mode 
        order by pre_entry_id, cast(g_no as UNSIGNED)`;
        exclService.getinvoicedetail(sql, function(data){ //reg
            // var pop = [];
            // var ooo = [];
            // for(var i=0;i<data.length;i++){
            //     if(pop.indexOf(data[i].pre_entry_id) == -1){
            //         pop.push(data[i].pre_entry_id);
            //     }
            // }
            // for(var j = 0;j<pop.length;j++){
            //     var kk = [];
            //     for(var k=0;k<data.length;k++){
            //         if(pop[j]== data[k].pre_entry_id){
            //             kk.push(data[k]);
            //         }
            //     }
            //     ooo.push(kk);
            // }
            var pid = '';
            var pp = {
                gross_wt_sum : 0,
                pack_no_sum: 0,
            }
            for(var i=0; i<data.length;i++){
                if (pid != data[i].pre_entry_id){
                    pid = data[i].pre_entry_id;
                    pp.gross_wt_sum += parseFloat(data[i].gross_wt);
                    pp.pack_no_sum += parseInt(data[i].pack_no);
                }
            }
            data.push(pp);
            cb(null,data);
        })
  };


Custinfo.downloadxsfppre = function(pre_entry_id, cb) {
        var sql = `select t.pre_entry_id,g_no,ocoo,sum(netweight) as netweight, cast((gross_wt/net_wt)*sum(netweight) as decimal(10,2)) as singlegw,sum(qtyc) as uomqty,sum(qty1) as qtyc,sum(qtyc) qty1,cast(sum(totalpriceCIF) as decimal(10,2))as totalpriceCIF,g_model,g_name,gross_wt,pack_no,SUBSTRING(trans_mode,1,3) as trans_mode 
        -- , gross_wt,net_wt,pack_no,venderid ,curr, ManualItemID
        from (
        select fh.pre_entry_id ,'INDITEX' as custid,fh.bill_no as billno,fh.voyage_no,sku,ocoo,curr,qty1 as uomqty,qtyc,qty1,i.netweight, totalpriceCIF,fh.gross_wt,fh.net_wt, fh.pack_no,'998Z' as venderid ,fl.g_no ,fh.contr_no,i.ManualItemID,g_model,i.combineid,fl.id,g_name,fh.trans_mode from  invoicedetailinfo i
        left join formlist fl on JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$') -- fl.combineid = i.combineid 
        left join formhead fh on fl.parentid = fh.id 
        where i.ywinfoid=(select ywid from formhead where pre_entry_id = ${pre_entry_id} limit 1) and fh.ywid = (select ywid from formhead where pre_entry_id = ${pre_entry_id} limit 1) and fh.pre_entry_id = ${pre_entry_id} and fl.pre_entry_id=${pre_entry_id} 
        ) t group by
        t.pre_entry_id,ocoo,curr,gross_wt,net_wt,pack_no,g_no,contr_no,ManualItemID,g_model,g_name,trans_mode 
        order by pre_entry_id, cast(g_no as UNSIGNED)`;
        exclService.getinvoicedetail(sql, function(data){
            cb(null,data);
        })
  };
 

 Custinfo.downloadxsfpall = function(pre_entry_id, cb) {
        var sql = `
        select fh.pre_entry_id ,'INDITEX' as custid,fh.bill_no as billno,fh.voyage_no,i.sku,ocoo,curr,qty1 as uomqty,qtyc,qty1,i.netweight, totalpriceCIF,fh.gross_wt,fh.net_wt, fh.pack_no,'998Z' as venderid ,fl.g_no ,fh.contr_no,i.ManualItemID,g_model,i.combineid,fl.id,g_name,fh.trans_mode,cu.cspec from  invoicedetailinfo i
        left join formlist fl on JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$') -- fl.combineid = i.combineid 
        left join formhead fh on fl.parentid = fh.id 
        left join custproductdetailinfo cu on i.sku=cu.sku
        where i.ywinfoid=(select ywid from formhead where pre_entry_id = ${pre_entry_id} limit 1) and fh.ywid = (select ywid from formhead where pre_entry_id = ${pre_entry_id} limit 1) and fh.pre_entry_id = ${pre_entry_id} and fl.pre_entry_id=${pre_entry_id}`;
        exclService.getinvoicedetail(sql, function(data){
            cb(null,data);
        })
  };

  Custinfo.downloadhuowu = function(ywid,res, cb) {
      var sql = `select pre_entry_id,g_name,g_no,l.ControlMark,l.CFlag,'Massimo Dutti' as pin,origin_country,qty_1,max(p.sku) as sku,jget( max(p.productDetailJson),'mainmaterial' ) as pro from formlist l
left join invoicedetailinfo p on JSON_CONTAINS(l.combinejson,cast(p.id as json),'$')
where parentid in (select id from formhead
where ie_flag='9' and ywid =${ywid})
and p.ywinfoid=${ywid}
group by l.id
order by l.pre_entry_id,cast(l.g_no as unsigned)`;
        exclService.getinvoicedetail(sql, function(data){ //reg
            var colums = [
            { header: '序号', key: 'pre_entry_id' },
            { header: 'g_no', key: 'g_no' },
            { header: '品名', key: 'g_name' },
            { header: '品牌', key: 'pin' },
            { header: '产地', key: 'origin_country' },
            { header: '款号', key: 'sku' },
            { header: '成分', key: 'pro' },
            { header: '数量', key: 'qty_1' },
            { header: 'ControlMark', key: 'ControlMark' },
            { header: 'CFlag', key: 'CFlag' },
            { header: '产品类别', key: '' },
            { header: '备注（生产日期）', key: '' }
            ];
            var filename = 'newhuowu.xlsx';
            async.waterfall([
                function (callback){
                    exclService.xls(colums,data,filename,function(result){
                        callback(null,result);
                    })
                }
            ],function(err,result){
                if(err){
                    cb(err)
                }else{
                    const rr = fs.createReadStream('newhuowu.xlsx');
                    rr.pipe(res);
                    cb(null, rr, 'application/octet-stream');
                }
            })
        })
  };
  
        

  Custinfo.huiyuxiangdan = function(ywinfoid,cb) {
    try{
        var sql = `select fl.pre_entry_id,fl.g_no,fl.g_name,fl.g_unit,fl.origin_country,fl.netweight,i.sku,i.productDetailJson,i.qty,fh.trans_mode,fh.gross_wt,fh.pack_no,fh.bill_no,fh.contr_no,i.GrossWeight from invoicedetailinfo i 
        left join formlist fl on JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$')
        left join formhead fh on fl.parentid = fh.id 
        where i.ywinfoid = ${ywinfoid} and fh.ywid = ${ywinfoid}
        order by pre_entry_id,cast(fl.g_no as unsigned)
        `;
        exclService.getinvoicedetail(sql, function(data){
            cb(null,data);
        })
        }catch(err){
            cb(err);
        }
  };

  Custinfo.huiyu3c = function(ywinfoid,cb) {
    try{
        var sql = `select fl.pre_entry_id,fl.g_name,fl.g_unit,fl.g_no,fl.origin_country,fl.netweight,g_model,i.sku,i.productDetailJson,i.qty,i.hscode,fh.trans_mode,fh.gross_wt,fh.pack_no,fh.contr_no,fh.bill_no,fh.trade_name,ou.type from invoicedetailinfo i 
        left join formlist fl on JSON_CONTAINS(fl.combinejson,cast(i.id as json),'$')
        left join formhead fh on fl.parentid = fh.id 
        left join outlist ou on i.sku = ou.remark_type
        where i.ywinfoid = ${ywinfoid} and fh.ywid = ${ywinfoid} and fl.ShangjianMark like '%L%' and i.sku in (select remark_type from outlist)
        order by pre_entry_id,cast(fl.g_no as unsigned)
        `;
        exclService.getinvoicedetail(sql, function(data){
            cb(null,data);
        })
        }catch(err){
            cb(err);
        }
  };

  Custinfo.remoteMethod(
        'downloadso', {
          accepts: [
                {arg: 'ywinfoid', type: 'number'},
                {arg: 'res', type: 'object', 'http': {source: 'res'}},
          ],
          http: {
            verb: 'get',
            path: '/downloadso.xlsx',
          },
          returns: [
                {arg: 'body', type: 'file', root: true},
                {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
          ],
        }
        );

    // Custinfo.remoteMethod(
    //     'downloadsonotes', {
    //       accepts: [
    //             {arg: 'ywinfoid', type: 'number'},
    //             {arg: 'res', type: 'object', 'http': {source: 'res'}},
    //       ],
    //       http: {
    //         verb: 'get',
    //         path: '/downloadsonotes.xlsx',
    //       },
    //       returns: [
    //             {arg: 'body', type: 'file', root: true},
    //             {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
    //       ],
    //     }
    //     );

    Custinfo.remoteMethod(
        'downloadsonotesN', {
          accepts: [
                {arg: 'ywinfoid', type: 'number'},
                {arg: 'ie_flag', type: 'string'},
                {arg: 'res', type: 'object', 'http': {source: 'res'}},
          ],
          http: {
            verb: 'get',
            path: '/downloadsonotesN.xlsx',
          },
          returns: [
                {arg: 'body', type: 'file', root: true},
                {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
          ],
        }
        );
    Custinfo.remoteMethod(
        'downloadform', {
          accepts: [
                {arg: 'ywinfoid', type: 'number'},
                {arg: 'res', type: 'object', 'http': {source: 'res'}},
          ],
          http: {
            verb: 'get',
            path: '/downloadform.xlsx',
          },
          returns: [
                {arg: 'body', type: 'file', root: true},
                {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
          ],
        }
        );

    Custinfo.remoteMethod(
        'downloadasn', {
          accepts: [
                {arg: 'ywinfoid', type: 'number'},
                {arg: 'res', type: 'object', 'http': {source: 'res'}},
          ],
          http: {
            verb: 'get',
            path: '/downloadasn.xlsx',
          },
          returns: [
                {arg: 'body', type: 'file', root: true},
                {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
          ],
        }
        );

    Custinfo.remoteMethod(
        'downloadnewsku', {
          accepts: [
                {arg: 'custid', type: 'number'},
                {arg: 'res', type: 'object', 'http': {source: 'res'}},
          ],
          http: {
            verb: 'get',
            path: '/downloadnewsku.xlsx',
          },
          returns: [
                {arg: 'body', type: 'file', root: true},
                {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
          ],
        }
        );
    
    Custinfo.remoteMethod(
        'downloadhuowu', {
          accepts: [
                {arg: 'ywid', type: 'string'},
                {arg: 'res', type: 'object', 'http': {source: 'res'}},
          ],
          http: {
            verb: 'get',
            path: '/downloadhuowu.xlsx',
          },
          returns: [
                {arg: 'body', type: 'file', root: true},
                {arg: 'Content-Type', type: 'string', http: {target: 'header'}},
          ],
        }
        );

    Custinfo.remoteMethod(
        'downloadxsfp', {
          http: {path: '/downloadxsfp', verb: 'get'},
          accepts: [
                {arg: 'ie_flag', type: 'string'},
                {arg: 'ywinfoid', type: 'number'},
          ],
          returns: {type: 'object', root: true},
        }
    );
    Custinfo.remoteMethod(
        'downloadxsfpzarareg', {
        http: {path: '/downloadxsfpzarareg', verb: 'get'},
        accepts: [
                {arg: 'ie_flag', type: 'string'},
                {arg: 'ywinfoid', type: 'number'},
        ],
        returns: {type: 'object', root: true},
        }
    );
    Custinfo.remoteMethod(
        'downloadxsfppre', {
          http: {path: '/downloadxsfppre', verb: 'get'},
          accepts: [
                {arg: 'pre_entry_id', type: 'string'},
          ],
          returns: {type: 'object', root: true},
        }
    );
    Custinfo.remoteMethod(
        'downloadxsfpall', {
          http: {path: '/downloadxsfpall', verb: 'get'},
          accepts: [
                {arg: 'pre_entry_id', type: 'string'},
          ],
          returns: {type: 'object', root: true},
        }
    );
    Custinfo.remoteMethod(
        'huiyuxiangdan', {
          http: {path: '/huiyuxiangdan', verb: 'get'},
          accepts: [
                {arg: 'ywinfoid', type: 'number'},
          ],
          returns: {type: 'object', root: true},
        }
    );

    Custinfo.remoteMethod(
        'huiyu3c', {
          http: {path: '/huiyu3c', verb: 'get'},
          accepts: [
                {arg: 'ywinfoid', type: 'number'},
          ],
          returns: {type: 'object', root: true},
        }
    );
};


function objnum(data) {
    var n = []; 
    for(var i = 0; i < data.length; i++){ 
        var ll = {};
        var count = 0;
        for(var j =0; j < data.length; j++){
            if(data[i].bundle == data[j].bundle){
                count++;
            }
        }
        ll.bundle = data[i].bundle;
        ll.count = count;
       n.push(ll);
    }

    async.map(data,function(dd){
        async.map(n,function(kk){
            if(kk.bundle == dd.bundle){
                if(kk.count == 1){
                    dd.yy = 'N'
                }else if(kk.count > 1){
                    dd.yy = 'Y'
                }
            }
        })
    })
    return n;
}

  // "17testbase": {
  //   "host": "192.168.0.17\\SQLEXPRESS",
  //   "port": 1433,
  //   "database": "RJECIQ",
  //   "username": "db_view",
  //   "password": "50461616",
  //   "name": "17testbase",
  //   "connector": "mssql"
  // },
      

  // "dclbiodeclmssql": {
  //   "dataSource": "17testbase",
  //   "public": true
  // },
  // "dclbiodeclcontmssql": {
  //   "dataSource": "17testbase",
  //   "public": true
  // },
  // "dclbiodeclgoodsmssql": {
  //   "dataSource": "17testbase",
  //   "public": true
  // },


        // { header: 'ManualItemID', key: 'ManualItemID' },
        //     { header: 'g_model', key: 'g_model' },
        //     { header: 'net_wt', key: 'net_wt' },
        //     { header: 'venderid', key: 'venderid' },
        //     { header: 'curr', key: 'curr' }