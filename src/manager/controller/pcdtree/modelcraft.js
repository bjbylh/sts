const Base = require('../base.js');
const clients = require('restify-clients');

const client = clients.createJsonClient({
  url: think.config('RestRbac'),
  version: '~1.0'
});
module.exports = class extends Base {
  async indexAction() {
    return this.display();
  }

  async getSatsAction() {
    const satellite = this.mongo('satellite', {database: 'MODELCRAFT'});
    const sats = await satellite.where().select();
    return this.json(sats);
  }

  async getSubsysAction() {
    const subsys = this.mongo('subsys', {database: 'MODELCRAFT'});
    const data = await subsys.where().select();
    return this.json({data: data});
  }

  async listDeviceAction() {
    const _subsysid = this.get('_subsysid');
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    const data = await device.where({subsys: _subsysid}).select();
    return this.json(data);
  }

  async saveSubsysAction() {
    const data = JSON.parse(this.post('data'));
    const subsys = this.mongo('subsys', {database: 'MODELCRAFT'});
    if (!data._id) {
      data._id = null;
      const insertId = await subsys.add(data);
      return this.json({success: true, msg: '添加标准化分系统成功', data: insertId});
    }
    const num = await subsys.where({_id: data._id}).update(data);
    return this.json({success: true, msg: '标准化分系统修改成功', data: num});
  }

  async saveDeviceAction() {
    const data = JSON.parse(this.post('data'));
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    if (!data._id) {
      data._id = null;
      const insertId = await device.add(data);
      return this.json({success: true, msg: '添加标准化单机成功', data: insertId});
    }
    const num = await device.where({_id: data._id}).update(data);
    return this.json({success: true, msg: '编辑标准化单机成功', data: num});
  }

  async subsysEditAction() {
    const _id = this.get('_id');
    if (_id) {
      const subsys = this.mongo('subsys', {database: 'MODELCRAFT'});

      const data = await subsys.where({_id: _id}).find();
      this.assign('data', data);
    }
    return this.display();
  }

  // deviceEdit
  async deviceEditAction() {
    let data = {};
    const _subsysid = this.get('_subsysid');
    const _id = this.get('_id');
    if (_id) {
      const device = this.mongo('device', {database: 'MODELCRAFT'});
      data = await device.where({_id: _id}).find();
    } else {
      data.subsys = _subsysid;
    }
    this.assign('data', data);
    return this.display();
  }

  // spectrum xingpu
  async listSpectrumAction() {
    const device = this.get('device');
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    const data = await spectrum.where({device: device}).select();
    return this.json(data);
  }

  async spectrumEditAction() {
    let data = {};
    const device = this.get('device');
    const _id = this.get('_id');
    if (_id) {
      const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
      data = await spectrum.where({_id: _id}).find();
    } else {
      data.device = device;
    }
    this.assign('data', data);
    return this.display();
  }

  async getAllDeviceAction() {
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    const data = await device.where().select();
    return this.json(data);
  }

  //
  async saveSpectrumAction() {
    const data = JSON.parse(this.post('data'));
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    if (!data._id) {
      data._id = null;
      const insertId = await spectrum.add(data);
      return this.json({success: true, msg: '添加标准化型谱成功', data: insertId});
    }
    const num = await spectrum.where({_id: data._id}).update(data);
    return this.json({success: true, msg: '编辑标准化型谱成功', data: num});
  }

  async deleteSubsysAction() {
    const _id = this.post('_id');
    const subsys = this.mongo('subsys', {database: 'MODELCRAFT'});
    let affectedRows = await subsys.where({_id: _id}).delete();
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    const des = await device.where({subsys: _id}).select();
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    for (let i = 0; i < des.length; i++) {
      affectedRows += await spectrum.where({device: des[i]._id.toString()}).delete();
    }
    affectedRows += await device.where({subsys: _id}).delete();
    return this.json({success: true, msg: '删除标准化分系统成功', data: affectedRows});
  }

  async deleteDeviceAction() {
    const _id = this.post('_id');
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    let affectedRows = await device.where({_id: _id}).delete();
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    affectedRows += await spectrum.where({device: _id}).delete();
    return this.json({success: true, msg: '删除标准化单机成功', data: affectedRows});
  }

  async deleteSpectrumAction() {
    const _id = this.post('_id');
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    const affectedRows = await spectrum.where({_id: _id}).delete();
    return this.json({success: true, msg: '删除标准化型谱成功', data: affectedRows});
  }

  async pcdsubsysAction() {
    const code = this.get('satcode');
    const sid = this.get('subsysid');
    const sub = this.mongo('subsys', {database: code});
    const subsy = await sub.where({_id: sid}).find();
    const subsys = this.mongo('subsys', {database: 'MODELCRAFT'});
    const data = await subsys.where({name: subsy.standardName}).find();
    return this.json(data);
  }

  async listSpectrumSltAction() {
    const name = this.get('device');
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    const dev = await device.where({name: name}).find();
    if (dev === {} || !dev._id) {
      console.error(name + '单机位找到！');
      return this.json([]);
    }
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    const data = await spectrum.where({device: dev._id.toString()}).select();
    console.error(data);
    return this.json(data);
  }

  async getDevicesAction() {
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    const data = await device.where().select();
    return this.json(data);
  }

  async validateSubsysAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const subsys = this.mongo('subsys', {database: 'MODELCRAFT'});
    const data = await subsys.where({code: code}).find();
    if (!data._id) {
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        return this.json('true');
      } else {
        return this.json('false');
      }
    }
  }

  async validateSubsysNameAction() {
    const name = this.get('name');
    const _id = this.get('_id');
    const subsys = this.mongo('subsys', {database: 'MODELCRAFT'});
    const data = await subsys.where({name: name}).find();
    if (!data._id) {
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        return this.json('true');
      } else {
        return this.json('false');
      }
    }
  }

  async validateDecviceAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    const data = await device.where({code: code}).find();
    if (!data._id) {
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        return this.json('true');
      } else {
        return this.json('false');
      }
    }
  }

  async validateDecviceNameAction() {
    const name = this.get('name');
    const _id = this.get('_id');
    const device = this.mongo('device', {database: 'MODELCRAFT'});
    const data = await device.where({name: name}).find();
    if (!data._id) {
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        return this.json('true');
      } else {
        return this.json('false');
      }
    }
  }

  async validateSpectrumAction() {
    const code = this.get('code');
    const _id = this.get('_id');
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    const data = await spectrum.where({code: code}).find();
    if (!data._id) {
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        return this.json('true');
      } else {
        return this.json('false');
      }
    }
  }

  async validateSpectrumNameAction() {
    const name = this.get('name');
    const _id = this.get('_id');
    const spectrum = this.mongo('spectrum', {database: 'MODELCRAFT'});
    const data = await spectrum.where({name: name}).find();
    if (!data._id) {
      return this.json('true');
    } else {
      if (data._id.toString() === _id) {
        return this.json('true');
      } else {
        return this.json('false');
      }
    }
  }
}
