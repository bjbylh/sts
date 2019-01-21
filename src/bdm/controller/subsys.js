const Base = require('./base.js');

module.exports = class extends Base {

  async maintainAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const subsys = this.mongo('subsys', {database: sat.code});
    let data = await subsys.where({$and: [{type: {$ne: 2}}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    this.assign('data', data);
    return this.display(this);
  }

  async getListAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    let data = await subsys.where({$and: [{type: {$ne: 2}}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    return this.json({data: data});
  }

  async addAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    return this.display('subsys_edit.html');
  }

  async editAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    const _id = this.get('_id');
    let data = await subsys.where({_id: _id}).find();
    this.assign('sat', sat);
    this.assign('data', data);
    return this.display();
  }

  async doDeleteAction() {
    const satellite = this.mongo('satellite');
    const postdata = this.post('data');
    const tar = JSON.parse(postdata);
    let sat = await satellite.where({_id: tar._satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    //todo 考虑再次进行权限检查
    let affectedRows = await subsys.where({_id: tar._id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除分系统成功', data: affectedRows});
  }

  async doSaveAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete  data._id;
    if (_id == undefined || _id == null || _id == '') {
      let samesubsys = await subsys.where({$and: [{code: data.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      if (samesubsys && samesubsys.length > 0) {
        return this.json({success: false, msg: '分系统代号已被占用', data: samesubsys});
      }
      let insertId = await subsys.add(data);
      return this.json({success: true, msg: '添加分系统成功', data: insertId});
    } else {
      //todo 考虑再次进行权限检查
      let affectedRows = await subsys.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑分系统成功', data: affectedRows});
    }
  }

  /*

   */
  async doValidateCodeAction(){
    const _satid = this.post('_satid');
    const _subsysid = this.post('_subsysid');
    const code = this.post('code');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    let samesubsys = await subsys.where({$and: [{code: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(samesubsys && samesubsys._id && samesubsys._id.toString()!=_subsysid){
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
    const _subsysid = this.post('_subsysid');
    const name = this.post('name');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    let samesubsys = await subsys.where({$and: [{name: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(samesubsys && samesubsys._id && samesubsys._id.toString()!=_subsysid){
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
    const _subsysid = this.get('_subsysid');
    const subsys_doc = this.mongo('subsys', {database: sat.code});
    let subsys = await subsys_doc.where({_id: _subsysid}).find();
    this.assign('sat', sat);
    this.assign('subsys', subsys);
    return this.display();
  }

  async getparamsAction() {
    const _satid = this.get('_satid');
    const _subsysid = this.get('_subsysid');
    const sat_doc = this.mongo('satellite');
    const sat = await sat_doc.where({_id: _satid}).find();
    const subsys_doc = this.mongo('subsys', {database: sat.code});
    const subsys = await subsys_doc.where({_id: _subsysid}).find();
    let res = null;
    res = subsys.params;
    if (res) {
      return this.json({data: res});
    } else {
      return this.json({data: new Array()});
    }
  }

  /**
   * 保存关键参数
   * @returns {Promise.<*>}
   */
  async doSaveSubsysParamAction() {
    const _satid = this.get('_satid');
    const _subsysid = this.get('_subsysid');
    const sat_doc = this.mongo('satellite');
    const sat = await sat_doc.where({_id: _satid}).find();
    const subsys_doc = this.mongo('subsys', {database: sat.code});
    const subsys = await subsys_doc.where({_id: _subsysid}).find();
    let _param = this.post('_param');
    if (_subsysid == undefined || _subsysid == null || _subsysid == '') {
      return this.json({success: false, msg: '尚未选择分系统', data: null});
    } else {
      subsys.params = JSON.parse(_param);
      const affectedRows = await subsys_doc.where({_id: _id}).update(subsys);
      return this.json({success: true, msg: '编辑分系统关键参数成功', data: affectedRows});
    }
  }
};
