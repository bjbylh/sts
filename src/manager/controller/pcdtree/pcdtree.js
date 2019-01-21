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
    /*const satellite = this.mongo('satellite');
    const sats = await satellite.where().select();
    return this.json({data: sats});*/
    const userAccount = await this.session('account');
    const parm = {account: userAccount, type: 'sat', url: '/manager/pcdtree/pcdtree/list'};
    const satCodeArr = await new Promise(function(resolve, reject) {
      client.post('/rbac/api/sats', parm, function(err, req, res, obj) {
        console.error(obj);
        resolve(obj.data);
      });
    });
    const satellite = this.mongo('satellite');
    const sats = await satellite.where({code: {$in: satCodeArr}}).select();
    for(let i=0;i<sats.length;i++){
      if(sats[i].code_out==undefined || sats[i].code_out=='')
        sats[i].code_out=sats[i].code;
    }
    return this.json({data: sats});
  }
  async manageAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const data = await satellite.where({_id: _id}).find();
    this.assign('data', data);
    return this.display();
  }
  async myelistAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    let data = await satellite.where({_id: _id}).find();
    if(data.code_out==undefined || data.code_out=='')
      data.code_out=data.code;
    let rows = new Array();
    rows.push(data);
    return this.json({"total": 1, "rows": rows});
  }
  async paramsAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    let data = await satellite.where({_id: _id}).find();
    this.assign("data", data);
    return this.display();
  }
  async getkeyparamsAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _id}).find();
    let res = null;
    res = sat.params;
    if (res)
      return this.json({data: res});
    else
      return this.json({data: new Array()});
  }
  async paramAddAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    let satitem = await satellite.where({_id: _satid}).find();
    this.assign("sat", satitem);
    return this.display();
  }
  async doSaveParamAction() {
    console.log('保存关键参数');
    const satellite = this.mongo('satellite');
    const _id = this.post("_id");
    let satitem = await satellite.where({_id: _id}).find();
    let _param = this.post("_param");
    if (_id == undefined || _id == null || _id == "") {
      return this.json({success: false, msg: '尚未选择型号', data: null});
    } else {
      satitem.params = JSON.parse(_param);
      let affectedRows = await satellite.where({_id: _id}).update(satitem);
      return this.json({success: true, msg: '编辑型号关键参数成功', data: affectedRows});
    }
  }

  /**
   * 获取该型号卫星下的所有参数
   * @returns {Promise.<*>}
   */
  async getparamsAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let satitem = await satellite.where ({_id: _satid}).find ();
    let res = new Array ();
    let tminfo = this.mongo ("tminfo", {database: satitem.code});
    let data = await tminfo.where ().select ();
    data.forEach (function (item) {
      let param = new Object ();
      param.tmid = item.tmid;
      param.code = item.code;
      param.note = item.note;
      res.push (param);
    });
    return this.json ({data: res});
  }
}
