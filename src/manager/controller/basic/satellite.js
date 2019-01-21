const Base = require('../base.js');
const clients = require('restify-clients');

const client = clients.createJsonClient({
  url: think.config('RestRbac'),
  version: '~1.0'
});

module.exports = class extends Base {
  async listAction() {
    return this.display();
  }

  async getSatsAction() {
    const userAccount = await this.session('account');
    const parm = {account: userAccount, type: 'sat', url: '/manager/basic/satellite/list'};
    const satCodeArr = await new Promise(function (resolve, reject) {
      client.post('/rbac/api/sats', parm, function (err, req, res, obj) {
        console.error(obj);
        resolve(obj.data);
      });
    });
    const satellite = this.mongo('satellite');
    const sats = await satellite.where({code: {$in: satCodeArr}}).select();
    for (let i = 0; i < sats.length; i++) {
      if (sats[i].code_out == undefined || sats[i].code_out == '')
        sats[i].code_out = sats[i].code;
    }
    return this.json({data: sats});
  }

  async editAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    const data = await satellite.where({_id: _id}).find();
    this.assign("data", data);
    return this.display();
  }

  async doSaveAction() {
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete data._id;
    const satellite = this.mongo('satellite');
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await satellite.add(data);
      return this.json({success: true, msg: '添加型号成功', data: insertId});
    } else {
      let affectedRows = await satellite.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑型号成功', data: affectedRows});
    }
  }
}
