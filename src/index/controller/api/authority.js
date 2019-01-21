const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        const account = this.post('account');
        //const code = this.post('project_code'); // 只要url不重复就用不到，待定
        const satcode = this.post('satcode');
        let url = this.post('url');
        let resourceid = '';
        console.error(account+'*******'+satcode+'*******'+url);
        // let code = this.get('project_code');
        const maindb=think.db.db('yyyyy');
        if (url) {
            if (url.indexOf('?') > 0) {
                url = url.substring(0, url.indexOf('?'));
            }
            // 可能需要判断前后“/”，有的话需要去除
            const menu = maindb.collection('menu');
            const m = await menu.findOne({url: url});
            if (m == null || !m._id) {
                const option = maindb.collection('option');
                const o = await option.findOne({url: url});
                resourceid = o._id;
            } else {
                resourceid = m._id;
            }
        } else {
            return this.success('空的URL');
        }
        if (!resourceid) {
            return this.success({'State': -1, 'Msg': '未知或不受控制的资源！'});
        }

        const userRole = maindb.collection('userRole');
        let roles = [];
        if ('*' == satcode) {
            console.error('不限型号' + url);
            roles = await userRole.distinct('roleid',{user_account: account});
            if (!roles || roles.length === 0) {
                return this.success({'State': 0, 'Msg': '您未有任何角色授权！'});
            }
        } else {
            roles = await userRole.distinct('roleid',{user_account: account,satcode: satcode});
            if (!roles || roles.length === 0) {
                return this.success({'State': 0, 'Msg': '您不具备该型号的访问权限！'});
            }
        }
        const rr = maindb.collection('resource_role');
        // 查询出角色拥有的资源
        const ids = await rr.find({resource: resourceid.toString(),roleid: {$in: roles}}).toArray(); // 查询出所有资源
        if (ids && ids.length > 0) {
            return this.json({'State': 1, 'Msg': '验证通过！'});
        }
        return this.json({'State': 0, 'Msg': '您不具备操作权限！'});
    }
}
