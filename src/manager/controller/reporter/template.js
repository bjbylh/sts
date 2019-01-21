const Base = require('../base.js');

module.exports = class extends Base {
  async grplistAction() {
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _id}).find();
    this.assign("group", groupitem);
    return this.display();
  }

  async getgrptemplatesAction() {
    const _groupid = this.get("_groupid");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    const template = this.mongo('template', {database: groupitem.code});
    let data = await template.where().select();
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
    const template = this.mongo('template', {database: groupitem.code});
    const _id = this.get("_id");
    let data = await template.where({_id: _id}).find();
    this.assign("group", groupitem);
    this.assign("data", data);
    return this.display("manager/reporter/template_grpadd.html");
  }

  async grpdeleteAction() {
    const group = this.mongo('group');
    const _groupid = this.post("_groupid");
    let groupitem = await group.where({_id: _groupid}).find();
    const template = this.mongo('template', {database: groupitem.code});
    const _id = this.post("_id");
    let affectedRows = await template.where({_id: _id}).delete();
    return this.json({success: true, msg: '删除模板成功', data: affectedRows});
  }

  async doGrpSaveAction() {
    const group = this.mongo('group');
    const _groupid = this.post("_groupid");
    let groupitem = await group.where({_id: _groupid}).find();
    const template = this.mongo('template', {database: groupitem.code});
    let data = new Object();
    data.name = this.post("name");
    data.code = this.post("code");
    data.type = this.post("type");
    data.genTime = this.post("genTime");
    data.template = this.post('template');
    const _id = this.post("_id");

    if (_id == undefined || _id == null || _id == "") {
      let insertId = await template.add(data);
      return this.json({success: true, msg: '添加模板成功', data: insertId});
    } else {
      let affectedRows = await template.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑模板成功', data: affectedRows});
    }
  }

  async grptagAction() {
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _id}).find();
    this.assign("group", groupitem);
    return this.display();
  }

  async getgrptagsAction() {
    const _groupid = this.get("_groupid");
    console.log("groupid", _groupid);
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    console.log(groupitem);
    const satellite = this.mongo('satellite');
    let wherestr = {"code": {"$in": groupitem.groupsats}};
    if (typeof groupitem.groupsats == "string")
      wherestr = {"code": groupitem.groupsats};
    let sats = await satellite.where(wherestr).select();

    let res = new Array();
    res.push({code: 'START', name: '报告期开始日期'});
    res.push({code: 'END', name: '报告期结束日期'});
    res.push({code: 'BASICINFO', name: '航天器基本信息'});
    res.push({code: 'TROUBLE-PART', name: '本报告期内异常信息汇总'});
    res.push({code: 'TROUBLE-ALLD', name: '全部异常信息汇总'});
    res.push({code: 'FAULT', name: '全部常驻故障汇总'});

    for (let i = 0; i < sats.length; i++) {
      let sat = sats[i];
      res.push({code: 'ORIBTCTRLEVENT-PART%' + sat.code, name: sat.name + '轨道控制事件信息汇总'});
      res.push({code: 'DEORIBTCTRLEVENT-PART%' + sat.code, name: sat.name + '离轨控制事件信息汇总'});
      res.push({code: 'ANTIJAMEVENT-PART%' + sat.code, name: sat.name + '日月干扰保护信息汇总'});
      res.push({code: 'TRANSFORMEVENT-PART%' + sat.code, name: sat.name + '动零转换信息汇总'});
      res.push({code: 'LIGHTPERIODEVENT-PART%' + sat.code, name: sat.name + '光照期管理信息汇总'});
      res.push({code: 'SHADOWPERIODEVENT-PART%' + sat.code, name: sat.name + '地月影期管理信息汇总'});
      res.push({code: 'OTHEREVENT-PART%' + sat.code, name: sat.name + '其他事件信息汇总'});

      const subsysDB = this.mongo('subsys', {database: sat.code});
      const subcollection = await subsysDB.where().select();
      for (let j = 0; j < subcollection.length; j++) {
        res.push({
          code: 'TROUBLE-ALLD%' + sat.code + '%' + subcollection[j].name,
          name: sat.name + subcollection[j].name + '全部异常信息汇总'
        });
        res.push({
          code: 'TROUBLE-PART%' + sat.code + '%' + subcollection[j].name,
          name: sat.name + subcollection[j].name + '本报告期内异常信息汇总'
        });
        res.push({
          code: 'DEVICE%' + sat.code + '%' + subcollection[j].name,
          name: sat.name + subcollection[j].name + '单机工作状态汇总'
        });
      }
      const analysisDB = this.mongo('analysis', {database: sat.code});
      const anacollection = await analysisDB.where().select();
      for (let j = 0; j < anacollection.length; j++) {
        res.push({code: anacollection[j].code + '%' + sat.code, name: sat.name + anacollection[j].name});
      }
    }
    return this.json({data: res});
  }

  async grpanalysisAction() {
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _id}).find();
    this.assign("group", groupitem);
    return this.display();
  }

  async getgrpanalysisAction() {
    const _groupid = this.get("_groupid");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    const satellite = this.mongo('satellite');
    let wherestr = {"code": {"$in": groupitem.groupsats}};
    if (typeof groupitem.groupsats == "string")
      wherestr = {"code": groupitem.groupsats};
    let sats = await satellite.where(wherestr).select();

    let res = new Array();
    const analysis = this.mongo('analysis', {database: groupitem.code});
    const anas = await analysis.where().select();
    for (let i = 0; i < anas.length; i++) {
      res.push({code: anas[i].code, name: anas[i].name});
    }

    for (let i = 0; i < sats.length; i++) {
      let sat = sats[i];
      const analysisDB = this.mongo('analysis', {database: sat.code});
      const anacollection = await analysisDB.where().select();
      for (let j = 0; j < anacollection.length; j++) {
        res.push({code: anacollection[j].code + '%' + sat.code, name: sat.name + anacollection[j].name});
      }
    }
    return this.json({data: res});
  }

  //型号模板定义相关内容
  async satlistAction() {
    const id = this.get('_id');
    const satellite = this.mongo('satellite');
    const data = await satellite.where({_id: id}).find();
    this.assign({'data': data});
    return this.display();
  }

  async getsattemplatesAction() {
    const id = this.get('_id')
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: id}).find();
    const template = this.mongo('template', {database: sat.code});
    const data = await template.where().select();
    return this.json({'data': data});
  }

  async sataddAction() {
    const satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: satid}).find();
    this.assign({'sat': sat});
    return this.display();
  }

  async sateditAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.get('_satid');
    const sat = await satellite.where({_id: _satid}).find();
    const template = this.mongo('template', {database: sat.code});
    const _id = this.get('_id');
    const data = await template.where({_id: _id}).find();
    this.assign({'sat': sat});
    this.assign('data', data);
    return this.display('manager/reporter/template_satadd.html');
  }

  async satdeleteAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    const sat = await satellite.where({_id: _satid}).find();
    const template = this.mongo('template', {database: sat.code});
    const _id = this.post('_id');
    const affectedRows = await template.where({_id: _id}).delete(); // 真的要删除吗？还是标记删除，待定
    return this.json({success: true, msg: '删除模板成功', data: affectedRows});
  }

  async doSatSaveAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    const sat = await satellite.where({_id: _satid}).find();
    const template = this.mongo('template', {database: sat.code});
    const data = new Object();
    data.name = this.post('name');
    data.code = this.post('code');
    data.type = this.post('type');
    data.genTime = this.post('genTime');
    data.template = this.post('template');
    const _id = this.post('_id');
    if (_id == undefined || _id == null || _id == '') {
      const insertId = await template.add(data);
      return this.json({success: true, msg: '添加模板成功', data: insertId});
    } else {
      const affectedRows = await template.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑模板成功', data: affectedRows});
    }
  }

  async sattagAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _id}).find();
    this.assign('sat', sat);
    return this.display();
  }

  // grpindicatorAction
  async grpindicatorAction() {
    const _groupid = this.get('_groupid');
    const group = this.mongo('group');
    const grp = await group.where({_id: _groupid}).find();
    this.assign('grp', grp);
    return this.display();
  }

  async satindicatorAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _id}).find();
    this.assign('sat', sat);
    return this.display();
  }


  async getsattagsAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const subsysDB = this.mongo('subsys', {database: sat.code});
    const subcollection = await subsysDB.where().select();
    let res = new Array();
    res.push({code: 'START', name: '报告期开始日期'});
    res.push({code: 'END', name: '报告期结束日期'});
    res.push({code: 'BASICINFO', name: '航天器基本信息'});
    res.push({code: 'TROUBLE-PART', name: '本报告期内异常信息汇总'});
    res.push({code: 'TROUBLE-ALLD', name: '全部异常信息汇总'});
    res.push({code: 'FAULT', name: '全部常驻故障汇总'});
    res.push({code: 'ORIBTCTRLEVENT-PART%' + sat.code, name: '轨道控制事件信息汇总'});
    res.push({code: 'DEORIBTCTRLEVENT-PART%' + sat.code, name: '离轨控制事件信息汇总'});
    res.push({code: 'ANTIJAMEVENT-PART%' + sat.code, name: '日月干扰保护信息汇总'});
    res.push({code: 'TRANSFORMEVENT-PART%' + sat.code, name: '动零转换信息汇总'});
    res.push({code: 'LIGHTPERIODEVENT-PART%' + sat.code, name: '光照期管理信息汇总'});
    res.push({code: 'SHADOWPERIODEVENT-PART%' + sat.code, name: '地月影期管理信息汇总'});
    res.push({code: 'OTHEREVENT-PART%' + sat.code, name: '其他事件信息汇总'});
    for (let i = 0; i < subcollection.length; i++) {
      res.push({
        code: 'TROUBLE-ALLD%' + sat.code + '%' + subcollection[i].name,
        name: subcollection[i].name + '全部异常信息汇总'
      });
      res.push({
        code: 'TROUBLE-PART%' + sat.code + '%' + subcollection[i].name,
        name: subcollection[i].name + '本报告期内异常信息汇总'
      });
      res.push({code: 'DEVICE%' + sat.code + '%' + subcollection[i].name, name: subcollection[i].name + '单机工作状态汇总'});
    }
    return this.json({data: res});
  }

  async satanalysisAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const data = await satellite.where({_id: _id}).find();
    this.assign('sat', data);
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

  async getgrpindicatorAction() {
    const groupcode = this.get('groupcode');
    const indicator = this.mongo('indicator', {database: groupcode});
    const data = await indicator.where().select();
    const group = this.mongo('group');
    const gr = await group.where({code: groupcode}).find();
    const groupsats = gr.groupsats;
    for (var i = 0; i < groupsats.length; i++) {
      const indicator = this.mongo('indicator', {database: groupsats[i]});
      const satinds = await indicator.where().select();
      for (var j = 0; j < satinds.length; j++) {
        satinds[j].name = groupsats[i] + '_' + satinds[j].name;
        satinds[j].code += '%' + groupsats[i];
        data.push(satinds[j]);
      }
    }
    return this.json({data: data});
  }// getsatindicatorAction
  async getsatindicatorAction() {
    const satcode = this.get('satcode');
    const indicator = this.mongo('indicator', {database: satcode});
    const data = await indicator.where().select();
    return this.json({data: data});
  }

  async validatesattmpAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const satcode = this.get('satcode');
    const analysis = this.mongo('template', {database: satcode});
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
  async validategrptmpAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const grpcode = this.get('grpcode');
    const analysis = this.mongo('template', {database: grpcode});
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
}
