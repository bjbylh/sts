const Base = require('./base.js');
module.exports = class extends Base {
  async indexAction() {
    return this.display();
  }

  async getAllAction() {
    const project = this.mongo('project');
    const data = await project.where().select();
    console.error(data);
    return this.json({'data': data});
  }

  /**
   * 转到添加项目页面
   */
  async addAction() {
    return this.display();
  }

  /**
   * 跳转到编辑页面
   * @returns {Promise.<*>}
   */
  async editAction() {
    const _id = this.get('_id');
    const project = this.mongo('project');
    const data = await project.where({'_id': _id}).find();
    console.error(data);
    this.assign('data', data);
    return this.display('rbac/project_add.html');
  }

  /**
   * 保存
   * @returns {Promise.<*>}
   */
  async doSaveAction() {
    const data = {};
    const _id = this.post('_id');
    data.name = this.post('name');
    data.code = this.post('code');
    data.remark = this.post('remark');
    const project = this.mongo('project');
    if (!_id) {
      const insertId = await project.add(data);
      return this.json({success: true, msg: '项目添加成功', data: insertId});
    } else {
      const affectedRows = await project.where({_id: _id}).update(data);
      return this.json({success: true, msg: '项目修改成功', data: affectedRows});
    }
  }

  /**
   * 删除项目----要不要判断先清空该项目下其他信息再进行删除（如：项目下的菜单、资源等）
   * @returns {Promise.<*>}
   */
  async deleteAction() {
    const _id = this.get('_id');
    const project = this.mongo('project');
    const affectedRows = await project.where({'_id': _id}).delete();
    return this.json({success: true, msg: '删除项目', data: affectedRows});
  }

  async resourceAction() {
    const _id = this.get('_id');
    const project = this.mongo('project');
    const pro = await project.where({'_id': _id}).find();
    this.assign('pro', pro);
    return this.display();
  }
}