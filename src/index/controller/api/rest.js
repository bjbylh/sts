const assert = require('assert');

module.exports = class extends think.Controller {
  static get _REST() {
    return true;
  }

  constructor(ctx) {
    super(ctx);
    this.resource = this.getResource();
    this.id = this.getId();
    assert(think.isFunction(this.model), 'this.model must be a function');
    this.modelInstance = this.model(this.resource);
  }
  __before() {}
  /**
   * get resource
   * @return {String} [resource name]
   */
  getResource() {
    return this.ctx.controller;
  }
  getId() {
    const id = this.get('id');
    if (id && (think.isString(id) || think.isNumber(id))) {
      return id;
    }
    const last = this.ctx.path.split('/').slice(-1)[0];
    if (last !== this.resource) {
      return last;
    }
    return '';
  }
  async getAction() {
    let data;
    if (this.id) {
      const pk = this.modelInstance.pk;
      data = await this.modelInstance.where({ [pk]: this.id }).find();
      return this.success(data);
    }
    data = await this.modelInstance.select();
    return this.success(data);
  }
  /**
   * put resource
   * @return {Promise} []
   */
  async postAction() {
    const pk = this.modelInstance.pk;
    const data = this.post();
    delete data[pk];
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    const insertId = await this.modelInstance.add(data);
    return this.success({ id: insertId });
  }
  /**
   * delete resource
   * @return {Promise} []
   */
  async deleteAction() {
    if (!this.id) {
      return this.fail('params error');
    }
    const pk = this.modelInstance.pk;
    const rows = await this.modelInstance.where({ [pk]: this.id }).delete();
    return this.success({ affectedRows: rows });
  }
  /**
   * update resource
   * @return {Promise} []
   */
  async putAction() {
    if (!this.id) {
      return this.fail('params error');
    }
    const pk = this.modelInstance.pk;
    const data = this.post();
    data[pk] = this.id; // rewrite data[pk] forbidden data[pk] !== this.id
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    const rows = await this.modelInstance.where({ [pk]: this.id }).update(data);
    return this.success({ affectedRows: rows });
  }

  // async mirrorList(list,maindb){
  //    let reslist=[],item,dblist,i;
  //    dblist=maindb.collection('basic_channel').find().toArray();
  //    while(list.length!=0){
  //       item=list.shift();
  //       for(i=0;i<dblist.length;i++){
  //         if(dblist[i].code==item&&dblist[i].mirrorcode){
  //           reslist.push(dblist[i].mirrorcode);
  //           i=-1;
  //           break;
  //         }
  //       }
  //       if(i!=-1)
  //         reslist.push(item);
  //    }
  //    return reslist;
  // }
  __call() {}
};