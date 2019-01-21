const Base = require('./base.js');
const assert = require('assert');
const clients = require('restify-clients');

const client = clients.createJsonClient({
  url: think.config('RestTrouble'),
  version: '~1.0'
});

module.exports = class extends Base {
  async gettroubleAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    let restparam = {satcode: sat.code};
    let data = await new Promise(function(resolve, reject) {
      client.post(think.config('RestTroubleAll'), restparam, function(err, req, res, obj) {
        assert.ifError(err);
        resolve(obj);
      });
    });
    let data2 = new Array();
    for (let i = 0; i < data.length; i++) {
      data2.push(JSON.parse(data[i]));
    }
    return this.json({data: data2});
  }

  async editAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    const _id = this.get("_id");
    let sat = await satellite.where({_id: _satid}).find();
    let restparam = {satcode: sat.code, id: _id};
    console.log(restparam);
    let data = await new Promise(function(resolve, reject) {
      client.post(think.config('RestTroubleDetail'), restparam, function(err, req, res, obj) {
        assert.ifError(err);
        console.log(obj);
        resolve(obj);
      });
    });
    console.log(data);
    this.assign("data", JSON.parse(data));
    this.assign("sat", sat);
    return this.display("home/trouble_add.html");
  }

  async displayAction() {
    const _satid = this.get('_satid');
    const satellite = this.mongo('satellite');
    const _id = this.get('_id');
    const sat = await satellite.where({_id: _satid}).find();
    const restparam = {satcode: sat.code, id: _id};
    const data = await new Promise(function(resolve, reject) {
      client.post(think.config('RestTroubleDetail'), restparam, function(err, req, res, obj) {
        assert.ifError(err);
        resolve(obj);
      });
    });
    this.assign('data', JSON.parse(data));
    this.assign('sat', sat);
    return this.display();
  }

  async getDeviceAction() {
    const _satid = this.get("_satid");
    const _subsysid = this.get("_subsysid");
    const satellite = this.mongo('satellite');
    let sat = await satellite.where({_id: _satid}).find();
    const device = this.mongo('device', {database: sat.code});
    let data = await device.where({subsys: _subsysid}).field("_id,name").select();
    let data2 = new Array();
    data.forEach(function(t) {
      let te = new Object();
      te.id = t._id;
      te.text = t.name;
      data2.push(te);
    });
    return this.json({data: data2});
  }
};
