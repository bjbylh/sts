const Base = require('../base.js');

module.exports = class extends Base {
  async manageAction() {
      const _id = this.get("_id");
      const _satid = this.get("_satid");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:_satid}).find();
      this.assign("sat",sat);
      const project = this.mongo('project',{database:sat.code});
      let prj = await project.where({_id:_id}).find();
      this.assign("data",prj);
      return this.display();
  }

    async tabletempletAction() {
        const _id = this.get("_id");
        const _satid = this.get("_satid");
        const satellite = this.mongo('satellite');
        let sat =await satellite.where({_id:_satid}).find();
        this.assign("sat",sat);
        const project = this.mongo('project',{database:sat.code});
        let prj = await project.where({_id:_id}).find();
        this.assign("data",prj);
        return this.display();
    }

  async getresultAction() {
      const _satid = this.get("_satid");
      const _id = this.get("_id");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:_satid}).find();
	  const result = this.mongo ('result', {database: sat.code});
	  const cond={};
	  cond.project = _id;
	  //let data = await result.where (cond).select ();
      let data = await result.where (cond).field("time,stage,stage_name,person,place,tag,_id").select ();
      return this.json ({data: data});
  }

  async getstageAction() {
    const _satid = this.get("_satid");
    const satellite = this.mongo('satellite');
    let sat =await satellite.where({_id:_satid}).find();
    const stage = this.mongo ('stage', {database: sat.code});
    let data = await stage.where ().select ();
    let data2 = new Array ();
    data.forEach (function (t) {
      let te = new Object ();
      te.id = t._id;
      te.text = t.name;
      data2.push (te);
    });
    data2.push ({id:'-',text:'无'});
    return this.json ({data: data2});
  }
  
  async addAction () {
    const _satid = this.get ("_satid");
    const _id = this.get("_id");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
    const project = this.mongo('project',{database:sat.code});
    let prj = await project.where({_id:_id}).find();
    this.assign("prj",prj);
    return this.display ();
  }

    async addtaskAction () {
        const _satid = this.get ("_satid");
        const _id = this.get("_id");
        const satellite = this.mongo ('satellite');
        let sat = await satellite.where ({_id: _satid}).find ();
        this.assign ("sat", sat);
        const project = this.mongo('project',{database:sat.code});
        let prj = await project.where({_id:_id}).find();
        this.assign("prj",prj);
        return this.display ();
    }

    async taskwatchAction () {
            const _id = this.get("_id");
            const _satid = this.get("_satid");
            const satellite = this.mongo('satellite');
            let sat =await satellite.where({_id:_satid}).find();
            this.assign("sat",sat);
            const project = this.mongo('project',{database:sat.code});
            let prj = await project.where({_id:_id}).find();
            this.assign("data",prj);
            return this.display();
        }

    async addtempletAction () {
        const _satid = this.get ("_satid");
        const _id = this.get("_id");
        const satellite = this.mongo ('satellite');
        let sat = await satellite.where ({_id: _satid}).find ();
        this.assign ("sat", sat);
        const project = this.mongo('project',{database:sat.code});
        let prj = await project.where({_id:_id}).find();
        this.assign("prj",prj);
        return this.display ();
    }

  async editAction(){
	const _satid = this.get ("_satid");
    const _prjid = this.get("_prjid");
    const _id = this.get ("_id");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();

    const project = this.mongo('project',{database:sat.code});
    let prj = await project.where({_id:_prjid}).find();

    const result = this.mongo ('result', {database: sat.code});
    let data = await result.where ({_id: _id}).find ();
    this.assign ("sat", sat);
    this.assign("prj",prj);
    this.assign ("data", data);
    return this.display("manager/project/result_add.html");
  }

    async edittempletAction(){
        const _id = this.get ("_id");
        const satellite = this.mongo ('c_template', {database: 'yyyyy'});
        let data = await satellite.where ({_id: _id}).find ();
        this.assign ("data", data);
        return this.display("manager/project/result_addtemplet.html");
    }

  async deleteAction () {
        const satellite = this.mongo ('satellite');
        const _satid = this.post ("_satid");
        let sat = await satellite.where ({_id: _satid}).find ();
        const result = this.mongo ('result', {database: sat.code});
        const _id = this.post ("_id");
        let affectedRows = await result.where ({_id: _id}).delete ();//注意关联的测试结果没有删除。
        return this.json ({success: true, msg: '删除测试结果成功', data: affectedRows});
    }

    async deletetempletAction () {
        const satellite = this.mongo ('c_template', {database: 'yyyyy'});
        const _id = this.post ("_id");
        let affectedRows = await satellite.where ({_id: _id}).delete ();//注意关联的测试结果没有删除。
        return this.json ({success: true, msg: '删除模板成功', data: affectedRows});
    }

  async doSaveAction () {
    const postobj = this.post('data');
    const data = JSON.parse(postobj);
    console.log(data);
    const _satid = data._satid;
    const _id = data._id;
    delete data._satid;
    delete data._id;
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const result = this.mongo ('result', {database: sat.code});
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await result.add (data);
      return this.json ({success: true, msg: '添加测试结果成功', data: insertId});
    } else {
      let affectedRows = await result.where ({_id: _id}).update (data);
      return this.json ({success: true, msg: '编辑测试结果成功', data: affectedRows});
    }
  }
};
