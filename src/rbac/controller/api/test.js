const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
  async getAction() {
    console.log("tt", this.modelInstance);
    const n2 = this.get('info');
    const name = this.get('name');
    //console.error(name + '============' + n2);
    return this.success({'info': n2});
  }

  async postAction() {
    const account = this.post('account');
    const code = this.post('project_code'); // 只要url不重复就用不到，待定
    const satcode = this.post('satcode');
    let url = this.post('url');
    let resourceid = '';
    //console.error(account+'*******'+satcode+'*******'+url);
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
      return this.success('空的URL');
    }
    if (!resourceid) {
      return this.success({'state': -1, 'msg': '未知或不受控制的资源！'});
    }

    const userRole = this.mongo('userRole');
    let roles = [];
    if ('*' == satcode) {
      console.error('不限型号' + url);
      roles = await userRole.where({user_account: account}).distinct('roleid').select();
      if (!roles || roles.length === 0) {
        return this.success({'state': 0, 'msg': '您未有任何角色授权！'});
      }
    } else {
      roles = await userRole.where({user_account: account}).where({satcode: satcode}).distinct('roleid').select();
      if (!roles || roles.length === 0) {
        return this.success({'state': 0, 'msg': '您不具备该型号的访问权限！'});
      }
    }
    const rr = this.mongo('resource_role');
    // 查询出角色拥有的资源
    const ids = await rr.where({resource: resourceid.toString()}).where({roleid: {$in: roles}}).select(); // 查询出所有资源
    if (ids && ids.length > 0) {
      return this.success({'state': 1, 'msg': '验证通过！'});
    }
    return this.success({'state': 0, 'msg': '您不具备操作权限！'});
  }

};
