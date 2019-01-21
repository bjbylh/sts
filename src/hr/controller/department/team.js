const Base = require('../base.js');
var ObjectId = require('mongodb').ObjectId;

function findTeam(document, tid) {
  var teams = document["teams"];
  for (var i = 0; i < teams.length; i++) {
    if (teams[i]._id == tid) {
      var team = teams[i];
      return team;
    }
  }
}

function updateTitle(document, tid, name, desc) {
  for (var i = 0; i < document["teams"].length; i++) {
    if (document["teams"][i]._id == tid) {
      document["teams"][i].name = name;
      document["teams"][i].desc = desc;
    }
  }
}

module.exports = class extends Base {

  /**
   * 数据库操作，获取一个部门信息
   */
  async getAction() {
    const _id = this.get('_id');
    const department = this.mongo('department');
    const data = await department.where({'_id': _id}).find();
    if (!data || !data["teams"]) {
      return this.json([]);
    }
    return this.json(data["teams"]);
  }

  async editAction() {
    const _id = this.get('_id');
    this.assign("_id", _id);
    const collection = this.mongo('department');
    const tid = this.get('tid');
    if (tid) {
      this.assign("tid", tid);
      console.log(tid);
      const document = await collection.where({'_id': _id}).find();
      var team = findTeam(document, tid);
      this.assign("data", team);
    }
    return this.display();
  }

  async saveAction() {
    console
    const _id = this.post('_id');
    const name = this.post('name');
    const desc = this.post('desc');
    const collection = this.mongo('department');

    if (this.isMethod("POST")) {
      await collection.where({'_id': _id}).update({$push: {'teams': {'_id': ObjectId(), 'name': name, 'desc': desc}}});
      return this.json({success: true, msg: '添加成功', _id: _id});
    } else if (this.isMethod("PUT")) {
      const tid = this.post('tid');
      if (tid) {
        const document = await collection.where({'_id': _id}).find();
        updateTitle(document, tid, name, desc);
        await collection.where({'_id': _id}).update(document);
        return this.json({success: true, msg: '更新成功', _id: _id});
      }
    } else {
      return this.json({success: false, msg: 'Please use post or put method'});
    }
  }

  async deleteAction() {
    const _id = this.get('_id');
    if (_id) {
      const tid = this.get('tid');
      if (tid) {
        const collection = this.mongo('department');
        const affectedRows = await collection.where({'_id': _id}).update({$pull: {'teams': {'_id': ObjectId(tid)}}});
        const document = await collection.where({'_id': _id}).find();
        return this.json({success: true, msg: '删除班组成功', _id: _id});
      } else {
        return this.json({success: false, msg: '没有找到相应的班组'});
      }
    } else {
      return this.json({success: false, msg: '没有找到相应的部门'});
    }
  }

}