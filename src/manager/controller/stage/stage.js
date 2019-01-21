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
    const parm = {account: userAccount, type: 'sat', url: '/manager/stage/stage/list'};//此处待修改
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
      const _id = this.get("_id");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:_id}).find();
      this.assign("sat",sat);
      return this.display();
  }

  async getstageAction() {
      const _satid = this.get("_satid");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:_satid}).find();
	  const stage = this.mongo ('stage', {database: sat.code});
	  let data = await stage.where ().select ();
      return this.json ({data: data});
  }
  
  async addAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
    return this.display ();
  }

  async editAction(){
	const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const stage = this.mongo ('stage', {database: sat.code});
    const _id = this.get ("_id");
    let data = await stage.where ({_id: _id}).find ();
    this.assign ("sat", sat);
    this.assign ("data", data);
    return this.display("manager/stage/stage_add.html");
  }

  async deleteAction () {
    const satellite = this.mongo ('satellite');
    const _satid = this.post ("_satid");
    let sat = await satellite.where ({_id: _satid}).find ();
    const stage = this.mongo ('stage', {database: sat.code});
    const _id = this.post ("_id");
    let affectedRows = await stage.where ({_id: _id}).delete ();//���Ҫɾ���𣿻��Ǳ��ɾ��������
    return this.json ({success: true, msg: '删除测试阶段成功', data: affectedRows});
  }

  async doSaveAction () {
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    console.log(data);
    const _satid = data._satid;
    const _id = data._id;
    delete data._satid;
    delete data._id;
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const stage = this.mongo ('stage', {database: sat.code});
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await stage.add (data);
      return this.json ({success: true, msg: '添加测试阶段成功', data: insertId});
    } else {
      let affectedRows = await stage.where ({_id: _id}).update (data);
      return this.json ({success: true, msg: '编辑测试阶段成功', data: affectedRows});
    }
  }
};
