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
    const parm = {account: userAccount, type: 'sat', url: '/manager/fault/fault/list'};
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

  async getfaultAction() {
      const _satid = this.get("_satid");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:_satid}).find();
	  const fault = this.mongo ('fault', {database: sat.code});
	  let data = await fault.where ().select ();
	  //console.log(data);
	  //if(data.occurTime==undefined) data.occurTime='';
	  for(let i=0;i<data.length;i++){
	  	if(data[i].occurTime==undefined) data[i].occurTime='';
	  }
      return this.json ({data: data});
  }
  
  async addAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
	this.assign("check",'false');
    return this.display ();
  }

  async editAction(){
	const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const fault = this.mongo ('fault', {database: sat.code});
    const _id = this.get ("_id");
	const check = this.get("check");
    let data = await fault.where ({_id: _id}).find ();
    this.assign ("sat", sat);
    this.assign ("data", data);
	this.assign("check",check);
    return this.display("manager/fault/fault_add.html");
  }

  async deleteAction () {
    const satellite = this.mongo ('satellite');
    const _satid = this.post ("_satid");
    let sat = await satellite.where ({_id: _satid}).find ();
    const fault = this.mongo ('fault', {database: sat.code});
    const _id = this.post ("_id");
    let affectedRows = await fault.where ({_id: _id}).delete ();//���Ҫɾ���𣿻��Ǳ��ɾ��������
    return this.json ({success: true, msg: '删除常驻故障成功', data: affectedRows});
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
    const fault = this.mongo ('fault', {database: sat.code});
    //const subsys = this.mongo ('subsys', {database: sat.code});
    //let subsys_data = await subsys.where ({_id: data.subsys}).find ();
    //data.subsys_name = subsys_data.name;
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await fault.add (data);
      return this.json ({success: true, msg: '添加常驻故障成功', data: insertId});
    } else {
      let affectedRows = await fault.where ({_id: _id}).update (data);
      return this.json ({success: true, msg: '编辑常驻故障成功', data: affectedRows});
    }
  }
  
  async getSubsysAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    console.log (sat);
    const subsys = this.mongo ('subsys', {database: sat.code});
    let data = await subsys.field ("_id,name").select ();
    let data2 = new Array ();
    data.forEach (function (t) {
      let te = new Object ();
      te.id = t._id;
      te.text = t.name;
      data2.push (te);
    });
    data2.push ({id:'-',text:'无'});
    return this.json ({data: data2});
  }
  
  async getDeviceAction(){
    const _satid = this.get("_satid");
    const _subsysid = this.get("_subsysid");
    const satellite = this.mongo('satellite');
    let sat =await satellite.where({_id:_satid}).find();
    const device = this.mongo('device',{database:sat.code});
    let data = await device.where({subsys:_subsysid}).field("_id,name").select();
    let data2 = new Array();
    data.forEach(function (t) {
      let te = new Object();
      te.id = t._id;
      te.text = t.name;
      data2.push(te);
    });
    data2.push ({id:'-',text:'无'});
    return this.json({ data: data2});
  }
};
