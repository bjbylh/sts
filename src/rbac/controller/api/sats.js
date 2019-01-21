const rest = require('../rest.js');
module.exports = class extends rest {
  /**
   * 获取某个action下某用户具有操作权限的型号、分组
   * @returns {Promise.<*>}
   */
  async postAction() {
    const account = this.post('account');
    // const code = this.post('project_code'); // 只要url不重复就用不到，待定
    const type = this.post('type');
    let url = this.post('url');
    if (url) {
      if (url.indexOf('?') > 0) {
        url = url.substring(0, url.indexOf('?'));
      }
      let resourceid = '';// 定义资源id
      const menu = this.mongo('menu');
      const m = await menu.where({url: url}).find();
      if (m == null || !m._id) {
        const option = this.mongo('option');
        const o = await option.where({'url': url}).find();
        resourceid = o._id.toString();
      } else {
        resourceid = m._id.toString();
      }
      if (!resourceid) { // 资源未找到
        return this.success({'msg': '未知或不受控制的资源！', 'data': []});
      }
      const rr = this.mongo('resource_role');
      const datas = await rr.where({resource: resourceid}).select();
      const arr = []; // 取出所有有权限
      for (let i = 0; i < datas.length; i++) {
        arr.push(datas[i].roleid);
      }
      const userrole = this.mongo('userRole');
      let urs = [];
      if (type === 'sat' || type === 'grp') {
        urs = await userrole.where({user_account: account, type: type, roleid: {$in: arr}}).select();
      } else {
        urs = await userrole.where({user_account: account, roleid: {$in: arr}}).select();
      }
      console.error('url:' + url + ',用户：' + account + ',获取结果', urs.length);
      const codes = [];
      for (let i = 0; i < urs.length; i++) {
        codes.push(urs[i].satcode);
      }
      return this.json({'msg': '查询完成！', 'data': codes});
    } else {
      console.error('空的url');
      return this.success({'msg': '空的url！', 'data': []});
    }
  }
}
