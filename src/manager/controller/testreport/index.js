const Base = require('../base.js');
const clients = require('restify-clients');
const marked = require('marked');
const pdc = require('pdc');
const fs = require('fs');

const client = clients.createJsonClient({
  url: think.config('RestRbac'),
  version: '~1.0'
});

module.exports = class extends Base {
	
	async indexAction() {
    return this.display();
  }
	
	async getSatsAction() {
    const userAccount = await this.session('account');
    const parm = {account: userAccount, type: 'sat', url: '/manager/testreport/index/list'};
    const satCodeArr = await new Promise(function(resolve, reject) {
      client.post('/rbac/api/sats', parm, function(err, req, res, obj) {
        console.error(obj);
        resolve(obj.data);
      });
    });
    const satellite = this.mongo('satellite');
    const sats = await satellite.where({code: {$in: satCodeArr}}).select();
    for(let i=0;i<sats.length;i++){
      if(sats[i].code_out==undefined || sats[i].code_out=='')
        sats[i].code_out=sats[i].code;
    }
    return this.json({data: sats});
  }
	
	async testreportAction() {
      const _id = this.get("_id");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:_id}).find();
      this.assign("sat",sat);
      return this.display();
  }
	
  async getRepsAction() {
    const satid = this.get("satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    const data = await testreport.select();
    return this.json({data: data});
  }
  
  async getReppsAction() {								//弹出的选择报告框
    const satid = this.get("satid");
    const _id = this.get("_id");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    const data = await testreport.select();
    
   	this.assign('_id', _id);
   	this.assign('satid', satid);
    return this.display();
  }
  
  async getReptagsAction() {								//弹出的选择报告框的数据
    const satid = this.get("satid");
    //const _id = this.get("_id");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    const data = await testreport.select();
    return this.json({data: data});
  }
  
  async getResultAction() {								//弹出的引入结果框
    const satid = this.get("satid");
    const _id = this.get("_id");
    /*const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    const data = await testreport.select();*/
    
   	this.assign('_id', _id);
   	this.assign('satid', satid);
    return this.display();
  }
  
  async getresAction() {						//结果初始化获取数据
      const satid = this.get("satid");
      //const _id = this.get("_id");
      console.log(satid);
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:satid}).find();
	  	const result = this.mongo ('result', {database: sat.code});
      let data = await result.where().select();//.field("time,stage,stage_name,person,place,tag,_id")
      
      return this.json ({data: data});
  }
  
  async manageAction() {							//点击项目列表单行触发事件
     const satid = this.get("satid");
      const xiangId = this.get("xiangId");
      const satellite = this.mongo('satellite');
      let sat =await satellite.where({_id:satid}).find();
	  	const result = this.mongo ('result', {database: sat.code});
      let data = await result.where({'project':xiangId}).select();//.field("time,stage,stage_name,person,place,tag,_id")
      return this.json ({data: data});
  }
  
	async addAction() {
		const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
    return this.display();
  }
	

  async editAction() {
  	const _id = this.get ("_id");
    const _satid = this.get ("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    this.assign ("sat", sat);
    
    const testreport = this.mongo ('testreport', {database: sat.code});
    const data = await testreport.where({'_id':_id}).find();
    
    this.assign ("data", data);
    return this.display('manager/testreport/index_add.html');
  }
  
  async deleteAction() {
  	const _id = this.post("_id");
    const _satid = this.post("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    let affectedRows = await testreport.where ({_id: _id}).delete ();
    return this.json ({success: true, msg: '删除测试报告成功', data: affectedRows});
  }
  
  async fabuAction() {
  	const _id = this.post("_id");
    const _satid = this.post("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    const state = this.post("state");
    if(state == "未发布"){
    	let affectedRows = await testreport.where ({_id: _id}).update({'state':"已发布"});
    	return this.json ({success: true, msg: '报告发布成功', data: affectedRows});
    }else{
    	let affectedRows = await testreport.where ({_id: _id}).update({'state':"未发布"});
    	return this.json ({success: true, msg: '报告撤回成功', data: affectedRows});
    }
  }

  async doSaveAction() {
   const postobj = this.post('data');
    const data = JSON.parse(postobj);
    
    const satid = data.satid;
    const _id = data._id;
    delete data._id;
    delete data.satid;
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    
    if (_id == undefined || _id == null || _id == "") {
      let insertId = await testreport.add (data);
      return this.json ({success: true, msg: '添加测试报告成功', data: insertId});
    } else {
      let affectedRows = await testreport.where ({_id: _id}).update (data);
      return this.json ({success: true, msg: '编辑测试报告成功', data: affectedRows});
    }
  }
  
  async exportAction() {
  	const _id = this.get('_id');
  	const _satid = this.get("_satid");
    const satellite = this.mongo ('satellite');
    let sat = await satellite.where ({_id: _satid}).find ();
    const testreport = this.mongo ('testreport', {database: sat.code});
    
    const data = await testreport.where({_id: _id}).find();
    //console.log(data);
    const UUID = require('uuid');
    const fname = think.ROOT_PATH + '/tmp/' + data.name + UUID.v1() + '.docx';
    data.template = data.template.replace(/&lt;/g, '<');
    data.template = data.template.replace(/&gt;/g, '>');

    const css = '<style type="text/css" media="screen">table{word-break:normal !important;display:table !important;} table,table tr th, table tr td { border:1px solid #000000; }</style>';

    const htmlstring = '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'+css+'<body>'+marked(data.template)+'</body></html>';
    console.log(htmlstring);
    const tmp = await new Promise(function (resolved, reject) {
      pdc.path = "C:\\Pandoc\\pandoc";
      pdc(htmlstring, 'html', 'docx', ['-o', fname], function (err, result) {
        if (err)
          throw err;
        resolved('ok');
      });

      /*pdc(data.template, 'markdown+pipe_tables+markdown_in_html_blocks+raw_html+footnotes', 'docx', ['-o' , fname], function (err, result) {
        if (err)
          throw err;
        resolved('ok');
      });*/
    });
    return this.download(fname);
  }
  
}
