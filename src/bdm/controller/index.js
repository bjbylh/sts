const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const userInfo = await this.session('userInfo');
    this.assign('userInfo', userInfo);
    return this.display();
  }
  async portalAction() {
    const userInfo = await this.session('userInfo');
    this.assign('userInfo', userInfo);
    return this.display();
  }

  async portalmenuAction() {
    const userInfo = await this.session('userInfo');
    this.assign('userInfo', userInfo);
    return this.display();
  }
  async welcomeAction() {
    return this.display();
  }

  async confimCriticalOPAction() {
    let data = {};
    data._id = this.get('_id');
    data.operName=this.get('operName');
    data._satid=this.get('_satid');
    data._subsysid=this.get('_subsysid');
    this.assign('data', data);
    return this.display();
  }
};
