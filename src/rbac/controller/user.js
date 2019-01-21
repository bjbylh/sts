const Base = require('./base.js');
module.exports = class extends Base {
  async indexAction() {
    // const projectId = this.get('projectId');
    // const project = this.mongo('project');
    // const pro = await project.where({'_id': projectId}).find();
    // this.assign('pro', pro);
    return this.display();
  }

  async doSaveAction() {
    const data = {};
    data.name = this.post('name');
    data.account = this.post('account');
    data.password = this.post('password');
    data.remark = this.post('remark');
    data.phone = this.post('phone');
    data.email = this.post('email');
    const user = this.mongo('user');
    const _id = this.post('_id');
    console.error(data);
    if (!_id) {
      const insertId = await user.add(data);
      return this.json({success: true, msg: '用户信息添加成功', data: insertId});
    } else {
      const affectedRows = await user.where({_id: _id}).update(data);
      return this.json({success: true, msg: '用户信息修改成功', data: affectedRows});
    }
  }

  async addAction() {
    return this.display();
  }

  async editAction() {
    const _id = this.get('_id');
    const user = this.mongo('user');
    const data = await user.where({'_id': _id}).find();
    console.error(data);
    this.assign('data', data);
    return this.display('rbac/user_add.html');
  }

  async getUsersAction() {
    // const projectId = this.get('projectId');
    const user = this.mongo('user');
    const data = await user.where().select();
    return this.json({'data': data});
  }

  async addRoleAction() {
    const _id = this.get('_id');
    const user = this.mongo('user');
    const data = await user.where({'_id': _id}).find();
    this.assign('user', data);
    return this.display();
  }

  async savaRoleAction() {
    const userRole = this.mongo('userRole');
    var data = {};
    data.userid = this.post('userid');
    data.roleid = this.post('roleid');
    data.sats = JSON.parse(this.post('sats'));
    // data.user_name = this.post('user_name');
    const _id = this.post('_id');
    if (!_id) {
      const insertId = await userRole.add(data);
      return this.json({success: true, msg: '数据添加成功', data: insertId});
    } else {
      return this.json({'msg': 'ok'});
    }
  }

  async satListAction() {
    const userid = this.get('userid');
    const roleid = this.get('roleid');
    this.assign('roleid', roleid);
    this.assign('userid', userid);
    return this.display();
  }

  async byIdAction() {
    const _id = this.get('_id');
    const user = this.mongo('user');
    const data = await user.where({'_id': _id}).find();
    return this.json(data);
  }

  async deleteAction() {
    const _id = this.get('_id');
    const user = this.mongo('user');
    const userRole = this.mongo('userRole');
    await userRole.where({'userid': _id}).delete();
    const affectedRows = await user.where({'_id': _id}).delete();
    return this.json({success: true, msg: '删除用户成功', data: affectedRows});
  }

  async getSelectedSatsAction() {
    const userid = this.get('userid');
    const roleid = this.get('roleid');
    const userRole = this.mongo('userRole');
    const datas = await userRole.where({userid: userid, roleid: roleid}).field('satcode').select();
    return this.json(datas);
  }
}
