const Base = require('./base.js');
const fs = require('fs');

module.exports = class extends Base {
  async indexAction() {
    return this.display();
  }

  async dologinAction() {
      const account = this.post('account');
      const password = this.post('password');
      const user = this.mongo('user');
      const data = await user.where({'account': account, 'password': password}).find();
      if (data == null || data._id == null || data == {}) {
        return this.json({'state': 'failure', 'msg': '账号或者密码错误！'});
      }
      await this.session('account', account);
      await this.session('userInfo', data);
      const path = think.ROOT_PATH + '/www/static/userimages/' + account + '.png';
      const exists = await new Promise(function(resolve, reject) {
        fs.exists(path, function(exists) {
          resolve(exists);
        });
      });
      if (exists) {
        const imgpath = '/static/userimages/' + account + '.png';
        await this.session('userimgpath', imgpath);
      } else {
        const imgpath = '/static/userimages/default.png';
        await this.session('userimgpath', imgpath);
      }
      return this.json({'state': 'ok'});

  }

  async adloginAction() {
    const account = this.post('account');
    if (account) {
      const user = this.mongo('user');
      const data = await user.where({'account': account}).find();
      if (data == null || data._id == null || data == {}) {
        console.error(account + '域账号不存在！');
        return this.json({'state': 'failed', 'msg': '域登陆失败，域账号不存在,请使用账号密码登录！'});
      }
      await this.session('account', account);
      await this.session('userInfo', data);
      const path = think.ROOT_PATH + '/www/static/userimages/' + account + '.png';
      const exists = await new Promise(function(resolve, reject) {
        fs.exists(path, function(exists) {
          resolve(exists);
        });
      });
      if (exists) {
        const imgpath = '/static/userimages/' + account + '.png';
        await this.session('userimgpath', imgpath);
      } else {
        const imgpath = '/static/userimages/default.png';
        await this.session('userimgpath', imgpath);
      }
      console.error(account + '域登陆成功！');
      return this.json({'state': 'ok'});
    }
    console.error(account + '域账号为空！');
    return this.json({'state': 'failed', 'msg': '域登陆失败，获取域账号为空！'});
  }

  async changepasswordAction() {
    return this.display();
  }

  async changeAction() {
    const password = this.post('password');
    const new_p = this.post('new_p');
    const new_p2 = this.post('new_p2');
    if (new_p != new_p2) {
      return this.json({'result': 0, 'msg': '两次密码输入不一致！'});
    }
    const account = await this.session('account');
    const user = this.mongo('user');
    const data = await user.where({'account': account, 'password': password}).find();
    if (data == null || data._id == null || data == {}) {
      return this.json({'result': 0, 'msg': '原始密码不正确！'});
    }
    data.password = new_p;
    const affectedRows = await user.where({_id: data._id}).update(data);
    return this.json({'result': affectedRows, 'msg': '密码修改成功！'});
  }

  async logoutAction() {
    console.error('清空session');
    await this.session(null);
	await this.session('account');
    return this.json({'msg': '已退出！'});
  }

  async homechangeAction() {
    const new_p = this.post('new_p');
    const account = await this.session('account');
    const user = this.mongo('user');
    const data = await user.where({'account': account}).find();
    data.password = new_p;
    const affectedRows = await user.where({_id: data._id}).update(data);
    return this.json({'result': affectedRows, 'msg': '密码修改成功！'});
  }
};
