const Base = require('./base.js');
const fs = require('fs');

const async2 = require('async');

const clients = require('restify-clients');
const assert = require('assert');

const client = clients.createJsonClient({
  url: think.config('RestTrouble'),
  version: '~1.0'
});

module.exports = class extends Base {
  async loadStageDataAction() {
    if(!this.isCli) return this.fail(1000, 'deny');
    const cachefile = think.ROOT_PATH + '/tmp/cache/stagedata.json';
    const satellite = this.mongo('satellite');
    const sats = await satellite.where({'stage':'测试'}).select();//此处where需要加判断条件，判断是测试型号
    const result={};
    const groups = [];
    const items = [];
    for (let i = 0; i < sats.length; i++) {
    //for (let i = 0; i < 1; i++) {
      let group={};
      group.id = sats[i]._id;
      //group.id=i;
      group.content = sats[i].name;
      group.sat_name = sats[i].name;
      group.sat_code = sats[i].code;
      group.sat_factory = sats[i].factory ? sats[i].factory : '';
      group.sat_field = sats[i].field ? sats[i].field : '';
      //group.sat_field = sats[i].field2 ? sats[i].field2 : '';
      group.sat_platform = sats[i].platform ? sats[i].platform : '';
      group.sat_size = sats[i].size ? sats[i].size : '';
      group.sat_stage = sats[i].stage ? sats[i].stage : '';
      group.sat_applyField = sats[i].applyField ? sats[i].applyField : '';
      group.sat_orbitType = sats[i].orbitType ? sats[i].orbitType : '';
      group.sat_user = sats[i].user ? sats[i].user : ''
      groups.push(group);
      let stage = this.mongo('stage',{database:sats[i].code});
      let stgs = await stage.where().select();
      if(stgs!=undefined && stgs!=null && stgs.length!==undefined && stgs.length>0){
        for(let j=0;j<stgs.length;j++){
          let item_p={};
          item_p.id=sats[i].code+stgs[j]._id+'p';
          item_p.group = sats[i]._id;
          //item_p.group = i;
          item_p.start = new Date(stgs[j].expstart);
          item_p.end = new Date(stgs[j].expend);
          item_p.content = stgs[j].name;
          item_p.subgroup='sg_p';
          if(stgs[j].state=='已完成')
            item_p.className = 'green';
          else if(stgs[j].state=='进行中')
            item_p.className='red';
          items.push(item_p);
            let item_a={};
            item_a.id=sats[i].code+stgs[j]._id+'a';
            item_a.group = sats[i]._id;
            //item_a.group = i;
            item_a.start = new Date(stgs[j].reastart);
            item_a.end = new Date(stgs[j].reaend);
            item_a.content = stgs[j].name;
            item_a.subgroup='sg_a';
            if(stgs[j].state=='已完成')
              item_a.className = 'green';
            else if(stgs[j].state=='进行中'){
              item_a.className='red';
              item_a.end = new Date(stgs[j].expend);
            }else {
              item_a.start = new Date(stgs[j].expstart);
              item_a.end = new Date(stgs[j].expend);
            }
            items.push(item_a);

        }
      }
    }
    result.groups = groups;
    result.items=items;
    fs.writeFileSync(cachefile, JSON.stringify(result));
  }


  async getwallsatAction() {
    if(!this.isCli) return this.fail(1000, 'deny');
    const cachefile = think.ROOT_PATH + '/tmp/cache/wallsat.json';
    const satellite = this.mongo('satellite');
    //const sats = await satellite.where().order("lanuchTime").select();
     const sats = await satellite.where({'stage':'测试'}).select();
    const result = [];
    for (let i = 0; i < sats.length; i++) {
      const item={};
      item._id = sats[i]._id;
      item.name = sats[i].name;
      item.code = sats[i].code;
      if(sats[i].produce_stage == undefined || sats[i].produce_stage == "" || sats[i].produce_stage == null){
          item.produce_stage = "";
      }else{
          item.produce_stage = sats[i].produce_stage;
      }

      if(sats[i].test_commander == undefined || sats[i].test_commander == "" || sats[i].test_commander == null){
          item.test_commander = "";
      }else{
          item.test_commander = sats[i].test_commander;
      }

      //item.produce_stage = sats[i].produce_stage;
      //item.test_commander = sats[i].test_commander;
      let stage = this.mongo('stage', {database:sats[i].code});
      let stagedata = await stage.where().select();
      let reastart = [];
      let restartDate = [];

      let powertime=0;
      for(let d=0;d<stagedata.length;d++){
        if(stagedata[d].state!=='未开始'){
          restartDate.push(parseInt(stagedata[d].reastart.replace(/\-/g,'')));
        }
          powertime+=parseFloat(stagedata[d].powertime);
      }

      item.powertime = powertime.toFixed(1);

        if(restartDate.length != 0){
            let min = (Math.min.apply(null,restartDate)).toString();
            let dat = min.substring(0, 4) + "-" + min.substring(4, 6) + "-" + min.substring(6, 8);
            item.testDate = dat;
            item.testYear = dat.substring(0,4);
        }else{
            item.testDate = NaN;
            item.testYear = NaN;
        }



      if (sats[i].code_out == undefined || sats[i].code_out=='') { sats[i].code_out = sats[i].code };
      item.code_out = sats[i].code_out;
      item.stage = sats[i].stage;
      if (sats[i].commander == undefined) { sats[i].commander = '' };
      item.commander = sats[i].commander;
      if (sats[i].designer == undefined) { sats[i].designer = '' };
      item.designer = sats[i].designer;

      const code = sats[i].code;
      //判断文件是否存在
      const path = think.ROOT_PATH + '/www/static/satimgs/' + code + '.png';
      const exists = await new Promise(function(resolve, reject) {
        fs.exists(path, function(exists) {
          resolve(exists);
        });
      });
      if (exists) {
        item.imgpath = '/static/satimgs/' + code + '.png';
      } else {
        item.imgpath = '/static/satimgs/default.png';
      }

      if (sats[i].lanuchTime == undefined ) { sats[i].lanuchTime = '1900-01-01 00:00:00' };
      item.lanuchTime = (new Date( sats[i].lanuchTime)).Format('yyyy-MM-dd hh:mm:ss');
      let current = new Date();
      if(sats[i].stage=='退役' || sats[i].stage=='失效'){
        if(sats[i].retireTime=='' || sats[i].retireTime==undefined){
          if(sats[i].invalidTime!==undefined && sats[i].invalidTime!==''){
            current = new Date(sats[i].invalidTime);
          }else{
            current = new Date(sats[i].lanuchTime);
          }
        }else{
          current = new Date(sats[i].retireTime);
        }
      }
      current = current.getTime();

      let launchorign = new Date(sats[i].lanuchTime);
      let passed = current - launchorign.getTime();
      let lifeorign = parseFloat(sats[i].life);
      if(lifeorign >= parseFloat(sats[i].assessLife))
        lifeorign = parseFloat(sats[i].assessLife);
      item.lifepercent = (passed/(1000*60*60*24*365)).toFixed(2)+'Y/'+lifeorign.toFixed(2)+'Y';
      item.factory = sats[i].factory? sats[i].factory : '';
      item.field = sats[i].field? sats[i].field : '';
      item.applyField = sats[i].applyField? sats[i].applyField : '';
      item.orbitType = sats[i].orbitType? sats[i].orbitType : '';
      item.platform = sats[i].platform ? sats[i].platform : '';
      item.user = sats[i].user? sats[i].user : '';
      item.designer = sats[i].designer? sats[i].designer : '';
      item.commander = sats[i].commander? sats[i].commander : '';
      item.size = sats[i].size? sats[i].size : '';
      item.powerstyle = sats[i].powerstyle? sats[i].powerstyle : '';
      item.lanuchYear = launchorign.getFullYear()+'';
      result.push(item);
    }
    fs.writeFileSync(cachefile, JSON.stringify(result));
  }



  async getRankAction() {
    if(!this.isCli) return this.fail(1000, 'deny');
    const cachefile = think.ROOT_PATH + '/tmp/cache/rank.json';
    const satellite = this.mongo('satellite');
    const orbitSats = await satellite.where().select();
    const result = [];
    for (let idx = 0; idx < orbitSats.length; idx++) {
      const sat = orbitSats[idx];
      const item = {};
      item.name = sat.name;
      item.code = sat.code;
      if (sat.code_out === undefined || sat.code_out === '') {
        sat.code_out = sat.code;
      }
      item.code_out = sat.code_out;
      item.score = 0;
      item._id = sat._id;
      item.factory = sat.factory ? sat.factory : '';
      item.field = sat.field ? sat.field : '';
      item.applyField = sat.applyField ? sat.applyField : '';
      item.orbitType = sat.orbitType ? sat.orbitType : '';
      item.platform = sat.platform ? sat.platform : '';
      item.stage = sat.stage ? sat.stage : '';;
      item.lanuchTime = sat.lanuchTime ? sat.lanuchTime : '';
      item.assessLife = sat.assessLife ? sat.assessLife : '';
      item.life = sat.life ? sat.life : '';
      item.retireTime = sat.retireTime ? sat.retireTime : '';
      item.invalidTime = sat.invalidTime ? sat.invalidTime : '';
      item.user = sat.user ? sat.user : '';
      const fault = this.mongo('fault', {database: sat.code});
      item['order_fault'] = await fault.where().count();
      item['order_quality'] = sat.quality ? parseFloat(sat.quality) : NaN;
      const satcode = item.code;
      //判断文件是否存在
      const path = think.ROOT_PATH + '/www/static/satimgs/' + satcode + '.png';
      const exists = await new Promise(function (resolve, reject) {
        fs.exists(path, function (exists) {
          resolve(exists);
        });
      });

      if (exists) {
        item.imgpath = '/static/satimgs/' + item.code + '.png';
      } else {
        item.imgpath = '/static/satimgs/default.png';
      }

      result.push(item);
    }

    await new Promise(function (resolve, reject) {
      async2.each(result, function (item, callback) {

        item.order_orbittime = NaN;
        item.order_overtime = NaN;
        item.order_overpercent = NaN;
        item.order_trb = 0;
        item.order_first_trb = 0;
        item.order_trb_year = NaN;

        let L = NaN;
        let design = 0;
        let start = 0;
        let end = 0;

        let existms = NaN;

        if (item.lanuchTime !== '') {
          start = new Date(item.lanuchTime).getTime();
          if (item.stage == '在轨') {
            end = new Date().getTime();
            existms = end - start;
          } else {
            if (item.retireTime == '') {
              if (item.invalidTime !== '') {
                end = new Date(item.invalidTime).getTime();
                existms = end - start;
              }
            } else {
              end = new Date(item.retireTime).getTime();
              existms = end - start;
            }
          }
        }

        item.order_orbittime=existms;

        if (!isNaN(existms)) item.order_orbittime = (item.order_orbittime / (1000 * 60 * 60 * 24)).toFixed(1);

        if (item.assessLife != '' && item.assessLife != undefined) {
          design = parseFloat(item.assessLife);
        } else {
          if (item.life != '' && item.life != undefined) {
            design = parseFloat(item.life);
          }
        }

        if (!isNaN(design) && !isNaN(item.order_orbittime)) item.order_overtime = (item.order_orbittime - design * 365).toFixed(1);
        if (item.order_overtime <= 0) item.order_overtime = 0;

        if (isNaN(design)) design = 0;
        if (design != 0) {
          design = design * 365 * 24 * 60 * 60 * 1000;
          if (item.lanuchTime !== '' && item.lanuchTime !== undefined) {
            start = new Date(item.lanuchTime).valueOf();
            if (item.stage == '在轨') {
              end = new Date().valueOf();
              existms = end - start;
              if (design < existms) {
                L = (existms / design) * 100;
              }
            } else {
              if (item.retireTime == '' || item.retireTime == undefined) {
                if (item.invalidTime !== undefined && item.invalidTime !== '') {
                  end = new Date(item.invalidTime).valueOf();
                  existms = end - start;
                  L = (existms / design) * 100;
                }
              } else {
                end = new Date(item.retireTime).valueOf();
                existms = end - start;
                L = (existms / design) * 100;
              }
            }
          }
        }
        if (!isNaN(L)) item.order_overpercent = L.toFixed(1);
        const restparam = {satcode: item.code};
        client.post(think.config('RestTroubleAll'), restparam, function (err, req, res, obj) {
          assert.ifError(err);
          for (let i = 0; i < obj.length; i++) {
            const trb = JSON.parse(obj[i]);
            item.order_trb = item.order_trb + 1;
            if (trb.count == "1" || trb.count==1) {
              item.order_first_trb = item.order_first_trb + 1;
            }
          }
          if (!isNaN(item.order_orbittime) && item.order_orbittime !== 0) item.order_trb_year = (item.order_trb / (item.order_orbittime / 365)).toFixed(1);
          callback();
        });
      }, function (err) {
        resolve('ok');
      });
    });
    fs.writeFileSync(cachefile, JSON.stringify(result));
  }

  async loadSatDataAction() {
    if(!this.isCli) return this.fail(1000, 'deny');

    const cachefile = think.ROOT_PATH + '/tmp/cache/satdata.json';
    const satellite = this.mongo('satellite');
    const orbitSats = await satellite.where({'stage':'测试'}).select();
    const result = [];

    await new Promise(function (resolve, reject) {
      async2.each(orbitSats, function (item, callback) {
        const sat = {};
        sat.name = item.name;
        sat.code = item.code;








        sat.factory = item.factory ? item.factory : '';
        sat.field = item.field ? item.field : '';
        sat.size = item.size ? item.size : '';
        sat.stage = item.stage ? item.stage : '';
        sat.platform = item.platform ? item.platform : '';
        sat.applyField = item.applyField ? item.applyField : '';
        sat.orbitType = item.orbitType ? item.orbitType : '';
        //sat.health = item.health ? item.health : '';
        sat.user = item.user ? item.user : '';
        //sat.manager = item.manager ? item.manager : '';
        sat.designer = item.designer ? item.designer : '';
        sat.commander = item.commander ? item.commander : '';
        sat.powerstyle = item.powerstyle ? item.powerstyle : '';
        sat.lanuchYear = new Date(item.lanuchTime).getFullYear();
        //sat.retireYear = new Date(item.retireTime).getFullYear();
        //sat.invalidYear = new Date(item.invalidTime).getFullYear();
        sat.life = item.life ? item.life : '';
        sat.assessLife = item.assessLife ? item.assessLife : '';
        sat.lanuchTime = item.lanuchTime ? item.lanuchTime : '';
        sat.test_commander = item.test_commander ? item.test_commander : '';
        sat.produce_stage = item.produce_stage ? item.produce_stage : '';

        result.push(sat);


        callback();
      }, function (err) {
        resolve('ok');
      });
    });


      for(let j=0;j<result.length;j++){
          let stage = this.mongo('stage', {database:result[j].code});
          let stagedata = await stage.where().select();
          let restartDate = [];

          for(let d=0;d<stagedata.length;d++){
              restartDate.push(parseInt(stagedata[d].reastart.replace(/\-/g,'')));
          }

          if(restartDate.length != 0){
              let min = (Math.min.apply(null,restartDate)).toString();
              let dat = min.substring(0, 4) + "-" + min.substring(4, 6) + "-" + min.substring(6, 8);
              result[j].testDate = dat;
              result[j].testYear = dat.substring(0,4);
          }else{
              result[j].testDate = '';
              result[j].testYear = '';
          }
      }



    fs.writeFileSync(cachefile, JSON.stringify(result));
  }

  async loadTrbDataAction() {
    if(!this.isCli) return this.fail(1000, 'deny');

    const cachefile = think.ROOT_PATH + '/tmp/cache/trbdata.json';
    const satellite = this.mongo('satellite');
    const orbitSats = await satellite.where().select();
    const result = [];

    let cateArr = ["测控", "地面", "供配电/电源/总体电路", "环控生保", "机构/结构", "热控", "数传", "数管/综合电子/星务", "天线", "推进", "星间链路", "有效载荷", "转发器", "控制/姿轨控", "自主运行", "捕获跟踪", "其他"];
    let keyArr = ["测控", "地面", "供配电;电源;总体电路", "环控生保", "机构;结构", "热控", "数传", "数管;综合电子;星务", "天线", "推进", "星间链路", "有效载荷", "转发器", "控制;姿轨控", "自主运行", "捕获跟踪", "其他"];
    await new Promise(function (resolve, reject) {
      async2.each(orbitSats, function (item, callback) {
        const sat = {};
        sat.sat_name = item.name;
        sat.sat_code = item.code;
        sat.sat_factory = item.factory ? item.factory : '';
        sat.sat_field = item.field ? item.field : '';
        sat.sat_platform = item.platform ? item.platform : '';
        sat.sat_size = item.size ? item.size : '';
        /*
        sat.sat_applyField = item.applyField ? item.applyField : '';
        sat.sat_orbitType = item.orbitType ? item.orbitType : '';
        sat.sat_stage = item.stage ? item.stage : '';
        sat.sat_lanuchTime = item.lanuchTime ? item.lanuchTime : '';
        sat.sat_assessLife = item.assessLife ? item.assessLife : '';
        sat.sat_life = item.life ? item.life : '';
        sat.sat_retireTime = item.retireTime ? item.retireTime : '';
        sat.sat_invalidTime = item.invalidTime ? item.invalidTime : '';
        */

        const restparam = {satcode: sat.sat_code};
        client.post(think.config('RestTroubleAll'), restparam, function (err, req, res, obj) {
          assert.ifError(err);
          for (let i = 0; i < obj.length; i++) {
            const trb = JSON.parse(obj[i]);
            const trbitem = {};
            for (var p in sat) {
              trbitem[p] = sat[p];
            }
            trbitem.trb_name = trb.name;

            let rsubidx = -1;
            for (let subidx = 0; subidx < cateArr.length; subidx++) {
              if (subidx === cateArr.length - 1) {//不用再判断关键字了，都扔进去
                rsubidx = cateArr.length - 1;
              } else {
                let keys = keyArr[subidx].split(";");
                for (let keyidx = 0; keyidx < keys.length; keyidx++) {
                  if (trb.subsys_name.indexOf(keys[keyidx]) >= 0) {
                    rsubidx = subidx;
                    break;
                  }
                }
              }
              if (rsubidx !== -1)
                break;
            }
            //trbitem.trb_subsys_name = trb.subsys_name;
            trbitem.trb_subsys_name = cateArr[rsubidx];

            trbitem.trb_grade = trb.grade;
            if (trb.count == 1)
              trbitem.trb_count = '首次';
            else
              trbitem.trb_count = '重复';
            trbitem.trb_occurYear = new Date(trb.occurTime).getFullYear();
            result.push(trbitem);
          }
          callback();
        });
      }, function (err) {
        resolve('ok');
      });
    });
    fs.writeFileSync(cachefile, JSON.stringify(result));
  }

  async loadProductDataAction() {
    if(!this.isCli) return this.fail(1000, 'deny');
    const cachefile = think.ROOT_PATH + '/tmp/cache/productdata.json';
    const satellite = this.mongo('satellite');
    const sats = await satellite.where().select();
    const result = [];
    for (let i = 0; i < sats.length; i++) {
      const device = this.mongo('device',{database:sats[i].code});
      const subsys = this.mongo('subsys', {database:sats[i].code});

      const devs = await device.where({spectrum_1:'是'}).select();
      for(let j=0;j<devs.length;j++){
        const item = {};

        /*item.sat_lanuchTime = sats[i].lanuchTime ? sats[i].lanuchTime : '';
        item.sat_assessLife = sats[i].assessLife ? sats[i].assessLife : '';
        item.sat_life = sats[i].life ? sats[i].life : '';
        item.sat_retireTime = sats[i].retireTime ? sats[i].retireTime : '';
        item.sat_invalidTime = sats[i].invalidTime ? sats[i].invalidTime : '';
        */
        item.sat_name = sats[i].name;
        item.sat_code = sats[i].code;
        item.sat_factory = sats[i].factory ? sats[i].factory : '';
        item.sat_field = sats[i].field ? sats[i].field : '';
        item.sat_platform = sats[i].platform ? sats[i].platform : '';
        item.sat_size = sats[i].size ? sats[i].size : '';
        item.sat_stage = sats[i].stage ? sats[i].stage : '';
        item.sat_applyField = sats[i].applyField ? sats[i].applyField : '';
        item.sat_orbitType = sats[i].orbitType ? sats[i].orbitType : '';

        item.sub_name = devs[j].subsys_name;
        const standsub = await subsys.field('standardName').where({name:item.subsys_name}).find();
        item.sub_standName = standsub.standardName;

        item.dev_name = devs[j].name;
        item.dev_code = devs[j].code;
        item.dev_standName = devs[j].product;
        item.dev_backup = devs[j].backups;
        item.dev_spectrum = devs[j].spectrum;
        item.dev_number = devs[j].number;
        item.dev_state = devs[j].product_state;
        item.dev_worktime = devs[j].startingUp_time;
        item.dev_worknum = devs[j].startingUp_num;
        item.dev_faulttime = devs[j].fault_time;
        item.dev_losetime = devs[j].lose_time;
        item.dev_factory = devs[j].manufacturers;
        item.dev_standSource = devs[j].sources_1;

        result.push(item);
      }
    }
    fs.writeFileSync(cachefile, JSON.stringify(result));
  }
};
