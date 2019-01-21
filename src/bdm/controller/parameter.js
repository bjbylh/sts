const Base = require('./base.js');

module.exports = class extends Base {
  async maintainAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const _subsysid = this.get('_subsysid');
    let subsys = null;
    if (_subsysid != undefined && _subsysid != null && _subsysid != '') {
      const doc_subsys = this.mongo('subsys', {database: sat.code});
      subsys = await doc_subsys.where({_id: _subsysid}).find();
    }
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    if (subsys && subsys.code) {
      //let data = await doc_tar.where({$and: [{subsyscode: subsys.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      //this.assign('data', data);
      this.assign('subsys', subsys);
    }
    else {
      //let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
      //this.assign('data', data);
    }
    return this.display();
  }

  async addAction() {
    const _satid = this.get('_satid');
    const doc_sat = this.mongo('satellite');
    let sat = await doc_sat.where({_id: _satid}).find();
    this.assign('sat', sat);
    const _subsysid = this.get('_subsysid');
    let subsys = null;
    if (_subsysid !== undefined && _subsysid != null && _subsysid !== '') {
      const doc_subsys = this.mongo('subsys', {database: sat.code});
      subsys = await doc_subsys.where({_id: _subsysid}).find();
      if (subsys && subsys.code) {
        this.assign('subsys', subsys);
      }
    }
    return this.display('home/parameter_edit.html');
  }

  async positionAction(){
    const _satid = this.get('_satid');
    const _parameterid = this.get('_parameterid');
    const doc_sat = this.mongo('satellite');
    var sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    var tm = await doc_tar.where({_id: _parameterid}).find();
    this.assign("tm",tm);
    this.assign("sat",sat);
    return this.display('bdm/parameter_position.html');
  }
  async processAction(){
    const _satid = this.get('_satid');
    const _parameterid = this.get('_parameterid');
    const doc_sat = this.mongo('satellite');
    var sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    var tm = await doc_tar.where({_id: _parameterid}).find();
    this.assign("tm",tm);
    this.assign("sat",sat);
    return this.display('bdm/parameter_process.html');

  }
  async editAction() {
    const _satid = this.get('_satid');
    const doc_sat = this.mongo('satellite');
    let sat = await doc_sat.where({_id: _satid}).find();
    this.assign('sat', sat);
    const _subsysid = this.get('_subsysid');
    let subsys = null;
    if (_subsysid !== undefined && _subsysid != null && _subsysid !== '') {
      const doc_subsys = this.mongo('subsys', {database: sat.code});
      subsys = await doc_subsys.where({_id: _subsysid}).find();
      if (subsys && subsys.size() > 1) {
        this.assign('subsys', subsys);
      }
    }
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    const _id = this.get('_id');
    let data = await doc_tar.where({_id: _id}).find();
    this.assign('data', data);
    return this.display();
  }

  async getListAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    var param = this.get();
    const _subsysid = this.get('_subsysid');
    let subsys = null;
    if (_subsysid !== undefined && _subsysid != null && _subsysid !== '') {
      const doc_subsys = this.mongo('subsys', {database: sat.code});
      subsys = await doc_subsys.where({_id: _subsysid}).find();
    }
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    if (subsys && subsys.code) {
      let data = await doc_tar.where({$and: [{subsyscode: subsys.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      this.assign('subsys', subsys);
      return this.json({data: data});
    }
    else {
      let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
      return this.json({data: data});
    }
  }

  async doDeleteAction() {
    const doc_sat = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    const postjson = this.post('data');
    const data = JSON.parse(postjson);
    //todo 考虑再次进行权限检查
    let affectedRows = await doc_tar.where({_id: data._id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除遥测参数成功', data: affectedRows});
  }

  async doSaveAction() {
    const doc_sat = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete data._id;

    if (_id === undefined || _id == null || _id === '') {
      //todo 后续补充更多的检查项
      let sametm = await doc_tar.where({$and: [{tmid: data.tmid}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      if (sametm && sametm._id ) {
        return this.json({success: false, msg: '遥测参数代号重复', data: sametm});
      }
      let insertId = await doc_tar.add(data);
      return this.json({success: true, msg: '添加遥测参数成功', data: insertId});
    } else {
      //todo 考虑再次进行权限检查
      let affectedRows = await doc_tar.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑遥测参数成功', data: affectedRows});
    }
  }

  /*

   */
  async doValidateCodeAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_parameterid');
    const code = this.post('code');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{tmcode: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
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
    const tarid = this.post('_parameterid');
    const name = this.post('name');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('tminfo', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{tmcaption: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!=tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }

};
