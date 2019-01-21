const Base = require ('../base.js');

module.exports = class extends Base {
  async listDeviceAction () {
    const _satid = this.get ("_satid");
    const _subsysid = this.get ("_subsysid");
    console.log(_subsysid);
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const device = this.mongo ('device', {database: sat.code});
    let data = await device.where ({subsys: _subsysid}).select ();
    for(let i=0;i<data.length;i++){
    	if(data[i].isspectrum!=='是'){
    		data[i].spectrum='';
    		data[i].product='';
    	}
    }
    return this.json (data);
  }

  async addAction () {
    const _satid = this.get ("_satid");
    const _subsysid = this.get ("_subsysid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
    let data=new Object();
    data.subsys=_subsysid;
    this.assign("data",data);
    console.log (sat);
    return this.display ();
  }

  async editAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const device = this.mongo ('device', {database: sat.code});
    const _id = this.get ("_id");
    let data = await device.where ({_id: _id}).find ();
    this.assign ("sat", sat);
    this.assign ("data", data);
    console.log (_satid, _id);
    return this.display ("manager/pcdtree/device_add.html");
  }

  async deleteAction () {
    const satellite = this.mongo ('satellite');
    const _satid = this.post ("_satid");
    let sat = await satellite.where ({_id: _satid}).find ();
    const device = this.mongo ('device', {database: sat.code});

    const _id = this.post ("_id");
    console.log (_id, _satid);
    let affectedRows = await device.where ({_id: _id}).delete ();//真的要删除吗？还是标记删除，待定
    return this.json ({success: true, msg: '删除单机成功', data: affectedRows});
  }

  async doSaveAction () {
    const satellite = this.mongo ('satellite');
    const _satid = this.post ("_satid");
    let sat = await satellite.where ({_id: _satid}).find ();
    const device = this.mongo ('device', {database: sat.code});
    const subsys = this.mongo ('subsys', {database: sat.code});

    let data = new Object ();
    data.name = this.post("name");
    data.code = this.post ("code");
    data.subsys = this.post ("subsys");

    data.number = this.post('number');
    //data.proficiency = this.post('proficiency');
    //data.worksate_1 = this.post('worksate_1');
    //data.worksate_2 = this.post('worksate_2');
    data.backup = this.post('backup');
    data.product = this.post('product');
    //data.product_unit = this.post('product_unit');
    //data.sources = this.post('sources');
    //data.batch = this.post('batch');
    //data.technical = this.post('technical');
    //data.describe = this.post('describe');
    //data.remark = this.post('remark');
    data.spectrum = this.post('spectrum');
    //data.work_time = this.post('work_time');
    // --
    //data.backups = this.post('backups');
    data.isspectrum = this.post('isspectrum');
    //data.startingUp_time = this.post('startingUp_time');
    //data.startingUp_num = this.post('startingUp_num');
    //data.fault_time = this.post('fault_time');
    //data.lose_time = this.post('lose_time');
    //data.product_state = this.post('product_state');
    data.manufacturers = this.post('manufacturers');
    data.origin = this.post('origin');
    let subsys_data = await subsys.where ({_id: data.subsys}).find ();
    data.subsys_name = subsys_data.name;
    const _id = this.post ("_id");
    console.log ("_id",_id);
    console.log (data);
    if (_id === undefined || _id === null || _id === '') {
		console.log("hereeeee");
      let insertId = await device.add (data);
      return this.json ({success: true, msg: '添加单机成功', data: insertId});
    } else {
      let affectedRows = await device.where ({_id: _id}).update (data);
      return this.json ({success: true, msg: '编辑单机成功', data: affectedRows});
    }
  }
  async doSaveDeviceAction() {
    const data = JSON.parse(this.post('data'));
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: data._satid}).find();
    const device = this.mongo('device', {database: sat.code});
    const subsys = this.mongo('subsys', {database: sat.code});
    const subsysData = await subsys.where({_id: data.subsys}).find();
    data.subsys_name = subsysData.name;
    if (!data._id) {
      data._id = null;
      const insertId = await device.add(data);
      return this.json({success: true, msg: '添加单机成功', data: insertId});
    } else {
      const affectedRows = await device.where({_id: data._id}).update(data);
      return this.json({success: true, msg: '编辑单机成功', data: affectedRows});
    }
  }
  async getSubsysAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const subsys = this.mongo ('subsys', {database: sat.code});
    let data = await subsys.field ("_id,name").select ();
    let data2 = new Array ();
    data.forEach (function (t) {
      let te = new Object ();
      te.id = t._id;
      te.text = t.name;
      data2.push (te);
    });
    return this.json ({data: data2});
  }

  async getdeviceparamAction() {
    const _satid = this.get ("_satid");
    const _deviceid = this.get ("_deviceid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const device = this.mongo ('device', {database: sat.code});
    let devitem = await device.where ({_id: _deviceid}).find ();
    let res = null;
    res = devitem.params;
    if (res)
      return this.json ({data: res});
    else
      return this.json ({data: new Array ()});
  }
  async paramsAction() {
    const _satid = this.get('_satid');
    const satelite = this.mongo('satellite');
    const sat = await satelite.where({_id: _satid}).find();
    const _id = this.get('_id');
    const device = this.mongo('device', {database: sat.code});
    const data = await device.where({_id: _id}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    const sub = await subsys.where({_id: data.subsys}).find();
    this.assign('sat', sat);
    this.assign('subsys', sub);
    this.assign('data', data);
    return this.display();
  }
  async doSaveDeviceParamAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post("_satid");
    let satitem = await satellite.where ({_id: _satid}).find ();
    const _deviceid = this.post ("_deviceid");
    const device = this.mongo ('device', {database: satitem.code});
    let deviceitem = await device.where ({_id: _deviceid}).find ();
    let _param = this.post ("_param");
    if (_deviceid == undefined || _deviceid == null || _deviceid == "") {
      return this.json ({success: false, msg: '尚未添加单机', data: null});
    } else {
      deviceitem.params = JSON.parse (_param);

      let affectedRows = await device.where ({_id: _deviceid}).update (deviceitem);
      return this.json ({success: true, msg: '编辑单机关联参数成功', data: affectedRows});
    }
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
    return this.json({ data: data2});
  }
};
