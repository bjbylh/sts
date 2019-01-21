const Base = require('./base.js');

module.exports = class extends Base {

  /*!
  获取指定_satid和_subsysid下的单机列表，查询结果绑定至data对象中
   */
  async getListAction() {
    const _satid = this.get('_satid');
    const _subsysid = this.get('_subsysid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const device_doc = this.mongo('basic_device', {database: sat.code});
    if (_subsysid === undefined || _subsysid === null || _subsysid === '') {
      let data = await device_doc.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
      return this.json(data);
    } else {
      let data = await device_doc.where({$and: [{subsys: _subsysid}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      return this.json(data);
    }

  }

  async addAction() {
    const _satid = this.get('_satid');
    const _subsysid = this.get('_subsysid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const subsysdb = this.mongo('subsys', {database: sat.code});
    let subsysobj = await subsysdb.where({_id: _subsysid}).find();
    let data = new Object();
    data.subsys = _subsysid;
    data.subsyscode = subsysobj.code;
    data.subsys_name = subsysobj.name;
    this.assign('data', data);
    console.log(sat);
    return this.display('bdm/device_edit.html');
  }

  async editAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const device = this.mongo('basic_device', {database: sat.code});
    const _id = this.get('_id');
    let data = await device.where({_id: _id}).find();
    this.assign('sat', sat);
    this.assign('data', data);
    console.log(_satid, _id);
    return this.display();
  }

  async doDeleteAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await satellite.where({_id: _satid}).find();
    const device = this.mongo('basic_device', {database: sat.code});
    const postjson = this.post('data');
    const data = JSON.parse(postjson);
    //todo 考虑再次进行权限检查
    let affectedRows = await device.where({_id: data._id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除单机成功', data: affectedRows});
  }

  async doSaveAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    let satobj = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_device', {database: satobj.code});

    /*
    let data = new Object ();
    data.name = this.post("name");
    data.code = this.post ("code");
    data.subsys = this.post ("subsys");
    data.number = this.post('number');
    data.proficiency = this.post('proficiency');
    data.worksate_1 = this.post('worksate_1');
    data.worksate_2 = this.post('worksate_2');
    data.backup = this.post('backup');
    data.product = this.post('product');
    data.product_unit = this.post('product_unit');
    data.sources = this.post('sources');
    data.batch = this.post('batch');
    data.technical = this.post('technical');
    data.describe = this.post('describe');
    data.remark = this.post('remark');
    data.spectrum = this.post('spectrum');
    data.work_time = this.post('work_time');
    data.backups = this.post('backups');
    data.spectrum_1 = this.post('spectrum_1');
    data.startingUp_time = this.post('startingUp_time');
    data.startingUp_num = this.post('startingUp_num');
    data.fault_time = this.post('fault_time');
    data.lose_time = this.post('lose_time');
    data.product_state = this.post('product_state');
    data.manufacturers = this.post('manufacturers');
    data.sources_1 = this.post('sources_1');
    */
    const data = JSON.parse(this.post('data'));
    const _id = data._id;
    delete data._id;
    if (_id === undefined || _id === null || _id === '') {
      let samedevice = await doc_tar.where({$and: [{subsys_code: data.subsys_code}, {code: data.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      if (samedevice && samedevice.length > 1) {
        return this.json({success: false, msg: '该分系统下已有相同代号的设备', data: samedevice});
      }
      let insertId = await doc_tar.add(data);
      return this.json({success: true, msg: '添加单机成功', data: insertId});
    } else {
      let affectedRows = await doc_tar.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑单机成功', data: affectedRows});
    }
  }

  /*
  async getListAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    let data = await subsys.field('_id,name').select();
    let data2 = new Array();
    data.forEach(function(t) {
      let te = new Object();
      te.id = t._id;
      te.text = t.name;
      data2.push(te);
    });
    return this.json({data: data2});
  }

*/

  /*

   */
  async doValidateCodeAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_deviceid');
    const code = this.post('code');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_device', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{code: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!=tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
  /*

 */
  async doValidateNameAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_deviceid');
    const name = this.post('name');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_device', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{name: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!=tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }

  async paramsAction() {
    const _satid = this.get('_satid');
    const sat_doc = this.mongo('satellite');
    const sat = await sat_doc.where({_id: _satid}).find();
    const _deviceid = this.get('_deviceid');
    const device_doc = this.mongo('basic_device', {database: sat.code});
    const device = await device_doc.where({_id: _deviceid}).find();
    const subsys_doc = this.mongo('subsys', {database: sat.code});
    const subsys = await subsys_doc.where({code: device.subsyscode}).find();
    this.assign('sat', sat);
    this.assign('subsys', subsys);
    this.assign('device', device);
    return this.display();
  }

  async getdeviceparamAction() {
    const _satid = this.get('_satid');
    const _deviceid = this.get('_deviceid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const device_doc = this.mongo('basic_device', {database: sat.code});
    let device = await device_doc.where({_id: _deviceid}).find();
    let res = null;
    res = device.params;
    if (res) {
      return this.json({data: res});
    } else {
      return this.json({data: new Array()});
    }
  }
  async doSaveDeviceParamAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    let satitem = await satellite.where({_id: _satid}).find();
    const _deviceid = this.post('_deviceid');
    const device_doc = this.mongo('basic_device', {database: satitem.code});
    let device = await device_doc.where({_id: _deviceid}).find();
    let _param = this.post('_param');
    if (_deviceid == undefined || _deviceid == null || _deviceid == '') {
      return this.json({success: false, msg: '尚未添加单机', data: null});
    } else {
      device.params = JSON.parse(_param);
      let affectedRows = await device.where({_id: _deviceid}).update(device);
      return this.json({success: true, msg: '编辑单机关联参数成功', data: affectedRows});
    }
  }
};
