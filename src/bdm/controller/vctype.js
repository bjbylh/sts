const Base = require('./base.js');

module.exports = class extends Base {

  async maintainAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const doc_tar = this.mongo('basic_vcinfo', {database: sat.code});
    let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
    this.assign('data', data);
    return this.display();
  }

  async addAction() {
    const _satid = this.get('_satid');
    const doc_sat = this.mongo('satellite');
    let sat = await doc_sat.where({_id: _satid}).find();
    this.assign('sat', sat);
    return this.display('home/vctype_edit.html');
  }

  async editAction() {
    const _satid = this.get('_satid');
    const doc_sat = this.mongo('satellite');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_vcinfo', {database: sat.code});
    const _id = this.get('_id');
    let data = await doc_tar.where({_id: _id}).find();
    this.assign('sat', sat);
    this.assign('data', data);
    return this.display();
  }

  async getListAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_vcinfo', {database: sat.code});
    let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
    return this.json({data: data});
  }

  async doDeleteAction() {
    const doc_sat = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_vcinfo', {database: sat.code});
    const postjson = this.post('data');
    const data = JSON.parse(postjson);
    //todo 考虑再次进行权限检查
    let affectedRows = await doc_tar.where({_id: data._id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除虚拟信道成功', data: affectedRows});
  }

  async doSaveAction() {
    const doc_sat = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_vcinfo', {database: sat.code});
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete data._id;

    if (_id === undefined || _id == null || _id === '') {
      let samevc = await doc_tar.where({$and: [{vcno: data.vcno}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      if (samevc && samevc.length > 1) {
        return this.json({success: false, msg: '虚拟信道代号已被占用', data: samevc});
      }
      let insertId = await doc_tar.add(data);
      return this.json({success: true, msg: '添加虚拟信道成功', data: insertId});
    } else {
      //todo 考虑再次进行权限检查
      let affectedRows = await doc_tar.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑虚拟信道成功', data: affectedRows});
    }
  }

  /*

   */
  async doValidateCodeAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_vctypeid');
    const code = this.post('code');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_vcinfo', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{code: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!==tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }

  async doValidateNameAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_vctypeid');
    const name = this.post('name');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_vcinfo', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{name: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!==tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
};
