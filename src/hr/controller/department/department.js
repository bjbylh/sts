const Base = require('../base.js');

module.exports = class extends Base {

  /**
   * 列出所有部门信息
   */
  async listAction() {
    return this.display();
  }

  /**
   * 添加及修改部门信息
   */
  async editAction() {
    const _id = this.get('_id');
    if (_id) {
      const department = this.mongo('department');
      const data = await department.where({'_id': _id}).find();
      this.assign('data', data);
    }
    return this.display();
  }

  /**
   * 数据库操作，获取所有部门信息
   */
  async getAction() {
    const department = this.mongo('department');
    const data = await department.select();
    return this.json({'data': data});
  }
  
  /**
   * 数据库操作，获取一个部门信息
   */
  async getByIdAction() {
    const _id = this.get('_id');
    const department = this.mongo('department');
    const data = await department.where({'_id': _id}).find();
    return this.json(data);
  }

  /**
   * add or update the employer
   * @returns {Promise<*>}
   */
  async saveAction() {
    const data = {};
    data.code = this.post('code');
    data.name = this.post('name');
    const department = this.mongo('department');
    if (this.isMethod("POST")) {
      const insertId = await department.add(data);
      return this.json({success: true, msg: '部门信息添加成功', data: insertId});
    } else if (this.isMethod("PUT")){
      const _id = this.post('_id');
      const affectedId = await department.where({_id: _id}).update(data);
      return this.json({success: true, msg: '部门信息修改成功', data: affectedId});
    } else {
        return this.json({success: false, msg: 'play use post or put method'});
    }
  }

  async deleteAction() {
    const _id = this.get('_id');
    if (_id) {
      const department = this.mongo('department');
      const affectedRows = await department.where({'_id': _id}).delete();
      return this.json({success: true, msg: '删除部门成功', data: affectedRows});  
    } else {
      return this.json({success: false, msg: '没有找到相应的部门信息'});      
    }
  }
}
