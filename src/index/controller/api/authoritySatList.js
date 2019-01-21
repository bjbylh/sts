const BaseRest = require('./rest.js');

module.exports = class extends BaseRest {
    async postAction(){
        const account = this.post('account');
        // const code = this.post('project_code'); // 只要url不重复就用不到，待定
        const type = this.post('type');
        let url = this.post('url');
        if (url) {
            if (url.indexOf('?') > 0) {
                url = url.substring(0, url.indexOf('?'));
            }
            let resourceid = '';// 定义资源id
            let maindb=think.db.db('yyyyy');
            const menu =maindb.collection('menu');
            const m = await menu.findOne({url: url});
            if (m == null || !m._id) {
                const option = maindb.collection('option');
                const o = await option.findOne({url: url});
                resourceid = o._id.toString();
            } else {
                resourceid = m._id.toString();
            }
            if (!resourceid) { // 资源未找到
                return this.success({'Msg': '未知或不受控制的资源！', 'Data': []});
            }
            const rr = maindb.collection('resource_role');
            const datas = await rr.find({resource: resourceid}).toArray();
            const arr = []; // 取出所有有权限
            for (let i = 0; i < datas.length; i++) {
                arr.push(datas[i].roleid);
            }
            const userrole = maindb.collection('userRole');
            let urs = [];
            if (type === 'sat' || type === 'grp') {//sat：型号，grp：分组
                urs = await userrole.find({user_account: account, type: type, roleid: {$in: arr}}).toArray();
            } else {
                urs = await userrole.find({user_account: account, roleid: {$in: arr}}).toArray();
            }
            console.error('url:' + url + ',用户：' + account + ',获取结果', urs.length);
            const codes = [];
            for (let i = 0; i < urs.length; i++) {
                codes.push(urs[i].satcode);
            }
            return this.json({State: 1,Msg:'查询完成', Data: codes});
        } else {
            console.error('空的url');
            return this.success({State:0,Msg: '空的url！', Data: []});
        }
    }
}
