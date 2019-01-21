const Base = require('./base.js');

module.exports = class extends Base {
  async maintainAction() {
    const _satid = this.get('_satid');
    if (_satid != undefined && _satid != null && _satid != '') {
      const satellite = this.mongo('satellite');
      let sat = await satellite.where({_id: _satid}).find();
      this.assign('sat', sat);
      const doc_tar = this.mongo('basic_formula', {database: sat.code});
      let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
      this.assign('data', data);
    }
    else {
      const doc_tar = this.mongo('formula');
      let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
      this.assign('data', data);
    }
    return this.display();
  }

  async addAction() {
    const _satid = this.get('_satid');
    const doc_sat = this.mongo('satellite');
    let sat = await doc_sat.where({_id: _satid}).find();
    this.assign('sat', sat);
    return this.display('home/formula_edit.html');
  }

  async editAction() {
    const _satid = this.get('_satid');
    const doc_sat = this.mongo('satellite');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_formula', {database: sat.code});
    const _id = this.get('_id');
    let data = await doc_tar.where({_id: _id}).find();
    this.assign('sat', sat);
    this.assign('data', data);
    return this.display();
  }

  async getListAction() {
    const _satid = this.get('_satid');
    if (_satid != undefined && _satid != null && _satid != '') {
      const satellite = this.mongo('satellite');
      let sat = await satellite.where({_id: _satid}).find();
      this.assign('sat', sat);
      const doc_tar = this.mongo('basic_formula', {database: sat.code});
      let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
      return this.json({data: data});
    }
    else {
      const doc_tar = this.mongo('basic_formula');
      let data = await doc_tar.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
      return this.json({data: data});
    }
  }

  async doDeleteAction() {
    const _satid = this.post('_satid');
    const postjson = this.post('data');
    const data = JSON.parse(postjson);
    if (_satid != undefined && _satid != null && _satid != '') {
      const satellite = this.mongo('satellite');
      let sat = await satellite.where({_id: _satid}).find();
      const doc_tar = this.mongo('basic_formula', {database: sat.code});
      //todo 考虑再次进行权限检查
      let affectedRows = await doc_tar.where({_id: data._id}).update({$set: {valid: false}});
      return this.json({success: true, msg: '删除型号计算公式成功', data: affectedRows});
    }
    else {
      const doc_tar = this.mongo('basic_formula');
      //todo 考虑再次进行权限检查
      let affectedRows = await doc_tar.where({_id: data._id}).update({$set: {valid: false}});
      return this.json({success: true, msg: '删除通用计算公式成功', data: affectedRows});
    }
  }

  async doSaveAction() {
    let sameformula;
    const _satid = this.post('_satid');
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete data._id;
    if (_satid != undefined && _satid != null && _satid != '') {
      const satellite = this.mongo('satellite');
      let sat = await satellite.where({_id: _satid}).find();
      this.assign('sat', sat);
      const doc_tar = this.mongo('basic_formula', {database: sat.code});
      if (_id == undefined || _id == null || _id == '') {
        sameformula = await doc_tar.where({$and: [{code: data.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
        if (sameformula && sameformula.length > 1) {
          return this.json({success: false, msg: '型号计算公式代号已被占用', data: sameformula});
        }
        let insertId = await doc_tar.add(data);
        return this.json({success: true, msg: '添加型号计算公式成功', data: insertId});
      } else {
        //todo 考虑再次进行权限检查
        let affectedRows = await doc_tar.where({_id: _id}).update(data);
        return this.json({success: true, msg: '编辑型号计算公式成功', data: affectedRows});
      }
    }
    else {
      const doc_tar = this.mongo('basic_formula');
      if (_id == undefined || _id == null || _id == '') {
        sameformula = await doc_tar.where({$and: [{code: data.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
        if (sameformula && sameformula.length > 1) {
          return this.json({success: false, msg: '通用计算公式代号已被占用', data: sameformula});
        }
        let insertId = await doc_tar.add(data);
        return this.json({success: true, msg: '添加通用计算公式成功', data: insertId});
      } else {
        //todo 考虑再次进行权限检查
        let affectedRows = await doc_tar.where({_id: _id}).update(data);
        return this.json({success: true, msg: '编辑通用计算公式成功', data: affectedRows});
      }
    }

  }

  /*

 */
  async doValidateCodeAction(){
    const _satid = this.post('_satid');
    const _tarid = this.post('_formulaid');
    const code = this.post('code');
    if (_satid != undefined && _satid != null && _satid != '') {
      const satellite = this.mongo('satellite');
      let sat = await satellite.where({_id: _satid}).find();
      const doc_tar = this.mongo('basic_formula', {database: sat.code});
      let sametars = await doc_tar.where({$and: [{code: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
      if(sametars && sametars._id && sametars._id.toString()!=_tarid){
        return this.json('false');
      }
      else {
        return this.json('true');
      }
    }
    else{
      const doc_tar = this.mongo('basic_formula');
      let sametars = await doc_tar.where({$and: [{code: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
      if(sametars && sametars._id && sametars._id.toString()!=_tarid){
        return this.json('false');
      }
      else {
        return this.json('true');
      }
    }
  }

  /*

 */
  async doValidateNameAction(){
    const _satid = this.post('_satid');
    const _tarid = this.post('_formulaid');
    const name = this.post('name');
    if (_satid != undefined && _satid != null && _satid != '') {
      const satellite = this.mongo('satellite');
      let sat = await satellite.where({_id: _satid}).find();
      const doc_tar = this.mongo('basic_formula', {database: sat.code});
      let sametars = await doc_tar.where({$and: [{name: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
      if(sametars && sametars._id && sametars._id.toString()!=_tarid){
        return this.json('false');
      }
      else {
        return this.json('true');
      }
    }
    else{
      const doc_tar = this.mongo('basic_formula');
      let sametars = await doc_tar.where({$and: [{name: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
      if(sametars && sametars._id && sametars._id.toString()!=_tarid){
        return this.json('false');
      }
      else {
        return this.json('true');
      }
    }
  }
};
