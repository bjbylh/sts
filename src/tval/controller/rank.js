const Base = require('./base.js');
const fs = require('fs');

module.exports = class extends Base {
  async indexAction() {
    return this.display();
  }

  async getStageAction() {
    const cachefile = think.ROOT_PATH + '/tmp/cache/stagedata.json';
    var cacheresult = JSON.parse(fs.readFileSync(cachefile));
    return this.json({data: cacheresult});
  }
};
