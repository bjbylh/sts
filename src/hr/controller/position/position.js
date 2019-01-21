const Base = require('../base.js');
var ObjectId = require('mongodb').ObjectId; 

function updatePosition(document, tid, name, numclass) {
  for (var i=0; i<document["titles"].length; i++) {
    if(document["titles"][i]._id == tid) {
      document["titles"][i].name = name;
      document["titles"][i].class = numclass;
    }
  }
}

function findTitle(document, tid) {
  var titles = document["titles"];
  for (var i=0; i<titles.length; i++) {
    if(titles[i]._id == tid) {
      var title = titles[i];
      return title;
    }
  }
}

module.exports = class extends Base {

  async listAction() {
    return this.display();
  }

  async getAction() {
    const collection = this.mongo('position');
    const document = await collection.where().select();
    return this.json({data: document});
  }

  async getByIdAction() {
    const _id = this.get('_id');
    const collection = this.mongo('position');
    const document = await collection.where({'_id': _id}).find();
    return this.json({data: document["titles"]});
  }

  async editAction() {
      const _id = this.get('_id');
      if (_id) {
          const department = this.mongo('position');
          const data = await department.where({'_id': _id}).find();
          this.assign('data', data);
      }
      return this.display();
  }

    /**
     * add or update the employer
     * @returns {Promise<*>}
     */
    async saveAction() {
        const data = {};
        data.name = this.post('name');
        data.describe = this.post('describe');
        const collection = this.mongo('position');

        if (this.isMethod("POST")) {
            const insertId = await collection.add(data);
            return this.json({success: true, msg: '添加成功', data: insertId});
        } else if (this.isMethod("PUT")){
            const _id = this.post('_id');
            const document = await collection.where({'_id': _id}).find();
            document.name = data.name;
            document.describe = data.describe;
            const affectedId = await collection.where({'_id': _id}).update(document);
            return this.json({success: true, msg: '更新成功', data: affectedId});
        } else {
            return this.json({success: false, msg: 'Please use post or put method'});
        }
    }

    async deleteAction() {
        const _id = this.get('_id');
        if (_id) {
            const collection = this.mongo('position');
            const affectedRows = await collection.where({'_id': _id}).delete();
            return this.json({success: true, msg: '删除岗序成功'});
        } else {
            return this.json({success: false, msg: '没有找到相应的岗位序列'});
        }
    }




  async editTitleAction() {
    if (this.isPost) {
      const data = this.post();
      const _id = this.post('_id');
      const tid = this.post('tid');

      const name = this.post('name');
      const numclass = this.post('class');
      const collection = this.mongo('position');
      
      if (tid) {
        const document = await collection.where({'_id': _id}).find();
        updatePosition(document, tid, name, numclass);
        await collection.where({'_id': _id}).update(document);
        return this.json({success: true, msg: '更新成功'});  
      } else {
        await collection.where({'_id': _id}).update({$push : {'titles' : {'_id' : ObjectId(), 'name' : name, 'class' : numclass}}});
        return this.json({success: true, msg: '添加成功'});  
      }
    } else {
      const _id = this.get('_id');
      this.assign("_id", _id);
      console.log(_id);
      const collection = this.mongo('position');
      const tid = this.get('tid');
      if (tid) {
        this.assign("tid", tid);
        console.log(tid);
        const document = await collection.where({'_id': _id}).find();
        var title = findTitle(document, tid);
        console.log(title);
        this.assign("data", title);
      }
      return this.display();
    }
  }
}

