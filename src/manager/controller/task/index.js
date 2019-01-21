const Base = require('../base.js');

const clients = require('restify-clients');
const client = clients.createJsonClient({
  url: think.config('RestEvaluation'),
  version: '~1.0'
});
const clientMaterial = clients.createJsonClient({
  url: think.config('RestAnalysis'),
  version: '~1.0'
});

module.exports = class extends Base {
  async listAction() {
    return this.display();
  }

  // 分析任务验证
  async analysisAction() {
    const code = this.get('code');
    const analysiscode = this.get('analysiscode');
    let name = this.get('name') + ' (';
    name += await this.getLocalTime() + ')';
    this.assign('name', name);
    this.assign('code', code);
    this.assign('analysiscode', analysiscode);
    return this.display();
  }

  // 模板任务
  async evaluationAction() {
    const code = this.get('code');
    const tplid = this.get('tplid');
    const type = this.get('type');
    let name = this.get('name') + ' (';
    name += await this.getLocalTime() + ')';
    this.assign('name', name);
    this.assign('code', code);
    this.assign('tplid', tplid);
    this.assign('bodytype', type);
    return this.display();
  }

  // 获取个人近期任务
  async recentListAction() {
    // this.copy();
    let pid = this.get('parentid');
    const task = this.mongo('task');
    if (!pid) {
      pid = null;
    }
    let starttime = this.get('startdate');
    let endtime = this.get('enddate');
    if (!endtime) {
      endtime = await this.getdate(0);
    } else {
      endtime += ' 23:59:59';
    }
    console.error(endtime);
    if (!starttime) {
      starttime = await this.getdate(-3);
    }
    const userAccount = await this.session('account');
    const data = await task.where({parent: pid}).where({operator: userAccount}).where({updatetime: {$gte: starttime}}).where({updatetime: {$lte: endtime}}).select();
    return this.json({data: data});
  }

  // 子任务
  async recentchildrenListAction() {
    // this.copy();
    let pid = this.get('parentid');
    const task = this.mongo('task');
    if (!pid) {
      pid = null;
    }
    const data = await task.where({parent: pid}).select();
    return this.json({data: data});
  }

  // 获取单个任务
  async getTaskAction() {
    const _id = this.get('_id');
    const task = this.mongo('task');
    const data = await task.where({_id: _id}).find();
    return this.json({data: data});
  }

  // 获取报告名称
  async reportnameAction() {
    const _id = this.get('_id');
    const task = this.mongo('task');
    const data = await task.where({_id: _id}).find();
    const body = JSON.parse(data.body);
    let name = '';
    if (body != {} && body) {
      const db = this.mongo('report', {database: body.code});
      const data = await db.where({_id: body.reportid}).find();
      name = data.name;
    }
    return this.json({name: name});
  }

  /**
   *
   * @param days
   * @returns {Promise.<void>}
   */
  async getdate(daysnummber) {
    var today = new Date();
    var milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * daysnummber;
    today.setTime(milliseconds);
    return today.Format('yyyy-MM-dd hh:mm:ss');
  }

  async addAction() {
    return this.display();
  }

  /**
   * 获取型号和组
   * @returns {Promise.<*>}
   */
  async evaluationBodyCodeAction() {
    const type = this.post('type');
    let db;
    if (type === 'sat') {
      db = this.mongo('satellite');
    } else {
      db = this.mongo('group');
    }
    const data = await db.where().select();
    return this.json({'data': data});
  }

  /**
   * 获取模板列表
   * @returns {Promise.<void>}
   */
  async gettpidAction() {
    const code = this.post('code');
    const db = this.mongo('template', {database: code});
    const data = await db.where().select();
    return this.json({'data': data});
  }

  async getanalAction() {
    const code = this.post('code');
    const db = this.mongo('analysis', {database: code});
    const data = await db.where().select();
    return this.json({'data': data});
  }

  /**
   * 新增保存
   */
  async saveAction() {
    var data = {};
    data.name = this.post('name');
    data.body = this.post('body');
    data.type = this.post('type');
    data.updatetime = await this.getLocalTime();
    const userAccount = await this.session('account');
    data.children = [];
    var history = {};
    history.state = 'dispatch';
    history.time = await this.getLocalTime();
    history.operator = userAccount;
    data.state = 'dispatch';
    data.operator = userAccount;
    const arr = [];
    arr.push(history);
    data.history = arr;// JSON.stringify(arr);
    const task = this.mongo('task');
    const insertId = await task.add(data);
    var str = {
      _id: insertId
    };
    if (data.type === 'evaluation') {
      await new Promise(function(resolve, reject) {
        client.post('/evaluator', str, function(err, req, res, obj) {
          console.error(err);
          console.error('Server returned: %j', obj);
          resolve(obj);
        });
      });
    } else {
      await new Promise(function(resolve, reject) {
        clientMaterial.post('/report/analysisTask', str, function(err, req, res, obj) {
          if (err) {
            console.error(err);
          } else {
            console.log('Server returned: %j', obj);
          }
          resolve(obj);
        });
      });
    }
    const rsp = {success: true, msg: '已添加验证。', data: insertId};
    console.error(rsp);
    return this.json(rsp);
  }

  async stopAction() {
    const _id = this.get('_id');
    var str = {
      _id: _id
    };
    console.error('停止任务');
    await new Promise(function(resolve, reject) {
      client.post('/stop', str, function(err, req, res, obj) {
        console.error(err);
        console.error('Server returned: %j', obj);
      });
    });
    const rsp = {success: true, msg: '任务已经停止。', data: _id};
    return this.json(rsp);
  }

  async getLocalTime() {
    const date = new Date();
    return date.Format('yyyy-MM-dd hh:mm:ss');
  }

  async getidbycodeAction() {
    const code = this.get('code');
    const type = this.get('type');
    let db = this.mongo('group');
    if (type === 'sat') {
      db = this.mongo('satellite');
    }
    const data = await db.where({code: code}).find();
    return this.json({'data': data});
  }

  // 分析结果
  async resultAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    this.assign({'code': code});
    this.assign({'_id': _id});
    return this.display();
  }

  async getmaterialAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const db = this.mongo('material', {database: code});
    const data = await db.where({_id: _id}).find();
    return this.json(data);
  }

  async deleteAction() {
    const _id = this.get('_id');
    const task = this.mongo('task');
    const data = await task.where({_id: _id}).find();
    if (data.state !== 'success' && data.state !== 'failed') {
      return this.json({success: true, msg: '删除失败,当前状态不允许删除。'});
    }
    await this.dodelete(_id, task, 0);
    return this.json({success: true, msg: '任务删除成功'});
  }

  async dodelete(_id, task) {
    const datas = await task.where({parent: _id}).select();
    if (datas.length > 0) {
      for (var i = 0; i < datas.length; i++) {
        await this.dodelete(datas[i]._id.toString(), task);
      }
    }
    await task.where({_id: _id}).delete();
  }
}
