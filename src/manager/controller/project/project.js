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
    const parm = {account: userAccount, type: 'sat', url: '/manager/project/project/list'};
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

  async getSatTreeAction(){
    const _id = this.get("_id");
    const tag = this.get("tag");
    console.log("_id",_id);
    const satellite = this.mongo('satellite');
    let sat =await satellite.where({_id:_id}).find();
    let data = [];
    let root = {};
    root.text = sat.name;
    root.id = sat._id;
    root.tag='sat';
    root.icon = "fa fa-folder";
    root.state = {};
    root.state.opened = true;
    root.children = [];
    if(tag=='sat'){
      let dbSub = this.mongo('subsys',{database:sat.code});
      let subs = await dbSub.where().select();
      if(subs!=null && subs.length>0){
        for(let i=0;i<subs.length;i++){
          let subnode = {};
          subnode.text = subs[i].name;
          subnode.tag='sub';
          subnode.id = subs[i]._id;
          subnode.children = true;
          subnode.icon = "fa fa-folder";

          root.children.push(subnode);
        }
      }
      data.push(root);
      return this.json(data);
    }else{
      const sid = this.get("sid");
      let dbDev = this.mongo('device',{database:sat.code});
      let devs = await dbDev.where({subsys:sid}).select();
      var devdata=[];
      if(devs!=null && devs.length>0){
        for(let j=0;j<devs.length;j++){
          let devnode = {};
          devnode.text = devs[j].name;
          devnode.tag='dev';
          devnode.id = devs[j]._id;
          devnode.children=false;
          devnode.icon = "fa fa-file-o";
          devdata.push(devnode);
        }
      }
      return this.json(devdata);
    }
  }

  async getprojectAction() {
      const _satid = this.get("_satid");
      const _subid = this.get("_subid");
      const _devid = this.get("_devid");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:_satid}).find();
	  const project = this.mongo ('project', {database: sat.code});
	  const cond={};
	  if(_subid!=='' && _subid!==undefined && _subid!==null && _subid!=='-'){
	    cond.subsys = _subid;
      }
    if(_devid!=='' && _devid!==undefined && _devid!==null && _devid!=='-'){
      cond.device = _devid;
    }
	  let data = await project.where (cond).select ();
      return this.json ({data: data});
  }
  
  async addAction () {
    const _satid = this.get ("_satid");
    const _subid = this.get("_subid");
    const _devid = this.get("_devid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
    const data={};
    data.subsys = _subid;
    data.device = _devid;
    this.assign ("data", data);
    return this.display ();
  }

    async keepAction () {
        const _satid = this.get ("_satid");
        const _id = this.get("_id");
        const satellite = this.mongo ('satellite');
        let sat = await satellite.where ({_id: _satid}).find ();
        this.assign ("sat", sat);
        const project = this.mongo('project',{database:sat.code});
        let prj = await project.where({_id:_id}).find();
        this.assign("prj",prj);
        return this.display ();
    }


    async taskAction () {
        const _satid = this.get ("_satid");
        const _id = this.get("_id");
        const satellite = this.mongo ('satellite');
        let sat = await satellite.where ({_id: _satid}).find ();
        this.assign ("sat", sat);
        const project = this.mongo('project',{database:sat.code});
        let prj = await project.where({_id:_id}).find();
        this.assign("prj",prj);
        return this.display ();
    }

  async editAction(){
	const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const project = this.mongo ('project', {database: sat.code});
    const _id = this.get ("_id");
    let data = await project.where ({_id: _id}).find ();
    this.assign ("sat", sat);
    this.assign ("data", data);
    return this.display("manager/project/project_add.html");
  }

  async deleteAction () {
    const satellite = this.mongo ('satellite');
    const _satid = this.post ("_satid");
    let sat = await satellite.where ({_id: _satid}).find ();
    const project = this.mongo ('project', {database: sat.code});
    const _id = this.post ("_id");
    let affectedRows = await project.where ({_id: _id}).delete ();//注意关联的测试结果没有删除。
    return this.json ({success: true, msg: '删除测试项目成功', data: affectedRows});
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
    const project = this.mongo ('project', {database: sat.code});
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await project.add (data);
      return this.json ({success: true, msg: '添加测试项目成功', data: insertId});
    } else {
      let affectedRows = await project.where ({_id: _id}).update (data);
      return this.json ({success: true, msg: '编辑测试项目成功', data: affectedRows});
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
