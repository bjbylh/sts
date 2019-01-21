const Base = require('./base.js');
const marked = require('marked');
const pdc = require('pdc');
const fs = require('fs');

module.exports = class extends Base {
  async editorAction() {
    const _groupid = this.get("_groupid");
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    let data = await report.where({_id: _id}).find();
    data.report = data.report.replace(/&lt;/g, '<');
    data.report = data.report.replace(/&gt;/g, '>');
    this.assign("group", groupitem);
    this.assign("data", data);
    return this.display();
  }

  async editorforIE8Action() {
    const _groupid = this.get("_groupid");
    const _id = this.get("_id");
    const group = this.mongo('group');
    let groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    let data = await report.where({_id: _id}).find();
    data.report = data.report.replace(/&lt;/g, '<');
    data.report = data.report.replace(/&gt;/g, '>');

    const regstr = /\[[^\[](.*?)[^\]]\]:data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*\r\n/gi;
    const wants = data.report.match(regstr);
    if(wants!=null){
      for(let i=0;i<wants.length;i++){
        data.report = data.report.replace(wants[i], "");
        const flagreg =  /\[[^\[](.*?)[^\]]\]/gi;
        const flagstrArr = wants[i].match(flagreg);
        const flagstr = flagstrArr[0];
        let base64string = wants[i];
        base64string = base64string.replace(/\[[^\[](.*?)[^\]]\]:data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?;base64,/,'');
        base64string = base64string.replace(/\r\n/, '');
        const path = think.ROOT_PATH + '/www/static/tmpimg/';
        fs.writeFileSync(path + flagstr + '.png', base64string, 'base64');
        data.report = data.report.replace(flagstr, "(/static/tmpimg/"+ flagstr + ".png)");
      }
    }


    this.assign("group", groupitem);
    this.assign("data", data);
    return this.display('home/report_editor');
  }

  async exportAction() {
    const _groupid = this.get('_groupid');
    const _id = this.get('_id');
    const group = this.mongo('group');
    const groupitem = await group.where({_id: _groupid}).find();
    const report = this.mongo('report', {database: groupitem.code});
    const data = await report.where({_id: _id}).find();
    const UUID = require('uuid');
    const fname = think.ROOT_PATH + '/tmp/' + data.name + UUID.v1() + '.docx';
    data.report = data.report.replace(/&lt;/g, '<');
    data.report = data.report.replace(/&gt;/g, '>');
    const htmlstring = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'+marked(data.report)+'</body></html>';
    const tmp = await new Promise(function (resolved, reject) {
      pdc.path = "C:\\Pandoc\\pandoc";
      pdc(htmlstring, 'html', 'docx', ['-o', fname], function (err, result) {
        if (err)
          throw err;
        resolved('ok');
      });
      /*
      pdc(data.report, 'markdown+pipe_tables+markdown_in_html_blocks+raw_html+footnotes', 'docx', ['--output=' + fname], function (err, result) {
        if (err)
          throw err;
        resolved('ok');
      });*/
    });
    return this.download(fname);
  }

  async sateditorAction() {
    const _satid = this.get('_satid');
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    /*const report = this.mongo('report', {database: sat.code});
    const data = await report.where({_id: _id}).find();
    data.report = data.report.replace(/&lt;/g, '<');
    data.report = data.report.replace(/&gt;/g, '>');
    this.assign('sat', sat);
    this.assign('data', data);*/
    const testreport = this.mongo('testreport', {database: sat.code});
    const data = await testreport.where({_id: _id}).find();
    //data.report = data.report.replace(/&lt;/g, '<');
    //data.report = data.report.replace(/&gt;/g, '>');
    this.assign('sat', sat);
    this.assign('data', data);
    return this.display();
  }

  async sateditorforIE8Action() {
    const _satid = this.get('_satid');
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const data = await report.where({_id: _id}).find();
    data.report = data.report.replace(/&lt;/g, '<');
    data.report = data.report.replace(/&gt;/g, '>');

    const regstr = /\[[^\[](.*?)[^\]]\]:data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*\r\n/gi;
    const wants = data.report.match(regstr);
    if(wants!=null){
      for(let i=0;i<wants.length;i++){
        data.report = data.report.replace(wants[i], "");
        const flagreg =  /\[[^\[](.*?)[^\]]\]/gi;
        const flagstrArr = wants[i].match(flagreg);
        const flagstr = flagstrArr[0];
        let base64string = wants[i];
        base64string = base64string.replace(/\[[^\[](.*?)[^\]]\]:data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?;base64,/,'');
        base64string = base64string.replace(/\r\n/, '');
        const path = think.ROOT_PATH + '/www/static/tmpimg/';
        fs.writeFileSync(path + flagstr + '.png', base64string, 'base64');
        data.report = data.report.replace(flagstr, "(/static/tmpimg/"+ flagstr + ".png)");
      }
    }

    this.assign('sat', sat);
    this.assign('data', data);
    return this.display('home/report_sateditor');
  }

  async exportSatAction() {
    const _satid = this.get('_satid');
    const _id = this.get('_id');
    const satellite = this.mongo('satellite');
    const sat = await satellite.where({_id: _satid}).find();
    const report = this.mongo('report', {database: sat.code});
    const data = await report.where({_id: _id}).find();
    const UUID = require('uuid');
    const fname = think.ROOT_PATH + '/tmp/' + data.name + UUID.v1() + '.docx';
    data.report = data.report.replace(/&lt;/g, '<');
    data.report = data.report.replace(/&gt;/g, '>');
    const htmlstring = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'+marked(data.report)+'</body></html>';
    const tmp = await new Promise(function (resolved, reject) {
      pdc.path = "C:\\Pandoc\\pandoc";
      /*pdc(marked(data.report), 'html', 'docx', ['-o',fname], function (err, result) {
        if (err)
          throw err;
        resolved('ok');
      });*/

      pdc(data.report, 'markdown-simple_tables-multiline_tables-grid_tables', 'docx', ['-o', fname], function (err, result) {
        if (err)
          throw err;
        resolved('ok');
      });

    });
    console.log(fname);
    return this.download(fname);
  }
};
