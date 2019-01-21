const Base = require('./base.js');

module.exports = class extends Base {
  async maintainAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const subsys = this.mongo('subsys', {database: sat.code});
    let data = await subsys.where({$and: [{type: 2}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    this.assign('data', data);
    return this.display(this);
  }

  async getListAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    let data = await subsys.where({$and: [{type: 2}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    return this.json({data: data});
  }

  async addAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    let data={};
    data.type=2;
    return this.display('home/subsys_edit.html');
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
    const _satid = this.post('_satid');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    const postjson = this.post('data');
    const data = JSON.parse(postjson);
    //todo 考虑再次进行权限检查
    let affectedRows = await subsys.where({_id: data._id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除地面设备成功', data: affectedRows});
  }

  async doSaveAction() {
    const satellite = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    data.type=2;
    const _id = data._id;
    delete data._id;
    if (_id == undefined || _id == null || _id == '') {
      let samesubsys = await subsys.where({$and: [{code: data.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      if (samesubsys && samesubsys.size > 1) {
        return this.json({success: false, msg: '地面设备代号已被占用', data: samesubsys});
      }
      let insertId = await subsys.add(data);
      return this.json({success: true, msg: '添加地面设备成功', data: insertId});
    } else {
      //todo 考虑再次进行权限检查
      let affectedRows = await subsys.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑地面设备成功', data: affectedRows});
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
};
