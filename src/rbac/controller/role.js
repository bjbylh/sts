const Base = require('./base.js');
module.exports = class extends Base {
  async indexAction() {
    // const projectId = this.get('projectId');
    // const project = this.mongo('project');
    // const pro = await project.where({'_id': projectId}).find();
    // this.assign('pro', pro);

    // const userRole = this.mongo('userRole');
    // const userRole2 = this.mongo('userRole2');
    // const datas = await userRole.where().select();
    // for (var i = 0, j = datas.length; i < j; i++) {
    //   await userRole2.add(datas[i]);
    // }
    return this.display();
  }

  async doSaveAction() {
    const data = {};
    data.name = this.post('name');
    data.remark = this.post('remark');
    const role = this.mongo('role');
    const _id = this.post('_id');
    console.error(data);
    if (!_id) {
      const insertId = await role.add(data);
      return this.json({success: true, msg: '角色信息添加成功', data: insertId});
    } else {
      const userRole = this.mongo('userRole');
      await userRole.where({roleid: _id}).update({role_name: data.name});
      const affectedRows = await role.where({_id: _id}).update(data);
      return this.json({success: true, msg: '角色信息修改成功', data: affectedRows});
    }
  }

  async addAction() {
    // const projectId = this.get('projectId');
    // const project = this.mongo('project');
    // const pro = await project.where({'_id': projectId}).find();
    // this.assign('pro', pro);
    // const _id = this.get('_id');
    // const menu = this.mongo('menu');
    // const data = menu.where({'_id': _id}).find();
    // this.assign('data', data);
    return this.display();
  }

  async editAction() {
    const _id = this.get('_id');
    const role = this.mongo('role');
    const data = await role.where({'_id': _id}).find();
    console.error(data);
    this.assign('data', data);
    return this.display('rbac/role_add.html');
  }

  async getRolesAction() {
    // const projectId = this.get('projectId');
    const role = this.mongo('role');
    const data = await role.where().select();
    return this.json({'data': data});
  }

  async deleteAction() {
    const _id = this.get('_id');
    const role = this.mongo('role');
    const userRole = this.mongo('userRole');
    await userRole.where({'roleid': _id}).delete();
    const affectedRows = await role.where({'_id': _id}).delete();
    return this.json({success: true, msg: '角色删除成功', data: affectedRows});
  }

  async treeAction() {
    const _id = this.get('roleid');
    const role = this.mongo('role');
    const data = await role.where({'_id': _id}).find();
    this.assign('role', data);
    return this.display();
  }

  async saveResourceAction() {
    const data = {};
    data.roleid = this.post('roleid');
    data.projectid = this.post('projectid');
    const resources = JSON.parse(this.post('resources'));
    const resourceRole = this.mongo('resource_role');
    resourceRole.where({'projectid': data.projectid}).where({roleid: data.roleid}).delete();
    let num = 0;
    const project = this.mongo('project');
    const pro = await project.where({'_id': data.projectid}).find();
    data.project_code = pro.code;
    for (var i = 0; i < resources.length; i++) {
      data.resource = resources[i];
      num += await resourceRole.add(data);
    }
    return this.json({success: true, msg: '保存成功', data: num});
  }

  async getSelectAction() {
    const roleid = this.get('roleid');
    const projectid = this.get('projectid');
    const resourceRole = this.mongo('resource_role');
    const data = await resourceRole.where({'roleid': roleid, 'projectid': projectid}).select();
    var r = [];
    for (var i = 0; i < data.length; i++) {
      r.push(data[i].resource);
    }
    return this.json(r);
  }
}
