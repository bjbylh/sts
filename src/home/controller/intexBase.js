const clients = require('restify-clients');
const client = clients.createJsonClient({
    url: think.config('RestRbac'),
    version: '~1.0'
});
module.exports = class extends think.Controller {
    async __before() {
        if(!this.isCli) {
            // 手动模拟退出一下
            const URL = this.ctx.url;


            // 获取当前用户的账户（需要同步获取）
            const userAccount = await this.session('account');

            const userInfo = await this.session('userInfo');
            this.assign('userInfo', userInfo);
            const userimgpath = await this.session('userimgpath');
            this.assign('userimgpath', userimgpath);
            const login = await this.isLogin(userAccount, URL);
            console.log("home login", login, URL);
            if (!login) {
                // console.log(this.get('logout') + '退出登录了啊 啊啊啊 啊 ');
                this.assign({'logout': this.get('logout')});
                return this.display('login/index_login.html');
            }
            if ('/login/index/login' != URL) {
                const data = await this.check();
                if (!data) {
                    const isPostAjax = this.ctx.isAjax('POST');
                    if (isPostAjax) {
                        return this.json({'msg': '您不具备该操作或型号的权限！'});
                    }
                    return this.display('login/index_error.html');
                }
            } else {
                console.log('---用户登录不拦截-----');
            }
        }
    }

    /**
     * 检查权限
     * @returns {Promise.<void>}
     */
    async check() {
        // 获取请求的url
        const URL = this.ctx.url;
        // -------------------------------校验权限--------------------------------------
        const satcode = await this.getCodes();// this.get('rbacSatCode');
        const data = await this.result(satcode, URL);
        const result = (data != 0);
        console.log(result + '------------' + data + '---------' + satcode + '-----------' + URL);
        return result;
    }

    async getCodes() {
        const isPost = this.ctx.isPost;
        const isGet = this.ctx.isGet;
        let code = '';
        if (isPost) {
            code = this.post('rbacSatCode');
        } else if (isGet) {
            code = this.get('rbacSatCode');
        }
        return code;
    }

    async result(satcode, URL) {
        const userAccount = await this.session('account');
        const parm = {account: userAccount, project_code: 'reporter', satcode: satcode, url: URL};
        const data = await new Promise(function(resolve, reject) {
            client.post('/rbac/api/test', parm, function(err, req, res, obj) {
                console.log(obj);
                resolve(obj.data.state);
            });
        });
        return data;
    }

    /**
     * 判断用户登录没有，未登录跳转到登录页面
     * @param URL
     * @returns {Promise.<*>}
     */
    async isLogin(userAccount, URL) {
        if (userAccount == null && URL !== '/login/index/login') {
            console.error('home 用户未登录');
            console.error('home URL');
            return false;
        }
        return true;
    }
};
