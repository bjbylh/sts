const Base = require('./base.js');
const fs = require('fs');

const clients = require('restify-clients');
const assert = require('assert');

const client = clients.createJsonClient({
  url: think.config('RestTrouble'),
  version: '~1.0'
});

module.exports = class extends Base {
  async indexAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const data = await satellite.where({_id: _id}).find();


    const code = data.code;
    //判断文件是否存在
    const path = think.ROOT_PATH + '/www/static/satimgs/' + code + '.png';
    const exists = await new Promise(function (resolve, reject) {
      fs.exists(path, function (exists) {
        resolve(exists);
      });
    });
    if (exists)
      data.imgpath = '/static/satimgs/' + code + '.png';
    else
      data.imgpath = '/static/satimgs/default.png';


    if (data.totaloxdiant == undefined || data.totaloxdiant == '') {
      data.totaloxdiant = 0
    }
    ;
    if (data.nowoxdiant == undefined || data.nowoxdiant == '') {
      data.nowoxdiant = 0
    }
    ;
    if (data.totalfuel == undefined || data.totalfuel == '') {
      data.totalfuel = 0
    }
    ;
    if (data.nowfuel == undefined || data.nowfuel == '') {
      data.nowfuel = 0
    }
    ;

    if (data.powerstyle !== '单组元' && data.powerstyle !== '双组元' && data.powerstyle !== '双组元+电推') {
      data.FUELtotal = 0;
      data.FUELnow = 0;
      data.FUELpercent = 100;
    } else {
      if (data.powercalc === '手工计算') {
        data.FUELtotal = data.totalfuel;
        data.FUELnow = data.nowfuel;
        data.FUELpercent = parseFloat(data.FUELnow) * 100 / parseFloat(data.FUELtotal);
        if (data.powerstyle === '双组元') {
          data.OXDIANTtotal = data.totaloxdiant;
          data.OXDIANTnow = data.nowoxdiant;
          data.OXDIANTpercent = parseFloat(data.OXDIANTnow) * 100 / parseFloat(data.OXDIANTtotal);
        }
      } else {
        const materialdb = this.mongo('material', {database: data.code});
        let FUEL = await materialdb.where({code: new RegExp('^FUEL-[0-9]{4}-[0-9]{2}-[0-9]{2}$')}).select({order: {code: 1}});
        if (FUEL.length > 0) {
          data.FUELtotal = FUEL[0].custom.toFixed(2);
          data.FUELnow = FUEL[FUEL.length - 1].custom.toFixed(2);
          data.FUELpercent = parseFloat(data.FUELnow) * 100 / parseFloat(data.FUELtotal);
        }
        if (data.powerstyle === '双组元') {
          let OXDIANT = await materialdb.where({code: new RegExp('^OXDIANT-[0-9]{4}-[0-9]{2}-[0-9]{2}$')}).select({order: {code: 1}});
          if (OXDIANT.length > 0) {
            data.OXDIANTtotal = OXDIANT[0].custom.toFixed(2);
            data.OXDIANTnow = OXDIANT[OXDIANT.length - 1].custom.toFixed(2);
            data.OXDIANTpercent = parseFloat(data.OXDIANTnow) * 100 / parseFloat(data.OXDIANTtotal);
          }
        }
      }
      if (data.FUELtotal == undefined) {
        data.FUELtotal = 0
      }
      ;
      if (data.FUELnow == undefined) {
        data.FUELnow = 0
      }
      ;
      if (data.FUELpercent == undefined) {
        data.FUELpercent = 100
      }
      ;
    }
    let current = new Date();
    if (data.stage == '退役' || data.stage == '失效') {

      if (data.retireTime == '' || data.retireTime == undefined) {
        if (data.invalidTime !== undefined && data.invalidTime !== '') {
          current = new Date(data.invalidTime);
        } else {
          current = new Date(data.lanuchTime);
        }
      } else {
        current = new Date(data.retireTime);
      }
    }
    current = current.getTime();

    let launchorign = new Date(data.lanuchTime);
    let passed = current - launchorign.getTime();
    //let lifeorign = parseFloat(data.life)*365*24*3600*1000;
    let lifeorign = parseFloat(data.life);
    if (lifeorign >= parseFloat(data.assessLife))
      lifeorign = parseFloat(data.assessLife);
    data.lifetotal = lifeorign;
    lifeorign = lifeorign * 365 * 24 * 3600 * 1000;
    data.lifepercent = (passed * 100 / lifeorign).toFixed(2);

    if (data.orbit_remarks == undefined) {
      data.orbit_remarks = ''
    }
    ;

    //if (data.powerstyle == undefined) { data.powerstyle='双组元+电推' };


    //故障数量统计
    let restparam = {satcode: code};
    let trbs = await new Promise(function (resolve, reject) {
      client.post(think.config('RestTroubleAll'), restparam, function (err, req, res, obj) {
        assert.ifError(err);
        resolve(obj);
      });
    });
    const troubleres = {};
    troubleres.zainan = 0;
    troubleres.guanjian = 0;
    troubleres.feizhuyao = 0;
    troubleres.qingdu = 0;
    for (let i = 0; i < trbs.length; i++) {
      let obj = JSON.parse(trbs[i]);
      if (obj.grade == '灾难性') {
        troubleres.zainan += 1;
      } else if (obj.grade == '关键性') {
        troubleres.guanjian += 1;
      } else if (obj.grade == '轻度') {
        troubleres.qingdu += 1;
      } else if (obj.grade == '非主要') {
        troubleres.feizhuyao += 1;
      }
    }
    const faultdb = this.mongo('fault', {database: data.code});
    let faultcount = await faultdb.where().count();

    if (data.life == undefined || data.life == '') {
      data.life = '-'
    }
    ;
    if (data.assessLife == undefined || data.assessLife == '') {
      data.assessLife = '-'
    }
    ;
    data.outTime = data.retireTime
    if (data.outTime == undefined || data.outTime == '') {
      data.outTime = data.invalidTime
    }
    ;

    this.assign('data', data);
    this.assign('troubleres', troubleres);
    this.assign('faultcount', faultcount);


    const group = this.mongo('group');
    const groups = await group.where().select();
    let reportcount = 0;
    for (let i = 0; i < groups.length; i++) {
      const codes = groups[i].groupsats;
      if (typeof(codes) === 'string' || (codes != null && codes.indexOf(code) > -1)) {
        const report = this.mongo('report', {database: groups[i].code});
        const grpcount = await report.where({state: '已发布'}).count();
        reportcount += grpcount;
      }
    }
    const repor = this.mongo('report', {database: code});
    const satcount = await repor.where({state: '已发布'}).count();
    reportcount += satcount;
    this.assign('reportcount', reportcount);

    return this.display();
  }

  async getsingletroubletimeAction() {
    const _id = this.post('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _id}).find();
    const designlife = parseFloat(sat.life) * 365;
    //console.log('sat.life',sat.life,'designlife',designlife);
    const this_catArr = new Array();
    let this_tp = 0;
    let restparam = {satcode: sat.code};
    let data = await new Promise(function (resolve, reject) {
      client.post(think.config('RestTroubleAll'), restparam, function (err, req, res, obj) {
        assert.ifError(err);
        resolve(obj);
      });
    });
    let troublecollection = new Array();
    for (let i = 0; i < data.length; i++) {
      troublecollection.push(JSON.parse(data[i]));
    }
    if (troublecollection.length > 0) {
      troublecollection.forEach(function (t2) {
        const t_lanuch = new Date(sat.lanuchTime);
        const t_occur = new Date(t2.occurTime);
        const num_lanuch = t_lanuch.valueOf();
        const num_occur = t_occur.valueOf();
        const num_diff = Math.floor((num_occur - num_lanuch) / (1000 * 60 * 60 * 24)) + 1;
        const num_per = parseFloat((num_diff / designlife).toFixed(2));
        this_catArr.push(num_per);
      });
    }
    this_catArr.sort(function (x, y) {
      return x - y;
    });
    const ptr_this = new Array();
    for (let i = this_catArr.length - 1; i >= 0; i--) {
      if (this_tp != this_catArr[i]) {
        this_tp = this_catArr[i];
        ptr_this.push([this_catArr[i], i + 1]);
      }
    }
    let result = {};
    result.data = ptr_this.reverse();
    result.name = sat.name;
    return this.json({success: true, msg: '', data: result});
  }

  async getsingletroubledistAction() {
    const _id = this.post('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _id}).find();
    let restparam = {satcode: sat.code};
    let data = await new Promise(function (resolve, reject) {
      client.post(think.config('RestTroubleAll'), restparam, function (err, req, res, obj) {
        assert.ifError(err);
        resolve(obj);
      });
    });
    let troublecollection = new Array();
    for (let i = 0; i < data.length; i++) {
      troublecollection.push(JSON.parse(data[i]));
    }
    const this_catArr = new Array();
    const this_zainanArr = new Array();
    const this_guanjianArr = new Array();
    const this_qingduArr = new Array();
    const this_feizhuyaoArr = new Array();

    if (troublecollection.length > 0) {
      troublecollection.forEach(function (t2) {
        let ptr = -1;
        for (let idx = 0; idx < this_catArr.length; idx++) {
          if (this_catArr[idx] == t2.subsys_name) {
            ptr = idx;
            break;
          }
        }
        if (ptr == -1) {
          this_catArr.push(t2.subsys_name);
          this_zainanArr.push(0);
          this_guanjianArr.push(0);
          this_qingduArr.push(0);
          this_feizhuyaoArr.push(0);
          ptr = this_catArr.length - 1;
        }
        if (t2.grade == '灾难性') {
          this_zainanArr[ptr] += 1;
        } else if (t2.grade == '关键性') {
          this_guanjianArr[ptr] += 1;
        } else if (t2.grade == '轻度') {
          this_qingduArr[ptr] += 1;
        } else if (t2.grade == '非主要') {
          this_feizhuyaoArr[ptr] += 1;
        }
      });
    }
    const result = {};
    result.categories = this_catArr;
    result.zainan = this_zainanArr;
    result.guanjian = this_guanjianArr;
    result.qingdu = this_qingduArr;
    result.feizhuyao = this_feizhuyaoArr;
    return this.json({success: true, msg: '', data: result});
  }

  async singleReportAction() {
    const code = this.get('code');
    const group = this.mongo('group');
    const groups = await group.where().select();
    const reports = [];
    for (let i = 0; i < groups.length; i++) {
      const codes = groups[i].groupsats;
      if (typeof(codes) === 'string' || (codes != null && codes.indexOf(code) > -1)) {
        const report = this.mongo('report', {database: groups[i].code});
        const data = await report.field('_id,name,gentime,author,state').where({state: '已发布'}).select();
        for (let j = 0; j < data.length; j++) {
          data[j]._groupid = groups[i]._id;
          data[j].reportType = 'group'; // 增加类型区分组报告还是型号报告
          reports.push(data[j]);
        }
      }
    }
    const repor = this.mongo('report', {database: code});
    const satreport = await repor.field('_id,name,gentime,author,state').where({state: '已发布'}).select();
    for (let i = 0; i < satreport.length; i++) {
      satreport[i].reportType = 'satellite';
      reports.push(satreport[i]);
    }
    return this.json({data: reports});
  }

  async satitemAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    let data = await satellite.where({_id: _id}).find();
    let rows = [];
    rows.push(data);
    return this.json({"total": 1, "rows": rows});
  }

  async satshowAction() {
    const code = this.get('_satcode');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({code: code}).find();
    this.assign('data', sat);
    return this.display();
  }

  async satshow2Action() {
    const code = this.get('_satcode');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({code: code}).find();
    this.assign('data', sat);
    return this.display();
  }

  async subsysshowAction() {
    const _satid = this.get('_satid');
    const _subsysid = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const subsysdb = this.mongo('subsys', {database: sat.code});
    const subsys = await subsysdb.where({_id: _subsysid}).find();
    this.assign('subsys', subsys);
    return this.display();
  }

  async deviceshowAction() {
    const _satid = this.get('_satid');
    const _deviceid = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const devicedb = this.mongo('device', {database: sat.code});
    const device = await devicedb.where({_id: _deviceid}).find();
    this.assign('device', device);
    return this.display();
  }

  async getZhibiaoAction() {
    const code = this.post('_satcode');
    const subsysid = this.post('_subsysid');
    const deviceid = this.post('_deviceid');
    console.log("rrrrrrrrrrrrrr", code, subsysid);
    //查询指标表获取待展示的指标
    const analysisdb = this.mongo('indicator', {database: code});
    let analysiscollection = null;
    if (subsysid != null && subsysid != '' && subsysid != undefined) {
      const subs = this.mongo('subsys', {database: code});
      const sub = await subs.where({_id: subsysid}).find();
      analysiscollection = await analysisdb.where({isShow: '是', level: '分系统级', subsystem: sub.name}).select();//使用型号展示的要求查询
    } else {
      if (deviceid != null && deviceid != '' && deviceid != undefined) {
        const devs = this.mongo('device', {database: code});
        const dev = await devs.where({_id: deviceid}).find();
        analysiscollection = await analysisdb.where({isShow: '是', level: '单机级', device: dev.name}).select();//使用型号展示的要求查询
      } else {
        analysiscollection = await analysisdb.where({isShow: '是', level: '卫星级'}).select();//使用型号展示的要求查询
      }

    }
    const materialdb = this.mongo('indicator_result', {database: code});
    const result = [];
    for (let i = 0; i < analysiscollection.length; i++) {
      let item = {};
      item.name = analysiscollection[i].name;
      item.code = analysiscollection[i].code;
      if (analysiscollection[i].resource_type == 'table') {
        item.type = 'matrix';//数字、向量、矩阵、图片
      } else if (analysiscollection[i].resource_type == 'imge') {
        item.type = 'image';
      } else {
        if (analysiscollection[i].resulttype == 'other') {
          item.type = 'image';
        } else {
          item.type = analysiscollection[i].resulttype;
        }
      }
      item.result = [];
      //let mats = await materialdb.where({code:new RegExp('^'+item.code+'-[0-9]{4}-[0-9]{2}-[0-9]{2}$')}).select({order:{code:1}});
      let mats = await materialdb.where({code: item.code}).select({order: {genTime: 1}});
      for (let j = 0; j < mats.length; j++) {
        let matitem = {};
        matitem.end = mats[j].end?mats[j].end:'';
        matitem.end = matitem.end.substr(0, 10);
        matitem.begin = mats[j].begin?mats[j].begin:'';
        matitem.begin = matitem.begin.substr(0, 10);
        if (analysiscollection[i].resource_type == 'table') {
          matitem.content = mats[j].table;
        } else if (analysiscollection[i].resource_type == 'imge') {
          matitem.content = mats[j].image;
        } else {
          matitem.content = mats[j].custom;
        }
        item.result.push(matitem);
      }
      result.push(item);
    }
    return this.json({success: true, msg: '', data: result});
  }

  async getZhibiaoforIE8Action() {
    const code = this.post('_satcode');
    const subsysid = this.post('_subsysid');
    const deviceid = this.post('_deviceid');
    console.log("rrrrrrrrrrrrrr", code, subsysid);
    //查询指标表获取待展示的指标
    const analysisdb = this.mongo('indicator', {database: code});
    let analysiscollection = null;
    if (subsysid != null && subsysid != '' && subsysid != undefined) {
      const subs = this.mongo('subsys', {database: code});
      const sub = await subs.where({_id: subsysid}).find();
      analysiscollection = await analysisdb.where({isShow: '是', level: '分系统级', subsystem: sub.name}).select();//使用型号展示的要求查询
    } else {
      if (deviceid != null && deviceid != '' && deviceid != undefined) {
        const devs = this.mongo('device', {database: code});
        const dev = await devs.where({_id: deviceid}).find();
        analysiscollection = await analysisdb.where({isShow: '是', level: '单机级', device: dev.name}).select();//使用型号展示的要求查询
      } else {
        analysiscollection = await analysisdb.where({isShow: '是', level: '卫星级'}).select();//使用型号展示的要求查询
        
      }

    }
    
    //console.log("zhibiao:",analysiscollection);
    
    
    const materialdb = this.mongo('indicator_result', {database: code});
    const result = [];
    for (let i = 0; i < analysiscollection.length; i++) {
      let item = {};
      item.name = analysiscollection[i].name;
      item.code = analysiscollection[i].code;
      if (analysiscollection[i].resource_type == 'table') {
        item.type = 'matrix';//数字、向量、矩阵、图片
      } else if (analysiscollection[i].resource_type == 'imge') {
        item.type = 'image';
      } else {
        if (analysiscollection[i].resulttype == 'other') {
          item.type = 'image';
        } else {
          item.type = analysiscollection[i].resulttype;
        }
      }
      item.result = [];
      //let mats = await materialdb.where({code:new RegExp('^'+item.code+'-[0-9]{4}-[0-9]{2}-[0-9]{2}$')}).select({order:{code:1}});
      let mats = await materialdb.where({code: item.code}).select({order: {genTime: 1}});
      //console.log("mats:",item,mats);
      for (let j = 0; j < mats.length; j++) {
        let matitem = {};
        matitem.end = mats[j].end?mats[j].end:'';
        matitem.end = matitem.end.substr(0, 10);
        matitem.begin = mats[j].begin?mats[j].begin:'';
        matitem.begin = matitem.begin.substr(0, 10);
        if (analysiscollection[i].resource_type == 'table') {
          matitem.content = mats[j].table;
        } else if (analysiscollection[i].resource_type == 'imge') {
          //存一个文件到tmp中
          const path = think.ROOT_PATH + '/www/static/tmpimg/';
          const base64string = mats[j].image.replace(/^data:image\/(jpeg|png|gif|bmp|jpg);base64,/, '');
          fs.writeFileSync(path + mats[j]._id + '.png', base64string, 'base64');
          //matitem.content=mats[j].image;
          matitem.content = '/static/tmpimg/' + mats[j]._id + '.png';
        } else {
          if (analysiscollection[i].resulttype == 'other') {
            const path = think.ROOT_PATH + '/www/static/tmpimg/';
            const base64string = mats[j].custom.replace(/^data:image\/(jpeg|png|gif|bmp|jpg);base64,/, '');
            fs.writeFileSync(path + mats[j]._id + '.png', base64string, 'base64');
            //matitem.content=mats[j].image;
            matitem.content = '/static/tmpimg/' + mats[j]._id + '.png';
          } else {
            matitem.content = mats[j].custom;
          }
        }
        item.result.push(matitem);
      }
      result.push(item);
    }
    return this.json({success: true, msg: '', data: result});
  }

  async getdeviceAction() {
    const code = this.post('_satcode');
    const subsysid = this.post('_subsysid');
    //查询指标表获取待展示的指标
    const devicedb = this.mongo('device', {database: code});
    const device = await devicedb.field('_id,name').where({subsys: subsysid}).select();
    return this.json({success: true, msg: '', data: device});
  }

  async faultAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const fault = this.mongo('fault', {database: sat.code});
    const _id = this.get("_id");
    let data = await fault.where({_id: _id}).find();
    this.assign("sat", sat);
    this.assign("data", data);
    console.log(data);
    return this.display();
  }

};
