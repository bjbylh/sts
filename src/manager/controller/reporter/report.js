const Base = require('../base.js');
const clients = require('restify-clients');
const client = clients.createJsonClient({
  url: think.config('RestReload'),
  version: '~1.0'
});

module.exports = class extends Base {
  async grplistAction() {
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _id}).find();
    this.assign("group", groupitem);
    return this.display();
  }

  async getgrpreportsAction() {
    const _groupid = this.get("_groupid");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    let data = await report.field('_id,name,code,gentime,lastModified,author,state').where().select();
    for(let i=0;i<data.length;i++){
      if(data[i].lastModified==undefined)
        data[i].lastModified=data[i].gentime;
    }
    return this.json({data: data});
  }

  async grpeditorAction() {
    const _groupid = this.get("_groupid");
    const _id = this.get("_id");
    console.log(_id);
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    console.log(groupitem);
    const report = this.mongo('report', {database: groupitem.code});

    let data = await report.where({_id: _id}).find();
    this.assign("group", groupitem);
    this.assign("data", data);
    return this.display();
  }

  async savegrpAction() {
    const group = this.mongo('group');
    const _groupid = this.post("_groupid");
    let groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    let data = new Object();
    data.report = this.post("report");
    data.lastModified = (new Date()).Format('yyyy-MM-dd hh:mm:ss');
    const _id = this.post("_id");
    if (_id == undefined || _id == null || _id == "") {
    } else {
      let affectedRows = await report.where({_id: _id}).update(data);
      return this.json({success: true, msg: '报告编辑成功', data: affectedRows});
    }
  }

  async grpdeleteAction () {
    const group = this.mongo ('group');
    const _groupid = this.post ("_groupid");
    let groupitem = await group.where ({_id: _groupid}).find ();
    const report = this.mongo ('report', {database: groupitem.code});
    const _id = this.post ("_id");
    let affectedRows = await report.where ({_id: _id}).delete ();//真的要删除吗？还是标记删除，待定
    return this.json({success: true, msg: '报告删除成功', data: affectedRows});
  }

  async grppublishAction() {
    const group = this.mongo('group');
    const _groupid = this.post("_groupid");
    let groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    let data = new Object();
    data.state = '已发布';
    const _id = this.post("_id");
    if (_id == undefined || _id == null || _id == "") {
    } else {
      let affectedRows = await report.where({_id: _id}).update(data);
      return this.json({success: true, msg: '报告发布成功', data: affectedRows});
    }
  }

  async grpunpublishAction() {
    const group = this.mongo('group');
    const _groupid = this.post("_groupid");
    let groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    let data = new Object();
    data.state = '未发布';
    const _id = this.post("_id");
    if (_id == undefined || _id == null || _id == "") {
    } else {
      let affectedRows = await report.where({_id: _id}).update(data);
      return this.json({success: true, msg: '报告撤回成功', data: affectedRows});
    }
  }

  async grpreloadAction() {
    const _groupid = this.post('_groupid');
    const _id = this.post('_id');
    console.log(_groupid, _id);
    const group = this.mongo('group');
    const groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    const data = await report.where({_id: _id}).find();
    const taskdb = this.mongo('task');
    console.log(data);
    let restask = new Object();
    restask.name = data.name + "-" + (new Date()).Format("yyyy-MM-dd") + '-reload';
    restask.type = "reload";
    const userAccount = await this.session('account');
    restask.operator = userAccount;// 此处更改为登录用户名
    const updatetime = (new Date()).Format("yyyy-MM-dd hh:mm:ss");
    restask.updatetime = updatetime;
    restask.state = 'dispatch';
    restask.history = new Array();
    restask.history.push({state: "dispatch", time: updatetime, operator: userAccount});// 此处更改为登录用户名
    let resbody = new Object();
    resbody.starttime = data.begin;
    resbody.endtime = data.end;
    resbody.code = groupitem.code;
    resbody.type = 'grp';
    resbody.reportid = data._id;
    restask.body = JSON.stringify(resbody);
    restask.result = null;
    restask.parent = null;
    restask.children = new Array();
    let insertId = await taskdb.add(restask);
    let feedback = await new Promise(function (resolve, reject) {
      var str = {
        _id: insertId
      };
      client.post('/reload', str, function (err, req, res, obj) {
        console.log(err);
        console.log('Server returned: %j', obj);
        resolve(obj);
      });
    });
    console.log('feedback', feedback);
    return this.json(feedback);
  }

  //型号报告相关

  async satlistAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _id}).find();
    this.assign("sat", sat);
    return this.display();
  }

  async getsatreportsAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    let data = await report.field('_id,name,code,gentime,lastModified,author,state').where().select();
    for(let i=0;i<data.length;i++){
      if(data[i].lastModified==undefined)
        data[i].lastModified=data[i].gentime;
    }
    return this.json({data: data});
  }

  async sateditorAction() {
    const _satid = this.get('_satid');
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const data = await report.where({_id: _id}).find();
    this.assign('sat', sat);
    this.assign('data', data);
    return this.display();
  }

  async savesatAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const data = new Object();
    data.report = this.post('report');
    data.lastModified = (new Date()).Format('yyyy-MM-dd hh:mm:ss');
    const _id = this.post('_id');
    if (_id == undefined || _id == null || _id == "") {
    } else {
      const affectedRows = await report.where({_id: _id}).update(data);
      return this.json({success: true, msg: '报告编辑成功', data: affectedRows});
    }
  }

  async satdeleteAction() {
    const _satid = this.post('_satid');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const _id = this.post('_id');
    const affectedRows = await report.where({_id: _id}).delete(); // 真的要删除吗？还是标记删除，待定
    return this.json({success: true, msg: '报告删除成功', data: affectedRows});
  }

  async satpublishAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const data = new Object();
    data.state = '已发布';
    //data.lastModified = (new Date()).Format('yyyy-MM-dd hh:mm:ss');
    const _id = this.post('_id');
    if (_id == undefined || _id == null || _id == "") {
    } else {
      const affectedRows = await report.where({_id: _id}).update(data);
      return this.json({success: true, msg: '报告发布成功', data: affectedRows});
    }
  }

  async satunpublishAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const data = new Object();
    data.state = '未发布';
    //data.lastModified = (new Date()).Format('yyyy-MM-dd hh:mm:ss');
    const _id = this.post('_id');
    if (_id == undefined || _id == null || _id == "") {
    } else {
      const affectedRows = await report.where({_id: _id}).update(data);
      return this.json({success: true, msg: '报告撤回成功', data: affectedRows});
    }
  }

  async satreloadAction() {
    const _satid = this.post('_satid');
    const _id = this.post('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const data = await report.where({_id: _id}).find();
    const taskdb = this.mongo('task');
    let restask = new Object();
    restask.name = data.name + "-" + (new Date()).Format("yyyy-MM-dd") + '-reload';
    restask.type = 'reload';
    const userAccount = await this.session('account');
    restask.operator = userAccount;// 此处更改为登录用户名
    const updatetime = (new Date()).Format("yyyy-MM-dd hh:mm:ss");
    restask.updatetime = updatetime;
    restask.state = 'dispatch';
    restask.history = new Array();
    restask.history.push({state: "dispatch", time: updatetime, operator: userAccount});// 此处更改为登录用户名
    let resbody = new Object();
    resbody.starttime = data.begin;
    resbody.endtime = data.end;
    resbody.code = sat.code;
    resbody.type = 'sat';
    resbody.reportid = data._id;
    restask.body = JSON.stringify(resbody);
    restask.result = null;
    restask.parent = null;
    restask.children = new Array();
    let insertId = await taskdb.add(restask);
    let feedback = await new Promise(function (resolve, reject) {
      var str = {
        _id: insertId
      };
      client.post('/reload', str, function (err, req, res, obj) {
        resolve(obj);
      });
    });
    return this.json(feedback);
  }
};
