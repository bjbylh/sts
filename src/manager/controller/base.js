const request = require('request');
const clients = require('restify-clients');

const client = clients.createJsonClient({
  url: think.config('RestRbac'),
  version: '~1.0'
});

module.exports = class extends think.Controller {
  async __before() {
    //const postobj = this.post('data');
    //console.log('__before postData:', postobj);
    //this.postobj = postobj;
    // // 获取请求的URL
    // const URL = this.ctx.url;
    // 获取用户账户
    const userAccount = await this.session('account');
    // 获取型号
    let satcodes = [];
    satcodes = await this.getCodes();
    // 未登录则跳转到登录页面
    if (userAccount === {} || !userAccount) {
      return this.display('login/index_login.html');
    }
    const userInfo = await this.session('userInfo');
    this.assign('userInfo', userInfo);
    const userimgpath = await this.session('userimgpath');
    this.assign('userimgpath', userimgpath);
    // 获取权限检查结果
    const data = await this.check(satcodes);
    // const isAjax = this.ctx.isAjax();
    const isPostAjax = this.ctx.isAjax('POST');
    if (!data) {
      if (isPostAjax) {
        return this.json({'msg': '您不具备该操作或型号的权限！'});
      }
      return this.display('login/index_noright.html');
    }
  }

  async getCodes() {
    const isPost = this.ctx.isPost;
    const isGet = this.ctx.isGet;
    let code = '';
    if (isPost) {
      code = this.post('rbacSatCode');
      console.log('-----------' + code + '+++++++++++++POST请求');
    } else if (isGet) {
      code = this.get('rbacSatCode');
    }
    return code;
  }

  /**
   * 检查权限
   * @returns {Promise.<void>}
   */
  async check(satcodes) {
    // 获取请求的url
    const URL = this.ctx.url;
    // -------------------------------校验权限--------------------------------------
    const projectCode = 'admin';
    const data = await this.result(satcodes, URL);
    const result = (data != 0);
    console.log(result + '------' + data + '---------' + satcodes + '-----------' + URL);
    return result;
  }

  async result(satcodes, URL) {
    const userAccount = await this.session('account');
    // const url = 'http://127.0.0.1:8360/rbac/validate/check?account=' + userAccount + '&project_code=admin&satcode=' + satcodes + '&url=' + URL;
    const parm = {account: userAccount, project_code: 'admin', satcode: satcodes, url: URL};
    const data = await new Promise(function(resolve, reject) {
      client.post('/rbac/api/test', parm, function(err, req, res, obj) {
        console.log(obj);
        resolve(obj.data.state);
      });
    });
    return data;
  }
};
