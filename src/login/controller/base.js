const clients = require('restify-clients');
const client = clients.createJsonClient({
  url: think.config('RestRbac'),
  version: '~1.0'
});
module.exports = class extends think.Controller {
  /* async __before() {
    const URL = this.ctx.url;
    // 获取当前用户的账户（需要同步获取）
    const userAccount = await this.session('account');
    const login = await this.isLogin(userAccount, URL);
    if (!login) {
      return this.display('login/index_login.html');
    }
  } */

  /**
   * 判断用户登录没有，未登录跳转到登录页面
   * @param URL
   * @returns {Promise.<*>}
   */
  async isLogin(userAccount, URL) {
    if (userAccount == null && URL !== '/' && URL !== '/login/index/login' && URL !== '/login/index/dologin' && URL !== '/login/index/adlogin') {
      console.error('用户未登录');
      console.log('URL:');
      return false;
    }
    return true;
  }
};
