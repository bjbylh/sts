const Base = require('./base.js');
module.exports = class extends Base {
  async indexAction() {
    const menuId = this.get('menuId');
    const menu = this.mongo('menu');
    const data = await menu.where({'_id': menuId}).find();
    const proname = this.get('proname');
    const mname = this.get('mname');
    this.assign('proname', proname);
    this.assign('mname', mname);
    this.assign('data', data);
    return this.display();
  }

  async addAction() {
    const menuId = this.get('menuId');
    const menu = this.mongo('menu');
    const data = await menu.where({'_id': menuId}).find();
    this.assign('menu', data);
    return this.display();
  }

  async editAction() {
    const menuId = this.get('menuId');
    const _id = this.get('_id');
    const menu = this.mongo('menu');
    const option = this.mongo('option');
    const m = await menu.where({'_id': menuId}).find();
    const data = await option.where({'_id': _id}).find();
    this.assign('menu', m);
    this.assign('data', data);
    return this.display('rbac/option_add.html');
  }

  async getAllAction() {
    const menuId = this.get('menuId');
    const option = this.mongo('option');
    const data = await option.where({'menuId': menuId}).select();
    console.error(data);
    return this.json({'data': data});
  }

  async delAction() {
    const _id = this.get('_id');
    const option = this.mongo('option');
    const affectedRows = await option.where({'_id': _id}).delete();
    return this.json({success: true, msg: '数据删除成功', data: affectedRows});
  }

  async doSaveAction() {
    const data = {};
    data.menuId = this.post('menuId');
    data.name = this.post('name');
    data.url = this.post('url');
    data.remark = this.post('remark');
    const option = this.mongo('option');
    const _id = this.post('_id');
    console.error(data.menuId);
    if (!_id) {
      const insertId = await option.add(data);
      return this.json({success: true, msg: '操作添加成功', data: insertId});
    } else {
      const affectedRows = await option.where({_id: _id}).update(data);
      return this.json({success: true, msg: '操作修改成功', data: affectedRows});
    }
  }

}