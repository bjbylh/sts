const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    return this.display();
  }
  async indexportalAction() {
    return this.display();
  }
  async getListAction() {
    const userAccount = await this.session('account');
    /*
    const parm = {account: userAccount, type: 'sat', url: '/manager/basic/satellite/list'};
    const satCodeArr = await new Promise(function(resolve, reject) {
      client.post('/rbac/api/sats', parm, function(err, req, res, obj) {
        console.error(obj);
        resolve(obj.data);
      });
    });
    */
    const satellite = this.mongo('satellite');
    //const sats = await satellite.where({$and: [{code: {$in: satCodeArr}}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    const sats = await satellite.where({$and: [{$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    for (let i = 0; i < sats.length; i++) {
      if (sats[i].code_out == undefined || sats[i].code_out == '') {
        sats[i].code_out = sats[i].code;
      }
    }
    return this.json({data: sats});
  }

  async editAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const data = await satellite.where({_id: _id}).find();
    this.assign('data', data);
    return this.display();
  }

  async maintainAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const data = await satellite.where({_id: _id}).find();
    this.assign('data', data);
    return this.display();
  }

  async doSaveAction() {
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    delete data._id;
    const satellite = this.mongo('satellite');
    //数据验证，检查
    let samesat = await satellite.where({$and: [{code: data.code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    if (samesat && samesat.length > 1) {
      return this.json({success: false, msg: '内部代号已被占用', data: samesat});
    }
    samesat = await satellite.where({$and: [{code_26: data.code_26}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    if (samesat && samesat.length > 1) {
      return this.json({success: false, msg: '卫测中心代号已被占用', data: samesat});
    }
    samesat = await satellite.where({$and: [{code_14: data.code_14}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    if (samesat && samesat.length > 1) {
      return this.json({success: false, msg: '测试中心代号已被占用', data: samesat});
    }
    samesat = await satellite.where({$and: [{name: data.name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).select();
    if (samesat && samesat.length > 1) {
      return this.json({success: false, msg: '航天器名称重复', data: samesat});
    }
    if (_id == undefined || _id == null || _id == '') {
      let insertId = await satellite.add(data);
      return this.json({success: true, msg: '添加型号成功', data: insertId});
    } else {
      //todo 考虑再次进行权限检查
      let affectedRows = await satellite.where({_id: _id}).update(data);
      return this.json({success: true, msg: '编辑型号成功', data: affectedRows});
    }
  }
  /*

   */
  async doValidateSatelliteCodeAction(){
    const _satid = this.post('_satid');
    const code = this.post('code');
    const satellite = this.mongo('satellite');
    let samesat = await satellite.where({$and: [{code: code}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(samesat && samesat._id && samesat._id.toString()!=_satid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
  async doValidateSatelliteCode_26Action(){
    const _satid = this.post('_satid');
    const code26 = this.post('code_26');
    const satellite = this.mongo('satellite');
    let samesat = await satellite.where({$and: [{code_26: code26}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(samesat && samesat._id && samesat._id.toString()!=_satid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
  async doValidateSatelliteCode_14Action(){
    const _satid = this.post('_satid');
    const code14 = this.post('code_14');
    const satellite = this.mongo('satellite');
    let samesat = await satellite.where({$and: [{code_14: code14}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(samesat && samesat._id && samesat._id.toString()!=_satid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
  async doValidateSatelliteNameAction(){
    const _satid = this.post('_satid');
    const name = this.post('name');
    const satellite = this.mongo('satellite');
    let samesat = await satellite.where({$and: [{name: name}, {$or: [{valid: {$exists: false}}, {valid: true}]}]}).find();
    if(samesat && samesat._id && samesat._id.toString()!=_satid){
      return this.json('false');
    }
    else {
      return this.json('true');
    }
  }
  /*

   */
  async doDeleteAction() {
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    const _id = data._id;
    const satellite = this.mongo('satellite');
    //todo 考虑再次进行权限检查
    let affectedRows = await satellite.where({_id: _id}).update({$set: {valid: false}});
    return this.json({success: true, msg: '删除型号成功', data: affectedRows});
  }

  async getColumnsAction() {
    const columns = [];
    columns.push({text: '抓总单位', id: 'factory'});
    columns.push({text: '卫星领域', id: 'field'});
    columns.push({text: '卫星大小', id: 'size'});
    columns.push({text: '卫星状态', id: 'stage'});
    columns.push({text: '卫星平台', id: 'platform'});
    columns.push({text: '应用目标', id: 'applyField'});
    columns.push({text: '轨道类型', id: 'orbitType'});
    columns.push({text: '健康状态', id: 'health'});
    columns.push({text: '卫星用户', id: 'user'});
    columns.push({text: '管理人：', id: 'manager'});
    columns.push({text: '总设计师', id: 'designer'});
    columns.push({text: '总指挥：', id: 'commander'});
    columns.push({text: '推进类型', id: 'powerstyle'});
    columns.push({text: '发射年份', id: 'lanuchTime'});
    columns.push({text: '退役年份', id: 'retireTime'});
    columns.push({text: '失效年份', id: 'invaildTime'});
    return this.json({data: columns});
  }

  async getColumnAction() {
    let column = this.get('column');
    const satellite = this.mongo('satellite');
    const result = await satellite.distinct(column).select();
    const result2 = [];
    if (column == 'lanuchTime' || column == 'retireTime' || column == 'invaildTime') {//发射年份，退役年份，失效年份，等等
      for (let i = 0; i < result.length; i++) {
        let year = new Date(result[i]).getFullYear();
        if (result2.indexOf(year) == -1) {
          result2.push(year);
        }
      }
      result2.sort(function(x, y) {
        return x - y;
      });
      return this.json({data: result2});
    }
    return this.json({data: result});
  }

  async getSatbyIdAction() {
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    let data = await satellite.where({_id: _id}).find();
    if (data.code_out == undefined || data.code_out == '') {
      data.code_out = data.code;
    }
    let rows = new Array();
    rows.push(data);
    return this.json({'total': 1, 'data': rows});
  }

  async paramsAction() {
    const _id = this.get("_satid");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _id}).find();
    this.assign("sat", sat);
    return this.display();
  }
  async getkeyparamsAction() {
    const _id = this.get("_id");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _id}).find();
    let res = null;
    res = sat.params;
    if (res)
      return this.json({data: res});
    else
      return this.json({data: new Array()});
  }
  async paramAddAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    let satitem = await satellite.where({_id: _satid}).find();
    this.assign("sat", satitem);
    return this.display();
  }
  async doSaveParamAction() {
    const _satid = this.post("_satid");
    if (_satid == undefined || _satid == null || _satid == "") {
      return this.json({success: false, msg: '尚未选择型号', data: null});
    } else {
      const sat_doc = this.mongo('satellite');
      let sat = await sat_doc.where({_id: _satid}).find();
      let _param = this.post("_param");
      sat.params = JSON.parse(_param);
      let affectedRows = await sat_doc.where({_id: _satid}).update(sat);
      return this.json({success: true, msg: '编辑型号关键参数成功', data: affectedRows});
    }


  }
};
