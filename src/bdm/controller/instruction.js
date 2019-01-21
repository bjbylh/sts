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
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
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
    return this.display('./instruction_edit.html');
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
      if (subsys && subsys._id) {
        this.assign('subsys', subsys);
      }
    }
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
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
    const _subsysid = this.get('_subsysid');
    let subsys = null;
    if (_subsysid !== undefined && _subsysid != null && _subsysid !== '') {
      const doc_subsys = this.mongo('subsys', {database: sat.code});
      subsys = await doc_subsys.where({_id: _subsysid}).find();
    }
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
    if (subsys && subsys._id) {
      let data = await doc_tar.where({$and: [{device: subsys.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
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
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
    const postjson = this.post('data');
    const data = JSON.parse(postjson);
    //todo 考虑再次进行权限检查
    let affectedRows = await doc_tar.where({_id: data._id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除遥控指令成功', data: affectedRows});
  }

  async doSaveAction() {
    const doc_sat = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete data._id;

    if (_id === undefined || _id == null || _id === '') {
      //todo 后续补充更多的检查项
      let sameins = await doc_tar.where({$and: [{insid: data.insid}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      if (sameins && sameins._id) {
        return this.json({success: false, msg: '遥控指令代号重复', data: sameins});
      }
      let insertId = await doc_tar.add(data);
      return this.json({success: true, msg: '添加遥控指令成功', data: insertId});
    } else {
      //todo 考虑再次进行权限检查
      let affectedRows = await doc_tar.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑遥控指令成功', data: affectedRows});
    }
  }

  /*

   */
  async doValidateInsidAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_instructionid');
    const insid = this.post('insid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{insid: insid}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!== tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }

  /*

 */
  async doValidateInsNoAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_instructionid');
    const insno = this.post('insno');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{insno: insno}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!== tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
  /*

 */
  async doValidateInsNameAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_instructionid');
    const insname = this.post('insname');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_instruction', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{insname: insname}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!==tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }

};
