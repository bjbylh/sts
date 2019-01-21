const Base = require('./base.js');

module.exports = class extends Base {

  async maintainAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    this.assign('sat', sat);
    const doc_channel = this.mongo('basic_channel', {database: sat.code});
    const _channelid = this.get('_channelid');
    let channel = null;
    if (_channelid != undefined && _channelid != null && _channelid != '') {
      channel = await doc_channel.where({_id: _channelid}).find();
    }
    const doc_tar = this.mongo('basic_mode', {database: sat.code});
    if (channel && channel.code) {
      let data = await doc_tar.where({$and: [{channelcode: channel.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      this.assign('data', data);
      this.assign('channel', channel);
    }
    else {
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
    return this.display('/bdm/mode_edit.html');
  }

  async editAction() {
    const _satid = this.get('_satid');
    const doc_sat = this.mongo('satellite');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_mode = this.mongo('basic_mode', {database: sat.code});
    const _id = this.get('_id');
    let data = await doc_mode.where({_id: _id}).find();
    this.assign('sat', sat);
    this.assign('data', data);
    return this.display();
  }

  async getListAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_mode = this.mongo('basic_mode', {database: sat.code});
    let data = await doc_mode.where({$or: [{valid: {$exists: false}}, {valid: true}]}).select();
    return this.json({data: data});
  }

  async doDeleteAction() {
    const doc_sat = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_mode = this.mongo('basic_mode', {database: sat.code});
    const postjson = this.post('data');
    const data = JSON.parse(postjson);
    //todo 考虑再次进行权限检查
    let affectedRows = await doc_mode.where({_id: data._id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除模式信息成功', data: affectedRows});
  }

  async doSaveAction() {
    const doc_sat = this.mongo('satellite');
    const _satid = this.post('_satid');
    let sat = await doc_sat.where({_id: _satid}).find();
    const doc_mode = this.mongo('basic_mode', {database: sat.code});
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete data._id;

    if (_id === undefined || _id == null || _id === '') {
      let samemode = await doc_mode.where({$and: [{channelcode: data.channelcode}, {code: data.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
      if (samemode && samemode.size > 1) {
        return this.json({success: false, msg: '该数据类型下已存在相同代号的模式', data: samemode});
      }
      let insertId = await doc_mode.add(data);
      return this.json({success: true, msg: '添加模式信息成功', data: insertId});
    } else {
      //todo 考虑再次进行权限检查
      let affectedRows = await doc_mode.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑数据类型成功', data: affectedRows});
    }
  }

  /*

   */
  async doValidateCodeAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_modeid');
    const code = this.post('code');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_mode', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{code: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!==tarid){
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
    const tarid = this.post('_modeid');
    const name = this.post('name');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_mode', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{name: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!==tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
  async doValidateChannelnameAction(){
    const _satid = this.post('_satid');
    const tarid = this.post('_modeid');
    const channelname = this.post('channelname');
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const doc_tar = this.mongo('basic_mode', {database: sat.code});
    let sametars = await doc_tar.where({$and: [{name: channelname}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(sametars && sametars._id && sametars._id.toString()!==tarid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
};
