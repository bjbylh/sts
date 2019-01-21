const Base = require('./base.js');
module.exports = class extends Base {
  async satAction() {
    return this.display();
  }

  async getSatAndGroupAction() {
    const satellite = this.mongo('satellite');
    const sats = await satellite.where().select();
    const group = this.mongo('group');
    const grps = await group.where().select();
    const data = [];

    sats.forEach(function(item) {
      const element = {};
      element._id = item._id;
      element.name = item.name;
      element.code = item.code;
      element.type = 'sat';
      element.content = item.code;
      data.push(element);
    });
    grps.forEach(function(item) {
      const element = {};
      element._id = item._id;
      element.name = item.name;
      element.code = item.code;
      element.type = 'grp';
      element.content = '';
      if (typeof(item.groupsats) === 'string') {
        element.content = item.groupsats;
      } else if (item.groupsats != null) {
        element.content = item.groupsats.join('<br>');
      }
      data.push(element);
    });
    return this.json({data: data});
  }

  async getAllSatsAction() {
    const satellite = this.mongo('satellite');
    const sats = await satellite.where().select();
    return this.json({data: sats});
  }

  async getRoleByUserAction() {
    const userid = this.get('userid');
    const userRole = this.mongo('userRole');
    const data = await userRole.aggregate([
      {$match: {userid: userid}},
      {
        $group: {
          _id: {roleid: '$roleid', role_name: '$role_name', total: {$sum: '$amount'}}
        }
      }]);
    return this.json({'data': data});
  }

  async getUserByRoleAction() {
    const roleid = this.get('roleid');
    const userRole = this.mongo('userRole');
    const data = await userRole.aggregate([
      {$match: {roleid: roleid}},
      {
        $group: {
          _id: {userid: '$userid', user_name: '$user_name', user_account: '$user_account', total: {$sum: '$amount'}}
        }
      }]);
    return this.json({'data': data});
  }

  async savaAction() {
    const userRole = this.mongo('userRole');
    var data = {};
    data.userid = this.post('userid');
    data.roleid = this.post('roleid');
    await userRole.where({'userid': data.userid, 'roleid': data.roleid}).delete();
    const sats = JSON.parse(this.post('sats'));
    data.user_account = this.post('user_account');
    data.user_name = this.post('user_name');
    data.role_name = this.post('role_name');
    for (let i = 0; i < sats.length; i++) {
      data.satcode = sats[i].satcode;
      data.satname = sats[i].satname;
      data.type = sats[i].type;
      await userRole.add(data);
    }
    return this.json({success: true, msg: '保存成功', data: sats.length});
  }

  async savaAction2() {
    const userRole = this.mongo('userRole');
    var data = {};
    data.userid = this.post('userid');
    data.roleid = this.post('roleid');
    data.sats = JSON.parse(this.post('sats'));
    data.user_account = this.post('user_account');
    data.user_name = this.post('user_name');
    data.role_name = this.post('role_name');
    const _id = this.post('_id');
    if (!_id) {
      const insertId = await userRole.add(data);
      return this.json({success: true, msg: '数据添加成功', data: insertId});
    } else {
      const affectedRows = await userRole.where({_id: _id}).update(data);
      return this.json({success: true, msg: '修改成功', data: affectedRows});
    }
  }

  async addAction() {
    const userid = this.get('userid');
    const user = this.mongo('user');
    const data = await user.where({'_id': userid}).find();
    this.assign('user', data);
    return this.display();
  }
/*
  async add2Action() {
    const roleid = this.get('roleid');
    const role = this.mongo('role');
    console.error(roleid);
    const data = await role.where({'_id': roleid}).find();
    console.error(data);
    this.assign('role', data);
    return this.display();
  }
  */

  async editByRoleAction() {
    // const _id = this.get('_id');
    const roleid = this.get('roleid');
    const userid = this.get('userid');
    const role = this.mongo('role');
    const r = await role.where({'_id': roleid}).find();
    const user = this.mongo('user');
    const u = await user.where({'_id': userid}).find();
    this.assign('user', u);
    this.assign('role', r);
    return this.display('rbac/userRole_add2.html');
  }

  async editAction() {
    const roleid = this.get('roleid');
    const userid = this.get('userid');
    const user = this.mongo('user');
    const role = this.mongo('role');
    const u = await user.where({'_id': userid}).find();
    const r = await role.where({'_id': roleid}).find();
    this.assign('role', r);
    this.assign('user', u);
    return this.display('rbac/userRole_add.html');
  }

  async getSatsAction() {
    const roleid = this.get('roleid');
    const userid = this.get('userid');
    const userRole = this.mongo('userRole');
    const data = await userRole.where({'roleid': roleid, 'userid': userid}).select();
    return this.json({'data': data});
  }

  async deleteAction() {
    const roleid = this.get('roleid');
    const userid = this.get('userid');
    const userRole = this.mongo('userRole');
    const affectedRows = await userRole.where({'userid': userid, 'roleid': roleid}).delete();
    return this.json({success: true, msg: '数据删除成功', data: affectedRows});
  }

  async getBySatAndRoleAction() {
    const roleid = this.get('roleid');
    const satcode = this.get('satcode');
    const userRole = this.mongo('userRole');
    const data = await userRole.where({'satcode': satcode, 'roleid': roleid}).select();
    return this.json({'data': data});
  }

  async deleteOneAction() {
    const _id = this.get('_id');
    const userRole = this.mongo('userRole');
    const affectedRows = await userRole.where({'_id': _id}).delete();
    return this.json({success: true, msg: '数据删除成功', data: affectedRows});
  }

  async addUserAction() {
    const roleid = this.get('roleid');
    const satcode = this.get('satcode');
    const type = this.get('type');
    const role = this.mongo('role');
    const r = await role.where({'_id': roleid}).find();
    let db = this.mongo('satellite');
    if (type === 'grp') {
      db = this.mongo('group');
    }
    const sat = await db.where({code: satcode}).find();
    this.assign('sat', sat);
    this.assign('r', r);
    this.assign('type', type);
    return this.display();
  }

  async savaUserAction() {
    const userRole = this.mongo('userRole');
    var data = {};
    data.userid = this.post('userid');
    data.roleid = this.post('roleid');
    const user = this.mongo('user');
    const u = await user.where({'_id': data.userid}).find();
    data.user_account = u.account;
    data.user_name = u.name;
    data.role_name = this.post('role_name');
    data.satcode = this.post('satcode');
    data.satname = this.post('satname');
    data.type = this.post('type');
    const insertId = await userRole.add(data);
    return this.json({success: true, msg: '数据添加成功', data: insertId});
  }

  /**
   *  批量添加
   * @returns {Promise.<*>}
   */
  async savaUsersAction() {
    const userRole = this.mongo('userRole');
    var data = {};
    const users = JSON.parse(this.post('users'));
    data.roleid = this.post('roleid');
    data.role_name = this.post('role_name');
    data.satcode = this.post('satcode');
    data.satname = this.post('satname');
    data.type = this.post('type');
    await userRole.where({roleid: data.roleid, satcode: data.satcode}).delete();
    const arr = [];
    for (let i = 0; i < users.length; i++) {
      data.userid = users[i]._id;
      data.user_account = users[i].account;
      data.user_name = users[i].name;
      arr.push(await userRole.add(data));
    }
    return this.json({success: true, msg: '数据添加成功', data: arr});
  }
}