const Base = require ('../base.js');

module.exports = class extends Base {
  async getSubsysAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const subsys = this.mongo ('subsys', {database: sat.code});
    let data = await subsys.where ({name:{$ne:'undefined'}}).select ();
    return this.json ({data: data});
  }

  async addAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
    console.log (sat);
    return this.display ();
  }

  async editAction () {
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const subsys = this.mongo ('subsys', {database: sat.code});
    const _id = this.get ("_id");
    let data = await subsys.where ({_id: _id}).find ();
    this.assign ("sat", sat);
    this.assign ("data", data);
    return this.display ("manager/pcdtree/subsys_add.html");
  }

  async deleteAction () {
    const satellite = this.mongo ('satellite');
    const _satid = this.post ("_satid");
    let sat = await satellite.where ({_id: _satid}).find ();
    const subsys = this.mongo ('subsys', {database: sat.code});

    const _id = this.post ("_id");
    let affectedRows = await subsys.where ({_id: _id}).delete ();//真的要删除吗？还是标记删除，待定
    return this.json ({success: true, msg: '删除分系统成功', data: affectedRows});
  }

  async doSaveAction () {
    const satellite = this.mongo ('satellite');
    const _satid = this.post ("_satid");
    let sat = await satellite.where ({_id: _satid}).find ();
    const subsys = this.mongo ('subsys', {database: sat.code});

    let data = new Object ();
    data.name = this.post ("name");
    data.code = this.post ("code");
    data.standardName = this.post('standardName');
    data.responsible=this.post('responsible');
    data.remark = this.post('remark');
    const _id = this.post ("_id");
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await subsys.add (data);
      return this.json ({success: true, msg: '添加分系统成功', data: insertId});
    } else {
      let affectedRows = await subsys.where ({_id: _id}).update (data);
      return this.json ({success: true, msg: '编辑分系统成功', data: affectedRows});
    }
  }

  async paramsAction(){
    const _satid = this.get('_satid');
    const satelite = this.mongo('satellite');
    const sat = await satelite.where({_id: _satid}).find();
    const _id = this.get('_id');
    const subsys = this.mongo('subsys', {database: sat.code});
    let data = await subsys.where({_id: _id}).find();
    console.log(data);
    this.assign('sat', sat);
    this.assign('data', data);
    return this.display();
  }
  async getparamsAction() {
    const _satid = this.get('_satid');
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const subsys = this.mongo('subsys', {database: sat.code});
    const data = await subsys.where({_id: _id}).find();
    let res = null;
    res = data.params;
    if(res)
      return this.json({data: res});
    else
      return this.json({data: new Array()});
  }

  /**
   * 保存关键参数
   * @returns {Promise.<*>}
   */
  async doSaveSubsysParamAction() {
    const satellite = this.mongo ('satellite');
    const _satid = this.post('_satid');
    const _id = this.post('_id');
    const satitem = await satellite.where({_id: _satid}).find();
    const device = this.mongo('subsys', {database: satitem.code});
    let deviceitem = await device.where({_id: _id}).find();
    let _param = this.post('_param');
    if (_id == undefined || _id == null || _id == '') {
      return this.json({success: false, msg: '尚未选择分系统', data: null});
    } else {
      deviceitem.params = JSON.parse(_param);
      const affectedRows = await device.where({_id: _id}).update(deviceitem);
      return this.json({success: true, msg: '编辑分系统关键参数成功', data: affectedRows});
    }
  }
};
