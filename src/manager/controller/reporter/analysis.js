const Base = require('../base.js');

module.exports = class extends Base {
  async satlistAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _id}).find();
    this.assign('sat', sat);
    return this.display();
  }

  async getsatanalysisAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const analysis = this.mongo('analysis', {database: sat.code});
    const data = await analysis.where().select();
    return this.json({data: data});
  }

  async sataddAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    if (sat.code_out == undefined || sat.code_out == '')
      sat.code_out = sat.code;
    this.assign('sat', sat);
    return this.display();
  }

  async sateditAction() {
    const _satid = this.get('_satid');
    console.error(_satid);
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    if (sat.code_out == undefined || sat.code_out == '')
      sat.code_out = sat.code;
    //console.error(sat);
    const analysis = this.mongo('analysis', {database: sat.code});
    const _id = this.get('_id');
    const data = await analysis.where({_id: _id}).find();
    this.assign('data', data);
    this.assign('sat', sat);
    return this.display('manager/reporter/analysis_satadd.html');
  }

  async satdeleteAction() {
    const _satid = this.post('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const analysis = this.mongo('analysis', {database: sat.code});
    const _id = this.post('_id');
    const affectedRows = await analysis.where({_id: _id}).delete(); // 真的要删除吗？还是标记删除，待定
    return this.json({success: true, msg: '型号素材定义删除成功', data: affectedRows});
  }

  async getsatparamsAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const analysis = this.mongo('analysis', {database: sat.code});
    const _id = this.get('_id');
    const analysisitem = await analysis.where({_id: _id}).find();
    if (analysisitem == null) {
      return this.json({data: new Array()});
    }
    const type = this.get('resource_type');
    let data;
    switch (type) {
      case 'imge' :
        data = analysisitem.imge_params;
        if(data!=undefined && data.length!=undefined){
          for(let idx=0;idx<data.length;idx++){
            if(data[idx].seq == undefined || data[idx].seq == 0)
              data[idx].seq = data[idx].tmid;
          }
        }
        break;
      case 'table' :
        data = analysisitem.table_params;
        break;
      default :
        data = new Array();
        break;
    }
    if (data == null) {
      return this.json({data: new Array()});
    } else {
      return this.json({data: data});
    }
  }

  async doSaveSatAnalysisAction() {
    const _satid = this.post('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const analysis = this.mongo('analysis', {database: sat.code});
    const data = new Object();
    data.name = this.post('name');
    data.code = this.post('code');
    data.wantornot = this.post('wantornot');
    data.wantbegin = this.post('wantbegin');
    data.wantend = this.post('wantend');
    data.resource_type = this.post('resource_type');
    data.style = this.post('style');
    const _params = this.post('_params'); // JSON.parse();
    const imgeParams = this.post('imge_params'); // JSON.parse();
    if (_params) {
      let Ftable = JSON.parse(_params);
      let Rtable = [];
      for (let i = 0; i < Ftable.length; i++) {
        let ritem = Ftable[i];
        const tminfo = this.mongo('tminfo', {database: ritem.sat});
        const tminstance = await tminfo.where({code: ritem.code}).find();
        if (JSON.stringify(tminstance) !== '{}') {
          ritem.tmid = tminstance.tmid;
          ritem.note = tminstance.note;
          Rtable.push(ritem);
        }
      }
      data.table_params = Rtable;
    }
    if (imgeParams) {
      let Fimage = JSON.parse(imgeParams);
      let Rimage = [];
      for (let i = 0; i < Fimage.length; i++) {
        let ritem = Fimage[i];
        const tminfo = this.mongo('tminfo', {database: ritem.sat});
        const tminstance = await tminfo.where({code: ritem.code}).find();
        if (JSON.stringify(tminstance) !== '{}') {
          ritem.tmid = tminstance.tmid;
          ritem.note = tminstance.note;
          Rimage.push(ritem);
        }
      }
      data.imge_params = Rimage;
    }
    const _id = this.post('_id');
    if (_id == undefined || _id == null || _id == '') {
      const insertId = await analysis.add(data);
      return this.json({success: true, msg: '型号素材定义添加成功', data: insertId});
    } else {
      const affectedRows = await analysis.where({_id: _id}).update(data);
      return this.json({success: true, msg: '型号素材定义编辑成功', data: affectedRows});
    }
  }

  //分组的
  async grplistAction() {
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _id}).find();
    this.assign("group", groupitem);
    return this.display();
  }

  async getgrpanalysisAction() {
    const _groupid = this.get("_groupid");
    console.log("groupid", _groupid);
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    console.log(groupitem);
    const analysis = this.mongo('analysis', {database: groupitem.code});
    let data = await analysis.where().select();
    return this.json({data: data});
  }

  async grpaddAction() {
    const _groupid = this.get("_groupid");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    this.assign("group", groupitem);
    return this.display();
  }

  async grpeditAction() {
    const _groupid = this.get("_groupid");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    const analysis = this.mongo('analysis', {database: groupitem.code});
    const _id = this.get("_id");
    let data = await analysis.where({_id: _id}).find();
    this.assign("group", groupitem);
    this.assign("data", data);
    return this.display("manager/reporter/analysis_grpadd.html");
  }

  async grpdeleteAction() {
    const group = this.mongo('group');
    const _groupid = this.post("_groupid");
    let groupitem = await group.where({_id: _groupid}).find();
    const analysis = this.mongo('analysis', {database: groupitem.code});
    const _id = this.post("_id");
    console.log(_id, _groupid);
    let affectedRows = await analysis.where({_id: _id}).delete();//真的要删除吗？还是标记删除，待定
    return this.json({success: true, msg: '删除分组素材定义成功', data: affectedRows});
  }

  async doSaveGrpAnalysisAction() {
    const group = this.mongo('group');
    const _groupid = this.post("_groupid");
    let groupitem = await group.where({_id: _groupid}).find();
    console.log(groupitem);
    const analysis = this.mongo('analysis', {database: groupitem.code});
    let data = new Object();
    data.name = this.post("name");
    data.code = this.post("code");

    data.wantornot = this.post('wantornot');
    data.wantbegin = this.post('wantbegin');
    data.wantend = this.post('wantend');
    data.resource_type = this.post('resource_type');
    data.style = this.post("style");
    const _id = this.post("_id");
    const _params = this.post('_params'); // JSON.parse();
    const imgeParams = this.post('imge_params'); // JSON.parse();

    if (_params) {
      let Ftable = JSON.parse(_params);
      let Rtable = [];
      for (let i = 0; i < Ftable.length; i++) {
        let ritem = Ftable[i];
        const tminfo = this.mongo('tminfo', {database: ritem.sat});
        const tminstance = await tminfo.where({code: ritem.code}).find();
        if (JSON.stringify(tminstance) !== '{}') {
          ritem.tmid = tminstance.tmid;
          ritem.note = tminstance.note;
          Rtable.push(ritem);
        }
      }
      data.table_params = Rtable;
    }
    if (imgeParams) {
      let Fimage = JSON.parse(imgeParams);
      let Rimage = [];
      for (let i = 0; i < Fimage.length; i++) {
        let ritem = Fimage[i];
        const tminfo = this.mongo('tminfo', {database: ritem.sat});
        const tminstance = await tminfo.where({code: ritem.code}).find();
        if (JSON.stringify(tminstance) !== '{}') {
          ritem.tmid = tminstance.tmid;
          ritem.note = tminstance.note;
          Rimage.push(ritem);
        }
      }
      data.imge_params = Rimage;
    }
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await analysis.add(data);
      return this.json({success: true, msg: '添加分组素材定义成功', data: insertId});
    } else {
      let affectedRows = await analysis.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑分组素材定义成功', data: affectedRows});
    }
  }

  async getgrpparamsAction() {
    const _groupid = this.get('_groupid');
    const group = this.mongo('group');
    const groupitem = await group.where({_id: _groupid}).find();
    const analysis = this.mongo('analysis', {database: groupitem.code});
    const _id = this.get('_id');
    const analysisitem = await analysis.where({_id: _id}).find();
    if (analysisitem == null) {
      return this.json({data: new Array()});
    }
    const type = this.get('resource_type');
    let data;
    switch (type) {
      case 'imge' :
        data = analysisitem.imge_params;
        if(data!=undefined && data.length!=undefined){
          for(let idx=0;idx<data.length;idx++){
            if(data[idx].seq == undefined || data[idx].seq == 0)
              data[idx].seq = data[idx].tmid;
          }
        }
        break;
      case 'table' :
        data = analysisitem.table_params;
        break;
      default :
        data = new Array();
        break;
    }
    if (data == null) {
      return this.json({data: new Array()});
    } else {
      return this.json({data: data});
    }
  }

  async allparamsingrpAction() {
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _id}).find();
    this.assign("group", groupitem);
    return this.display();
  }

  async getallparamsingrpAction() {
    const _groupid = this.get("_groupid");
    const group = this.mongo('group');
    const satellite = this.mongo('satellite');
    let groupitem = await group.where({_id: _groupid}).find();
    let res = new Array();
    for (let i = 0; i < groupitem.groupsats.length; i++) {
      let sat = await satellite.where({code: groupitem.groupsats[i]}).find();
      if (sat.code_out == undefined || sat.code_out == '')
        sat.code_out = sat.code;
      let satdatabase = this.mongo("tminfo", {database: groupitem.groupsats[i]});
      let data = await satdatabase.where().select();
      data.forEach(function(item) {
        let param = new Object();
        param.sat = groupitem.groupsats[i];
        param.sat_out = sat.code_out;
        param.tmid = item.tmid;
        param.code = item.code;
        param.note = item.note;
        res.push(param);
      });
    }
    return this.json({data: res});
  }

  async getGroupSatsAction() {
    const _id = this.get("_groupid");
    let selectArr = null;
    if (_id != undefined && _id != null && _id != "") {
      const group = this.mongo('group');
      let groupitem = await group.where({_id: _id}).find();
      selectArr = groupitem.groupsats;
    }
    const satellite = this.mongo('satellite');
    let data2 = new Array();
    if (typeof(selectArr) !== 'string') {
      for (let i = 0; i < selectArr.length; i++) {
        let sat = await satellite.where({code: selectArr[i]}).find();
        if (sat.code_out == undefined || sat.code_out == '')
          sat.code_out = sat.code;
        let te = new Object();
        te.id = selectArr[i];
        te.text = sat.code_out;
        data2.push(te);
      }
      ;
    } else {
      let sat = await satellite.where({code: selectArr}).find();
      if (sat.code_out == undefined || sat.code_out == '')
        sat.code_out = sat.code;
      let te = new Object();
      te.id = selectArr;
      te.text = sat.code_out;
      data2.push(te);
    }
    return this.json({data: data2});
  }

  // const analysis = this.mongo('analysis', {database: groupitem.code});
  async validatesatannAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const satcode = this.get('satcode');
    const analysis = this.mongo('analysis', {database: satcode});
    const data = await analysis.where({code: code}).find();
    if (!data._id) {
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        return this.json('true');
      } else {
        return this.json('false');
      }
    }
  }
  // validategrpann
  async validategrpannAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const grpcode = this.get('grpcode');
    const analysis = this.mongo('analysis', {database: grpcode});
    const data = await analysis.where({code: code}).find();
    if (!data._id) {
      //return this.json({result: 1, state: true});
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        //return this.json({result: 1, state: true});
        return this.json('true');
      } else {
        //return this.json({result: 0, state: false});
        return this.json('false');
      }
    }
  }
};
