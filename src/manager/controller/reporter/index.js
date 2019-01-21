const Base = require('../base.js');
const clients = require('restify-clients');

const client = clients.createJsonClient({
  url: think.config('RestRbac'),
  version: '~1.0'
});

module.exports = class extends Base {
  async listAction() {
    return this.display();
  }

  async getSatAndGroupAction() {
    const userAccount = await this.session('account');
    const parm = {account: userAccount, type: 'sat', url: '/manager/reporter/index/list'};
    const satCodeArr = await new Promise(function(resolve, reject) {
      client.post('/rbac/api/sats', parm, function(err, req, res, obj) {
        console.error(obj);
        resolve(obj.data);
      });
    });
    const satellite = this.mongo('satellite');
    const sats = await satellite.where({code: {$in: satCodeArr}}).select();

    const parmgrp = {account: userAccount, type: 'grp', url: '/manager/reporter/index/list'};
    const grpCodeArr = await new Promise(function(resolve, reject) {
      client.post('/rbac/api/sats', parmgrp, function(err, req, res, obj) {
        console.error(obj);
        resolve(obj.data);
      });
    });
    const group = this.mongo('group');
    const grps = await group.where({code: {$in: grpCodeArr}}).select();
    //const grps = await group.where().select();
    const data=[];

    sats.forEach(function(item){
      let element={};
      element._id=item._id;
      element.name=item.name;
      element.code=item.code;
      if(item.code_out==undefined || item.code_out=='')
        item.code_out=item.code;
      element.code_out=item.code_out;
      element.type='sat';
      element.content=item.code;
      data.push(element);
    });
    grps.forEach(function (item){
      let element={};
      element._id=item._id;
      element.name=item.name;
      element.code=item.code;
      element.code_out=item.code;
      element.type='grp';
      element.content = '';
      if ( typeof(item.groupsats) === 'string') {
        element.content = item.groupsats;
      } else if (item.groupsats != null) {
        element.content = item.groupsats.join('<br>');
      }
      data.push(element);
    });
    return this.json({ data: data});
  }
};
