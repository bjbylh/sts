const Base = require('./base.js');
module.exports = class extends Base {
  // 获取所有有权限的菜单
  async indexAction() {
    const account = this.get('account');
    const code = this.get('project_code');
    const userRole = this.mongo('userRole');
    const roles = await userRole.where({user_account: account}).distinct('roleid').select();
    const rr = this.mongo('resource_role');
    // 查询出角色拥有的资源
    const ids = await rr.where({project_code: code}).where({roleid: {$in: roles}}).distinct('resource').select(); // 查询出所有资源
    const menu = this.mongo('menu');
    // const ms = await menu.where({_id: {$in: ids}}).select();
    const menus = [];
    for (var i = 0; i < ids.length; i++) {
      const ms = await menu.where({_id: ids[i]}).find();
      if (ms == null || !ms.name) {
        continue;
      }
      menus.push(ms);
    }
    return this.json({'resourcess': menus, 'roleids': roles});
  }

  // 根据用户、URL以及sat、projectcode查询是否有权限（URL后斜杠不要）
  async checkAction() {
    const account = this.get('account');
    const code = this.get('project_code'); // 只要url不重复就用不到，待定
    const satcode = this.get('satcode');
    let url = this.get('url');
    let resourceid = '';
    // let code = this.get('project_code');
    if (url) {
      if (url.indexOf('?') > 0) {
        url = url.substring(0, url.indexOf('?'));
      }
      // 可能需要判断前后“/”，有的话需要去除

      const menu = this.mongo('menu');
      const m = await menu.where({url: url}).find();
      if (m == null || !m._id) {
        const option = this.mongo('option');
        const o = await option.where({'url': url}).find();
        resourceid = o._id;
      } else {
        resourceid = m._id;
      }
    } else {
      return this.json('空的URL');
    }
    if (!resourceid) {
      return this.json({'state': -1, 'msg': '未知或不受控制的资源！'});
    }

    const userRole = this.mongo('userRole');
    let roles = [];
    if ('*' == satcode) {
      roles = await userRole.where({user_account: account}).distinct('roleid').select();
      if (!roles || roles.length === 0) {
        return this.json({'state': 0, 'msg': '您未有任何角色授权！'});
      }
    } else {
      roles = await userRole.where({user_account: account}).where({satcode: satcode}).distinct('roleid').select();
      if (!roles || roles.length === 0) {
        return this.json({'state': 0, 'msg': '您不具备该型号的访问权限！'});
      }
    }
    // const roles = await userRole.where({user_account: account}).where({satcode: satcode}).distinct('roleid').select();
    // if (!roles || roles.length === 0) {
    //   return this.json({'state': 0, 'msg': '您不具备该型号的访问权限！'});
    // }
    // const rids = [];
    // for (var i = 0; i < roles.length; i++) {
    //   rids.push(roles[i].toString());
    // }
    const rr = this.mongo('resource_role');
    // 查询出角色拥有的资源
    const ids = await rr.where({resource: resourceid.toString()}).where({roleid: {$in: roles}}).select(); // 查询出所有资源
    if (ids && ids.length > 0) {
      return this.json({'state': 1, 'msg': '验证通过！'});
    }
    return this.json({'state': 0, 'msg': '您不具备操作权限！'});
  }

  // 获取某用户指定菜单下的功能
  async getOptionsAction() {
    const account = this.get('account');
    const menuid = this.get('menuid');
    const userRole = this.mongo('userRole');
    const roleids = await userRole.where({user_account: account}).distinct('roleid').select(); // 获取角色id

    const rr = this.mongo('resource_role');
    const rids = await rr.where({roleid: {$in: roleids}}).distinct('resource').select(); // 查询出所有资源
    const option = this.mongo('option');
    const options = await option.where({menuId: menuid}).where({_id: {$in: rids}}).select();
    const ops = [];
    for (var i = 0; i < rids.length; i++) {
      const data = await option.where({menuId: menuid}).where({_id: rids[i]}).find();
      if (!(JSON.stringify(data) === '{}')) {
        ops.push(data);
      }
    }
    return this.json({'data': ops});
  }
}