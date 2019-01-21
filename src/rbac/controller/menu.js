const Base = require('./base.js');
module.exports = class extends Base {
  async indexAction() {
    const projectId = this.get('projectId');
    const project = this.mongo('project');
    const pro = await project.where({'_id': projectId}).find();
    this.assign('pro', pro);
    return this.display();
  }

  async doSaveAction() {
    const data = {};
    data.projectId = this.post('projectId');
    data.name = this.post('name');
    data.parentId = this.post('parentId');
    data.url = this.post('url');
    data.remark = this.post('remark');
    const menu = this.mongo('menu');
    const _id = this.post('_id');
    console.error(data);
    if (!_id) {
      const insertId = await menu.add(data);
      return this.json({success: true, msg: '菜单添加成功', data: insertId});
    } else {
      const affectedRows = await menu.where({_id: _id}).update(data);
      return this.json({success: true, msg: '菜单修改成功', data: affectedRows});
    }
  }

  async addAction() {
    const projectId = this.get('projectId');
    const project = this.mongo('project');
    const pro = await project.where({'_id': projectId}).find();
    this.assign('pro', pro);
    const _id = this.get('pid');
    const menu = this.mongo('menu');
    const data = await menu.where({'_id': _id}).find();
    console.error(data);
    this.assign('pdata', data);
    return this.display();
  }

  async editAction() {
    const projectId = this.get('projectId');
    const project = this.mongo('project');
    const pro = await project.where({'_id': projectId}).find();
    this.assign('pro', pro);
    const _id = this.get('_id');
    const pid = this.get('pid');
    const menu = this.mongo('menu');
    const data = await menu.where({'_id': _id}).find();
    const pdata = await menu.where({'_id': pid}).find();
    console.error(pid);
    console.error(pdata);
    this.assign('data', data);
    this.assign('pdata', pdata);
    return this.display('rbac/menu_add.html');
  }

  async getTopsAction() {
    const projectId = this.get('projectId');
    const menu = this.mongo('menu');
    const data = await menu.where({'projectId': projectId, 'parentId': ''}).select();
    return this.json({'data': data});
  }

  async getByPidAction() {
    const parentId = this.get('parentId');
    const menu = this.mongo('menu');
    const data = await menu.where({'parentId': parentId}).select();
    return this.json({'data': data});
  }

  async chiledAction() {
    const _id = this.get('_id');
    const menu = this.mongo('menu');
    const num = await menu.where({'parentId': _id}).count();
    console.error(num);
    return this.json(num);
  }
  async deleteAction() {
    const _id = this.get('_id');
    const menu = this.mongo('menu');
    const affectedRows = await menu.where({'_id': _id}).delete();
    return this.json({success: true, msg: '菜单删除成功', data: affectedRows});
  }
  async getTreeAction() {
    const projectId = this.get('projectId');
    const menu = this.mongo('menu');
    const datas = await menu.where({'projectId': projectId}).select();
    const option = this.mongo('option');
    const resources = [];
    const state = {};
    state.opened = true;
    for (let i = 0; i < datas.length; i++) {
      const data = {};
      data.id = datas[i]._id.toString();
      data.text = datas[i].name;
      data.parent = datas[i].parentId;
      data.state = state;
      // data.icon = 'fa fa-bars';
      if (!data.parent) {
        data.parent = '#';
      }
      resources.push(data);
      const menuId = data.id;
      const ops = await option.where({'menuId': menuId}).select();
      for (let j = 0; j < ops.length; j++) {
        const op = {};
        op.id = ops[j]._id;
        op.text = ops[j].name;
        op.parent = data.id;
        op.state = state;
        op.icon = 'fa fa-file-text-o';
        resources.push(op);
      }
    }
    return this.json({'data': resources});
  }
}
